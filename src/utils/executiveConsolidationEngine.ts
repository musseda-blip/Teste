import { FiscalDocument } from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { TRANSITION_RATES } from '../data/taxRules';
import { calculateFiscalDocumentAnalysis, DocumentComparativeAnalysis } from './fiscalDocumentTaxEngine';
import { getAllFiscalDocuments } from './fiscalStorage';

export interface DocumentQualityMetrics {
  indiceConfiabilidade: number;
  totalAuditados: number;
  totalValidos: number;
  coberturaCalculoTributario: number;
  coberturaCreditos: number;
  coberturaDre: number;
  criteriosAuditados: Array<{
    criterio: string;
    finalidade: string;
    conformidadePercent: number;
    status: 'Conforme' | 'Parcial' | 'Atenção';
    detalhe: string;
  }>;
  inconsistencias: string[];
}

export interface ConsolidatedTaxMetrics {
  totalDocumentos: number;
  totalDocumentosSaida: number;
  totalDocumentosEntrada: number;
  documentosDetalhados: Array<{
    documento: FiscalDocument;
    analise: DocumentComparativeAnalysis;
  }>;
  
  // Base Econômica (Factual dos Documentos)
  receitaBruta: number;
  deducoesFaturamento: number;
  receitaLiquidaOperacao: number;
  custosInsumosDocumentados: number;
  despesasServicosDocumentadas: number;

  // Sistema Atual
  tributosAtuais: {
    iss: number;
    icms: number;
    pis: number;
    cofins: number;
    ipi: number;
    totalBruto: number;
    creditosDocumentados: number;
    totalLiquido: number;
    cargaEfetivaPercent: number;
  };

  // Reforma Tributária (Ano Selecionado)
  tributosReforma: {
    cbsAliquota: number;
    cbsValor: number;
    ibsAliquota: number;
    ibsValor: number;
    isValor: number;
    totalBruto: number;
    creditosDocumentados: number;
    totalLiquido: number;
    cargaEfetivaPercent: number;
  };

  // Variação / Diferença
  diferenca: {
    nominalBruta: number;
    percentualBruto: number;
    direcao: 'a mais' | 'a menos' | 'sem variação';
    nominalLiquida: number;
    percentualLiquido: number;
  };

  anoSelecionado: YearPeriod;
}

export interface YearlyTransitionPoint {
  ano: YearPeriod;
  fase: string;
  regraDescricao: string;
  receitaBruta: number;
  
  // Tributos Legados
  pis: number;
  cofins: number;
  iss: number;
  icms: number;
  totalLegado: number;
  
  // Tributos Reforma
  cbsAliquota: number;
  cbsValor: number;
  ibsAliquota: number;
  ibsValor: number;
  totalReforma: number;

  // Total do Exercício (Convivência)
  tributosTotaisExercicio: number;
  
  // Créditos Documentados
  creditosLegado: number;
  creditosReforma: number;

  // Carga Líquida
  cargaLiquidaLegado: number;
  cargaLiquidaReforma: number;

  // Variação frente ao Sistema Atual Legado
  diferencaNominal: number;
  diferencaPercentual: number;
  direcao: 'a mais' | 'a menos' | 'sem variação';
}

export interface DRELineItem {
  codigo: string;
  descricao: string;
  valorAtual: number | null;
  valorReforma: number | null;
  diferenca: number | null;
  variacaoPercent: number | null;
  isSubtotal?: boolean;
  isTotal?: boolean;
  destaque?: boolean;
  observacao?: string;
  suportado: boolean;
}

export interface ExecutiveReading {
  titulo: string;
  resumoCenario: string;
  comparativoAno: string;
  impactoNominalTexto: string;
  anoMaiorImpacto: { ano: number; valor: number; percentual: number; motivo: string };
  anoMenorImpacto: { ano: number; valor: number; percentual: number; motivo: string };
  principaisTributosVariaveis: string[];
  impactoReceitaLiquidaTexto: string;
  limitacaoCreditosTexto: string;
  limitacaoCaixaTexto: string;
}

export interface ExecutiveQAItem {
  id: string;
  numero: string;
  pergunta: string;
  resposta: string;
  categoria: 'Fiscal' | 'Econômico' | 'Financeiro' | 'Metodologia';
  destaque?: boolean;
}

/**
 * Motor Central de Consolidação Executiva da Base Documental
 * Executa estritamente a hierarquia imutável:
 * DOCUMENTOS FISCAIS -> MOTOR DE CÁLCULO -> CONSOLIDAÇÃO -> DRE -> INTERPRETAÇÃO C-LEVEL
 */
