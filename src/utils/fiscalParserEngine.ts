import { 
  FiscalDocument, 
  FiscalDocumentType, 
  FiscalImportStatus, 
  FiscalItem, 
  FiscalParticipant, 
  FiscalTotals, 
  FiscalTaxICMS, 
  FiscalTaxIPI, 
  FiscalTaxPIS, 
  FiscalTaxCOFINS, 
  FiscalTaxISSQN, 
  FiscalTaxIBS, 
  FiscalTaxCBS, 
  FiscalTaxIS, 
  FiscalDocumentReference, 
  FiscalEvent, 
  FiscalValidationError,
  EFDFiscalSummary,
  EFDParsedBlock,
  EFDRecord
} from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';

// Helper: Calcular Hash SHA-256 do arquivo original de forma assíncrona
export async function calculateSha256(content: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Fallback para hash básico:', e);
  }
  // Fallback determinístico caso crypto.subtle não esteja disponível
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(16, '0') + '_' + content.length;
}

// Helper: Extrair texto de elemento XML de forma segura
function getXmlText(parent: Element | null | undefined, tagName: string): string | null {
  if (!parent) return null;
  const el = parent.getElementsByTagName(tagName)[0];
  if (!el || el.textContent === null || el.textContent === undefined) return null;
  const val = el.textContent.trim();
  return val.length > 0 ? val : null;
}

// Helper: Extrair número de elemento XML de forma segura sem inferir valores ausentes
function getXmlNumber(parent: Element | null | undefined, tagName: string): number | null {
  const txt = getXmlText(parent, tagName);
  if (txt === null) return null;
  const num = parseFloat(txt);
  return isNaN(num) ? null : num;
}

// Helper: Formatar CNPJ
function formatCnpjCpf(val: string | null): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return val;
}

// Helper: Validar CNPJ oficial (Dígitos verificadores)
export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) return false;
  
  let tamanho = clean.length - 2;
  let numeros = clean.substring(0, tamanho);
  const digitos = clean.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;
  
  tamanho = tamanho + 1;
  numeros = clean.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}

