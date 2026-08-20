export type TaxSystemType = 'atual' | 'transicao' | 'definitivo';

export type YearPeriod = 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033;

export type EconomicSegment = 
  | 'Comércio'
  | 'Indústria'
  | 'Serviços'
  | 'Varejo'
  | 'Atacado'
  | 'Tecnologia / SaaS'
  | 'Agronegócio'
  | 'Saúde'
  | 'Educação'
  | 'Construção Civil'
  | 'Logística / Transporte'
  | 'Energia'
  | 'Imobiliário'
  | 'Exportação'
  | 'Importação'
  | 'Zona Franca de Manaus';

export interface TaxItem {
  id: string;
  docFiscalId: string;
  numNota: string;
  serie: string;
  data: string; // YYYY-MM-DD
  empresaId: string;
  empresaNome: string;
  filialId: string;
  filialNome: string;
  ufOrigem: string;
  municipioOrigem: string;
  ufDestino: string;
  municipioDestino: string;
  emitente: string;
  destinatario: string;
  produtoId: string;
  produtoCodigo: string;
  produtoDescricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  cst: string;
  csosn?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  valorLiquido?: number; // Valor Bruto deduzido de tributos legados por dentro (Base pura da Reforma)
  descontos: number;
  frete: number;
  seguro: number;
  outrasDespesas: number;
  
  // Tax calculation current system (Legado)
  basePisCofinsAtual: number;
  aliqPisAtual: number;
  vlrPisAtual: number;
  aliqCofinsAtual: number;
  vlrCofinsAtual: number;
  
  baseIcmsAtual: number;
  aliqIcmsAtual: number;
  vlrIcmsAtual: number;
  vlrIcmsStAtual: number;
  vlrFcpAtual: number;
  vlrDifalAtual: number;
  
  baseIpiAtual: number;
  aliqIpiAtual: number;
  vlrIpiAtual: number;
  
  baseIssAtual: number;
  aliqIssAtual: number;
  vlrIssAtual: number;
  
  creditosAtual: number;
  debitosAtual: number;
  totalTributosAtual: number;
  
  // Tax calculation Reform (Reforma - LC 214/2025)
  baseCbsReforma: number;
  aliqCbsReforma: number;
  vlrCbsReforma: number;
  
  baseIbsReforma: number;
  aliqIbsEstadualReforma: number;
  vlrIbsEstadualReforma: number;
  aliqIbsMunicipalReforma: number;
  vlrIbsMunicipalReforma: number;
  vlrIbsTotalReforma: number;
  
  baseImpostoSeletivoReforma: number;
  aliqImpostoSeletivoReforma: number;
  vlrImpostoSeletivoReforma: number;
  
  creditosReforma: number;
  debitosReforma: number;
  totalTributosReforma: number;
  
  // Comparative Impact
  diferencaRS: number;
  diferencaPercent: number;
  cargaTributariaAtualPercent: number;
  cargaTributariaReformaPercent: number;
  margemBrutaAtualPercent: number;
  margemBrutaReformaPercent: number;
  
  baseLegalAtual: string;
  baseLegalReforma: string;
  isRegimeEspecial?: boolean;
  hasSplitPayment?: boolean;
  hasCashback?: boolean;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  data: string;
  empresa: string;
  filial: string;
  emitente: string;
  destinatario: string;
  ufOrigem: string;
  municipioOrigem: string;
  ufDestino: string;
  municipioDestino: string;
  tipoOperacao: 'Entrada' | 'Saída';
  cfopPredominante: string;
  regimeTributario: 'Lucro Real' | 'Lucro Presumido' | 'Simples Nacional';
  
  qtdItens: number;
  valorProdutos: number;
  frete: number;
  seguro: number;
  descontos: number;
  outrasDespesas: number;
  valorTotalNota: number;
  
  // Aggregated Taxes
  totalAtual: number;
  totalReforma: number;
  diferencaRS: number;
  diferencaPercent: number;
  
  creditosAtual: number;
  debitosAtual: number;
  creditosReforma: number;
  debitosReforma: number;
  
  impactoFiscal: 'Aumento de Carga' | 'Redução de Carga' | 'Neutro';
  impactoFinanceiroRS: number;
  impactoContabilRS: number;
  
  itens: TaxItem[];
}

export interface ProductDetail {
  codigo: string;
  descricao: string;
  ncm: string;
  cest: string;
  gtin: string;
  classificacaoFiscal: string;
  familia: string;
  categoria: string;
  marca: string;
  fornecedorPrincipal: string;
  clientesPrincipais: string[];
  origem: string;
  destinos: string[];
  operacoesRealizadas: number;
  quantidadeVendida: number;
  receitaTotal: number;
  custoTotal: number;
  precoCompraMedio: number;
  precoVendaMedio: number;
  markupAtual: number;
  margemAtualPercent: number;
  
