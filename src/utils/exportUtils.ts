import { TaxItem } from '../types/tax';

export const exportTaxItemsToCSV = (items: TaxItem[], selectedYear: number, companyName: string = 'Empresa') => {
  const headers = [
    'Numero_NF',
    'Serie',
    'Data_Emissao',
    'Emitente',
    'Destinatario',
    'UF_Origem',
    'Municipio_Origem',
    'UF_Destino',
    'Municipio_Destino',
    'Codigo_Produto',
    'Descricao_Produto',
    'NCM',
    'CFOP',
    'CST',
    'Quantidade',
    'Unidade',
    'Valor_Unitario_BRL',
    'Valor_Total_Item_BRL',
    'Frete_BRL',
    'Seguro_BRL',
    'Descontos_BRL',
    'PIS_Legado_BRL',
    'COFINS_Legado_BRL',
    'ICMS_Legado_BRL',
    'ISS_Legado_BRL',
    'IPI_Legado_BRL',
    'Total_Tributos_Legado_BRL',
    `Aliq_CBS_${selectedYear}_Percent`,
    `Valor_CBS_${selectedYear}_BRL`,
    `Aliq_IBS_Estadual_${selectedYear}_Percent`,
    `Aliq_IBS_Municipal_${selectedYear}_Percent`,
    `Valor_IBS_Total_${selectedYear}_BRL`,
    `Aliq_Imposto_Seletivo_${selectedYear}_Percent`,
    `Valor_Imposto_Seletivo_${selectedYear}_BRL`,
    `Credito_Insumos_Reforma_${selectedYear}_BRL`,
    `Total_Tributos_Reforma_${selectedYear}_BRL`,
    `Carga_Liquida_Reforma_${selectedYear}_BRL`,
    'Base_Legal_Reforma'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map(item => [
    escapeCSV(item.numNota),
    escapeCSV(item.serie),
    escapeCSV(item.data),
    escapeCSV(item.emitente),
    escapeCSV(item.destinatario),
    escapeCSV(item.ufOrigem),
    escapeCSV(item.municipioOrigem),
    escapeCSV(item.ufDestino),
    escapeCSV(item.municipioDestino),
    escapeCSV(item.produtoCodigo),
    escapeCSV(item.produtoDescricao),
    escapeCSV(item.ncm),
    escapeCSV(item.cfop),
    escapeCSV(item.cst),
    item.quantidade,
    escapeCSV(item.unidade),
    item.valorUnitario.toFixed(2).replace('.', ','),
    item.valorTotal.toFixed(2).replace('.', ','),
    item.frete.toFixed(2).replace('.', ','),
    item.seguro.toFixed(2).replace('.', ','),
    item.descontos.toFixed(2).replace('.', ','),
    item.vlrPisAtual.toFixed(2).replace('.', ','),
    item.vlrCofinsAtual.toFixed(2).replace('.', ','),
    item.vlrIcmsAtual.toFixed(2).replace('.', ','),
    item.vlrIssAtual.toFixed(2).replace('.', ','),
    item.vlrIpiAtual.toFixed(2).replace('.', ','),
    item.totalTributosAtual.toFixed(2).replace('.', ','),
    item.aliqCbsReforma.toFixed(2).replace('.', ','),
    item.vlrCbsReforma.toFixed(2).replace('.', ','),
    item.aliqIbsEstadualReforma.toFixed(2).replace('.', ','),
    item.aliqIbsMunicipalReforma.toFixed(2).replace('.', ','),
    item.vlrIbsTotalReforma.toFixed(2).replace('.', ','),
    item.aliqImpostoSeletivoReforma.toFixed(2).replace('.', ','),
    item.vlrImpostoSeletivoReforma.toFixed(2).replace('.', ','),
    item.creditosReforma.toFixed(2).replace('.', ','),
    item.totalTributosReforma.toFixed(2).replace('.', ','),
    (item.totalTributosReforma - item.creditosReforma).toFixed(2).replace('.', ','),
    escapeCSV(item.baseLegalReforma)
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `simulador_tax_reform_transacoes_${cleanName}_${selectedYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
