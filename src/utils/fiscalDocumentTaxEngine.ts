import { FiscalDocument, FiscalItem } from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { TRANSITION_RATES } from '../data/taxRules';

export interface CalculatedItemTaxes {
  item: FiscalItem;
  numeroItem: number;
  descricao: string;
  ncm: string;
  codigoServico: string;
  cfop: string;
  cst: string;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
  
  // Tributos Atuais (ISS / ICMS, IPI, PIS, COFINS)
  issAliquota: number;
  issValor: number;
  icmsAliquota: number;
  icmsValor: number;
  ipiAliquota: number;
  ipiValor: number;
  pisAliquota: number;
  pisValor: number;
  cofinsAliquota: number;
  cofinsValor: number;
  
  // Reforma Tributária (Calculada estritamente pelo ano selecionado)
  ibsAliquota: number;
  ibsValor: number;
  cbsAliquota: number;
  cbsValor: number;
}

export interface DocumentTaxTotals {
  valorProdutos: number;
  valorDescontos: number;
  valorOutrasDespesas: number;
  valorLiquidoOperacao: number;
  
  // Tributos Atuais
  totalISS: number;
  totalICMS: number;
  totalIPI: number;
  totalPIS: number;
  totalCOFINS: number;
  totalTributosAtuais: number;
  
  // Total Bruto Final (= Líquido + ISS/ICMS + IPI + PIS + COFINS)
  valorTotalBruto: number;
  
  // Reforma Tributária para o Ano Selecionado
  baseCalculoReforma: number;
  cbsAliquota: number;
  cbsValor: number;
  ibsAliquota: number;
  ibsValor: number;
  totalReforma: number;
  
  // Diferenças & Impactos
  diffISS: number;
  diffICMS: number;
  diffPIS: number;
  diffCOFINS: number;
  diffIPI: number;
  diffIBS: number;
  diffCBS: number;
  diffTotalCarga: number;
  diffTotalPercent: number;
}

export interface DocumentTaxBreakdownRow {
  tributo: string;
  baseCalculo: number;
  aliquota: number;
  valor: number;
  tipo: 'positivo' | 'negativo' | 'neutro';
  notaExplicativa?: string;
}

export interface DocumentComparativeAnalysis {
  anoSelecionado: YearPeriod;
  isAnoTeste2026: boolean;
  itensCalculados: CalculatedItemTaxes[];
  totais: DocumentTaxTotals;
  quadroSistemaAtual: {
    valorBruto: number;
    linhasTributos: DocumentTaxBreakdownRow[];
    valorLiquido: number;
  };
  quadroReforma: {
    valorLiquidoBase: number;
    linhasTributos: DocumentTaxBreakdownRow[];
    totalReforma: number;
  };
  graficoDiferenca: {
    issIcms: { valor: number; variacao: number; label: string };
    pis: { valor: number; variacao: number; label: string };
    cofins: { valor: number; variacao: number; label: string };
    ibs: { valor: number; variacao: number; label: string; aliquota: number };
    cbs: { valor: number; variacao: number; label: string; aliquota: number };
    totalAtual: number;
    totalReforma: number;
    saldoDiferenca: number;
    percentualDiferenca: number;
  };
}

/**
 * Motor Fiscal de Cálculo Não Presuntivo e Temporal da Reforma Tributária (EC 132/23 e LC 214/25)
 * Executa estritamente a cadeia:
 * DOCUMENTO -> DADOS DA OPERAÇÃO -> CLASSIFICAÇÃO FISCAL -> REGIME DA EMPRESA -> ANO SELECIONADO ->
 * LEGISLAÇÃO VIGENTE -> REGRA TRIBUTÁRIA APLICÁVEL -> BASE DE CÁLCULO -> ALÍQUOTA APLICÁVEL ->
 * VALOR DO TRIBUTO -> TOTAL -> DIFERENÇA -> IMPACTO NA CARGA
 */