export function consolidateExecutiveDashboard(
  company: CompanyRegistration,
  selectedYear: YearPeriod = 2026,
  customDocs?: FiscalDocument[]
): {
  quality: DocumentQualityMetrics;
  metrics: ConsolidatedTaxMetrics;
  timeline: YearlyTransitionPoint[];
  dre: DRELineItem[];
  reading: ExecutiveReading;
  qa: ExecutiveQAItem[];
} {
  const docs = customDocs && customDocs.length > 0 ? customDocs : getAllFiscalDocuments(company);
  
  // 1. Auditoria de Qualidade da Base Documental (Dinâmica e com Critérios Objetivos)
  const quality = auditDocumentQuality(docs, company);

  // 2. Análise Individual de Cada Documento pelo Motor Oficial
  const docsAnalises = docs.map(doc => ({
    documento: doc,
    analise: calculateFiscalDocumentAnalysis(doc, company, selectedYear)
  }));

  // Separar Documentos de Saída (Faturamento/Receita) e Entrada (Custos/Despesas/Insumos)
  const saidas = docsAnalises.filter(d => d.documento.tipoOperacao === 'Saída');
  const entradas = docsAnalises.filter(d => d.documento.tipoOperacao === 'Entrada');

  // Totalização de Receitas e Saídas Fiscais
  let receitaBruta = 0;
  let deducoesFaturamento = 0;
  let issAtual = 0;
  let icmsAtual = 0;
  let pisAtual = 0;
  let cofinsAtual = 0;
  let ipiAtual = 0;
  let cbsReformaSaidas = 0;
  let ibsReformaSaidas = 0;
  let isReformaSaidas = 0;

  saidas.forEach(({ analise }) => {
    receitaBruta += analise.totais.valorProdutos;
    deducoesFaturamento += analise.totais.valorDescontos;
    issAtual += analise.totais.totalISS;
    icmsAtual += analise.totais.totalICMS;
    pisAtual += analise.totais.totalPIS;
    cofinsAtual += analise.totais.totalCOFINS;
    ipiAtual += analise.totais.totalIPI;
    cbsReformaSaidas += analise.totais.cbsValor;
    ibsReformaSaidas += analise.totais.ibsValor;
  });

  const receitaLiquidaOperacao = Math.max(0, receitaBruta - deducoesFaturamento);
  const totalTributosAtuaisBruto = issAtual + icmsAtual + pisAtual + cofinsAtual + ipiAtual;
  const totalReformaBruto = cbsReformaSaidas + ibsReformaSaidas + isReformaSaidas;

  // Totalização de Entradas (Insumos, Custos e Serviços Tomados Documentados)
  let custosInsumosDocumentados = 0;
  let despesasServicosDocumentadas = 0;
  let creditosPisAtual = 0;
  let creditosCofinsAtual = 0;
  let creditosIcmsAtual = 0;
  let creditosCbsReforma = 0;
  let creditosIbsReforma = 0;

  entradas.forEach(({ documento, analise }) => {
    const vlrDoc = documento.totais?.valorTotalDocumento || analise.totais.valorTotalBruto;
    
    // Classificação por finalidade da aquisição documentada
    if (documento.naturezaOperacao?.toLowerCase().includes('nuvem') || 
        documento.naturezaOperacao?.toLowerCase().includes('hospedagem') ||
        documento.naturezaOperacao?.toLowerCase().includes('infraestrutura') ||
        documento.cfopPrincipal?.startsWith('11') || documento.cfopPrincipal?.startsWith('21')) {
      custosInsumosDocumentados += vlrDoc;
    } else {
      despesasServicosDocumentadas += vlrDoc;
    }

    // Créditos apurados documentalmente (Lucro Real / Não-cumulatividade)
    creditosPisAtual += analise.totais.totalPIS;
    creditosCofinsAtual += analise.totais.totalCOFINS;
    creditosIcmsAtual += analise.totais.totalICMS;
    creditosCbsReforma += analise.totais.cbsValor;
    creditosIbsReforma += analise.totais.ibsValor;
  });

  const totalCreditosAtuais = creditosPisAtual + creditosCofinsAtual + creditosIcmsAtual;
  const totalCreditosReforma = creditosCbsReforma + creditosIbsReforma;

  const cargaLiquidaAtual = Math.max(0, totalTributosAtuaisBruto - totalCreditosAtuais);
  const cargaLiquidaReforma = Math.max(0, totalReformaBruto - totalCreditosReforma);

  // Alíquotas de referência vigentes para o ano
  const rates = TRANSITION_RATES[selectedYear] || TRANSITION_RATES[2026];
  const cbsAliquotaMedia = rates.cbs;
  const ibsAliquotaMedia = rates.ibsEstadual + rates.ibsMunicipal;

  // Variação Nominal e Percentual
  const diffNominalBruta = totalReformaBruto - totalTributosAtuaisBruto;
  const diffPercentBruta = totalTributosAtuaisBruto > 0 
    ? (diffNominalBruta / totalTributosAtuaisBruto) * 100 
    : 0;

  let direcaoBruta: 'a mais' | 'a menos' | 'sem variação' = 'sem variação';
  if (totalReformaBruto > totalTributosAtuaisBruto) direcaoBruta = 'a mais';
  else if (totalReformaBruto < totalTributosAtuaisBruto) direcaoBruta = 'a menos';

  const diffNominalLiquida = cargaLiquidaReforma - cargaLiquidaAtual;
  const diffPercentLiquida = cargaLiquidaAtual > 0
    ? (diffNominalLiquida / cargaLiquidaAtual) * 100
    : 0;

  const metrics: ConsolidatedTaxMetrics = {
    totalDocumentos: docs.length,
    totalDocumentosSaida: saidas.length,
    totalDocumentosEntrada: entradas.length,
    documentosDetalhados: docsAnalises,
    receitaBruta,
    deducoesFaturamento,
    receitaLiquidaOperacao,
    custosInsumosDocumentados,
    despesasServicosDocumentadas,
    tributosAtuais: {
      iss: issAtual,
      icms: icmsAtual,
      pis: pisAtual,
      cofins: cofinsAtual,
      ipi: ipiAtual,
      totalBruto: totalTributosAtuaisBruto,
      creditosDocumentados: totalCreditosAtuais,
      totalLiquido: cargaLiquidaAtual,
      cargaEfetivaPercent: receitaBruta > 0 ? (totalTributosAtuaisBruto / receitaBruta) * 100 : 0
    },
    tributosReforma: {
      cbsAliquota: cbsAliquotaMedia,
      cbsValor: cbsReformaSaidas,
      ibsAliquota: ibsAliquotaMedia,
      ibsValor: ibsReformaSaidas,
      isValor: isReformaSaidas,
      totalBruto: totalReformaBruto,
      creditosDocumentados: totalCreditosReforma,
      totalLiquido: cargaLiquidaReforma,
      cargaEfetivaPercent: receitaBruta > 0 ? (totalReformaBruto / receitaBruta) * 100 : 0
    },
    diferenca: {
      nominalBruta: diffNominalBruta,
      percentualBruto: diffPercentBruta,
      direcao: direcaoBruta,
      nominalLiquida: diffNominalLiquida,
      percentualLiquido: diffPercentLiquida
    },
    anoSelecionado
  };

  // 3. Projeção Temporal 2026 a 2033 com a Mesma Base Documental Imutável
  const years: YearPeriod[] = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
  const timeline: YearlyTransitionPoint[] = years.map(yr => {
    let yrPis = 0;
    let yrCofins = 0;
    let yrIss = 0;
    let yrIcms = 0;
    let yrCbs = 0;
    let yrIbs = 0;
    let yrCredLegado = 0;
    let yrCredReforma = 0;

    docs.forEach(doc => {
      const docAnalysis = calculateFiscalDocumentAnalysis(doc, company, yr);
      if (doc.tipoOperacao === 'Saída') {
        yrPis += docAnalysis.totais.totalPIS;
        yrCofins += docAnalysis.totais.totalCOFINS;
        yrIss += docAnalysis.totais.totalISS;
        yrIcms += docAnalysis.totais.totalICMS;
        yrCbs += docAnalysis.totais.cbsValor;
        yrIbs += docAnalysis.totais.ibsValor;
      } else {
        yrCredLegado += (docAnalysis.totais.totalPIS + docAnalysis.totais.totalCOFINS + docAnalysis.totais.totalICMS);
        yrCredReforma += (docAnalysis.totais.cbsValor + docAnalysis.totais.ibsValor);
      }
    });

    const yrTotalLegado = yrPis + yrCofins + yrIss + yrIcms;
    const yrTotalReforma = yrCbs + yrIbs;
    const yrTotalExercicio = yr === 2026 
      ? yrTotalLegado // Em 2026 o teste de CBS 0.9% / IBS 0.1% é compensável com PIS/COFINS
      : (yrTotalLegado + yrTotalReforma); // Transição cumulativa/concomitante conforme extinção gradual

    const yrRates = TRANSITION_RATES[yr] || TRANSITION_RATES[2026];
    const diffNom = yrTotalReforma - totalTributosAtuaisBruto;
    const diffPerc = totalTributosAtuaisBruto > 0 ? (diffNom / totalTributosAtuaisBruto) * 100 : 0;

    let dir: 'a mais' | 'a menos' | 'sem variação' = 'sem variação';
    if (yrTotalReforma > totalTributosAtuaisBruto) dir = 'a mais';
    else if (yrTotalReforma < totalTributosAtuaisBruto) dir = 'a menos';

    let fase = '';
    let regraDesc = '';
    if (yr === 2026) {
      fase = 'Ano de Teste (CBS 0,9% / IBS 0,1%)';
      regraDesc = 'CBS de 0,90% e IBS de 0,10% compensáveis com PIS/COFINS (recolhimento teste sem duplicidade).';
    } else if (yr === 2027 || yr === 2028) {
      fase = 'CBS Plena (8,8%) & Extinção PIS/COFINS';
      regraDesc = 'PIS e COFINS extintos; CBS integral de 8,80%; IBS de 0,10% em teste; ICMS e ISS 100% mantidos.';
    } else if (yr === 2029) {
      fase = 'Transição IBS 10% / ICMS-ISS 90%';
      regraDesc = 'Início da transição federativa: IBS passa a 10% da alíquota de referência (~1,77%) e ICMS/ISS reduzem para 90%.';
    } else if (yr === 2030) {
      fase = 'Transição IBS 20% / ICMS-ISS 80%';
      regraDesc = 'IBS atinge 20% da alíquota (~3,54%) e ICMS/ISS reduzem para 80%.';
    } else if (yr === 2031) {
      fase = 'Transição IBS 30% / ICMS-ISS 70%';
      regraDesc = 'IBS atinge 30% da alíquota (~5,31%) e ICMS/ISS reduzem para 70%.';
    } else if (yr === 2032) {
      fase = 'Transição IBS 40% / ICMS-ISS 60%';
      regraDesc = 'IBS atinge 40% da alíquota (~7,08%) e ICMS/ISS reduzem para 60%.';
    } else {
      fase = 'Vigência Integral (CBS 8,8% + IBS 17,7%)';
      regraDesc = 'Extinção completa do ICMS e ISS; Vigência integral da CBS (8,80%) e IBS (17,70%) no destino.';
    }

    return {
      ano: yr,
      fase,
      regraDescricao: regraDesc,
      receitaBruta,
      pis: yrPis,
      cofins: yrCofins,
      iss: yrIss,
      icms: yrIcms,
      totalLegado: yrTotalLegado,
      cbsAliquota: yrRates.cbs,
      cbsValor: yrCbs,
      ibsAliquota: yrRates.ibsEstadual + yrRates.ibsMunicipal,
      ibsValor: yrIbs,
      totalReforma: yrTotalReforma,
      tributosTotaisExercicio: yrTotalExercicio,
      creditosLegado: yrCredLegado,
      creditosReforma: yrCredReforma,
      cargaLiquidaLegado: Math.max(0, yrTotalLegado - yrCredLegado),
      cargaLiquidaReforma: Math.max(0, yrTotalReforma - yrCredReforma),
      diferencaNominal: diffNom,
      diferencaPercentual: diffPerc,
      direcao: dir
    };
  });

  // 4. DRE Executiva Gerencial (Espelhada e Suportada Estritamente pelos Documentos)
  const dre: DRELineItem[] = [
    {
      codigo: '1.0',
      descricao: 'RECEITA BRUTA DE SERVIÇOS / FATURAMENTO',
      valorAtual: receitaBruta,
      valorReforma: receitaBruta,
      diferenca: 0,
      variacaoPercent: 0,
      isSubtotal: true,
      destaque: true,
      observacao: 'Base documental de saídas fiscais faturadas.',
      suportado: true
    },
    {
      codigo: '1.1',
      descricao: '(-) Deduções e Descontos Incondicionados',
      valorAtual: -deducoesFaturamento,
      valorReforma: -deducoesFaturamento,
      diferenca: 0,
      variacaoPercent: 0,
      suportado: true
    },
    {
      codigo: '1.2',
      descricao: '(-) PIS / PASEP (Sistema Atual: 1,65%)',
      valorAtual: -pisAtual,
      valorReforma: selectedYear >= 2027 ? 0 : -pisAtual,
      diferenca: selectedYear >= 2027 ? pisAtual : 0,
      variacaoPercent: selectedYear >= 2027 ? -100 : 0,
      observacao: selectedYear >= 2027 ? 'Extinto pela LC 214/2025' : 'Em vigor no exercício',
      suportado: true
    },
    {
      codigo: '1.3',
      descricao: '(-) COFINS (Sistema Atual: 7,60%)',
      valorAtual: -cofinsAtual,
      valorReforma: selectedYear >= 2027 ? 0 : -cofinsAtual,
      diferenca: selectedYear >= 2027 ? cofinsAtual : 0,
      variacaoPercent: selectedYear >= 2027 ? -100 : 0,
      observacao: selectedYear >= 2027 ? 'Extinto pela LC 214/2025' : 'Em vigor no exercício',
      suportado: true
    },
    {
      codigo: '1.4',
      descricao: '(-) ISSQN Municipal (Sistema Atual: 5,00%)',
      valorAtual: -issAtual,
      valorReforma: selectedYear === 2033 ? 0 : -(issAtual * (timeline.find(t => t.ano === selectedYear)?.iss ? (timeline.find(t => t.ano === selectedYear)!.iss / (issAtual || 1)) : 1)),
      diferenca: selectedYear === 2033 ? issAtual : (issAtual - (timeline.find(t => t.ano === selectedYear)?.iss || 0)),
      variacaoPercent: selectedYear === 2033 ? -100 : -((issAtual - (timeline.find(t => t.ano === selectedYear)?.iss || 0)) / (issAtual || 1)) * 100,
      observacao: selectedYear === 2033 ? 'Extinto na vigência plena' : 'Transição proporcional',
      suportado: true
    },
    {
      codigo: '1.5',
      descricao: `(-) CBS Federal (${selectedYear}: ${metrics.tributosReforma.cbsAliquota.toFixed(2)}%)`,
      valorAtual: 0,
      valorReforma: -metrics.tributosReforma.cbsValor,
      diferenca: -metrics.tributosReforma.cbsValor,
      variacaoPercent: null,
      observacao: 'Novo tributo federal sobre valor agregado.',
      suportado: true
    },
    {
      codigo: '1.6',
      descricao: `(-) IBS Estadual/Municipal (${selectedYear}: ${metrics.tributosReforma.ibsAliquota.toFixed(2)}%)`,
      valorAtual: 0,
      valorReforma: -metrics.tributosReforma.ibsValor,
      diferenca: -metrics.tributosReforma.ibsValor,
      variacaoPercent: null,
      observacao: 'Novo tributo subnacional no destino.',
      suportado: true
    },
    {
      codigo: '2.0',
      descricao: '(=) RECEITA LÍQUIDA OPERACIONAL',
      valorAtual: receitaLiquidaOperacao - totalTributosAtuaisBruto,
      valorReforma: receitaLiquidaOperacao - totalReformaBruto,
      diferenca: (receitaLiquidaOperacao - totalReformaBruto) - (receitaLiquidaOperacao - totalTributosAtuaisBruto),
      variacaoPercent: ((receitaLiquidaOperacao - totalTributosAtuaisBruto) > 0)
        ? (((receitaLiquidaOperacao - totalReformaBruto) - (receitaLiquidaOperacao - totalTributosAtuaisBruto)) / (receitaLiquidaOperacao - totalTributosAtuaisBruto)) * 100
        : 0,
      isSubtotal: true,
      destaque: true,
      observacao: 'Receita líquida após dedução de todos os tributos faturados.',
      suportado: true
    },
    {
      codigo: '2.1',
      descricao: '(-) Custos dos Serviços Prestados / Insumos Documentados',
      valorAtual: -custosInsumosDocumentados,
      valorReforma: -custosInsumosDocumentados,
      diferenca: 0,
      variacaoPercent: 0,
      observacao: 'Serviços em nuvem e infraestrutura constantes nas NFS-e de entrada.',
      suportado: true
    },
    {
      codigo: '2.2',
      descricao: '(-) Despesas Operacionais com Terceiros Documentadas',
      valorAtual: -despesasServicosDocumentadas,
      valorReforma: -despesasServicosDocumentadas,
      diferenca: 0,
      variacaoPercent: 0,
      observacao: 'Consultoria e assessoria constantes nas NFS-e de entrada.',
      suportado: true
    },
    {
      codigo: '2.3',
      descricao: '(-) Despesas com Folha de Pagamento & Encargos',
      valorAtual: null,
      valorReforma: null,
      diferenca: null,
      variacaoPercent: null,
      observacao: 'Não determinado com os documentos vinculados (exige integração com eSocial/Folha).',
      suportado: false
    },
    {
      codigo: '2.4',
      descricao: '(-) Despesas Administrativas e Gerais Não-Documentadas',
      valorAtual: null,
      valorReforma: null,
      diferenca: null,
      variacaoPercent: null,
      observacao: 'Não determinado com os dados disponíveis.',
      suportado: false
    },
    {
      codigo: '3.0',
      descricao: '(=) RESULTADO OPERACIONAL BRUTO GERENCIAL (BASE DOCUMENTADA)',
      valorAtual: (receitaLiquidaOperacao - totalTributosAtuaisBruto) - (custosInsumosDocumentados + despesasServicosDocumentadas),
      valorReforma: (receitaLiquidaOperacao - totalReformaBruto) - (custosInsumosDocumentados + despesasServicosDocumentadas),
      diferenca: (receitaLiquidaOperacao - totalReformaBruto) - (receitaLiquidaOperacao - totalTributosAtuaisBruto),
      variacaoPercent: null,
      isTotal: true,
      destaque: true,
      observacao: 'Consolidação gerencial restrita aos fatos documentados; não substitui o EBITDA contábil auditado.',
      suportado: true
    }
  ];

  // 5. Leitura Executiva Dinâmica da Transição
  const reading = generateExecutiveReading(company, selectedYear, metrics, timeline);

  // 6. Q&A Estratégico Dinâmico (Q1 a Q8)
  const qa = generateExecutiveQA(company, selectedYear, metrics, timeline, quality);

  return {
    quality,
    metrics,
    timeline,
    dre,
    reading,
    qa
  };
}