  tributosAtuais: number;
  tributosReforma: number;
  creditosAtuais: number;
  debitosAtuais: number;
  creditosReforma: number;
  debitosReforma: number;
  cargaTributariaAtualPercent: number;
  cargaTributariaReformaPercent: number;
  
  impactoFiscal: number;
  impactoFinanceiro: number;
  impactoContabil: number;
  risco: 'Alto' | 'Médio' | 'Baixo';
  oportunidade: string;
  
  // 2026-2033 Timeline projection
  timelineData: ProductTimelinePoint[];
}

export interface ProductTimelinePoint {
  ano: YearPeriod | 'Atual';
  receita: number;
  custo: number;
  tributos: number;
  creditos: number;
  cargaLiquida: number;
  margemPercent: number;
  markup: number;
  ebitda: number;
  fluxoCaixa: number;
  capitalGiro: number;
}

export interface TaxMatrixRow {
  tributo: string;
  sistemaAtual: number;
  a2026: number;
  a2027: number;
  a2028: number;
  a2029: number;
  a2030: number;
  a2031: number;
  a2032: number;
  a2033: number;
  baseLegal: string;
  statusRegulamentacao?: 'Definido em Lei' | 'Pendente de Regulamentação';
}

export interface ExecutiveKPIs {
  receitaBruta: number;
  receitaLiquida: number;
  tributosAtuais: number;
  tributosReforma: number;
  cargaTributariaAtualPercent: number;
  cargaTributariaReformaPercent: number;
  creditosAtuais: number;
  debitosAtuais: number;
  creditosReforma: number;
  debitosReforma: number;
  impactoFiscalRS: number;
  impactoFiscalPercent: number;
  impactoFinanceiroRS: number;
  impactoContabilRS: number;
  ebitdaAtual: number;
  ebitdaReforma: number;
  margemEbitdaAtualPercent: number;
  margemEbitdaReformaPercent: number;
  fluxoCaixaAtual: number;
  fluxoCaixaReforma: number;
  capitalGiroAtual: number;
  capitalGiroReforma: number;
  impactoAcumulado2026_2033: number;
}

export interface DREComparative {
  conta: string;
  codigoContabil: string;
  valorAtual: number;
  valorReforma2026: number;
  valorReforma2027: number;
  valorReformaDefinitivo2033: number;
  variacaoAbsoluta: number;
  variacaoPercentual: number;
}

export interface BalancoPatrimonialComparative {
  grupo: 'ATIVO' | 'PASSIVO' | 'PATRIMÔNIO LÍQUIDO';
  subgrupo: string;
  codigoContabil: string;
  descricaoConta: string;
  valorAtual: number;
  valorReformaDefinitivo: number;
  variacaoRS: number;
  reflexoPatrimonial: string;
}

export interface SensitivityParams {
  precoVendaAdjPercent: number;
  custoInsumoAdjPercent: number;
  repasseTributarioPercent: number;
  aproveitamentoCreditoInsumosPercent: number;
  aliqCbsEstimada: number; // Def: 8.8
  aliqIbsEstimada: number; // Def: 17.7
  aliqImpostoSeletivoEstimada: number; // Def: 5.0
  mixProdutos: 'Atual' | 'Foco Alta Margem' | 'Insumos com Crédito Pleno';
  segmento: EconomicSegment;
  anoSimulacao: YearPeriod;
}

export interface SoftwareBenchmark {
  id: number;
  software: string;
  fabricante: string;
  focoMercado: string;
  coberturaReforma: string;
  integracaoErp: string;
  splitPaymentReady: boolean;
  itemLevelEngine: boolean;
  dreImpactModule: boolean;
  cashbackModule: boolean;
  diferencialEbitax: string;
}

export interface CalculationMemoryDetails {
  item: TaxItem;
  passosCalculo: {
    passo: number;
    etapa: string;
    formula: string;
    valorOriginal: number;
    baseCalculo: number;
    aliquota: number;
    redutoresOuBeneficios: number;
    creditoCalculado: number;
    debitoCalculado: number;
    resultadoFinal: number;
    regraAplicada: string;
    baseLegal: string;
    artigo?: string;
    inciso?: string;
    paragrafo?: string;
    fonteOficial: string;
    dataConsulta: string;
    versaoNormativa: string;
  }[];
}
