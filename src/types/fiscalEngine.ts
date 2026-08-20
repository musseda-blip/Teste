// Tipos do Modelo Fiscal Estruturado Interno e Motor de Importação

export type FiscalDocumentType = 
  | 'NFE' 
  | 'NFCE' 
  | 'NFSE' 
  | 'CTE' 
  | 'MDFE' 
  | 'EFD_ICMS_IPI' 
  | 'EFD_CONTRIBUICOES' 
  | 'EXCEL_CSV_TEMPLATE' 
  | 'EVENTO_FISCAL';

export type FiscalImportStatus = 
  | 'Recebido' 
  | 'Identificado' 
  | 'Validando' 
  | 'Validado' 
  | 'Importado' 
  | 'Importado com Alertas' 
  | 'Rejeitado' 
  | 'Duplicado' 
  | 'Divergência de Cadastro';

export interface FiscalParticipant {
  tipo: 'EMITENTE' | 'DESTINATARIO' | 'TOMADOR' | 'REMETENTE' | 'EXPEDIDOR' | 'RECEBEDOR' | 'TRANSPORTADOR';
  cnpjCpf: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  inscricaoEstadual?: string | null;
  inscricaoMunicipal?: string | null;
  regimeTributario?: string | null; // CRT 1=Simples, 2=Simples excesso, 3=Normal
  uf: string;
  municipio?: string | null;
  codigoMunicipio?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  pais?: string | null;
}

export interface FiscalTaxICMS {
  cst?: string | null;
  csosn?: string | null;
  origem?: string | null;
  modalidadeBC?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valor?: number | null;
  percentualReducaoBC?: number | null;
  modalidadeBCST?: string | null;
  baseCalculoST?: number | null;
  aliquotaST?: number | null;
  valorST?: number | null;
  percentualFCP?: number | null;
  valorFCP?: number | null;
  valorDiferido?: number | null;
  valorDesonerado?: number | null;
  motivoDesoneracao?: string | null;
}

export interface FiscalTaxIPI {
  cst?: string | null;
  cnpjProdutor?: string | null;
  codigoEnquadramento?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valor?: number | null;
}

export interface FiscalTaxPIS {
  cst?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valor?: number | null;
  quantidadeBC?: number | null;
  aliquotaReais?: number | null;
}

export interface FiscalTaxCOFINS {
  cst?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valor?: number | null;
  quantidadeBC?: number | null;
  aliquotaReais?: number | null;
}

export interface FiscalTaxISSQN {
  cst?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valor?: number | null;
  codigoMunicipio?: string | null;
  itemListaServico?: string | null;
  codigoTributacaoMunicipio?: string | null;
  valorRetencao?: number | null;
}

export interface FiscalTaxIBS {
  cst?: string | null;
  cClassTrib?: string | null; // Código de Classificação Tributária Reforma
  baseCalculo?: number | null;
  aliquotaEstadual?: number | null;
  valorIBSEstadual?: number | null;
  aliquotaMunicipal?: number | null;
  valorIBSMunicipal?: number | null;
  aliquotaTotal?: number | null;
  valorIBSTotal?: number | null;
  percentualReducao?: number | null;
  valorDiferimento?: number | null;
  valorCreditoPresumido?: number | null;
  valorEstornoDevolucao?: number | null;
}

export interface FiscalTaxCBS {
  cst?: string | null;
  cClassTrib?: string | null; // Código de Classificação Tributária Reforma
  baseCalculo?: number | null;
  aliquota?: number | null;
  valorCBS?: number | null;
  percentualReducao?: number | null;
  valorDiferimento?: number | null;
  valorCreditoPresumido?: number | null;
  valorEstornoDevolucao?: number | null;
}

export interface FiscalTaxIS {
  cst?: string | null;
  cClassTrib?: string | null;
  baseCalculo?: number | null;
  aliquota?: number | null;
  valorIS?: number | null;
}

export interface FiscalItem {
  numeroItem: number;
  codigo: string;
  descricao: string;
  ncm?: string | null;
  cest?: string | null;
  nbs?: string | null;
  codigoServico?: string | null;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  desconto?: number | null;
  frete?: number | null;
  seguro?: number | null;
  outrasDespesas?: number | null;
  tributacao: {
    icms?: FiscalTaxICMS | null;
    ipi?: FiscalTaxIPI | null;
    pis?: FiscalTaxPIS | null;
    cofins?: FiscalTaxCOFINS | null;
    issqn?: FiscalTaxISSQN | null;
    ibs?: FiscalTaxIBS | null;
    cbs?: FiscalTaxCBS | null;
    is?: FiscalTaxIS | null;
    outrosTributos?: Record<string, any> | null;
  };
}

export interface FiscalTotals {
  valorProdutos?: number | null;
  valorServicos?: number | null;
  valorFrete?: number | null;
  valorSeguro?: number | null;
  valorDesconto?: number | null;
  valorOutrasDespesas?: number | null;
  baseCalculoICMS?: number | null;
  valorICMS?: number | null;
  baseCalculoICMSST?: number | null;
  valorICMSST?: number | null;
  valorIPI?: number | null;
  valorPIS?: number | null;
  valorCOFINS?: number | null;
  valorISS?: number | null;
  valorIBSEstadual?: number | null;
  valorIBSMunicipal?: number | null;
  valorIBSTotal?: number | null;
  valorCBS?: number | null;
  valorIS?: number | null;
  valorOutrosTributos?: number | null;
  valorTotalDocumento: number;
}