/**
 * Auditoria da Qualidade e Cobertura da Base Documental
 */
function auditDocumentQuality(docs: FiscalDocument[], company: CompanyRegistration): DocumentQualityMetrics {
  const total = docs.length;
  if (total === 0) {
    return {
      indiceConfiabilidade: 0,
      totalAuditados: 0,
      totalValidos: 0,
      coberturaCalculoTributario: 0,
      coberturaCreditos: 0,
      coberturaDre: 0,
      criteriosAuditados: [],
      inconsistencias: ['Nenhum documento fiscal vinculado ao contexto selecionado.']
    };
  }

  let comChave = 0;
  let comClassFiscal = 0;
  let comItensValidos = 0;
  let comParticipantesValidos = 0;
  let comTributacaoAuditada = 0;
  const inconsistencias: string[] = [];

  docs.forEach((doc, idx) => {
    // 1. Chave e identificadores
    if (doc.chaveAcesso && doc.chaveAcesso.trim().length >= 10) {
      comChave++;
    } else {
      inconsistencias.push(`Doc #${doc.numero || idx + 1}: Chave de acesso ausente ou incompleta.`);
    }

    // 2. Classificação fiscal adequada por tipo
    const hasItems = doc.itens && doc.itens.length > 0;
    if (hasItems) {
      comItensValidos++;
      const isNfse = doc.tipoDocumento === 'NFSE' || doc.modelo === 'NFS-e';
      const itensOk = doc.itens.every(it => {
        if (isNfse) {
          return it.codigoServico || it.nbs || it.descricao;
        }
        return it.ncm || it.cfop;
      });
      if (itensOk) comClassFiscal++;
      else inconsistencias.push(`Doc #${doc.numero}: Classificação fiscal do item não especificada.`);

      // 3. Tributação
      const tribOk = doc.itens.every(it => it.tributacao && it.valorTotal > 0);
      if (tribOk) comTributacaoAuditada++;
    }

    // 4. Participantes
    if (doc.emitente?.cnpjCpf && (doc.tomador?.cnpjCpf || doc.destinatario?.cnpjCpf)) {
      comParticipantesValidos++;
    }
  });

  const percChave = (comChave / total) * 100;
  const percClass = (comClassFiscal / total) * 100;
  const percTrib = (comTributacaoAuditada / total) * 100;
  const percPart = (comParticipantesValidos / total) * 100;

  // Índice Ponderado de Confiabilidade
  const indiceConfiabilidade = Math.round(
    (percChave * 0.25) + (percClass * 0.30) + (percTrib * 0.30) + (percPart * 0.15)
  );

  const coberturaCalculoTributario = Math.round((comTributacaoAuditada / total) * 100);
  const entradas = docs.filter(d => d.tipoOperacao === 'Entrada');
  const coberturaCreditos = entradas.length > 0
    ? Math.round((entradas.filter(d => d.emitente?.regimeTributario && d.totais).length / entradas.length) * 100)
    : 100; // Quando não há entradas, a cobertura teórica para o conjunto é total
  
  const coberturaDre = Math.round((docs.filter(d => d.totais?.valorTotalDocumento).length / total) * 100);

  const criteriosAuditados = [
    {
      criterio: 'Integridade de Schemas & Chaves de Acesso',
      finalidade: 'Autenticidade e validação digital do documento fiscal',
      conformidadePercent: Math.round(percChave),
      status: (percChave >= 95 ? 'Conforme' : percChave >= 80 ? 'Parcial' : 'Atenção') as 'Conforme' | 'Parcial' | 'Atenção',
      detalhe: `${comChave} de ${total} documentos possuem chaves de acesso homologadas.`
    },
    {
      criterio: 'Classificação Fiscal Específica (NBS/Serviço ou NCM)',
      finalidade: 'Enquadramento correto nas alíquotas CBS e IBS por produto/serviço',
      conformidadePercent: Math.round(percClass),
      status: (percClass >= 95 ? 'Conforme' : percClass >= 80 ? 'Parcial' : 'Atenção') as 'Conforme' | 'Parcial' | 'Atenção',
      detalhe: `Avaliação do código de serviço e NBS para serviços de tecnologia e consultoria.`
    },
    {
      criterio: 'Auditabilidade de Bases de Cálculo e Alíquotas',
      finalidade: 'Cálculo determinístico de débitos e créditos fiscais',
      conformidadePercent: Math.round(percTrib),
      status: (percTrib >= 95 ? 'Conforme' : percTrib >= 80 ? 'Parcial' : 'Atenção') as 'Conforme' | 'Parcial' | 'Atenção',
      detalhe: `${comTributacaoAuditada} documentos com alíquotas de ISS, PIS, COFINS, CBS e IBS apuradas.`
    },
    {
      criterio: 'Qualificação de Tomadores e Princípio do Destino',
      finalidade: 'Aplicação da alíquota municipal e estadual no destino',
      conformidadePercent: Math.round(percPart),
      status: (percPart >= 95 ? 'Conforme' : percPart >= 80 ? 'Parcial' : 'Atenção') as 'Conforme' | 'Parcial' | 'Atenção',
      detalhe: `Identificação dos municípios de origem e destino para alocação federativa do IBS.`
    }
  ];

  return {
    indiceConfiabilidade,
    totalAuditados: total,
    totalValidos: docs.filter(d => d.status === 'Importado').length,
    coberturaCalculoTributario,
    coberturaCreditos,
    coberturaDre,
    criteriosAuditados,
    inconsistencias
  };
}

