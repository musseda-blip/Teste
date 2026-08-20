import { TaxMatrixRow, YearPeriod, EconomicSegment } from '../types/tax';

export const OFFICIAL_SOURCES = [
  { nome: 'Planalto - EC 132/2023', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm', versao: 'EC 132/2023' },
  { nome: 'Planalto - LC 214/2025 (Regulamentação IBS/CBS/IS)', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm', versao: 'LC 214/2025' },
  { nome: 'Receita Federal do Brasil - Portal Reforma Tributária', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria', versao: 'RFB 2026.1' },
  { nome: 'Comitê Gestor do IBS (CGIBS)', url: 'https://www.cgibs.gov.br', versao: 'Atos Normativos 2026' },
  { nome: 'CONFAZ - Conselho Nacional de Política Fazendária', url: 'https://www.confaz.fazenda.gov.br', versao: 'Convênios ICMS 2026' },
  { nome: 'SPED - Sistema Público de Escrituração Digital', url: 'http://sped.rfb.gov.br', versao: 'Notas Técnicas NF-e/NFC-e 2026' },
];

export const TRANSITION_RATES = {
  2025: { cbs: 0.0, ibsEstadual: 0.0, ibsMunicipal: 0.0, is: 0.0, pisCofinsReducao: 0.0, icmsIssReducao: 0.0 },
  2026: { cbs: 0.009, ibsEstadual: 0.0005, ibsMunicipal: 0.0005, is: 0.0, pisCofinsReducao: 0.0, icmsIssReducao: 0.0 }, // Ano-teste: 0.90% CBS, 0.10% IBS (0.05% EST + 0.05% MUN), compensável com PIS/COFINS
  2027: { cbs: 0.088, ibsEstadual: 0.0005, ibsMunicipal: 0.0005, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.0 }, // CBS Plena 8.80%, PIS/COFINS extintos, IBS preparatório 0.10%, ICMS/ISS 100%
  2028: { cbs: 0.088, ibsEstadual: 0.0005, ibsMunicipal: 0.0005, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.0 }, // CBS Plena 8.80%, PIS/COFINS extintos, IBS preparatório 0.10%, ICMS/ISS 100%
  2029: { cbs: 0.088, ibsEstadual: 0.0120, ibsMunicipal: 0.0057, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.10 }, // Transição IBS 10% (1.77% = 1.20% EST + 0.57% MUN), ICMS/ISS 90%
  2030: { cbs: 0.088, ibsEstadual: 0.0240, ibsMunicipal: 0.0114, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.20 }, // Transição IBS 20% (3.54% = 2.40% EST + 1.14% MUN), ICMS/ISS 80%
  2031: { cbs: 0.088, ibsEstadual: 0.0360, ibsMunicipal: 0.0171, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.30 }, // Transição IBS 30% (5.31% = 3.60% EST + 1.71% MUN), ICMS/ISS 70%
  2032: { cbs: 0.088, ibsEstadual: 0.0480, ibsMunicipal: 0.0228, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 0.40 }, // Transição IBS 40% (7.08% = 4.80% EST + 2.28% MUN), ICMS/ISS 60%
  2033: { cbs: 0.088, ibsEstadual: 0.1200, ibsMunicipal: 0.0570, is: 0.05, pisCofinsReducao: 1.0, icmsIssReducao: 1.00 }, // Vigência Plena: IBS 17.70% (12.00% EST + 5.70% MUN), CBS 8.80%, ICMS/ISS 0%
};

export const TAX_MATRIX_TEMPORAL: TaxMatrixRow[] = [
  {
    tributo: 'PIS',
    sistemaAtual: 1.65,
    a2026: 1.65,
    a2027: 0.00,
    a2028: 0.00,
    a2029: 0.00,
    a2030: 0.00,
    a2031: 0.00,
    a2032: 0.00,
    a2033: 0.00,
    baseLegal: 'Art. 129, I da LC 214/2025 (Extinção em 2027)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'COFINS',
    sistemaAtual: 7.60,
    a2026: 7.60,
    a2027: 0.00,
    a2028: 0.00,
    a2029: 0.00,
    a2030: 0.00,
    a2031: 0.00,
    a2032: 0.00,
    a2033: 0.00,
    baseLegal: 'Art. 129, I da LC 214/2025 (Extinção em 2027)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'ICMS (Médio)',
    sistemaAtual: 18.00,
    a2026: 18.00,
    a2027: 18.00,
    a2028: 18.00,
    a2029: 16.20,
    a2030: 14.40,
    a2031: 12.60,
    a2032: 10.80,
    a2033: 0.00,
    baseLegal: 'Art. 131 da LC 214/2025 (Transição proporcional 2029-2032)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'ISS (Médio)',
    sistemaAtual: 5.00,
    a2026: 5.00,
    a2027: 5.00,
    a2028: 5.00,
    a2029: 4.50,
    a2030: 4.00,
    a2031: 3.50,
    a2032: 3.00,
    a2033: 0.00,
    baseLegal: 'Art. 131 da LC 214/2025 (Transição proporcional 2029-2032)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'IPI',
    sistemaAtual: 5.00,
    a2026: 5.00,
    a2027: 0.00,
    a2028: 0.00,
    a2029: 0.00,
    a2030: 0.00,
    a2031: 0.00,
    a2032: 0.00,
    a2033: 0.00,
    baseLegal: 'Art. 130 da LC 214/2025 (Alíquota zero em 2027 salvo ZFM)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'CBS (Federal)',
    sistemaAtual: 0.00,
    a2026: 0.90,
    a2027: 8.80,
    a2028: 8.80,
    a2029: 8.80,
    a2030: 8.80,
    a2031: 8.80,
    a2032: 8.80,
    a2033: 8.80,
    baseLegal: 'Art. 15 da LC 214/2025 (CBS Teste em 2026 e Plena em 2027)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'IBS Estadual',
    sistemaAtual: 0.00,
    a2026: 0.05,
    a2027: 0.05,
    a2028: 0.05,
    a2029: 1.20,
    a2030: 2.40,
    a2031: 3.60,
    a2032: 4.80,
    a2033: 12.00,
    baseLegal: 'Art. 22 da LC 214/2025 (Comitê Gestor IBS)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'IBS Municipal',
    sistemaAtual: 0.00,
    a2026: 0.05,
    a2027: 0.05,
    a2028: 0.05,
    a2029: 0.57,
    a2030: 1.14,
    a2031: 1.71,
    a2032: 2.28,
    a2033: 5.70,
    baseLegal: 'Art. 22 da LC 214/2025 (Comitê Gestor IBS)',
    statusRegulamentacao: 'Definido em Lei',
  },
  {
    tributo: 'Imposto Seletivo (IS)',
    sistemaAtual: 0.00,
    a2026: 0.00,
    a2027: 5.00,
    a2028: 5.00,
    a2029: 5.00,
    a2030: 5.00,
    a2031: 5.00,
    a2032: 5.00,
    a2033: 5.00,
    baseLegal: 'Art. 153, VIII da CF/88 c/c Art. 400 da LC 214/2025',
    statusRegulamentacao: 'Pendente de Regulamentação',
  },
];

export function getSectorPriceRule(segmento: EconomicSegment): number {
  switch (segmento) {
    case 'Saúde': return 5.0;
    case 'Educação': return 4.0;
    case 'Agronegócio': return 3.0;
    case 'Comércio': return 2.5;
    case 'Indústria': return 6.0;
    case 'Serviços': return 8.0;
    case 'Varejo': return 2.0;
    case 'Tecnologia / SaaS': return 0.0;
    case 'Logística / Transporte': return 5.0;
    case 'Zona Franca de Manaus': return 1.5;
    default: return 0.0;
  }
}

export function getSegmentTaxModifiers(segmento: EconomicSegment) {
  // Regra Estrita: Respeita apenas o PREÇO e NÃO altera impacto tributário (Fator CBS/IBS mantido em 1.0)
  return { 
    fatorCbsIbs: 1.0, 
    isApplicable: false, 
    descricao: 'Regra por Setor: Variação direcionada exclusivamente ao preço de venda, mantendo a carga tributária nominal sem alterações de impacto.' 
  };
}
