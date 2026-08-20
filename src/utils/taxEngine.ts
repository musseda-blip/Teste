import { 
  TaxItem, 
  NotaFiscal, 
  ProductDetail, 
  ExecutiveKPIs, 
  DREComparative, 
  BalancoPatrimonialComparative, 
  SensitivityParams,
  YearPeriod
} from '../types/tax';
import { MOCK_FISCAL_ITEMS, MOCK_NOTAS_FISCAIS, MOCK_PRODUCT_DETAILS } from '../data/mockEnterpriseData';
import { TRANSITION_RATES, getSegmentTaxModifiers } from '../data/taxRules';

export function calculateEngine(params: SensitivityParams) {
  const ano = params.anoSimulacao || 2026;
  const rates = TRANSITION_RATES[ano] || TRANSITION_RATES[2026];
  const segmentMods = getSegmentTaxModifiers(params.segmento);

  // 1. Calculate each Item individually (Lowest Level First)
  const calculatedItems: TaxItem[] = MOCK_FISCAL_ITEMS.map((baseItem) => {
    // Price and Cost Adjustments from Sensitivity Params
    const precoMult = 1 + (params.precoVendaAdjPercent / 100);
    const vlrUnit = baseItem.valorUnitario * precoMult;
    const vlrTotal = vlrUnit * baseItem.quantidade;

    // Current Taxes (Legado - calculados "por dentro" no modelo atual)
    const totalTributosAtual = baseItem.vlrPisAtual + baseItem.vlrCofinsAtual + baseItem.vlrIcmsAtual + baseItem.vlrIpiAtual + baseItem.vlrIssAtual + baseItem.vlrIcmsStAtual;
    const creditosAtual = baseItem.creditosAtual;
    const debitosAtual = totalTributosAtual;

    // Valor Líquido: Expurgo dos impostos legados embutidos por dentro (evitando imposto sobre imposto)
    const valorLiquido = Math.max(0, vlrTotal - totalTributosAtual);
    const baseCalculoReforma = valorLiquido > 0 ? valorLiquido : vlrTotal;

    // Reform Taxes (LC 214/2025 according to simulation year)
    let aliqCbs = (params.aliqCbsEstimada / 100) * segmentMods.fatorCbsIbs;
    let aliqIbsEst = (params.aliqIbsEstimada / 100 * 0.6) * segmentMods.fatorCbsIbs;
    let aliqIbsMun = (params.aliqIbsEstimada / 100 * 0.4) * segmentMods.fatorCbsIbs;
    let aliqIS = (params.aliqImpostoSeletivoEstimada / 100);

    // Apply Transition Factors for the specific year
    if (ano === 2026) {
      aliqCbs = rates.cbs;
      aliqIbsEst = rates.ibsEstadual;
      aliqIbsMun = rates.ibsMunicipal;
      aliqIS = rates.is;
    } else if (ano >= 2027 && ano <= 2032) {
      aliqCbs = rates.cbs * segmentMods.fatorCbsIbs;
      aliqIbsEst = rates.ibsEstadual * segmentMods.fatorCbsIbs;
      aliqIbsMun = rates.ibsMunicipal * segmentMods.fatorCbsIbs;
      aliqIS = rates.is;
    }

    // Aplicação da CBS e IBS "por fora" sobre o Valor Líquido (Base Pura sem imposto sobre imposto)
    const vlrCbs = baseCalculoReforma * aliqCbs;
    const vlrIbsEst = baseCalculoReforma * aliqIbsEst;
    const vlrIbsMun = baseCalculoReforma * aliqIbsMun;
    const vlrIbsTotal = vlrIbsEst + vlrIbsMun;

    // Imposto Seletivo applies if item is beverage/vehicle/tobacco
    const hasIS = baseItem.produtoCodigo.includes('BEB') || baseItem.ncm.startsWith('2202');
    const vlrIS = hasIS ? baseCalculoReforma * aliqIS : 0.0;

    const debitosReforma = vlrCbs + vlrIbsTotal + vlrIS;
    const creditosReforma = (debitosReforma * 0.45) * (1 + params.aproveitamentoCreditoInsumosPercent / 100);
    const totalTributosReforma = debitosReforma;

    const diffRS = totalTributosReforma - totalTributosAtual;
    const diffPercent = totalTributosAtual > 0 ? (diffRS / totalTributosAtual) * 100 : 100;

    return {
      ...baseItem,
      valorUnitario: vlrUnit,
      valorTotal: vlrTotal,
      valorLiquido: valorLiquido,
      
      baseCbsReforma: baseCalculoReforma,
      aliqCbsReforma: aliqCbs * 100,
      vlrCbsReforma: vlrCbs,
      baseIbsReforma: baseCalculoReforma,
      aliqIbsEstadualReforma: aliqIbsEst * 100,
      vlrIbsEstadualReforma: vlrIbsEst,
      aliqIbsMunicipalReforma: aliqIbsMun * 100,
      vlrIbsMunicipalReforma: vlrIbsMun,
      vlrIbsTotalReforma: vlrIbsTotal,
      
      aliqImpostoSeletivoReforma: hasIS ? aliqIS * 100 : 0,
      vlrImpostoSeletivoReforma: vlrIS,
      
      creditosAtual,
      debitosAtual,
      totalTributosAtual,
      
      creditosReforma,
      debitosReforma,
      totalTributosReforma,
      
      diferencaRS: diffRS,
      diferencaPercent: diffPercent,
      cargaTributariaAtualPercent: vlrTotal > 0 ? (totalTributosAtual / vlrTotal) * 100 : 0,
      cargaTributariaReformaPercent: vlrTotal > 0 ? (totalTributosReforma / vlrTotal) * 100 : 0,
    };
  });

  // 2. Consolidate into Fiscal Notes (NF)
  const calculatedNotas: NotaFiscal[] = MOCK_NOTAS_FISCAIS.map((nota) => {
    const notaItens = calculatedItems.filter((i) => i.docFiscalId === nota.id);
    const vlrProds = notaItens.reduce((acc, i) => acc + i.valorTotal, 0);
    const totAtual = notaItens.reduce((acc, i) => acc + i.totalTributosAtual, 0);
    const totReforma = notaItens.reduce((acc, i) => acc + i.totalTributosReforma, 0);
    const credAtual = notaItens.reduce((acc, i) => acc + i.creditosAtual, 0);
    const debAtual = notaItens.reduce((acc, i) => acc + i.debitosAtual, 0);
    const credReforma = notaItens.reduce((acc, i) => acc + i.creditosReforma, 0);
    const debReforma = notaItens.reduce((acc, i) => acc + i.debitosReforma, 0);
    const diff = totReforma - totAtual;

    return {
      ...nota,
      valorProdutos: vlrProds,
      valorTotalNota: vlrProds + nota.frete + nota.seguro + nota.outrasDespesas - nota.descontos,
      totalAtual: totAtual,
      totalReforma: totReforma,
      diferencaRS: diff,
      diferencaPercent: totAtual > 0 ? (diff / totAtual) * 100 : 100,
      creditosAtual: credAtual,
      debitosAtual: debAtual,
      creditosReforma: credReforma,
      debitosReforma: debReforma,
      impactoFiscal: diff > 0 ? 'Aumento de Carga' : diff < 0 ? 'Redução de Carga' : 'Neutro',
      impactoFinanceiroRS: -diff,
      impactoContabilRS: -diff,
      itens: notaItens,
    };
  });

  // 3. Consolidate Executive KPIs
  const receitaBruta = calculatedItems.reduce((acc, i) => acc + i.valorTotal, 0);
  const tributosAtuais = calculatedItems.reduce((acc, i) => acc + i.totalTributosAtual, 0);
  const tributosReforma = calculatedItems.reduce((acc, i) => acc + i.totalTributosReforma, 0);
  const creditosAtuais = calculatedItems.reduce((acc, i) => acc + i.creditosAtual, 0);
  const debitosAtuais = calculatedItems.reduce((acc, i) => acc + i.debitosAtual, 0);
  const creditosReforma = calculatedItems.reduce((acc, i) => acc + i.creditosReforma, 0);
  const debitosReforma = calculatedItems.reduce((acc, i) => acc + i.debitosReforma, 0);

  const impactoFiscalRS = tributosReforma - tributosAtuais;
  const ebitdaAtual = receitaBruta * 0.35 - tributosAtuais;
  const ebitdaReforma = receitaBruta * 0.35 - tributosReforma;

  const kpis: ExecutiveKPIs = {
    receitaBruta,
    receitaLiquida: receitaBruta - tributosReforma,
    tributosAtuais,
    tributosReforma,
    cargaTributariaAtualPercent: receitaBruta > 0 ? (tributosAtuais / receitaBruta) * 100 : 0,
    cargaTributariaReformaPercent: receitaBruta > 0 ? (tributosReforma / receitaBruta) * 100 : 0,
    creditosAtuais,
    debitosAtuais,
    creditosReforma,
    debitosReforma,
    impactoFiscalRS,
    impactoFiscalPercent: tributosAtuais > 0 ? (impactoFiscalRS / tributosAtuais) * 100 : 0,
    impactoFinanceiroRS: -impactoFiscalRS,
    impactoContabilRS: -impactoFiscalRS,
    ebitdaAtual,
    ebitdaReforma,
    margemEbitdaAtualPercent: receitaBruta > 0 ? (ebitdaAtual / receitaBruta) * 100 : 0,
    margemEbitdaReformaPercent: receitaBruta > 0 ? (ebitdaReforma / receitaBruta) * 100 : 0,
    fluxoCaixaAtual: ebitdaAtual * 0.9,
    fluxoCaixaReforma: ebitdaReforma * 0.9,
    capitalGiroAtual: receitaBruta * 0.22,
    capitalGiroReforma: receitaBruta * 0.25,
    impactoAcumulado2026_2033: impactoFiscalRS * 8,
  };

  // 4. Generate DRE Comparative
  const dreData: DREComparative[] = [
    { conta: '1. RECEITA BRUTA DE VENDAS E SERVIÇOS', codigoContabil: '3.1.01', valorAtual: receitaBruta, valorReforma2026: receitaBruta, valorReforma2027: receitaBruta * 1.05, valorReformaDefinitivo2033: receitaBruta * 1.25, variacaoAbsoluta: receitaBruta * 0.25, variacaoPercentual: 25.0 },
    { conta: '2. DEDUÇÕES DA RECEITA (Impostos sobre Vendas)', codigoContabil: '3.1.02', valorAtual: -tributosAtuais, valorReforma2026: -tributosReforma, valorReforma2027: -(receitaBruta * 0.265), valorReformaDefinitivo2033: -(receitaBruta * 1.25 * 0.265), variacaoAbsoluta: -impactoFiscalRS, variacaoPercentual: kpis.impactoFiscalPercent },
    { conta: '3. RECEITA LÍQUIDA DE VENDAS', codigoContabil: '3.1.03', valorAtual: receitaBruta - tributosAtuais, valorReforma2026: receitaBruta - tributosReforma, valorReforma2027: (receitaBruta * 1.05) - (receitaBruta * 0.265), valorReformaDefinitivo2033: (receitaBruta * 1.25) * 0.735, variacaoAbsoluta: -impactoFiscalRS, variacaoPercentual: -3.5 },
    { conta: '4. CUSTO DOS BENS E SERVIÇOS VENDIDOS (CPV/CSV)', codigoContabil: '3.2.01', valorAtual: -(receitaBruta * 0.45), valorReforma2026: -(receitaBruta * 0.43), valorReforma2027: -(receitaBruta * 0.41), valorReformaDefinitivo2033: -(receitaBruta * 1.25 * 0.38), variacaoAbsoluta: receitaBruta * 0.07, variacaoPercentual: 15.5 },
    { conta: '5. LUCRO BRUTO', codigoContabil: '3.3.01', valorAtual: (receitaBruta - tributosAtuais) - (receitaBruta * 0.45), valorReforma2026: (receitaBruta - tributosReforma) - (receitaBruta * 0.43), valorReforma2027: (receitaBruta * 0.785) - (receitaBruta * 0.41), valorReformaDefinitivo2033: (receitaBruta * 1.25 * 0.735) - (receitaBruta * 1.25 * 0.38), variacaoAbsoluta: 125000, variacaoPercentual: 4.2 },
    { conta: '6. DESPESAS OPERACIONAIS (Vendas, Adm, TI)', codigoContabil: '3.4.01', valorAtual: -(receitaBruta * 0.18), valorReforma2026: -(receitaBruta * 0.18), valorReforma2027: -(receitaBruta * 0.17), valorReformaDefinitivo2033: -(receitaBruta * 1.25 * 0.16), variacaoAbsoluta: 45000, variacaoPercentual: 5.0 },
    { conta: '7. EBITDA (Resultado Antes de Juros e Impostos)', codigoContabil: '3.5.01', valorAtual: ebitdaAtual, valorReforma2026: ebitdaReforma, valorReforma2027: ebitdaReforma * 1.08, valorReformaDefinitivo2033: ebitdaReforma * 1.30, variacaoAbsoluta: ebitdaReforma - ebitdaAtual, variacaoPercentual: ((ebitdaReforma - ebitdaAtual) / Math.abs(ebitdaAtual || 1)) * 100 },
  ];

  // 5. Generate Balance Sheet Comparative
  const balancoData: BalancoPatrimonialComparative[] = [
    { grupo: 'ATIVO', subgrupo: 'Ativo Circulante', codigoContabil: '1.1.01.02', descricaoConta: 'Conta Corrente Vinculada Split Payment Bancário', valorAtual: 0, valorReformaDefinitivo: receitaBruta * 0.05, variacaoRS: receitaBruta * 0.05, reflexoPatrimonial: 'Retenção automática imediata de caixa na transação' },
    { grupo: 'ATIVO', subgrupo: 'Ativo Circulante', codigoContabil: '1.1.03.01', descricaoConta: 'Créditos A Recuperar de IBS/CBS (Insumos e Ativo Imobilizado)', valorAtual: creditosAtuais, valorReformaDefinitivo: creditosReforma * 2.5, variacaoRS: (creditosReforma * 2.5) - creditosAtuais, reflexoPatrimonial: 'Aumento de Liquidez por não-cumulatividade plena sem glosas' },
    { grupo: 'PASSIVO', subgrupo: 'Passivo Circulante', codigoContabil: '2.1.02.01', descricaoConta: 'IBS a Recolher ao Comitê Gestor (CGIBS)', valorAtual: 0, valorReformaDefinitivo: debitosReforma * 0.6, variacaoRS: debitosReforma * 0.6, reflexoPatrimonial: 'Substituição das obrigações passivas de ICMS e ISS' },
    { grupo: 'PASSIVO', subgrupo: 'Passivo Circulante', codigoContabil: '2.1.02.02', descricaoConta: 'CBS a Recolher à Receita Federal', valorAtual: 0, valorReformaDefinitivo: debitosReforma * 0.4, variacaoRS: debitosReforma * 0.4, reflexoPatrimonial: 'Substituição unificada de PIS e COFINS' },
    { grupo: 'PATRIMÔNIO LÍQUIDO', subgrupo: 'Lucros Acumulados', codigoContabil: '2.3.05.01', descricaoConta: 'Reservas e Lucros Retidos Acumulados', valorAtual: ebitdaAtual * 4, valorReformaDefinitivo: ebitdaReforma * 4.2, variacaoRS: (ebitdaReforma - ebitdaAtual) * 4, reflexoPatrimonial: 'Ganho acumulado de eficiência fiscal e redução do custo de conformidade' },
  ];

  return {
    items: calculatedItems,
    notas: calculatedNotas,
    produtos: MOCK_PRODUCT_DETAILS,
    kpis,
    dreData,
    balancoData,
  };
}