/**
 * Geração de Diagnóstico e Leitura Executiva Dinâmica
 */
function generateExecutiveReading(
  company: CompanyRegistration,
  year: YearPeriod,
  metrics: ConsolidatedTaxMetrics,
  timeline: YearlyTransitionPoint[]
): ExecutiveReading {
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);

  const totalAtual = metrics.tributosAtuais.totalBruto;
  const totalReforma = metrics.tributosReforma.totalBruto;
  const diffNominal = metrics.diferenca.nominalBruta;
  const diffPercent = metrics.diferenca.percentualBruto;
  const direcao = metrics.diferenca.direcao;

  // Encontrar anos extremos
  let maiorPonto = timeline[0];
  let menorPonto = timeline[0];
  timeline.forEach(t => {
    if (t.totalReforma > maiorPonto.totalReforma) maiorPonto = t;
    if (t.totalReforma < menorPonto.totalReforma) menorPonto = t;
  });

  const resumoCenario = `A consolidação tributária da empresa ${company.razaoSocial} (${company.setor}), com base nos ${metrics.totalDocumentos} documentos fiscais auditados, totaliza um faturamento faturado de ${formatRS(metrics.receitaBruta)}.`;

  const comparativoAno = `Para o exercício de ${year}, sob as regras da EC 132/2023 e LC 214/2025, a carga tributária faturada simulada é de ${formatRS(totalReforma)} (CBS: ${metrics.tributosReforma.cbsAliquota.toFixed(2)}% e IBS: ${metrics.tributosReforma.ibsAliquota.toFixed(2)}%), comparada a ${formatRS(totalAtual)} apurados no Sistema Atual.`;

  const impactoNominalTexto = direcao === 'sem variação'
    ? 'O impacto nominal indica equivalência matemática de tributos calculados entre os cenários.'
    : `O impacto nominal indica uma diferença calculada de ${direcao} ${formatRS(Math.abs(diffNominal))} (${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(2)}%) em relação ao Sistema Atual em vigor.`;

  const impactoReceitaLiquidaTexto = `A Receita Líquida Operacional gerencial passa de ${formatRS(metrics.receitaLiquidaOperacao - totalAtual)} no Sistema Atual para ${formatRS(metrics.receitaLiquidaOperacao - totalReforma)} na simulação de ${year}.`;

  return {
    titulo: `Diagnóstico Executivo de Transição Tributária (${year})`,
    resumoCenario,
    comparativoAno,
    impactoNominalTexto,
    anoMaiorImpacto: {
      ano: maiorPonto.ano,
      valor: maiorPonto.totalReforma,
      percentual: maiorPonto.diferencaPercentual,
      motivo: `Vigência integral da CBS e progressão do IBS para ${maiorPonto.ibsAliquota.toFixed(2)}%.`
    },
    anoMenorImpacto: {
      ano: menorPonto.ano,
      valor: menorPonto.totalReforma,
      percentual: menorPonto.diferencaPercentual,
      motivo: 'Fase de teste e início da transição com alíquotas experimentais compensáveis.'
    },
    principaisTributosVariaveis: [
      'Substituição do PIS (1,65%) e COFINS (7,60%) pela CBS Federal (8,80%).',
      'Transição progressiva do ISS Municipal (5,00%) para o IBS Subnacional.',
      'Aplicação plena do princípio do destino sobre as operações interestaduais.'
    ],
    limitacaoCreditosTexto: 'Impacto líquido após créditos: Calculado com base nas aquisições documentadas de serviços de nuvem e advocacia tomadas; créditos adicionais dependem de documentação comprobatória de fornecedores.',
    limitacaoCaixaTexto: 'Impacto de caixa não se confunde com carga tributária por competência: a retenção pelo Split Payment elimina a defasagem temporal de recolhimento no ato da liquidação financeira.'
  };
}