export function calculateFiscalDocumentAnalysis(
  doc: FiscalDocument,
  company: CompanyRegistration,
  selectedYear: YearPeriod = 2026
): DocumentComparativeAnalysis {
  const isAnoTeste2026 = selectedYear === 2026;
  const rates = TRANSITION_RATES[selectedYear] || TRANSITION_RATES[2026];

  const isNfse = doc.tipoDocumento === 'NFSE' || doc.modelo === 'NFS-e';
  const regimeEmpresa = company.regimeTributario || doc.emitente.regimeTributario || 'Lucro Real';

  // 1. Processar Itens com base nos fatos da operação contidos no documento
  const itensCalculados: CalculatedItemTaxes[] = doc.itens.map((it, idx) => {
    const vlrBruto = it.valorTotal || (it.quantidade * it.valorUnitario) || 0;
    const desc = it.desconto || 0;
    const baseCalculoItem = Math.max(0, vlrBruto - desc);

    // Tributação Municipal (ISSQN para NFS-e)
    let issAliq = 0;
    let issVal = 0;
    if (isNfse) {
      if (it.tributacao?.issqn?.aliquota !== undefined) {
        issAliq = it.tributacao.issqn.aliquota;
        issVal = it.tributacao.issqn.valor !== undefined 
          ? it.tributacao.issqn.valor 
          : (baseCalculoItem * (issAliq / 100));
      } else if (doc.totais.valorISS !== undefined && doc.totais.valorISS > 0) {
        issVal = doc.totais.valorISS / Math.max(1, doc.itens.length);
        issAliq = baseCalculoItem > 0 ? (issVal / baseCalculoItem) * 100 : 5.0;
      } else {
        issAliq = 5.0; // Padrão municipal quando não informado
        issVal = baseCalculoItem * 0.05;
      }
    }

    // Tributação Estadual (ICMS para NF-e)
    let icmsAliq = 0;
    let icmsVal = 0;
    if (!isNfse) {
      if (it.tributacao?.icms?.aliquota !== undefined) {
        icmsAliq = it.tributacao.icms.aliquota;
        icmsVal = it.tributacao.icms.valor !== undefined 
          ? it.tributacao.icms.valor 
          : (baseCalculoItem * (icmsAliq / 100));
      } else if (doc.totais.valorICMS !== undefined && doc.totais.valorICMS > 0) {
        icmsVal = doc.totais.valorICMS / Math.max(1, doc.itens.length);
        icmsAliq = baseCalculoItem > 0 ? (icmsVal / baseCalculoItem) * 100 : 18.0;
      }
    }

    // IPI (para NF-e industrial)
    const ipiVal = it.tributacao?.ipi?.valor ?? 0;
    const ipiAliq = it.tributacao?.ipi?.aliquota ?? (baseCalculoItem > 0 && ipiVal > 0 ? (ipiVal / baseCalculoItem) * 100 : 0);

    // PIS (conforme documento e regime da empresa cadastrada)
    let pisAliq = 0;
    let pisVal = 0;
    if (it.tributacao?.pis?.aliquota !== undefined) {
      pisAliq = it.tributacao.pis.aliquota;
      pisVal = it.tributacao.pis.valor !== undefined 
        ? it.tributacao.pis.valor 
        : (baseCalculoItem * (pisAliq / 100));
    } else if (doc.totais.valorPIS !== undefined && doc.totais.valorPIS > 0) {
      pisVal = doc.totais.valorPIS / Math.max(1, doc.itens.length);
      pisAliq = baseCalculoItem > 0 ? (pisVal / baseCalculoItem) * 100 : (regimeEmpresa === 'Lucro Real' ? 1.65 : 0.65);
    } else {
      pisAliq = regimeEmpresa === 'Lucro Real' ? 1.65 : (regimeEmpresa === 'Lucro Presumido' ? 0.65 : 0.0);
      pisVal = baseCalculoItem * (pisAliq / 100);
    }

    // COFINS (conforme documento e regime da empresa cadastrada)
    let cofinsAliq = 0;
    let cofinsVal = 0;
    if (it.tributacao?.cofins?.aliquota !== undefined) {
      cofinsAliq = it.tributacao.cofins.aliquota;
      cofinsVal = it.tributacao.cofins.valor !== undefined 
        ? it.tributacao.cofins.valor 
        : (baseCalculoItem * (cofinsAliq / 100));
    } else if (doc.totais.valorCOFINS !== undefined && doc.totais.valorCOFINS > 0) {
      cofinsVal = doc.totais.valorCOFINS / Math.max(1, doc.itens.length);
      cofinsAliq = baseCalculoItem > 0 ? (cofinsVal / baseCalculoItem) * 100 : (regimeEmpresa === 'Lucro Real' ? 7.60 : 3.00);
    } else {
      cofinsAliq = regimeEmpresa === 'Lucro Real' ? 7.60 : (regimeEmpresa === 'Lucro Presumido' ? 3.00 : 0.0);
      cofinsVal = baseCalculoItem * (cofinsAliq / 100);
    }

    // Valor Líquido do Item = Valor Bruto - Descontos - Tributos embutidos por dentro
    const tributosPorDentro = issVal + icmsVal + pisVal + cofinsVal;
    const vlrLiquido = Math.max(0, baseCalculoItem - tributosPorDentro);

    // Alíquotas da Reforma para o ano selecionado (LC 214/2025)
    const aliqCbs = Number((rates.cbs * 100).toFixed(2));
    const aliqIbs = Number(((rates.ibsEstadual + rates.ibsMunicipal) * 100).toFixed(2));

    const cbsVal = Number((vlrLiquido * rates.cbs).toFixed(2));
    const ibsVal = Number((vlrLiquido * (rates.ibsEstadual + rates.ibsMunicipal)).toFixed(2));

    const cstPrincipal = it.tributacao?.issqn?.cst || it.tributacao?.icms?.cst || it.tributacao?.pis?.cst || '01';

    return {
      item: it,
      numeroItem: it.numeroItem || (idx + 1),
      descricao: it.descricao || 'Item de Serviço',
      ncm: it.ncm || it.nbs || 'Não informado',
      codigoServico: it.codigoServico || (it.nbs ? it.nbs : '01.01.01'),
      cfop: it.cfop || doc.cfopPrincipal || (isNfse ? '5933' : '5102'),
      cst: cstPrincipal,
      valorBruto: vlrBruto,
      desconto: desc,
      valorLiquido: vlrLiquido,
      
      issAliquota: issAliq,
      issValor: issVal,
      icmsAliquota: icmsAliq,
      icmsValor: icmsVal,
      ipiAliquota: ipiAliq,
      ipiValor: ipiVal,
      pisAliquota: pisAliq,
      pisValor: pisVal,
      cofinsAliquota: cofinsAliq,
      cofinsValor: cofinsVal,
      
      ibsAliquota: aliqIbs,
      ibsValor: ibsVal,
      cbsAliquota: aliqCbs,
      cbsValor: cbsVal
    };
  });

  // 2. Totalização Geral dos Tributos Atuais do Documento
  const somaItensBruto = itensCalculados.reduce((acc, i) => acc + i.valorBruto, 0);
  const somaItensDesconto = itensCalculados.reduce((acc, i) => acc + i.desconto, 0);
  const valorProdutos = doc.totais.valorServicos ?? doc.totais.valorProdutos ?? somaItensBruto;
  const valorDescontos = doc.totais.valorDesconto ?? somaItensDesconto;
  const valorOutrasDespesas = (doc.totais.valorFrete || 0) + (doc.totais.valorSeguro || 0) + (doc.totais.valorOutrasDespesas || 0);

  const totalISS = doc.totais.valorISS ?? itensCalculados.reduce((acc, i) => acc + i.issValor, 0);
  const totalICMS = doc.totais.valorICMS ?? itensCalculados.reduce((acc, i) => acc + i.icmsValor, 0);
  const totalIPI = doc.totais.valorIPI ?? itensCalculados.reduce((acc, i) => acc + i.ipiValor, 0);
  const totalPIS = doc.totais.valorPIS ?? itensCalculados.reduce((acc, i) => acc + i.pisValor, 0);
  const totalCOFINS = doc.totais.valorCOFINS ?? itensCalculados.reduce((acc, i) => acc + i.cofinsValor, 0);

  const totalTributosAtuais = totalISS + totalICMS + totalIPI + totalPIS + totalCOFINS;
  
  // Valor Líquido da Operação = Base Bruta - Descontos - Tributos por dentro
  const baseBrutaOperacao = Math.max(0, valorProdutos - valorDescontos);
  const valorLiquidoOperacao = Math.max(0, baseBrutaOperacao - (totalISS + totalICMS + totalPIS + totalCOFINS));

  // Valor Total Bruto (conforme regra de recomposição: Líquido + Tributos por dentro)
  const valorTotalBruto = valorLiquidoOperacao + totalISS + totalICMS + totalIPI + totalPIS + totalCOFINS + valorOutrasDespesas;

  // 3. Cálculos Específicos para o Ano da Reforma Selecionado (2026 a 2033)
  const baseCalculoReforma = valorLiquidoOperacao;
  const cbsAliquota = Number((rates.cbs * 100).toFixed(2));
  const ibsAliquota = Number(((rates.ibsEstadual + rates.ibsMunicipal) * 100).toFixed(2));
  
  const cbsValor = Number((baseCalculoReforma * rates.cbs).toFixed(2));
  const ibsValor = Number((baseCalculoReforma * (rates.ibsEstadual + rates.ibsMunicipal)).toFixed(2));
  const totalReforma = Number((cbsValor + ibsValor).toFixed(2));

  // 4. Diferenças Individuais e Impacto na Carga para o Ano Selecionado
  const diffISS = -totalISS;
  const diffICMS = -totalICMS;
  const diffPIS = -totalPIS;
  const diffCOFINS = -totalCOFINS;
  const diffIPI = -totalIPI;
  const diffIBS = ibsValor;
  const diffCBS = cbsValor;

  const diffTotalCarga = Number((totalReforma - totalTributosAtuais).toFixed(2));
  const diffTotalPercent = totalTributosAtuais > 0 
    ? Number(((diffTotalCarga / totalTributosAtuais) * 100).toFixed(2))
    : 0;

  const totais: DocumentTaxTotals = {
    valorProdutos,
    valorDescontos,
    valorOutrasDespesas,
    valorLiquidoOperacao,
    totalISS,
    totalICMS,
    totalIPI,
    totalPIS,
    totalCOFINS,
    totalTributosAtuais,
    valorTotalBruto,
    baseCalculoReforma,
    cbsAliquota,
    cbsValor,
    ibsAliquota,
    ibsValor,
    totalReforma,
    diffISS,
    diffICMS,
    diffPIS,
    diffCOFINS,
    diffIPI,
    diffIBS,
    diffCBS,
    diffTotalCarga,
    diffTotalPercent
  };

  // 5. Linhas do Quadro 1 — SISTEMA ATUAL
  const aliqIssGeral = baseBrutaOperacao > 0 ? (totalISS / baseBrutaOperacao) * 100 : 5.0;
  const aliqIcmsGeral = baseBrutaOperacao > 0 ? (totalICMS / baseBrutaOperacao) * 100 : 18.0;
  const aliqPisGeral = baseBrutaOperacao > 0 ? (totalPIS / baseBrutaOperacao) * 100 : (regimeEmpresa === 'Lucro Real' ? 1.65 : 0.65);
  const aliqCofinsGeral = baseBrutaOperacao > 0 ? (totalCOFINS / baseBrutaOperacao) * 100 : (regimeEmpresa === 'Lucro Real' ? 7.60 : 3.00);

  const linhasQuadroAtual: DocumentTaxBreakdownRow[] = [
    {
      tributo: '1. VLR. BRUTO',
      baseCalculo: valorTotalBruto,
      aliquota: 100.0,
      valor: valorTotalBruto,
      tipo: 'neutro',
      notaExplicativa: `Contém: ${isNfse ? 'ISS' : 'ICMS'}, PIS e COFINS`
    }
  ];

  if (isNfse) {
    linhasQuadroAtual.push({
      tributo: '(-) ISS',
      baseCalculo: baseBrutaOperacao,
      aliquota: aliqIssGeral,
      valor: totalISS,
      tipo: 'negativo',
      notaExplicativa: `Alíquota municipal ${doc.emitente.municipio || 'São Paulo'}`
    });
  } else {
    linhasQuadroAtual.push({
      tributo: '(-) ICMS',
      baseCalculo: baseBrutaOperacao,
      aliquota: aliqIcmsGeral,
      valor: totalICMS,
      tipo: 'negativo',
      notaExplicativa: `Alíquota estadual ${doc.emitente.uf || 'SP'}`
    });
  }

  linhasQuadroAtual.push(
    {
      tributo: '(-) PIS',
      baseCalculo: baseBrutaOperacao,
      aliquota: aliqPisGeral,
      valor: totalPIS,
      tipo: 'negativo',
      notaExplicativa: `PIS/PASEP ${regimeEmpresa === 'Lucro Real' ? 'Não-Cumulativo' : 'Cumulativo'}`
    },
    {
      tributo: '(-) COFINS',
      baseCalculo: baseBrutaOperacao,
      aliquota: aliqCofinsGeral,
      valor: totalCOFINS,
      tipo: 'negativo',
      notaExplicativa: `COFINS ${regimeEmpresa === 'Lucro Real' ? 'Não-Cumulativo' : 'Cumulativo'}`
    }
  );

  const quadroSistemaAtual = {
    valorBruto: valorTotalBruto,
    linhasTributos: linhasQuadroAtual,
    valorLiquido: valorLiquidoOperacao
  };

  // 6. Linhas do Quadro 2 — REFORMA TRIBUTÁRIA ({selectedYear})
  let notaCbs = 'Contribuição sobre Bens e Serviços (LC 214/25)';
  if (selectedYear === 2026) {
    notaCbs = 'Alíquota teste compensável com PIS/COFINS';
  } else if (selectedYear >= 2027) {
    notaCbs = 'Alíquota de referência plena federal';
  }

  let notaIbs = 'Imposto sobre Bens e Serviços (LC 214/25)';
  if (selectedYear === 2026) {
    notaIbs = 'Alíquota teste estadual (0,05%) + municipal (0,05%)';
  } else if (selectedYear === 2027 || selectedYear === 2028) {
    notaIbs = 'Alíquota teste transitória estadual + municipal';
  } else if (selectedYear >= 2029 && selectedYear <= 2032) {
    notaIbs = `${(selectedYear - 2028) * 10}% da alíquota de referência`;
  } else if (selectedYear === 2033) {
    notaIbs = 'Alíquota de referência plena IBS: 12,00% EST + 5,70% MUN';
  }

  const quadroReforma = {
    valorLiquidoBase: valorLiquidoOperacao,
    linhasTributos: [
      {
        tributo: '1. VLR. LÍQUIDO',
        baseCalculo: valorLiquidoOperacao,
        aliquota: 100.0,
        valor: valorLiquidoOperacao,
        tipo: 'neutro' as const,
        notaExplicativa: 'Base para CBS e IBS'
      },
      {
        tributo: '(+) CBS',
        baseCalculo: valorLiquidoOperacao,
        aliquota: cbsAliquota,
        valor: cbsValor,
        tipo: 'positivo' as const,
        notaExplicativa: notaCbs
      },
      {
        tributo: '(+) IBS',
        baseCalculo: valorLiquidoOperacao,
        aliquota: ibsAliquota,
        valor: ibsValor,
        tipo: 'positivo' as const,
        notaExplicativa: notaIbs
      }
    ],
    totalReforma: totalReforma
  };

  // 7. Balanço e Gráfico de Diferenças (Quadro 3)
  const graficoDiferenca = {
    issIcms: { 
      valor: isNfse ? totalISS : totalICMS, 
      variacao: isNfse ? diffISS : diffICMS, 
      label: isNfse ? 'ISS' : 'ICMS' 
    },
    pis: { valor: totalPIS, variacao: diffPIS, label: 'PIS' },
    cofins: { valor: totalCOFINS, variacao: diffCOFINS, label: 'COFINS' },
    ibs: { valor: ibsValor, variacao: diffIBS, label: 'IBS', aliquota: ibsAliquota },
    cbs: { valor: cbsValor, variacao: diffCBS, label: 'CBS', aliquota: cbsAliquota },
    totalAtual: totalTributosAtuais,
    totalReforma: totalReforma,
    saldoDiferenca: diffTotalCarga,
    percentualDiferenca: diffTotalPercent
  };

  return {
    anoSelecionado: selectedYear,
    isAnoTeste2026,
    itensCalculados,
    totais,
    quadroSistemaAtual,
    quadroReforma,
    graficoDiferenca
  };
}

