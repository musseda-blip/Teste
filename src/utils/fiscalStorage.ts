import { FiscalDocument, FiscalImportStatus } from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';
import { getAuditedFiscalSeedDocuments } from '../data/fiscalSeedDocuments';

const FISCAL_DOCS_STORAGE_KEY = 'tax_reform_fiscal_documents_v3';

export function getSeedFiscalDocuments(company?: CompanyRegistration): FiscalDocument[] {
  return getAuditedFiscalSeedDocuments(company);
}

export function getAllFiscalDocuments(company?: CompanyRegistration): FiscalDocument[] {
  try {
    const raw = localStorage.getItem(FISCAL_DOCS_STORAGE_KEY);
    const seed = getAuditedFiscalSeedDocuments(company);

    if (!raw) {
      localStorage.setItem(FISCAL_DOCS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as FiscalDocument[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(FISCAL_DOCS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    // Se houver documentos mas precisarem dos dados dinâmicos da empresa ativa
    if (company) {
      return seed;
    }

    return parsed;
  } catch (e) {
    console.error('Erro ao ler documentos fiscais do localStorage:', e);
    return getAuditedFiscalSeedDocuments(company);
  }
}

export function getFiscalDocumentsByCompany(company?: CompanyRegistration): FiscalDocument[] {
  return getAuditedFiscalSeedDocuments(company);
}

export function getFiscalDocumentById(id: string, company?: CompanyRegistration): FiscalDocument | null {
  const all = getAllFiscalDocuments(company);
  return all.find(d => d.id === id) || null;
}

export function getFiscalDocumentByChave(chave: string, company?: CompanyRegistration): FiscalDocument | null {
  const cleanKey = chave.replace(/\D/g, '');
  if (!cleanKey) return null;
  const all = getAllFiscalDocuments(company);
  return all.find(d => d.chaveAcesso && d.chaveAcesso.replace(/\D/g, '') === cleanKey) || null;
}

export interface SaveFiscalDocumentResult {
  success: boolean;
  status: FiscalImportStatus;
  message: string;
  documento?: FiscalDocument;
  isDuplicate?: boolean;
}

export function saveFiscalDocument(doc: FiscalDocument, company?: CompanyRegistration): SaveFiscalDocumentResult {
  const all = getAllFiscalDocuments(company);

  // 1. Verificação de Duplicidade Oficial por Chave
  if (doc.chaveAcesso && doc.chaveAcesso.trim().length > 0) {
    const cleanKey = doc.chaveAcesso.replace(/\D/g, '');
    const dupKey = all.find(d => d.chaveAcesso && d.chaveAcesso.replace(/\D/g, '') === cleanKey);
    if (dupKey) {
      return {
        success: false,
        status: 'Duplicado',
        isDuplicate: true,
        message: `Documento já importado anteriormente com a Chave de Acesso: ${doc.chaveAcesso}.`,
        documento: dupKey
      };
    }
  }

  try {
    const updated = [doc, ...all];
    localStorage.setItem(FISCAL_DOCS_STORAGE_KEY, JSON.stringify(updated));
    return {
      success: true,
      status: doc.status,
      message: `Documento fiscal ${doc.modelo} Nº ${doc.numero} importado e auditado com sucesso.`,
      documento: doc
    };
  } catch (e: any) {
    console.error('Falha ao persistir documento fiscal:', e);
    return {
      success: false,
      status: 'Rejeitado',
      message: 'Erro ao gravar documento fiscal: ' + (e?.message || 'Falha de I/O')
    };
  }
}

export function deleteFiscalDocument(id: string): boolean {
  try {
    const all = getAllFiscalDocuments();
    const filtered = all.filter(d => d.id !== id);
    localStorage.setItem(FISCAL_DOCS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}

export function resetFiscalDocumentsToSeed(company?: CompanyRegistration): FiscalDocument[] {
  const seed = getAuditedFiscalSeedDocuments(company);
  localStorage.setItem(FISCAL_DOCS_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
