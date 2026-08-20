import JSZip from 'jszip';
import { 
  FiscalDocument, 
  FiscalImportStatus, 
  BatchImportResult 
} from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';
import { 
  parseFiscalXml, 
  parseFiscalSpedTxt, 
  parseFiscalCsv 
} from './fiscalParserEngine';
import { saveFiscalDocument } from './fiscalStorage';

export interface ProcessFileOptions {
  activeCompany: CompanyRegistration;
  currentUser: { id: string; nome: string; email: string };
  currentOrgId: string;
  onProgress?: (current: number, total: number, currentFileName: string) => void;
}

// Processar um único arquivo ou conteúdo de arquivo
export async function processFiscalFile(
  file: File | { name: string; content: string },
  options: ProcessFileOptions
): Promise<{ documento?: FiscalDocument; status: FiscalImportStatus; mensagem: string; nomeArquivo: string }> {
  const fileName = file.name;
  let content = '';

  if ('content' in file) {
    content = file.content;
  } else {
    content = await file.text();
  }

  const trimmed = content.trim();

  // 1. Identificação Automática do Formato Real (não apenas pela extensão)
  const isXml = trimmed.startsWith('<?xml') || trimmed.startsWith('<') || fileName.toLowerCase().endsWith('.xml');
  const isSpedTxt = trimmed.startsWith('|0000|') || (trimmed.startsWith('|') && fileName.toLowerCase().endsWith('.txt'));
  const isCsvOrStructured = trimmed.includes(';') || trimmed.includes(',') || fileName.toLowerCase().endsWith('.csv');

  if (isXml) {
    const parseRes = await parseFiscalXml(
      content,
      fileName,
      options.activeCompany,
      options.currentUser,
      options.currentOrgId
    );

    if (parseRes.status === 'Rejeitado' || !parseRes.documento) {
      return {
        status: parseRes.status,
        mensagem: parseRes.erros.map(e => e.motivo).join(' | ') || 'Arquivo XML não atende aos schemas fiscais oficiais homologados.',
        nomeArquivo: fileName
      };
    }

    // Salvar e auditar
    const saveRes = saveFiscalDocument(parseRes.documento);
    return {
      documento: saveRes.documento || parseRes.documento,
      status: saveRes.status,
      mensagem: saveRes.message,
      nomeArquivo: fileName
    };
  } else if (isSpedTxt) {
    const parseRes = await parseFiscalSpedTxt(
      content,
      fileName,
      options.activeCompany,
      options.currentUser,
      options.currentOrgId
    );

    if (parseRes.status === 'Rejeitado' || !parseRes.documento) {
      return {
        status: parseRes.status,
        mensagem: parseRes.erros.map(e => e.motivo).join(' | ') || 'Arquivo SPED TXT inválido conforme Guia Prático.',
        nomeArquivo: fileName
      };
    }

    const saveRes = saveFiscalDocument(parseRes.documento);
    return {
      documento: saveRes.documento || parseRes.documento,
      status: saveRes.status,
      mensagem: saveRes.message,
      nomeArquivo: fileName
    };
  } else if (isCsvOrStructured) {
    const parseRes = await parseFiscalCsv(
      content,
      fileName,
      options.activeCompany,
      options.currentUser,
      options.currentOrgId
    );

    if (parseRes.status === 'Rejeitado' || !parseRes.documento) {
      return {
        status: parseRes.status,
        mensagem: parseRes.erros.map(e => e.motivo).join(' | ') || 'Planilha CSV não pôde ser interpretada.',
        nomeArquivo: fileName
      };
    }

    const saveRes = saveFiscalDocument(parseRes.documento);
    return {
      documento: saveRes.documento || parseRes.documento,
      status: saveRes.status,
      mensagem: saveRes.message,
      nomeArquivo: fileName
    };
  } else {
    return {
      status: 'Rejeitado',
      mensagem: `Formato de arquivo não reconhecido para "${fileName}". Esperado XML (NF-e/NFC-e/CT-e/MDF-e/NFS-e), SPED TXT ou CSV/Excel.`,
      nomeArquivo: fileName
    };
  }
}

// Processar Lote de Arquivos (incluindo descompactação automática de .ZIP)
export async function processBatchFiscalFiles(
  files: FileList | File[],
  options: ProcessFileOptions
): Promise<BatchImportResult> {
  const fileArray = Array.from(files);
  const itemsToProcess: { name: string; content: string }[] = [];

  // Extrair arquivos (descompactando ZIPs se existirem)
  for (const f of fileArray) {
    if (f.name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(f);
        const fileNames = Object.keys(zipData.files);
        for (const zName of fileNames) {
          const zFile = zipData.files[zName];
          if (!zFile.dir && (zName.endsWith('.xml') || zName.endsWith('.txt') || zName.endsWith('.csv'))) {
            const txt = await zFile.async('text');
            itemsToProcess.push({ name: zName, content: txt });
          }
        }
      } catch (err) {
        console.error('Erro ao descompactar arquivo ZIP:', err);
      }
    } else {
      const txt = await f.text();
      itemsToProcess.push({ name: f.name, content: txt });
    }
  }

  const result: BatchImportResult = {
    totalArquivos: itemsToProcess.length,
    totalImportados: 0,
    totalComAlertas: 0,
    totalDuplicados: 0,
    totalDivergenciaCadastro: 0,
    totalRejeitados: 0,
    documentos: [],
    relatorio: []
  };

  const total = itemsToProcess.length;

  for (let i = 0; i < total; i++) {
    const item = itemsToProcess[i];
    if (options.onProgress) {
      options.onProgress(i + 1, total, item.name);
    }

    const res = await processFiscalFile(item, options);

    if (res.documento) {
      result.documentos.push(res.documento);
    }

    if (res.status === 'Importado') {
      result.totalImportados++;
    } else if (res.status === 'Importado com Alertas') {
      result.totalComAlertas++;
    } else if (res.status === 'Duplicado') {
      result.totalDuplicados++;
    } else if (res.status === 'Divergência de Cadastro') {
      result.totalDivergenciaCadastro++;
    } else {
      result.totalRejeitados++;
    }

    result.relatorio.push({
      arquivo: item.name,
      tipo: res.documento?.modelo || 'Desconhecido',
      numero: res.documento?.numero,
      status: res.status,
      mensagem: res.mensagem,
      chaveAcesso: res.documento?.chaveAcesso || undefined,
      dataHora: new Date().toISOString()
    });
  }

  return result;
}
