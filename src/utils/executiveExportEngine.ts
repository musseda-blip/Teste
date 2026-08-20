import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { WhiteLabelConfig } from '../types/auth';
import { 
  ConsolidatedTaxMetrics, 
  DocumentQualityMetrics, 
  YearlyTransitionPoint, 
  DRELineItem, 
  ExecutiveReading 
} from './executiveConsolidationEngine';

export interface ExportExecutiveDashboardOptions {
  company: CompanyRegistration;
  selectedYear: YearPeriod;
  metrics: ConsolidatedTaxMetrics;
  quality: DocumentQualityMetrics;
  timeline: YearlyTransitionPoint[];
  dre: DRELineItem[];
  reading: ExecutiveReading;
  whiteLabel?: WhiteLabelConfig;
}

const formatRS = (v: number | null | undefined) => {
  if (v === null || v === undefined) return 'Não determinado';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);
};

const formatPercent = (v: number | null | undefined) => {
  if (v === null || v === undefined) return 'N/D';
  return `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

/**
 * Exportar Dossiê Executivo C-Level em PDF para o Conselho de Administração
 */
export function exportExecutiveDashboardPDF({
  company,
  selectedYear,
  metrics,
  quality,
  timeline,
  dre,
  reading,
  whiteLabel
}: ExportExecutiveDashboardOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [0, 210, 128]; // #00D280
  const darkColor = [15, 23, 42]; // #0F172A
  const brandName = whiteLabel?.enabled ? whiteLabel.brandName : 'Simulador de Reforma Tributária';
  const partnerName = whiteLabel?.enabled ? whiteLabel.partnerName : 'Tax Intelligence Platform';
  const supportPhone = whiteLabel?.enabled && whiteLabel.supportPhone ? whiteLabel.supportPhone : '+55 11 96175-9438';

  // --- CABEÇALHO DA PÁGINA 1 ---
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(brandName.toUpperCase(), 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`${partnerName} • Dossiê Estratégico de Diagnóstico e Transição C-Level (EC 132/2023 & LC 214/2025)`, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} • Ano Simulado: ${selectedYear} • Contato: ${supportPhone}`, 14, 29);

  let y = 44;

  // 1. Dados Cadastrais e Confiabilidade
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('1. CONTEXTO CORPORATIVO & ÍNDICE DE CONFIABILIDADE DOCUMENTAL', 14, y);

  y += 3;
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    head: [['Razão Social', 'CNPJ', 'Regime Tributário', 'Segmento', 'Base Documental Auditada', 'Confiabilidade']],
    body: [
      [
        company.razaoSocial,
        company.cnpj,
        company.regimeTributario,
        company.setor,
        `${metrics.totalDocumentos} Documentos (${metrics.totalDocumentosSaida} Saídas / ${metrics.totalDocumentosEntrada} Entradas)`,
        `${quality.indiceConfiabilidade}% (Auditado)`
      ]
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // 2. Comparativo Executivo Consolidado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`2. CONSOLIDAÇÃO EXECUTIVA: SISTEMA ATUAL × REFORMA (${selectedYear})`, 14, y);

  y += 3;
  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    head: [['Indicador Financeiro / Tributário', 'Sistema Atual (Legado)', `Reforma (${selectedYear})`, 'Diferença Nominal', 'Variação %']],
    body: [
      [
        'Receita Bruta Faturada',
        formatRS(metrics.receitaBruta),
        formatRS(metrics.receitaBruta),
        'R$ 0,00',
        '0,00%'
      ],
      [
        'Tributos Totais Faturados',
        formatRS(metrics.tributosAtuais.totalBruto),
        formatRS(metrics.tributosReforma.totalBruto),
        `${metrics.diferenca.nominalBruta > 0 ? '+' : ''}${formatRS(metrics.diferenca.nominalBruta)}`,
        formatPercent(metrics.diferenca.percentualBruto)
      ],
      [
        'Carga Tributária Efetiva (%)',
        `${metrics.tributosAtuais.cargaEfetivaPercent.toFixed(2)}%`,
        `${metrics.tributosReforma.cargaEfetivaPercent.toFixed(2)}%`,
        `${(metrics.tributosReforma.cargaEfetivaPercent - metrics.tributosAtuais.cargaEfetivaPercent).toFixed(2)} p.p.`,
        '-'
      ],
      [
        'Créditos Documentados (Entradas)',
        formatRS(metrics.tributosAtuais.creditosDocumentados),
        formatRS(metrics.tributosReforma.creditosDocumentados),
        formatRS(metrics.tributosReforma.creditosDocumentados - metrics.tributosAtuais.creditosDocumentados),
        '-'
      ],
      [
        'Carga Tributária Líquida Documentada',
        formatRS(metrics.tributosAtuais.totalLiquido),
        formatRS(metrics.tributosReforma.totalLiquido),
        `${metrics.diferenca.nominalLiquida > 0 ? '+' : ''}${formatRS(metrics.diferenca.nominalLiquida)}`,
        formatPercent(metrics.diferenca.percentualLiquido)
      ]
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // 3. Leitura Executiva Dinâmica
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('3. LEITURA EXECUTIVA E DIAGNÓSTICO ESTRATÉGICO', 14, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  
  const textLines = [
    `• ${reading.resumoCenario}`,
    `• ${reading.comparativoAno}`,
    `• ${reading.impactoNominalTexto}`,
    `• ${reading.impactoReceitaLiquidaTexto}`,
    `• ${reading.limitacaoCreditosTexto}`
  ];

  textLines.forEach(line => {
    const split = doc.splitTextToSize(line, 182);
    doc.text(split, 14, y);
    y += (split.length * 3.5) + 1;
  });

  // --- PÁGINA 2: TRANSIÇÃO 2026-2033 E DRE ---
  doc.addPage();
  
  // Cabeçalho Página 2
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 16, 210, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`EVOLUÇÃO TEMPORAL (2026 A 2033) & DRE GERENCIAL — ${company.razaoSocial.toUpperCase()}`, 14, 11);

  y = 24;

  // 4. Tabela Temporal 2026-2033
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('4. CRONOGRAMA DE TRANSIÇÃO DA CARGA TRIBUTÁRIA (2026 A 2033)', 14, y);

  y += 3;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6.5, textColor: [30, 41, 59] },
    head: [['Ano', 'Fase Legal', 'Legado (PIS/COF/ISS)', 'CBS (R$)', 'IBS (R$)', 'Total Reforma', 'Diferença vs Atual', 'Var. %']],
    body: timeline.map(t => [
      String(t.ano),
      t.fase,
      formatRS(t.totalLegado),
      formatRS(t.cbsValor),
      formatRS(t.ibsValor),
      formatRS(t.totalReforma),
      `${t.diferencaNominal > 0 ? '+' : ''}${formatRS(t.diferencaNominal)}`,
      formatPercent(t.diferencaPercentual)
    ]),
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // 5. DRE Gerencial Espelhada
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('5. DRE GERENCIAL EXECUTIVA — BASE DOCUMENTAL AUDITADA', 14, y);

  y += 3;
  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6.5, textColor: [30, 41, 59] },
    head: [['Linha da DRE', 'Sistema Atual', `Reforma (${selectedYear})`, 'Diferença', 'Variação %', 'Observações']],
    body: dre.map(d => [
      d.descricao,
      d.valorAtual !== null ? formatRS(d.valorAtual) : 'Não determinado',
      d.valorReforma !== null ? formatRS(d.valorReforma) : 'Não determinado',
      d.diferenca !== null ? formatRS(d.diferenca) : '-',
      formatPercent(d.variacaoPercent),
      d.observacao || ''
    ]),
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // 6. Nota Metodológica e Conclusiva
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('6. NOTA METODOLÓGICA & DECLARAÇÃO DE GOVERNANÇA', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const notaLines = [
    '• Esta consolidação foi realizada exclusivamente com base nos documentos fiscais vinculados ao contexto selecionado e nos respectivos cálculos realizados pelo sistema sob a EC 132/2023 e LC 214/2025.',
    '• Eventuais créditos, ajustes ou efeitos financeiros não identificados ou não suportados pelos documentos vinculados não foram considerados nesta consolidação.',
    '• O resultado representa uma análise tributária baseada nos documentos disponíveis e não constitui, isoladamente, uma projeção definitiva de caixa ou resultado contábil.'
  ];
  let notaY = y + 11;
  notaLines.forEach(l => {
    const split = doc.splitTextToSize(l, 174);
    doc.text(split, 18, notaY);
    notaY += (split.length * 3) + 1;
  });

  // Salvar PDF
  const cleanName = company.razaoSocial.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`dossie_executivo_c_level_${cleanName}_ano_${selectedYear}.pdf`);
}