/**
 * Perguntas e Respostas Estratégicas C-Level (Q1 a Q8)
 */
function generateExecutiveQA(
  company: CompanyRegistration,
  year: YearPeriod,
  metrics: ConsolidatedTaxMetrics,
  timeline: YearlyTransitionPoint[],
  quality: DocumentQualityMetrics
): ExecutiveQAItem[] {
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);

  const totalAtual = metrics.tributosAtuais.totalBruto;
  const totalReforma = metrics.tributosReforma.totalBruto;
  const diffNominal = metrics.diferenca.nominalBruta;
  const diffPercent = metrics.diferenca.percentualBruto;
  const direcao = metrics.diferenca.direcao;

  return [
    {
      id: 'q1',
      numero: 'Q1',
      categoria: 'Econômico',
      destaque: true,
      pergunta: 'Qual o impacto total da Reforma Tributária sobre o faturamento da empresa?',
      resposta: `Para o ano de ${year}, a carga tributária faturada calculada no cenário da Reforma é de ${formatRS(totalReforma)}, frente a ${formatRS(totalAtual)} apurados no Sistema Atual. O impacto nominal é de ${direcao} ${formatRS(Math.abs(diffNominal))} (${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(2)}%).`
    },
    {
      id: 'q2',
      numero: 'Q2',
      categoria: 'Fiscal',
      pergunta: 'Qual a composição do impacto fiscal no exercício selecionado?',
      resposta: `No exercício de ${year}, a composição tributária da Reforma compreende CBS de ${metrics.tributosReforma.cbsAliquota.toFixed(2)}% (${formatRS(metrics.tributosReforma.cbsValor)}) e IBS de ${metrics.tributosReforma.ibsAliquota.toFixed(2)}% (${formatRS(metrics.tributosReforma.ibsValor)}), substituindo gradualmente o PIS, COFINS e ISS municipais conforme a cronologia da EC 132/2023.`
    },
    {
      id: 'q3',
      numero: 'Q3',
      categoria: 'Econômico',
      pergunta: 'Qual o impacto econômico sobre a Receita Líquida?',
      resposta: `A Receita Líquida Operacional gerencial da empresa varia de ${formatRS(metrics.receitaLiquidaOperacao - totalAtual)} no Sistema Atual para ${formatRS(metrics.receitaLiquidaOperacao - totalReforma)} na simulação de ${year}, representando uma variação líquida de ${formatRS(metrics.diferenca.nominalBruta * -1)} na margem bruta faturada.`
    },
    {
      id: 'q4',
      numero: 'Q4',
      categoria: 'Financeiro',
      pergunta: 'Qual o impacto no EBITDA contábil da empresa?',
      resposta: 'O impacto no EBITDA contábil definitivo não é determinado exclusivamente com os documentos fiscais disponíveis, pois depende de custos de folha de pagamento, encargos sociais e despesas administrativas que não transitam por notas fiscais. A base gerencial documentada aponta resultado operacional bruto suportado de ' + formatRS((metrics.receitaLiquidaOperacao - totalReforma) - (metrics.custosInsumosDocumentados + metrics.despesasServicosDocumentadas)) + '.'
    },
    {
      id: 'q5',
      numero: 'Q5',
      categoria: 'Financeiro',
      pergunta: 'Qual o impacto no fluxo de caixa e capital de giro?',
      resposta: 'Carga tributária por competência não se confunde com fluxo de caixa imediato. A introdução do Split Payment bancário na liquidação dos recebimentos PIX/Cartão elimina o diferimento provisório do imposto, exigindo readequação das linhas de capital de giro e prazos médios de cobrança.'
    },
    {
      id: 'q6',
      numero: 'Q6',
      categoria: 'Fiscal',
      pergunta: 'Qual é o ano de maior impacto da transição (2026–2033)?',
      resposta: `O ano de maior impacto nominal na transição é 2033 (${formatRS(timeline[timeline.length - 1].totalReforma)}), momento em que o novo modelo atinge a vigência integral com extinção total do ICMS/ISS e aplicação de 100% da CBS (8,80%) e IBS (17,70%).`
    },
    {
      id: 'q7',
      numero: 'Q7',
      categoria: 'Fiscal',
      pergunta: 'Qual tributo explica a maior parcela da variação?',
      resposta: 'A variação é explicada pela transição da tributação cumulativa/mista de serviços (ISS 5% + PIS/COFINS 9,25% = 14,25%) para a incidência do IVA Dual pleno não-cumulativo no destino (CBS + IBS estimados em ~26,50% na alíquota de referência padrão).'
    },
    {
      id: 'q8',
      numero: 'Q8',
      categoria: 'Metodologia',
      pergunta: 'Quais informações adicionais são necessárias para determinar o impacto líquido definitivo?',
      resposta: `A base documental auditada possui índice de confiabilidade de ${quality.indiceConfiabilidade}%. Para determinação do impacto financeiro líquido definitivo, é recomendável a integração com a totalidade dos contratos de fornecedores de serviços/insumos, folha de pagamento e premissas de repasse de preços em contratos B2B.`
    }
  ];
}