// Parser Principal de XML Fiscal
export async function parseFiscalXml(
  xmlContent: string,
  fileName: string,
  activeCompany: CompanyRegistration,
  currentUser: { id: string; nome: string; email: string },
  currentOrgId: string
): Promise<{ documento?: FiscalDocument; status: FiscalImportStatus; erros: FiscalValidationError[]; alertas: string[] }> {
  const erros: FiscalValidationError[] = [];
  const alertas: string[] = [];
  const timestamp = new Date().toISOString();

  // 1. Identificar Formato & Estrutura XML
  let dom: Document;
  try {
    const parser = new DOMParser();
    dom = parser.parseFromString(xmlContent, 'application/xml');
    const parseError = dom.getElementsByTagName('parsererror')[0];
    if (parseError) {
      erros.push({
        motivo: 'Arquivo XML malformado ou corrompido: ' + (parseError.textContent || 'Erro de sintaxe XML'),
        origem: 'DOMParser',
        dataHora: timestamp,
        regraViolada: 'Estrutura XML W3C'
      });
      return { status: 'Rejeitado', erros, alertas };
    }
  } catch (e: any) {
    erros.push({
      motivo: 'Falha crítica ao ler estrutura XML: ' + (e?.message || 'Arquivo ilegível'),
      origem: 'DOMParser',
      dataHora: timestamp,
      regraViolada: 'Estrutura XML W3C'
    });
    return { status: 'Rejeitado', erros, alertas };
  }

  // 2. Identificar Tipo de Documento e Versão do Leiaute
  const rootTag = dom.documentElement.nodeName;
  let tipoDocumento: FiscalDocumentType = 'NFE';
  let modelo = '55';
  let versaoLeiaute = dom.documentElement.getAttribute('versao') || '4.00';

  const infNFe = dom.getElementsByTagName('infNFe')[0];
  const infCte = dom.getElementsByTagName('infCte')[0];
  const infMDFe = dom.getElementsByTagName('infMDFe')[0];
  const infNFSe = dom.getElementsByTagName('infNFSe')[0] || dom.getElementsByTagName('tcCompNFSe')[0] || dom.getElementsByTagName('DPS')[0] || dom.getElementsByTagName('NFSe')[0];
  const infEvento = dom.getElementsByTagName('infEvento')[0];

  if (infNFe) {
    const modEl = getXmlText(infNFe, 'mod');
    if (modEl === '65') {
      tipoDocumento = 'NFCE';
      modelo = '65';
    } else {
      tipoDocumento = 'NFE';
      modelo = modEl || '55';
    }
    versaoLeiaute = infNFe.getAttribute('versao') || versaoLeiaute;
  } else if (infCte) {
    tipoDocumento = 'CTE';
    modelo = getXmlText(infCte, 'mod') || '57';
    versaoLeiaute = infCte.getAttribute('versao') || versaoLeiaute;
  } else if (infMDFe) {
    tipoDocumento = 'MDFE';
    modelo = getXmlText(infMDFe, 'mod') || '58';
    versaoLeiaute = infMDFe.getAttribute('versao') || versaoLeiaute;
  } else if (infNFSe) {
    tipoDocumento = 'NFSE';
    modelo = 'NFS-e Padrão Nacional';
    versaoLeiaute = infNFSe.getAttribute('versao') || '1.00';
  } else if (infEvento) {
    tipoDocumento = 'EVENTO_FISCAL';
    modelo = 'Evento Fiscal';
    versaoLeiaute = infEvento.getAttribute('versao') || '1.00';
  } else {
    erros.push({
      motivo: `Tipo de documento fiscal não reconhecido para o nó raiz <${rootTag}>. Formatos suportados: NF-e, NFC-e, NFS-e, CT-e, MDF-e ou Evento Fiscal.`,
      origem: 'Identificação de Documento',
      dataHora: timestamp,
      regraViolada: 'Schema Portal Fiscal'
    });
    return { status: 'Rejeitado', erros, alertas };
  }

  // 3. Tratar Evento Fiscal
  if (tipoDocumento === 'EVENTO_FISCAL' && infEvento) {
    const tpEvento = getXmlText(infEvento, 'tpEvento') || '';
    const descEvento = getXmlText(infEvento, 'descEvento') || 'Evento Fiscal';
    const chDoc = getXmlText(infEvento, 'chNFe') || getXmlText(infEvento, 'chCTe') || getXmlText(infEvento, 'chMDFe') || '';
    const nProt = getXmlText(infEvento, 'nProt');
    const dhEvento = getXmlText(infEvento, 'dhEvento') || timestamp;
    const nSeqEvento = getXmlNumber(infEvento, 'nSeqEvento');
    const cOrgao = getXmlText(infEvento, 'cOrgao');
    const xMotivo = getXmlText(infEvento, 'xMotivo') || getXmlText(infEvento, 'xJust');
    const cnpjAutor = getXmlText(infEvento, 'CNPJ') || getXmlText(infEvento, 'CPF') || '';

    const hash = await calculateSha256(xmlContent);

    const docEvento: FiscalDocument = {
      id: `fiscal_evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipoDocumento: 'EVENTO_FISCAL',
      modelo: 'Evento',
      numero: nSeqEvento ? nSeqEvento.toString() : '1',
      serie: '1',
      chaveAcesso: chDoc || null,
      dataEmissao: dhEvento,
      versaoLeiaute,
      ambiente: getXmlText(infEvento, 'tpAmb') === '1' ? 'Produção' : 'Homologação',
      finalidade: 'Evento / Vinculação',
      tipoOperacao: 'Saída',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: formatCnpjCpf(cnpjAutor),
        razaoSocial: 'Autor do Evento: ' + formatCnpjCpf(cnpjAutor),
        uf: cOrgao || 'BR'
      },
      naturezaOperacao: descEvento,
      itens: [],
      totais: { valorTotalDocumento: 0 },
      eventos: [{
        tipoEvento: tpEvento,
        descricaoEvento: descEvento,
        chaveDocumento: chDoc,
        protocolo: nProt,
        dataHora: dhEvento,
        autorEvento: cnpjAutor,
        motivo: xMotivo,
        status: 'Registrado',
        numeroSequencial: nSeqEvento
      }],
      arquivoOriginal: xmlContent,
      nomeOriginal: fileName,
      extensao: 'xml',
      hashSha256: hash,
      tamanhoBytes: xmlContent.length,
      dataHoraImportacao: timestamp,
      usuarioResponsavel: currentUser,
      organizacaoAdministradoraId: currentOrgId,
      empresaAtivaId: activeCompany.id,
      empresaAtivaCnpj: activeCompany.cnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    };

    return { documento: docEvento, status: 'Importado', erros, alertas };
  }

  // 4. Extração de Identificação (NF-e, NFC-e, CT-e, MDF-e, NFS-e)
  const ide = (infNFe || infCte || infMDFe || infNFSe)?.getElementsByTagName('ide')[0];
  
  const numero = getXmlText(ide, 'nNF') || getXmlText(ide, 'nCT') || getXmlText(ide, 'nMDF') || getXmlText(infNFSe, 'nDPS') || getXmlText(infNFSe, 'Numero') || '0';
  const serie = getXmlText(ide, 'serie') || getXmlText(infNFSe, 'Serie') || '1';
  
  // Chave de acesso: extrair do atributo Id ou tags oficiais
  let chaveAcesso: string | null = null;
  const rawId = (infNFe || infCte || infMDFe)?.getAttribute('Id');
  if (rawId) {
    chaveAcesso = rawId.replace(/^(NFe|CTe|MDFe)/, '');
  } else {
    chaveAcesso = getXmlText(dom.documentElement, 'chNFe') || getXmlText(dom.documentElement, 'chCTe') || getXmlText(dom.documentElement, 'chMDFe');
  }

  // Validação da Chave de Acesso (44 dígitos para documentos do SPED)
  if (chaveAcesso && (tipoDocumento === 'NFE' || tipoDocumento === 'NFCE' || tipoDocumento === 'CTE' || tipoDocumento === 'MDFE')) {
    const cleanKey = chaveAcesso.replace(/\D/g, '');
    if (cleanKey.length !== 44) {
      alertas.push(`Chave de acesso com comprimento não padrão (${cleanKey.length} dígitos em vez de 44).`);
    }
  }

  const dataEmissao = getXmlText(ide, 'dhEmi') || getXmlText(ide, 'dEmi') || getXmlText(infNFSe, 'dhEmi') || getXmlText(infNFSe, 'DataEmissao') || timestamp;
  const dataEntradaSaida = getXmlText(ide, 'dhSaiEnt') || getXmlText(ide, 'dSaiEnt');
  const tpAmbCode = getXmlText(ide, 'tpAmb') || getXmlText(infNFSe, 'tpAmb');
  const ambiente: 'Produção' | 'Homologação' | 'Não Informado' = tpAmbCode === '1' ? 'Produção' : tpAmbCode === '2' ? 'Homologação' : 'Não Informado';
  
  const tpNF = getXmlText(ide, 'tpNF');
  const tipoOperacao: 'Entrada' | 'Saída' | 'Mista' = tpNF === '0' ? 'Entrada' : 'Saída';
  const finNFeCode = getXmlText(ide, 'finNFe');
  const finalidadeMap: Record<string, string> = {
    '1': 'Normal',
    '2': 'Complementar',
    '3': 'Ajuste',
    '4': 'Devolução'
  };
  const finalidade = (finNFeCode && finalidadeMap[finNFeCode]) || 'Normal';
  const natOp = getXmlText(ide, 'natOp') || getXmlText(infNFSe, 'xDescServ') || 'Operação Fiscal';

  // 5. Empresa Emitente
  const emitNode = (infNFe || infCte || infMDFe || infNFSe)?.getElementsByTagName('emit')[0] || infNFSe?.getElementsByTagName('prestador')[0];
  const emitCnpjCpf = getXmlText(emitNode, 'CNPJ') || getXmlText(emitNode, 'CPF') || '';
  const emitRazao = getXmlText(emitNode, 'xNome') || getXmlText(emitNode, 'RazaoSocial') || 'Não Informado';
  const emitFantasia = getXmlText(emitNode, 'xFant') || getXmlText(emitNode, 'NomeFantasia');
  const emitIE = getXmlText(emitNode, 'IE') || getXmlText(emitNode, 'InscricaoEstadual');
  const emitIM = getXmlText(emitNode, 'IM') || getXmlText(emitNode, 'InscricaoMunicipal');
  const emitCRT = getXmlText(emitNode, 'CRT');
  const enderEmit = emitNode?.getElementsByTagName('enderEmit')[0] || emitNode?.getElementsByTagName('Endereco')[0];
  
  const emitente: FiscalParticipant = {
    tipo: 'EMITENTE',
    cnpjCpf: formatCnpjCpf(emitCnpjCpf),
    razaoSocial: emitRazao,
    nomeFantasia: emitFantasia,
    inscricaoEstadual: emitIE,
    inscricaoMunicipal: emitIM,
    regimeTributario: emitCRT === '1' ? 'Simples Nacional' : emitCRT === '2' ? 'Simples excesso' : emitCRT === '3' ? 'Regime Normal' : null,
    uf: getXmlText(enderEmit, 'UF') || 'SP',
    municipio: getXmlText(enderEmit, 'xMun') || getXmlText(enderEmit, 'Municipio'),
    codigoMunicipio: getXmlText(enderEmit, 'cMun') || getXmlText(enderEmit, 'CodigoMunicipio'),
    logradouro: getXmlText(enderEmit, 'xLgr') || getXmlText(enderEmit, 'Endereco'),
    numero: getXmlText(enderEmit, 'nro') || getXmlText(enderEmit, 'Numero'),
    bairro: getXmlText(enderEmit, 'xBairro') || getXmlText(enderEmit, 'Bairro'),
    cep: getXmlText(enderEmit, 'CEP'),
    telefone: getXmlText(enderEmit, 'fone'),
    pais: getXmlText(enderEmit, 'xPais') || 'Brasil'
  };

  // 6. Participantes (Destinatário, Tomador, etc.)
  let destinatario: FiscalParticipant | null = null;
  const destNode = (infNFe || infCte || infNFSe)?.getElementsByTagName('dest')[0] || infNFSe?.getElementsByTagName('tomador')[0];
  if (destNode) {
    const destCnpjCpf = getXmlText(destNode, 'CNPJ') || getXmlText(destNode, 'CPF') || '';
    const enderDest = destNode.getElementsByTagName('enderDest')[0] || destNode.getElementsByTagName('Endereco')[0];
    destinatario = {
      tipo: 'DESTINATARIO',
      cnpjCpf: formatCnpjCpf(destCnpjCpf),
      razaoSocial: getXmlText(destNode, 'xNome') || getXmlText(destNode, 'RazaoSocial') || 'Consumidor / Destinatário',
      inscricaoEstadual: getXmlText(destNode, 'IE'),
      uf: getXmlText(enderDest, 'UF') || 'SP',
      municipio: getXmlText(enderDest, 'xMun'),
      codigoMunicipio: getXmlText(enderDest, 'cMun'),
      logradouro: getXmlText(enderDest, 'xLgr'),
      numero: getXmlText(enderDest, 'nro'),
      bairro: getXmlText(enderDest, 'xBairro'),
      cep: getXmlText(enderDest, 'CEP'),
      email: getXmlText(destNode, 'email')
    };
  }

  // 7. Itens / Serviços & Tributação Detalhada
  const itens: FiscalItem[] = [];
  const detNodes = (infNFe || infCte || infNFSe)?.getElementsByTagName('det');
  
  if (detNodes && detNodes.length > 0) {
    for (let i = 0; i < detNodes.length; i++) {
      const det = detNodes[i];
      const nItem = parseInt(det.getAttribute('nItem') || `${i + 1}`, 10);
      const prod = det.getElementsByTagName('prod')[0];
      const imposto = det.getElementsByTagName('imposto')[0];

      // Produto / Serviço
      const codigo = getXmlText(prod, 'cProd') || getXmlText(det, 'cServ') || `${nItem}`;
      const descricao = getXmlText(prod, 'xProd') || getXmlText(det, 'xDescServ') || 'Item ' + nItem;
      const ncm = getXmlText(prod, 'NCM');
      const cest = getXmlText(prod, 'CEST');
      const nbs = getXmlText(prod, 'NBS');
      const codigoServico = getXmlText(prod, 'cListServ') || getXmlText(det, 'cServ');
      const cfop = getXmlText(prod, 'CFOP') || '5102';
      const unidade = getXmlText(prod, 'uCom') || 'UN';
      const quantidade = getXmlNumber(prod, 'qCom') || 1;
      const valorUnitario = getXmlNumber(prod, 'vUnCom') || 0;
      const valorTotal = getXmlNumber(prod, 'vProd') || valorUnitario * quantidade;
      const desconto = getXmlNumber(prod, 'vDesc');
      const frete = getXmlNumber(prod, 'vFrete');
      const seguro = getXmlNumber(prod, 'vSeg');
      const outrasDespesas = getXmlNumber(prod, 'vOutro');

      // Grupos Tributários (ICMS, IPI, PIS, COFINS, ISSQN, IBS, CBS, IS)
      let icms: FiscalTaxICMS | null = null;
      let ipi: FiscalTaxIPI | null = null;
      let pis: FiscalTaxPIS | null = null;
      let cofins: FiscalTaxCOFINS | null = null;
      let issqn: FiscalTaxISSQN | null = null;
      let ibs: FiscalTaxIBS | null = null;
      let cbs: FiscalTaxCBS | null = null;
      let isTax: FiscalTaxIS | null = null;

      if (imposto) {
        // ICMS
        const icmsContainer = imposto.getElementsByTagName('ICMS')[0];
        if (icmsContainer && icmsContainer.firstElementChild) {
          const icmsType = icmsContainer.firstElementChild;
          icms = {
            cst: getXmlText(icmsType, 'CST'),
            csosn: getXmlText(icmsType, 'CSOSN'),
            origem: getXmlText(icmsType, 'orig'),
            modalidadeBC: getXmlText(icmsType, 'modBC'),
            baseCalculo: getXmlNumber(icmsType, 'vBC'),
            aliquota: getXmlNumber(icmsType, 'pICMS'),
            valor: getXmlNumber(icmsType, 'vICMS'),
            percentualReducaoBC: getXmlNumber(icmsType, 'pRedBC'),
            modalidadeBCST: getXmlText(icmsType, 'modBCST'),
            baseCalculoST: getXmlNumber(icmsType, 'vBCST'),
            aliquotaST: getXmlNumber(icmsType, 'pICMSST'),
            valorST: getXmlNumber(icmsType, 'vICMSST'),
            percentualFCP: getXmlNumber(icmsType, 'pFCP'),
            valorFCP: getXmlNumber(icmsType, 'vFCP'),
            valorDiferido: getXmlNumber(icmsType, 'vICMSDif'),
            valorDesonerado: getXmlNumber(icmsType, 'vICMSDeson'),
            motivoDesoneracao: getXmlText(icmsType, 'motDesICMS')
          };
        }

        // IPI
        const ipiContainer = imposto.getElementsByTagName('IPI')[0];
        if (ipiContainer) {
          const ipiTrib = ipiContainer.getElementsByTagName('IPITrib')[0] || ipiContainer.getElementsByTagName('IPINT')[0];
          if (ipiTrib) {
            ipi = {
              cst: getXmlText(ipiTrib, 'CST'),
              cnpjProdutor: getXmlText(ipiContainer, 'CNPJProd'),
              codigoEnquadramento: getXmlText(ipiContainer, 'cEnq'),
              baseCalculo: getXmlNumber(ipiTrib, 'vBC'),
              aliquota: getXmlNumber(ipiTrib, 'pIPI'),
              valor: getXmlNumber(ipiTrib, 'vIPI')
            };
          }
        }

        // PIS
        const pisContainer = imposto.getElementsByTagName('PIS')[0];
        if (pisContainer && pisContainer.firstElementChild) {
          const pisType = pisContainer.firstElementChild;
          pis = {
            cst: getXmlText(pisType, 'CST'),
            baseCalculo: getXmlNumber(pisType, 'vBC'),
            aliquota: getXmlNumber(pisType, 'pPIS'),
            valor: getXmlNumber(pisType, 'vPIS'),
            quantidadeBC: getXmlNumber(pisType, 'qBCProd'),
            aliquotaReais: getXmlNumber(pisType, 'vAliqProd')
          };
        }

        // COFINS
        const cofinsContainer = imposto.getElementsByTagName('COFINS')[0];
        if (cofinsContainer && cofinsContainer.firstElementChild) {
          const cofinsType = cofinsContainer.firstElementChild;
          cofins = {
            cst: getXmlText(cofinsType, 'CST'),
            baseCalculo: getXmlNumber(cofinsType, 'vBC'),
            aliquota: getXmlNumber(cofinsType, 'pCOFINS'),
            valor: getXmlNumber(cofinsType, 'vCOFINS'),
            quantidadeBC: getXmlNumber(cofinsType, 'qBCProd'),
            aliquotaReais: getXmlNumber(cofinsType, 'vAliqProd')
          };
        }

        // ISSQN
        const issqnNode = imposto.getElementsByTagName('ISSQN')[0];
        if (issqnNode) {
          issqn = {
            cst: getXmlText(issqnNode, 'cSitTrib'),
            baseCalculo: getXmlNumber(issqnNode, 'vBC'),
            aliquota: getXmlNumber(issqnNode, 'vAliq'),
            valor: getXmlNumber(issqnNode, 'vISSQN'),
            codigoMunicipio: getXmlText(issqnNode, 'cMunFG'),
            itemListaServico: getXmlText(issqnNode, 'cListServ'),
            valorRetencao: getXmlNumber(issqnNode, 'vRetISS')
          };
        }

        // Reconhecimento de Grupos Oficiais de IBS / CBS / IS (Reforma Tributária EC 132/2023 & LC 214/2025)
        const ibsNode = imposto.getElementsByTagName('IBS')[0] || imposto.getElementsByTagName('gIBS')[0];
        if (ibsNode) {
          ibs = {
            cst: getXmlText(ibsNode, 'CST') || getXmlText(ibsNode, 'cstIBS'),
            cClassTrib: getXmlText(ibsNode, 'cClassTrib'),
            baseCalculo: getXmlNumber(ibsNode, 'vBC') || getXmlNumber(ibsNode, 'vBCIBS'),
            aliquotaEstadual: getXmlNumber(ibsNode, 'pIBSEst'),
            valorIBSEstadual: getXmlNumber(ibsNode, 'vIBSEst'),
            aliquotaMunicipal: getXmlNumber(ibsNode, 'pIBSMun'),
            valorIBSMunicipal: getXmlNumber(ibsNode, 'vIBSMun'),
            aliquotaTotal: getXmlNumber(ibsNode, 'pIBS'),
            valorIBSTotal: getXmlNumber(ibsNode, 'vIBS'),
            percentualReducao: getXmlNumber(ibsNode, 'pRed'),
            valorDiferimento: getXmlNumber(ibsNode, 'vDif'),
            valorCreditoPresumido: getXmlNumber(ibsNode, 'vCredPres'),
            valorEstornoDevolucao: getXmlNumber(ibsNode, 'vEstornoDev')
          };
        }

        const cbsNode = imposto.getElementsByTagName('CBS')[0] || imposto.getElementsByTagName('gCBS')[0];
        if (cbsNode) {
          cbs = {
            cst: getXmlText(cbsNode, 'CST') || getXmlText(cbsNode, 'cstCBS'),
            cClassTrib: getXmlText(cbsNode, 'cClassTrib'),
            baseCalculo: getXmlNumber(cbsNode, 'vBC') || getXmlNumber(cbsNode, 'vBCCBS'),
            aliquota: getXmlNumber(cbsNode, 'pCBS'),
            valorCBS: getXmlNumber(cbsNode, 'vCBS'),
            percentualReducao: getXmlNumber(cbsNode, 'pRed'),
            valorDiferimento: getXmlNumber(cbsNode, 'vDif'),
            valorCreditoPresumido: getXmlNumber(cbsNode, 'vCredPres'),
            valorEstornoDevolucao: getXmlNumber(cbsNode, 'vEstornoDev')
          };
        }

        const isNode = imposto.getElementsByTagName('IS')[0] || imposto.getElementsByTagName('gIS')[0];
        if (isNode) {
          isTax = {
            cst: getXmlText(isNode, 'CST') || getXmlText(isNode, 'cstIS'),
            cClassTrib: getXmlText(isNode, 'cClassTrib'),
            baseCalculo: getXmlNumber(isNode, 'vBC'),
            aliquota: getXmlNumber(isNode, 'pIS'),
            valorIS: getXmlNumber(isNode, 'vIS')
          };
        }
      }

      itens.push({
        numeroItem: nItem,
        codigo,
        descricao,
        ncm,
        cest,
        nbs,
        codigoServico,
        cfop,
        unidade,
        quantidade,
        valorUnitario,
        valorTotal,
        desconto,
        frete,
        seguro,
        outrasDespesas,
        tributacao: {
          icms,
          ipi,
          pis,
          cofins,
          issqn,
          ibs,
          cbs,
          is: isTax
        }
      });
    }
  }

  // 8. Totais
  const totalNode = (infNFe || infCte || infNFSe)?.getElementsByTagName('total')[0];
  const icmsTot = totalNode?.getElementsByTagName('ICMSTot')[0];
  const issqnTot = totalNode?.getElementsByTagName('ISSQNTot')[0];
  const ibscbsTot = totalNode?.getElementsByTagName('IBSCBSTot')[0];

  const totais: FiscalTotals = {
    valorProdutos: getXmlNumber(icmsTot, 'vProd') || (itens.length > 0 ? itens.reduce((acc, it) => acc + it.valorTotal, 0) : 0),
    valorServicos: getXmlNumber(issqnTot, 'vServ'),
    valorFrete: getXmlNumber(icmsTot, 'vFrete'),
    valorSeguro: getXmlNumber(icmsTot, 'vSeg'),
    valorDesconto: getXmlNumber(icmsTot, 'vDesc'),
    valorOutrasDespesas: getXmlNumber(icmsTot, 'vOutro'),
    baseCalculoICMS: getXmlNumber(icmsTot, 'vBC'),
    valorICMS: getXmlNumber(icmsTot, 'vICMS'),
    baseCalculoICMSST: getXmlNumber(icmsTot, 'vBCST'),
    valorICMSST: getXmlNumber(icmsTot, 'vST'),
    valorIPI: getXmlNumber(icmsTot, 'vIPI'),
    valorPIS: getXmlNumber(icmsTot, 'vPIS'),
    valorCOFINS: getXmlNumber(icmsTot, 'vCOFINS'),
    valorISS: getXmlNumber(issqnTot, 'vISS'),
    valorIBSEstadual: getXmlNumber(ibscbsTot, 'vIBSEst'),
    valorIBSMunicipal: getXmlNumber(ibscbsTot, 'vIBSMun'),
    valorIBSTotal: getXmlNumber(ibscbsTot, 'vIBS'),
    valorCBS: getXmlNumber(ibscbsTot, 'vCBS'),
    valorIS: getXmlNumber(ibscbsTot, 'vIS'),
    valorTotalDocumento: getXmlNumber(icmsTot, 'vNF') || getXmlNumber(infCte, 'vTPrest') || getXmlNumber(infNFSe, 'vNFSe') || (itens.reduce((acc, it) => acc + it.valorTotal, 0))
  };

  // 9. Documentos Referenciados
  const docsReferenciados: FiscalDocumentReference[] = [];
  const nfRefNodes = ide?.getElementsByTagName('NFref');
  if (nfRefNodes && nfRefNodes.length > 0) {
    for (let i = 0; i < nfRefNodes.length; i++) {
      const ref = nfRefNodes[i];
      const refNFe = getXmlText(ref, 'refNFe');
      const refCTe = getXmlText(ref, 'refCTe');
      if (refNFe) {
        docsReferenciados.push({ tipo: 'NFE', chaveAcesso: refNFe });
      } else if (refCTe) {
        docsReferenciados.push({ tipo: 'CTE', chaveAcesso: refCTe });
      }
    }
  }

  // 10. Hash SHA-256 do arquivo original
  const hash = await calculateSha256(xmlContent);

  // 11. Validação de Vínculo com Cadastro Central
  const cleanActiveCnpj = activeCompany.cnpj.replace(/\D/g, '');
  const cleanEmitCnpj = emitente.cnpjCpf.replace(/\D/g, '');
  const cleanDestCnpj = destinatario?.cnpjCpf.replace(/\D/g, '') || '';

  let status: FiscalImportStatus = 'Importado';
  if (cleanEmitCnpj !== cleanActiveCnpj && cleanDestCnpj !== cleanActiveCnpj) {
    status = 'Divergência de Cadastro';
    alertas.push(`O CNPJ do documento (${emitente.cnpjCpf || 'Dest: ' + destinatario?.cnpjCpf}) difere do CNPJ da empresa ativa selecionada (${activeCompany.cnpj}). O documento foi preservado para auditoria sem alterar o Cadastro Central.`);
  } else if (alertas.length > 0) {
    status = 'Importado com Alertas';
  }

  const fiscalDoc: FiscalDocument = {
    id: `fiscal_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tipoDocumento,
    modelo,
    numero,
    serie,
    chaveAcesso,
    dataEmissao,
    dataEntradaSaida,
    versaoLeiaute,
    periodoReferencia: dataEmissao ? dataEmissao.substring(0, 7) : null,
    ambiente,
    finalidade,
    tipoOperacao,
    emitente,
    destinatario,
    naturezaOperacao: natOp,
    cfopPrincipal: itens[0]?.cfop || null,
    itens,
    totais,
    documentosRelacionados: docsReferenciados.length > 0 ? docsReferenciados : null,
    arquivoOriginal: xmlContent,
    nomeOriginal: fileName,
    extensao: 'xml',
    hashSha256: hash,
    tamanhoBytes: xmlContent.length,
    dataHoraImportacao: timestamp,
    usuarioResponsavel: currentUser,
    organizacaoAdministradoraId: currentOrgId,
    empresaAtivaId: activeCompany.id,
    empresaAtivaCnpj: activeCompany.cnpj,
    status,
    errosValidacao: erros,
    alertasValidacao: alertas
  };

  return { documento: fiscalDoc, status, erros, alertas };
}

// Parser Principal de Arquivos TXT (SPED EFD ICMS/IPI e EFD Contribuições)
export async function parseFiscalSpedTxt(
  txtContent: string,
  fileName: string,
  activeCompany: CompanyRegistration,
  currentUser: { id: string; nome: string; email: string },
  currentOrgId: string
): Promise<{ documento?: FiscalDocument; status: FiscalImportStatus; erros: FiscalValidationError[]; alertas: string[] }> {
  const erros: FiscalValidationError[] = [];
  const alertas: string[] = [];
  const timestamp = new Date().toISOString();

  const lines = txtContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    erros.push({
      motivo: 'Arquivo TXT está vazio.',
      origem: 'SPED Parser',
      dataHora: timestamp,
      regraViolada: 'Estrutura SPED Vazia'
    });
    return { status: 'Rejeitado', erros, alertas };
  }

  // 1. Identificar Header |0000|
  const headerLine = lines[0];
  if (!headerLine.startsWith('|0000|')) {
    erros.push({
      registro: '0000',
      motivo: 'O arquivo TXT não se inicia com o registro de abertura oficial |0000| do SPED.',
      origem: 'Guia Prático SPED',
      dataHora: timestamp,
      regraViolada: 'Registro Inicial 0000 Obrigatório'
    });
    return { status: 'Rejeitado', erros, alertas };
  }

  const headerFields = headerLine.split('|');
  // headerFields: ['', '0000', 'COD_VER', 'COD_FIN/TIPO_ESCRIT', 'DT_INI', 'DT_FIN', 'NOME', 'CNPJ', 'UF', 'COD_MUN', ...]
  const codVer = headerFields[2] || '018';
  const dtIni = headerFields[4] || '';
  const dtFin = headerFields[5] || '';
  const razaoSocial = headerFields[6] || activeCompany.razaoSocial;
  const cnpjSped = headerFields[7] || '';
  const uf = headerFields[8] || activeCompany.uf;

  // 2. Identificar se é EFD ICMS/IPI ou EFD Contribuições
  let isContrib = false;
  let hasE110 = false;
  let hasM200 = false;

  let totalC100 = 0;
  let totalD100 = 0;
  let totalDebitoICMS = 0;
  let totalCreditoICMS = 0;
  let totalICMSApurado = 0;
  let totalPISApurado = 0;
  let totalCOFINSApurado = 0;

  const parsedBlocks: EFDParsedBlock[] = [];
  const currentBlockMap: Record<string, EFDRecord[]> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    const fields = line.split('|');
    const reg = fields[1];
    if (!reg) continue;

    const blockLetter = reg.charAt(0);
    if (!currentBlockMap[blockLetter]) {
      currentBlockMap[blockLetter] = [];
    }

    currentBlockMap[blockLetter].push({
      registro: reg,
      linhaNumero: i + 1,
      campos: fields
    });

    if (reg === 'C100') totalC100++;
    if (reg === 'D100') totalD100++;
    if (reg === 'E110') {
      hasE110 = true;
      totalDebitoICMS += parseFloat(fields[2]?.replace(',', '.') || '0') || 0;
      totalCreditoICMS += parseFloat(fields[6]?.replace(',', '.') || '0') || 0;
      totalICMSApurado += parseFloat(fields[13]?.replace(',', '.') || '0') || 0;
    }
    if (reg === 'M200' || reg === 'M600') {
      hasM200 = true;
      isContrib = true;
      if (reg === 'M200') totalPISApurado += parseFloat(fields[12]?.replace(',', '.') || '0') || 0;
      if (reg === 'M600') totalCOFINSApurado += parseFloat(fields[12]?.replace(',', '.') || '0') || 0;
    }
  }

  // Organizar blocos
  Object.keys(currentBlockMap).sort().forEach(blk => {
    parsedBlocks.push({
      bloco: blk,
      totalLinhas: currentBlockMap[blk].length,
      registros: currentBlockMap[blk]
    });
  });

  const tipoDocumento: FiscalDocumentType = isContrib || hasM200 ? 'EFD_CONTRIBUICOES' : 'EFD_ICMS_IPI';
  const tipoEFD = isContrib ? 'EFD_CONTRIBUICOES' : 'EFD_ICMS_IPI';

  // Período formatado
  const formatSpedDate = (d: string) => {
    if (d.length === 8) {
      return `${d.substring(0, 2)}/${d.substring(2, 4)}/${d.substring(4, 8)}`;
    }
    return d;
  };

  const periodoInicio = formatSpedDate(dtIni);
  const periodoFim = formatSpedDate(dtFin);

  const efdSummary: EFDFiscalSummary = {
    tipoEFD,
    versaoLeiaute: codVer,
    periodoInicio,
    periodoFim,
    cnpjEstabelecimento: formatCnpjCpf(cnpjSped),
    razaoSocial,
    uf,
    indicadorFinalidade: headerFields[3] === '0' ? 'Original' : 'Retificadora',
    totalNotasC100: totalC100,
    totalNotasD100: totalD100,
    totalDebitoICMS,
    totalCreditoICMS,
    totalICMSApurado,
    totalPISApurado,
    totalCOFINSApurado
  };

  // Hash SHA-256
  const hash = await calculateSha256(txtContent);

  // Vínculo com Cadastro Central
  const cleanActiveCnpj = activeCompany.cnpj.replace(/\D/g, '');
  const cleanSpedCnpj = cnpjSped.replace(/\D/g, '');

  let status: FiscalImportStatus = 'Importado';
  if (cleanSpedCnpj && cleanSpedCnpj !== cleanActiveCnpj) {
    status = 'Divergência de Cadastro';
    alertas.push(`O CNPJ da escrituração SPED (${formatCnpjCpf(cnpjSped)}) difere da empresa ativa selecionada (${activeCompany.cnpj}).`);
  }

  const fiscalDoc: FiscalDocument = {
    id: `fiscal_sped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tipoDocumento,
    modelo: isContrib ? 'EFD-Contribuições' : 'EFD ICMS/IPI',
    numero: `${periodoInicio.substring(3)}`,
    serie: 'SPED',
    chaveAcesso: null,
    dataEmissao: periodoFim,
    versaoLeiaute: codVer,
    periodoReferencia: `${periodoInicio} a ${periodoFim}`,
    ambiente: 'Produção',
    finalidade: headerFields[3] === '0' ? 'Original' : 'Retificadora',
    tipoOperacao: 'Mista',
    emitente: {
      tipo: 'EMITENTE',
      cnpjCpf: formatCnpjCpf(cnpjSped),
      razaoSocial,
      uf
    },
    naturezaOperacao: isContrib ? 'Escrituração Fiscal Digital das Contribuições' : 'Escrituração Fiscal Digital ICMS/IPI',
    itens: [],
    totais: {
      valorICMS: totalICMSApurado,
      valorPIS: totalPISApurado,
      valorCOFINS: totalCOFINSApurado,
      valorTotalDocumento: totalICMSApurado + totalPISApurado + totalCOFINSApurado
    },
    efdData: {
      summary: efdSummary,
      blocos: parsedBlocks
    },
    arquivoOriginal: txtContent,
    nomeOriginal: fileName,
    extensao: 'txt',
    hashSha256: hash,
    tamanhoBytes: txtContent.length,
    dataHoraImportacao: timestamp,
    usuarioResponsavel: currentUser,
    organizacaoAdministradoraId: currentOrgId,
    empresaAtivaId: activeCompany.id,
    empresaAtivaCnpj: activeCompany.cnpj,
    status,
    errosValidacao: erros,
    alertasValidacao: alertas
  };

  return { documento: fiscalDoc, status, erros, alertas };
}

// Parser Principal de Planilhas CSV / Template Estruturado
export async function parseFiscalCsv(
  csvContent: string,
  fileName: string,
  activeCompany: CompanyRegistration,
  currentUser: { id: string; nome: string; email: string },
  currentOrgId: string
): Promise<{ documento?: FiscalDocument; status: FiscalImportStatus; erros: FiscalValidationError[]; alertas: string[] }> {
  const erros: FiscalValidationError[] = [];
  const alertas: string[] = [];
  const timestamp = new Date().toISOString();

  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    erros.push({
      motivo: 'Arquivo CSV deve possuir cabeçalho oficial e ao menos uma linha de dados.',
      origem: 'CSV Parser',
      dataHora: timestamp,
      regraViolada: 'Estrutura Mínima CSV'
    });
    return { status: 'Rejeitado', erros, alertas };
  }

  // Detectar separador (; ou , ou tab)
  const headerLine = lines[0];
  const sep = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
  const headers = headerLine.split(sep).map(h => h.trim().toUpperCase().replace(/["']/g, ''));

  const getColIdx = (names: string[]) => {
    return headers.findIndex(h => names.some(n => h === n || h.includes(n)));
  };

  const idxChave = getColIdx(['CHAVE', 'CHAVE_ACESSO', 'CHAVENFE']);
  const idxNumero = getColIdx(['NUMERO', 'NUM', 'NNF', 'NUM_DOC']);
  const idxSerie = getColIdx(['SERIE']);
  const idxData = getColIdx(['DATA', 'DATA_EMISSAO', 'DEMI', 'DHEMI']);
  const idxEmitCnpj = getColIdx(['CNPJ_EMITENTE', 'EMIT_CNPJ', 'CNPJ_EMIT']);
  const idxEmitRazao = getColIdx(['RAZAO_EMITENTE', 'EMIT_NOME', 'EMITENTE']);
  const idxDestCnpj = getColIdx(['CNPJ_DESTINATARIO', 'DEST_CNPJ']);
  const idxDestRazao = getColIdx(['RAZAO_DESTINATARIO', 'DEST_NOME', 'DESTINATARIO']);
  const idxValorTotal = getColIdx(['VALOR_TOTAL', 'VALOR', 'VNF', 'TOTAL']);
  const idxCfop = getColIdx(['CFOP']);
  const idxNcm = getColIdx(['NCM']);
  const idxDescricao = getColIdx(['DESCRICAO', 'PRODUTO', 'ITEM', 'XPROD']);
  const idxValorIcms = getColIdx(['VALOR_ICMS', 'VICMS']);
  const idxValorPis = getColIdx(['VALOR_PIS', 'VPIS']);
  const idxValorCofins = getColIdx(['VALOR_COFINS', 'VCOFINS']);
  const idxValorIbs = getColIdx(['VALOR_IBS', 'VIBS', 'IBS']);
  const idxValorCbs = getColIdx(['VALOR_CBS', 'VCBS', 'CBS']);

  const itens: FiscalItem[] = [];
  let somaTotal = 0;
  let somaIcms = 0;
  let somaPis = 0;
  let somaCofins = 0;
  let somaIbs = 0;
  let somaCbs = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue;

    const numItem = i;
    const desc = (idxDescricao >= 0 && cols[idxDescricao]) || `Item ${i}`;
    const ncm = (idxNcm >= 0 && cols[idxNcm]) || null;
    const cfop = (idxCfop >= 0 && cols[idxCfop]) || '5102';
    const vTot = (idxValorTotal >= 0 && parseFloat(cols[idxValorTotal]?.replace(',', '.'))) || 0;
    const vIcms = (idxValorIcms >= 0 && parseFloat(cols[idxValorIcms]?.replace(',', '.'))) || 0;
    const vPis = (idxValorPis >= 0 && parseFloat(cols[idxValorPis]?.replace(',', '.'))) || 0;
    const vCofins = (idxValorCofins >= 0 && parseFloat(cols[idxValorCofins]?.replace(',', '.'))) || 0;
    const vIbs = (idxValorIbs >= 0 && parseFloat(cols[idxValorIbs]?.replace(',', '.'))) || null;
    const vCbs = (idxValorCbs >= 0 && parseFloat(cols[idxValorCbs]?.replace(',', '.'))) || null;

    somaTotal += vTot;
    somaIcms += vIcms;
    somaPis += vPis;
    somaCofins += vCofins;
    if (vIbs !== null) somaIbs += vIbs;
    if (vCbs !== null) somaCbs += vCbs;

    itens.push({
      numeroItem: numItem,
      codigo: `ITM_${i}`,
      descricao: desc,
      ncm,
      cfop,
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: vTot,
      valorTotal: vTot,
      tributacao: {
        icms: vIcms > 0 ? { valor: vIcms } : null,
        pis: vPis > 0 ? { valor: vPis } : null,
        cofins: vCofins > 0 ? { valor: vCofins } : null,
        ibs: vIbs !== null ? { valorIBSTotal: vIbs } : null,
        cbs: vCbs !== null ? { valorCBS: vCbs } : null
      }
    });
  }

  const firstRow = lines[1].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
  const chave = idxChave >= 0 ? firstRow[idxChave] : null;
  const numero = (idxNumero >= 0 && firstRow[idxNumero]) || '1';
  const serie = (idxSerie >= 0 && firstRow[idxSerie]) || '1';
  const dtEmissao = (idxData >= 0 && firstRow[idxData]) || timestamp;
  const emitCnpj = (idxEmitCnpj >= 0 && firstRow[idxEmitCnpj]) || activeCompany.cnpj;
  const emitRazao = (idxEmitRazao >= 0 && firstRow[idxEmitRazao]) || activeCompany.razaoSocial;
  const destCnpj = (idxDestCnpj >= 0 && firstRow[idxDestCnpj]) || null;
  const destRazao = (idxDestRazao >= 0 && firstRow[idxDestRazao]) || null;

  const hash = await calculateSha256(csvContent);

  const fiscalDoc: FiscalDocument = {
    id: `fiscal_csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tipoDocumento: 'EXCEL_CSV_TEMPLATE',
    modelo: 'Planilha Estruturada',
    numero,
    serie,
    chaveAcesso: chave,
    dataEmissao: dtEmissao,
    versaoLeiaute: 'Template v2026.1',
    periodoReferencia: dtEmissao.substring(0, 7),
    ambiente: 'Produção',
    finalidade: 'Normal',
    tipoOperacao: 'Saída',
    emitente: {
      tipo: 'EMITENTE',
      cnpjCpf: formatCnpjCpf(emitCnpj),
      razaoSocial: emitRazao,
      uf: activeCompany.uf
    },
    destinatario: destCnpj ? {
      tipo: 'DESTINATARIO',
      cnpjCpf: formatCnpjCpf(destCnpj),
      razaoSocial: destRazao || 'Cliente / Destinatário',
      uf: 'SP'
    } : null,
    naturezaOperacao: 'Importação por Planilha Estruturada',
    itens,
    totais: {
      valorProdutos: somaTotal,
      valorICMS: somaIcms > 0 ? somaIcms : null,
      valorPIS: somaPis > 0 ? somaPis : null,
      valorCOFINS: somaCofins > 0 ? somaCofins : null,
      valorIBSTotal: somaIbs > 0 ? somaIbs : null,
      valorCBS: somaCbs > 0 ? somaCbs : null,
      valorTotalDocumento: somaTotal
    },
    arquivoOriginal: csvContent,
    nomeOriginal: fileName,
    extensao: 'csv',
    hashSha256: hash,
    tamanhoBytes: csvContent.length,
    dataHoraImportacao: timestamp,
    usuarioResponsavel: currentUser,
    organizacaoAdministradoraId: currentOrgId,
    empresaAtivaId: activeCompany.id,
    empresaAtivaCnpj: activeCompany.cnpj,
    status: 'Importado',
    errosValidacao: erros,
    alertasValidacao: alertas
  };

  return { documento: fiscalDoc, status: 'Importado', erros, alertas };
}