/**
 * Exportar Visão Estruturada em Planilha XLSX / CSV Compatível
 */
export function exportExecutiveDashboardXLSX({
  company,
  selectedYear,
  metrics,
  quality,
  timeline,
  dre,
  whiteLabel
}: ExportExecutiveDashboardOptions): void {
  const headersCronograma = [
    'Ano',
    'Fase_Transição',
    'Receita_Bruta_BRL',
    'PIS_BRL',
    'COFINS_BRL',
    'ISS_BRL',
    'ICMS_BRL',
    'Total_Legado_BRL',
    'Aliq_CBS_Percent',
    'CBS_BRL',
    'Aliq_IBS_Percent',
    'IBS_BRL',
    'Total_Reforma_BRL',
    'Diferença_Nominal_vs_Atual_BRL',
    'Variação_Percentual'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rowsCronograma = timeline.map(t => [
    t.ano,
    escapeCSV(t.fase),
    t.receitaBruta.toFixed(2).replace('.', ','),
    t.pis.toFixed(2).replace('.', ','),
    t.cofins.toFixed(2).replace('.', ','),
    t.iss.toFixed(2).replace('.', ','),
    t.icms.toFixed(2).replace('.', ','),
    t.totalLegado.toFixed(2).replace('.', ','),
    t.cbsAliquota.toFixed(2).replace('.', ','),
    t.cbsValor.toFixed(2).replace('.', ','),
    t.ibsAliquota.toFixed(2).replace('.', ','),
    t.ibsValor.toFixed(2).replace('.', ','),
    t.totalReforma.toFixed(2).replace('.', ','),
    t.diferencaNominal.toFixed(2).replace('.', ','),
    t.diferencaPercentual.toFixed(2).replace('.', ',') + '%'
  ]);

  const rowsDre = dre.map(d => [
    d.codigo,
    escapeCSV(d.descricao),
    d.valorAtual !== null ? d.valorAtual.toFixed(2).replace('.', ',') : 'Não determinado',
    d.valorReforma !== null ? d.valorReforma.toFixed(2).replace('.', ',') : 'Não determinado',
    d.diferenca !== null ? d.diferenca.toFixed(2).replace('.', ',') : 'N/D',
    d.variacaoPercent !== null ? d.variacaoPercent.toFixed(2).replace('.', ',') + '%' : 'N/D',
    escapeCSV(d.observacao || '')
  ]);

  const csvContent = '\uFEFF' + [
    '# ============================================================',
    `# DOSSIÊ EXECUTIVO C-LEVEL — REFORMA TRIBUTÁRIA (EC 132/2023 & LC 214/2025)`,
    `# Empresa: ${company.razaoSocial} | CNPJ: ${company.cnpj} | Regime: ${company.regimeTributario} | Segmento: ${company.setor}`,
    `# Ano de Simulação: ${selectedYear} | Confiabilidade Documental: ${quality.indiceConfiabilidade}%`,
    `# Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '# ============================================================',
    '',
    '# 1. CRONOGRAMA TEMPORAL DE TRANSIÇÃO (2026 A 2033)',
    headersCronograma.join(';'),
    ...rowsCronograma.map(r => r.join(';')),
    '',
    '# 2. DRE GERENCIAL CONSOLIDADA (SISTEMA ATUAL × REFORMA)',
    ['Código', 'Linha_DRE', 'Sistema_Atual_BRL', `Reforma_${selectedYear}_BRL`, 'Diferença_BRL', 'Variação_Percent', 'Observações'].join(';'),
    ...rowsDre.map(r => r.join(';')),
    '',
    '# 3. NOTA METODOLÓGICA E GOVERNANÇA',
    '"Esta consolidação foi realizada exclusivamente com base nos documentos fiscais vinculados ao contexto selecionado."',
    '"Eventuais créditos, ajustes ou efeitos financeiros não identificados não foram considerados."',
    '"O resultado representa análise tributária baseada nos documentos disponíveis."'
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = company.razaoSocial.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `consolidacao_executiva_c_level_${cleanName}_${selectedYear}.csv`);
  document.body.appendChild(link);
  link.click();
}