export const EXECUTIVE_QUESTIONS_ANSWERS = [
  { q: 'Qual o impacto total da Reforma Tributária na empresa?', a: 'O impacto global representa uma variação de carga bruta calculada item-a-item com convergência ao IVA Dual (CBS 8,8% + IBS 17,7%). A empresa atinge aproveitamento integral de créditos sobre insumos.' },
  { q: 'Qual o impacto fiscal?', a: 'Redução do contencioso tributário, eliminação do efeito cascata e substituição de 5 tributos (PIS, COFINS, IPI, ICMS, ISS) pela CBS e IBS unificados.' },
  { q: 'Qual o impacto financeiro no caixa?', a: 'Necessidade de adaptação ao Split Payment (recolhimento automático no momento do pagamento do cliente), eliminando prazos estendidos de retenção de guias.' },
  { q: 'Qual o impacto contábil nas demonstrações (DRE/Balanço)?', a: 'Transparência de imposto por fora da base de cálculo. O imposto não comporá a receita nem o custo do bem, limpando a DRE operacional.' },
  { q: 'Qual produto possui maior impacto de carga?', a: 'Licenciamento de Software SaaS / Serviços Tecnologia (Aumento de alíquota de 14,25% para 26,50%, porém com repasse B2B integral e crédito ao tomador).' },
  { q: 'Qual item da Nota Fiscal possui maior ganho de margem?', a: 'Bebidas e produtos sujeitos a IPI/ICMS-ST elevado no modelo antigo, onde a não-cumulatividade plena do IBS reduz o custo efetivo de insumos.' },
  { q: 'Qual Nota Fiscal possui maior volume de créditos gerados?', a: 'Nota Fiscal DOC-5501 com montante elevado de bens de capital e equipamentos com crédito financeiro imediato.' },
  { q: 'Qual NCM é mais impactado?', a: 'NCM 8523.80.00 (Software) e NCM 2202.10.00 (Bebidas Adoçadas sujeitas ao Imposto Seletivo).' },
  { q: 'Qual operação possui maior vantagem distributiva?', a: 'Operações interestaduais onde a cobrança no Destino elimina a Guerra Fiscal de Origem (ICMS).' },
  { q: 'Qual cliente possui maior ganho na cadeia?', a: 'Clientes B2B no Lucro Real que utilizavam serviços e bens antes indutores de glosa de PIS/COFINS/ICMS e que agora tomam crédito pleno.' },
  { q: 'Qual fornecedor precisa de revisão contratual?', a: 'Fornecedores do Simples Nacional ou não-contribuintes que repassam custos tributários sem gerar crédito de IBS/CBS ao comprador.' },
  { q: 'Qual UF de origem tem maior mudança tributária?', a: 'Estados produtores de origem (SP, MG) que perdem arrecadação direta na origem em favor dos Estados de destino e consumo final (RJ, PE, BA).' },
  { q: 'Qual município sofre alteração de arrecadação?', a: 'Municípios prestadores de serviços de tecnologia que arrecadavam ISS na origem e passarão a receber a fatia do IBS via Comitê Gestor no Destino.' },
  { q: 'Qual produto perde margem se não ajustar preço?', a: 'Serviços puros de alta intensidade de mão de obra (SaaS, Consultoria) sem cadeia de insumos físicos pesados.' },
  { q: 'Qual produto ganha margem operacional?', a: 'Produtos industriais com extensa cadeia de fornecedores e insumos antes onerados com ICMS não aproveitado.' },
  { q: 'Qual produto necessita de readequação do preço de venda?', a: 'Produtos de consumo final B2C sujeitos ao Imposto Seletivo (IS) ou sem direito a crédito ao consumidor final.' },
  { q: 'Qual o impacto direto no EBITDA acumulado?', a: 'Impacto positivo de até +4,2% na margem EBITDA consolidada pela redução dos custos de conformidade e recuperação rápida de saldos credores.' },
  { q: 'Qual o impacto no Capital de Giro?', a: 'Pequena redução temporária no fluxo de caixa no 1º mês devido ao Split Payment, compensada pelo fim dos acúmulos perenes de saldos credores de ICMS.' },
  { q: 'Qual a estratégia recomendada de governança e transição fiscal?', a: 'Implementar saneamento cadastral de NCM/NBS, parametrização de ERP para o modelo Dual CBS/IBS, renegociação de contratos com fornecedores e homologação bancária do Split Payment.' },
];
