import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExecutiveKPIs, SensitivityParams, YearPeriod } from '../types/tax';
import { CompanyRegistration } from '../types/company';
import { AssessmentStep, SavedSimulation } from '../types/simulation';
import { WhiteLabelConfig } from '../types/auth';
import { Language } from './i18n';

interface StrategicReportPDFParams {
  companyData: CompanyRegistration;
  kpis: ExecutiveKPIs;
  selectedYear: YearPeriod;
  sensitivityParams: SensitivityParams;
  savedSimulations?: SavedSimulation[];
  assessmentSteps?: AssessmentStep[];
  whiteLabel?: WhiteLabelConfig;
  currentLanguage?: Language;
}

export const generateStrategicReportPDF = ({
  companyData,
  kpis,
  selectedYear,
  sensitivityParams,
  savedSimulations = [],
  assessmentSteps = [],
  whiteLabel,
}: StrategicReportPDFParams) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [0, 210, 128]; // #00D280
  const darkColor = [15, 23, 42]; // #0F172A

  const brandName = whiteLabel?.enabled ? whiteLabel.brandName : 'Simulador de Reforma Tributária';
  const partnerName = whiteLabel?.enabled ? whiteLabel.partnerName : 'Tax Intelligence Platform';
  const reportHeader = whiteLabel?.enabled && whiteLabel.reportHeader ? whiteLabel.reportHeader : 'Dossiê Executivo de Planejamento Tributário - Reforma Tributária (EC 132/2023 & LC 214/2025)';
  const supportPhone = whiteLabel?.enabled && whiteLabel.supportPhone ? whiteLabel.supportPhone : '+55 11 96175-9438';

  const formatRS = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  // --- PAGE 1: HEADER & METADATA ---
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(brandName.toUpperCase(), 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`${partnerName} • ${reportHeader}`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em: ${new Date().toLocaleString('pt-BR')} • Ano Base: ${selectedYear} • Contato: ${supportPhone}`,
    14,
    30
  );

  let y = 46;

  // Company Overview Card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Dados Cadastrais da Empresa Auditada', 14, y);

  y += 3;
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    head: [['Razão Social / Nome', 'CNPJ', 'Regime Tributário', 'Setor Econômico', 'Ano Simulado']],
    body: [
      [
        companyData.razaoSocial,
        companyData.cnpj,
        companyData.regimeTributario,
        companyData.setor,
        String(selectedYear),
      ],
    ],
  });

  // Section 1: KPIs
  const currentTableEndY = (doc as any).lastAutoTable.finalY || y + 20;
  y = currentTableEndY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('1. Síntese Executiva de Impactos Fiscais, EBITDA e Margens', 14, y);

  y += 3;
  const deltaTributos = kpis.tributosReforma - kpis.tributosAtuais;
  const deltaPercent = (deltaTributos / Math.max(1, kpis.tributosAtuais)) * 100;
  const deltaEbitda = kpis.ebitdaReforma - kpis.ebitdaAtual;
  const deltaEbitdaPercent = (deltaEbitda / Math.max(1, kpis.ebitdaAtual)) * 100;

  const kpiData = [
    ['Receita Bruta Faturada', formatRS(kpis.receitaBruta), formatRS(kpis.receitaBruta), 'R$ 0,00', 'Base Estável'],
    ['Tributos Totais Devidos', formatRS(kpis.tributosAtuais), formatRS(kpis.tributosReforma), formatRS(deltaTributos), `${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(2)}%`],
    ['Créditos Apropriados de Insumos', formatRS(kpis.creditosAtuais), formatRS(kpis.creditosReforma), formatRS(kpis.creditosReforma - kpis.creditosAtuais), 'Crédito Amplo (LC 214)'],
    ['Carga Tributária Efetiva (%)', `${kpis.cargaTributariaAtualPercent.toFixed(2)}%`, `${kpis.cargaTributariaReformaPercent.toFixed(2)}%`, `${(kpis.cargaTributariaReformaPercent - kpis.cargaTributariaAtualPercent).toFixed(2)} p.p.`, kpis.cargaTributariaReformaPercent <= kpis.cargaTributariaAtualPercent ? 'Otimizada' : 'Aumento Nominal'],
    ['EBITDA Projetado', formatRS(kpis.ebitdaAtual), formatRS(kpis.ebitdaReforma), formatRS(deltaEbitda), `${deltaEbitdaPercent >= 0 ? '+' : ''}${deltaEbitdaPercent.toFixed(2)}%`],
    ['Fluxo de Caixa Livre Estimado', formatRS(kpis.fluxoCaixaAtual), formatRS(kpis.fluxoCaixaReforma), formatRS(kpis.fluxoCaixaReforma - kpis.fluxoCaixaAtual), 'Impacto Split Payment'],
    ['Necessidade de Capital de Giro', formatRS(kpis.capitalGiroAtual), formatRS(kpis.capitalGiroReforma), formatRS(kpis.capitalGiroReforma - kpis.capitalGiroAtual), 'Reserva de Liquidez'],
  ];

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['Indicador de Performance', 'Sistema Atual (Legado)', `Reforma (${selectedYear})`, 'Variação Líquida', 'Comportamento']],
    body: kpiData,
  });

  // Section 2: Saved Scenarios Comparison (if any)
  if (savedSimulations.length >= 2) {
    const endY = (doc as any).lastAutoTable.finalY || 130;
    y = endY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('2. Comparativo de Cenários Gravados no Repositório', 14, y);

    y += 3;
    const simA = savedSimulations[0];
    const simB = savedSimulations[1];

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      head: [['Métrica de Comparação', `Cenário A: ${simA.nome.substring(0, 22)}`, `Cenário B: ${simB.nome.substring(0, 22)}`, 'Variação (B vs A)']],
      body: [
        ['Alíquota CBS Estimada', `${simA.sensitivityParams.aliqCbsEstimada.toFixed(2)}%`, `${simB.sensitivityParams.aliqCbsEstimada.toFixed(2)}%`, `${(simB.sensitivityParams.aliqCbsEstimada - simA.sensitivityParams.aliqCbsEstimada).toFixed(2)} p.p.`],
        ['Alíquota IBS Estimada', `${simA.sensitivityParams.aliqIbsEstimada.toFixed(2)}%`, `${simB.sensitivityParams.aliqIbsEstimada.toFixed(2)}%`, `${(simB.sensitivityParams.aliqIbsEstimada - simA.sensitivityParams.aliqIbsEstimada).toFixed(2)} p.p.`],
        ['Repasse Comercial (%)', `${simA.sensitivityParams.repasseTributarioPercent}%`, `${simB.sensitivityParams.repasseTributarioPercent}%`, `${simB.sensitivityParams.repasseTributarioPercent - simA.sensitivityParams.repasseTributarioPercent} p.p.`],
        ['Aproveitamento de Créditos', `${simA.sensitivityParams.aproveitamentoCreditoInsumosPercent}%`, `${simB.sensitivityParams.aproveitamentoCreditoInsumosPercent}%`, `${simB.sensitivityParams.aproveitamentoCreditoInsumosPercent - simA.sensitivityParams.aproveitamentoCreditoInsumosPercent} p.p.`],
        ['Tributos Totais Calculados', formatRS(simA.calculatedKPIs.tributosReforma), formatRS(simB.calculatedKPIs.tributosReforma), formatRS(simB.calculatedKPIs.tributosReforma - simA.calculatedKPIs.tributosReforma)],
        ['EBITDA Projetado', formatRS(simA.calculatedKPIs.ebitdaReforma), formatRS(simB.calculatedKPIs.ebitdaReforma), formatRS(simB.calculatedKPIs.ebitdaReforma - simA.calculatedKPIs.ebitdaReforma)],
      ],
    });
  }

  // --- PAGE 2: ROADMAP DE IMPLANTAÇÃO PÓS-SIMULAÇÃO ---
  doc.addPage();

  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Assessment de Transição & Roadmap de Mudança (5 Fases)', 14, 13);

  y = 28;
  const roadmapBody = assessmentSteps.map((s) => [
    s.faseNome,
    s.titulo,
    s.status === 'concluido' ? 'Concluído' : s.status === 'em_andamento' ? 'Em Andamento' : 'Planejado',
    s.responsavel,
    s.prazoEstimado,
    s.entregavel,
  ]);

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 38 },
    },
    head: [['Fase do Projeto', 'Ação Estratégica', 'Status', 'Líder Responsável', 'Prazo', 'Entregável Homologado']],
    body: roadmapBody,
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // Strategic Advisory Recommendations Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Parecer Consultivo & Recomendações Estratégicas:', 14, finalY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const disclaimer = [
    '• Recomenda-se iniciar imediatamente a revisão cadastral dos itens e contratos para garantir a não-cumulatividade plena a partir de 2026.',
    '• Acompanhar as regulamentações complementares do Comitê Gestor do IBS (CGIBS) e Receita Federal para parametrização do Split Payment.',
    '• Este relatório foi gerado com base nas diretrizes da Emenda Constitucional 132/2023 e Lei Complementar 214/2025.',
  ];

  disclaimer.forEach((line, idx) => {
    doc.text(line, 14, finalY + 18 + idx * 5);
  });

  // Footer text
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento Confidencial • Elaborado por ${brandName} (${partnerName}) • Suporte: ${supportPhone}`,
    14,
    285
  );

  doc.save(`Relatorio_Estrategico_Tax_Reform_${companyData.cnpj.replace(/\D/g, '') || 'Empresa'}_${selectedYear}.pdf`);
};