export interface FiscalDocumentReference {
  tipo: 'NFE' | 'CTE' | 'MDFE' | 'OUTRO';
  chaveAcesso?: string | null;
  numero?: string | null;
  serie?: string | null;
  dataEmissao?: string | null;
  cnpjEmitente?: string | null;
}

export interface FiscalEvent {
  tipoEvento: string;
  descricaoEvento: string;
  chaveDocumento: string;
  protocolo?: string | null;
  dataHora: string;
  autorEvento?: string | null;
  motivo?: string | null;
  status?: string | null;
  numeroSequencial?: number | null;
}

export interface FiscalValidationError {
  campo?: string | null;
  registro?: string | null;
  motivo: string;
  regraViolada?: string | null;
  origem: string;
  dataHora: string;
}

// SPED EFD Estrutura Oficial de Registros
export interface EFDRecord {
  registro: string; // Ex: '0000', '0150', 'C100', 'C170', 'C190', 'D100', 'E110', 'M200', 'M600', '9999'
  linhaNumero: number;
  campos: string[];
}

export interface EFDParsedBlock {
  bloco: string; // '0', 'C', 'D', 'E', 'G', 'H', 'K', '1', '9' ou 'M'
  totalLinhas: number;
  registros: EFDRecord[];
}

export interface EFDFiscalSummary {
  tipoEFD: 'EFD_ICMS_IPI' | 'EFD_CONTRIBUICOES';
  versaoLeiaute: string;
  periodoInicio: string;
  periodoFim: string;
  cnpjEstabelecimento: string;
  razaoSocial: string;
  uf: string;
  codigoMunicipio?: string | null;
  indicadorFinalidade: string;
  indicadorPerfil?: string | null;
  indicadorAtividade?: string | null;
  totalNotasC100: number;
  totalNotasD100: number;
  totalDebitoICMS?: number | null;
  totalCreditoICMS?: number | null;
  totalICMSApurado?: number | null;
  totalIPIApurado?: number | null;
  totalPISApurado?: number | null;
  totalCOFINSApurado?: number | null;
  totalCreditoPIS?: number | null;
  totalCreditoCOFINS?: number | null;
}

export interface FiscalDocument {
  // Identificador Único do Registro no Sistema
  id: string;

  // 1. IDENTIFICAÇÃO
  tipoDocumento: FiscalDocumentType;
  modelo: string; // '55' (NF-e), '65' (NFC-e), '57' (CT-e), '58' (MDF-e), 'NFS-e', 'SPED-ICMS-IPI', etc.
  numero: string;
  serie: string;
  chaveAcesso?: string | null;
  dataEmissao: string;
  dataEntradaSaida?: string | null;
  versaoLeiaute: string;
  periodoReferencia?: string | null;
  ambiente: 'Produção' | 'Homologação' | 'Não Informado';
  finalidade: string; // 'Normal' | 'Complementar' | 'Ajuste' | 'Devolução'
  tipoOperacao: 'Entrada' | 'Saída' | 'Mista';

  // 2. EMPRESA EMITENTE
  emitente: FiscalParticipant;

  // 3. PARTICIPANTES
  destinatario?: FiscalParticipant | null;
  tomador?: FiscalParticipant | null;
  remetente?: FiscalParticipant | null;
  expedidor?: FiscalParticipant | null;
  recebedor?: FiscalParticipant | null;
  transportador?: FiscalParticipant | null;

  // 4. OPERAÇÃO
  naturezaOperacao: string;
  cfopPrincipal?: string | null;
  indicadoresOperacao?: Record<string, string> | null;
  municipioOrigem?: string | null;
  ufOrigem?: string | null;
  municipioDestino?: string | null;
  ufDestino?: string | null;
  informacoesComplementares?: string | null;

  // 5. ITENS / SERVIÇOS
  itens: FiscalItem[];

  // 6. TOTAIS
  totais: FiscalTotals;

  // 7. DOCUMENTOS RELACIONADOS
  documentosRelacionados?: FiscalDocumentReference[] | null;

  // 8. EVENTOS FISCAIS VINCULADOS
  eventos?: FiscalEvent[] | null;

  // 9. EFD SPED (quando o documento for um arquivo EFD)
  efdData?: {
    summary: EFDFiscalSummary;
    blocos: EFDParsedBlock[];
  } | null;

  // 10. ARMAZENAMENTO ORIGINAL & AUDITORIA
  arquivoOriginal: string; // Conteúdo bruto (XML ou TXT) mantido para auditoria
  nomeOriginal: string;
  extensao: string;
  hashSha256: string;
  tamanhoBytes: number;
  dataHoraImportacao: string;
  usuarioResponsavel: {
    id: string;
    nome: string;
    email: string;
  };
  organizacaoAdministradoraId: string;
  empresaAtivaId: string;
  empresaAtivaCnpj: string;

  // 11. STATUS & CONFORMIDADE
  status: FiscalImportStatus;
  errosValidacao: FiscalValidationError[];
  alertasValidacao: string[];
}

export interface FiscalEngineResult {
  sucesso: boolean;
  documento?: FiscalDocument | null;
  status: FiscalImportStatus;
  mensagem: string;
  erros: FiscalValidationError[];
  alertas: string[];
}

export interface BatchImportResult {
  totalArquivos: number;
  totalImportados: number;
  totalComAlertas: number;
  totalDuplicados: number;
  totalDivergenciaCadastro: number;
  totalRejeitados: number;
  documentos: FiscalDocument[];
  relatorio: {
    arquivo: string;
    tipo: string;
    numero?: string;
    status: FiscalImportStatus;
    mensagem: string;
    chaveAcesso?: string;
    dataHora: string;
  }[];
}
