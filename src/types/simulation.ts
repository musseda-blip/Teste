import { EconomicSegment, ExecutiveKPIs, SensitivityParams, YearPeriod } from './tax';

export interface AssessmentStep {
  id: string;
  fase: number;
  faseNome: string;
  titulo: string;
  descricao: string;
  impacto: 'Alto' | 'Médio' | 'Crítico' | 'Estratégico';
  status: 'concluido' | 'em_andamento' | 'planejado';
  responsavel: string;
  prazoEstimado: string;
  entregavel: string;
  observacoes?: string;
  recomendacaoIA: string;
}

export interface SavedSimulation {
  id: string;
  nome: string;
  descricao: string;
  anoBase: YearPeriod;
  segmento: EconomicSegment;
  sensitivityParams: SensitivityParams;
  calculatedKPIs: ExecutiveKPIs;
  criadoEm: string;
  atualizadoEm: string;
  autorNome: string;
  companyId?: string;
  tags?: string[];
  statusAprovacao?: 'Rascunho' | 'Em Análise' | 'Aprovado pelo C-Level' | 'Homologado';
  estrategiaResumo?: string;
}

export interface ScenarioDelta {
  cbsAliqDiff: number;
  ibsAliqDiff: number;
  isAliqDiff: number;
  cargaTotalAliqDiff: number;
  tributosDiffRS: number;
  tributosDiffPercent: number;
  ebitdaDiffRS: number;
  ebitdaMargemDiffPoints: number;
  creditosDiffRS: number;
  fluxoCaixaDiffRS: number;
  precoAjusteDiffPercent: number;
}

export const DEFAULT_ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'step_1',
    fase: 1,
    faseNome: 'Fase 1: Diagnóstico Cadastral & NCM/NBS',
    titulo: 'Higienização de Cadastros e Classificação Fiscal de Mercadorias e Serviços',
    descricao: 'Auditoria de 100% da base cadastral de SKUs, serviços e NCMs/NBS para identificar alíquotas reduzidas (60%, 100% isenção) ou incidência do Imposto Seletivo.',
    impacto: 'Crítico',
    status: 'concluido',
    responsavel: 'Gerente Fiscal & Especialistas Tributários',
    prazoEstimado: '30 dias',
    entregavel: 'Matriz DE-PARA de NCMs/NBS com alíquotas estimadas de CBS e IBS parametrizadas.',
    observacoes: 'Diagnóstico preliminar apontou 94% dos itens sob regime padrão e 6% com regimes específicos.',
    recomendacaoIA: 'Priorizar a revisão dos contratos de serviços recorrentes e licenças de software para garantir o enquadramento sem bitributação.',
  },
  {
    id: 'step_2',
    fase: 2,
    faseNome: 'Fase 2: Arquitetura de Sistemas & Parametrização ERP',
    titulo: 'Adaptação do ERP (SAP / TOTVS / Oracle / Senior) e Motores de Cálculo',
    descricao: 'Configuração do motor de cálculo fiscal para emissão de notas com destaque de CBS/IBS "por fora", convivência de campos do SPED e regras de transição.',
    impacto: 'Crítico',
    status: 'em_andamento',
    responsavel: 'Head de TI & Consultoria ERP',
    prazoEstimado: '60 dias',
    entregavel: 'Ambiente de Homologação emitindo NF-e e NFS-e no layout padrão nacional 2026.',
    observacoes: 'Patch de atualização do ERP programado para o próximo sprint de desenvolvimento.',
    recomendacaoIA: 'Implementar conectores com APIs fiscais especialistas para evitar dependência exclusiva de releases legadas dos fabricantes de ERP.',
  },
  {
    id: 'step_3',
    fase: 3,
    faseNome: 'Fase 3: Meios de Pagamento & Split Payment',
    titulo: 'Adequação de Tesouraria, Liquidação Financeira e Conciliação Bancária',
    descricao: 'Estruturação dos fluxos de recebimento (PIX, cartões, boletos e TED) para acomodar a retenção automática pelo Comitê Gestor (CGIBS).',
    impacto: 'Alto',
    status: 'em_andamento',
    responsavel: 'Diretor Financeiro & Tesouraria',
    prazoEstimado: '45 dias',
    entregavel: 'Modelo de conciliação bancária líquida e revisão de linhas de crédito de capital de giro.',
    observacoes: 'Mapeamento de fornecedores com prazo médio de pagamento (DSO e DPO) em andamento.',
    recomendacaoIA: 'Negociar linhas de crédito rotativo de curto prazo para neutralizar o hiato temporal de caixa da retenção do Split Payment.',
  },
  {
    id: 'step_4',
    fase: 4,
    faseNome: 'Fase 4: Cadeia de Fornecedores & Maximização de Créditos',
    titulo: 'Auditoria de Fornecedores B2B e Não-Cumulatividade Plena',
    descricao: 'Revisão da base de fornecedores de insumos, fretes, energia e serviços terceirizados para maximizar a apropriação de créditos financeiros de CBS/IBS.',
    impacto: 'Estratégico',
    status: 'planejado',
    responsavel: 'Diretoria de Compras & Suprimentos',
    prazoEstimado: '40 dias',
    entregavel: 'Scorecard de conformidade fiscal de fornecedores e cláusulas contratuais de recolhimento.',
    observacoes: 'Planejada reunião com os 20 principais parceiros comerciais no próximo mês.',
    recomendacaoIA: 'Substituir compras sem comprovação fiscal de recolhimento por parceiros com conformidade tributária nível A para assegurar o crédito financeiro pleno.',
  },
  {
    id: 'step_5',
    fase: 5,
    faseNome: 'Fase 5: Reprecificação Comercial & Gestão de Margem',
    titulo: 'Reestruturação de Tabelas de Preços, Contratos e Elasticidade de Margem',
    descricao: 'Calibração dos preços de venda com base no modelo de imposto "por fora", garantindo a preservação da margem EBITDA líquida e competitividade de mercado.',
    impacto: 'Estratégico',
    status: 'planejado',
    responsavel: 'Diretoria Comercial & Pricing',
    prazoEstimado: '50 dias',
    entregavel: 'Nova política de precificação B2B/B2C com simulador de margem pós-reforma por linha de produto.',
    observacoes: 'Simulação inicial demonstra necessidade de ajuste de +4.2% para neutralidade de EBITDA em serviços.',
    recomendacaoIA: 'Diferenciar o repasse nos contratos corporativos B2B (onde o cliente aproveita crédito integral) versus clientes finais B2C.',
  },
];

export const DEFAULT_SAVED_SIMULATIONS: SavedSimulation[] = [
  {
    id: 'sim_cenario_base',
    nome: 'Cenário 1: Base Oficial EC 132/2023 (Conservador)',
    descricao: 'Alíquotas padrão oficiais (CBS 8,8% + IBS 17,7%), repasse comercial padrão de 100% e 100% de apropriação de créditos.',
    anoBase: 2026,
    segmento: 'Tecnologia / SaaS',
    sensitivityParams: {
      precoVendaAdjPercent: 0,
      custoInsumoAdjPercent: 0,
      repasseTributarioPercent: 100,
      aproveitamentoCreditoInsumosPercent: 100,
      aliqCbsEstimada: 8.8,
      aliqIbsEstimada: 17.7,
      aliqImpostoSeletivoEstimada: 5.0,
      mixProdutos: 'Atual',
      segmento: 'Tecnologia / SaaS',
      anoSimulacao: 2026,
    },
    calculatedKPIs: {
      receitaBruta: 12500000,
      receitaLiquida: 10750000,
      tributosAtuais: 1845000,
      tributosReforma: 1985000,
      cargaTributariaAtualPercent: 14.76,
      cargaTributariaReformaPercent: 15.88,
      creditosAtuais: 412000,
      debitosAtuais: 2257000,
      creditosReforma: 685000,
      debitosReforma: 2670000,
      impactoFiscalRS: 140000,
      impactoFiscalPercent: 7.58,
      impactoFinanceiroRS: -165000,
      impactoContabilRS: -140000,
      ebitdaAtual: 3420000,
      ebitdaReforma: 3345000,
      margemEbitdaAtualPercent: 27.36,
      margemEbitdaReformaPercent: 26.76,
      fluxoCaixaAtual: 2950000,
      fluxoCaixaReforma: 2810000,
      capitalGiroAtual: 1400000,
      capitalGiroReforma: 1590000,
      impactoAcumulado2026_2033: -1120000,
    },
    criadoEm: '2026-01-15T10:00:00Z',
    atualizadoEm: '2026-01-15T10:00:00Z',
    autorNome: 'Consultoria Tributária Especializada',
    tags: ['Oficial', 'Base', 'Tecnologia'],
    statusAprovacao: 'Aprovado pelo C-Level',
    estrategiaResumo: 'Cenário de referência para auditoria com o Conselho de Administração.',
  },
  {
    id: 'sim_cenario_otimizado',
    nome: 'Cenário 2: Otimizado - Maximização de Créditos B2B',
    descricao: 'Reajuste comercial de preços de +4,5%, substituição de fornecedores sem crédito e redução de custos operacionais.',
    anoBase: 2026,
    segmento: 'Tecnologia / SaaS',
    sensitivityParams: {
      precoVendaAdjPercent: 4.5,
      custoInsumoAdjPercent: -2.0,
      repasseTributarioPercent: 100,
      aproveitamentoCreditoInsumosPercent: 100,
      aliqCbsEstimada: 8.8,
      aliqIbsEstimada: 17.7,
      aliqImpostoSeletivoEstimada: 5.0,
      mixProdutos: 'Insumos com Crédito Pleno',
      segmento: 'Tecnologia / SaaS',
      anoSimulacao: 2026,
    },
    calculatedKPIs: {
      receitaBruta: 13062500,
      receitaLiquida: 11233750,
      tributosAtuais: 1845000,
      tributosReforma: 1910000,
      cargaTributariaAtualPercent: 14.76,
      cargaTributariaReformaPercent: 14.62,
      creditosAtuais: 412000,
      debitosAtuais: 2257000,
      creditosReforma: 810000,
      debitosReforma: 2720000,
      impactoFiscalRS: 65000,
      impactoFiscalPercent: 3.52,
      impactoFinanceiroRS: 215000,
      impactoContabilRS: 180000,
      ebitdaAtual: 3420000,
      ebitdaReforma: 3680000,
      margemEbitdaAtualPercent: 27.36,
      margemEbitdaReformaPercent: 28.17,
      fluxoCaixaAtual: 2950000,
      fluxoCaixaReforma: 3140000,
      capitalGiroAtual: 1400000,
      capitalGiroReforma: 1460000,
      impactoAcumulado2026_2033: 1850000,
    },
    criadoEm: '2026-01-20T14:30:00Z',
    atualizadoEm: '2026-01-20T14:30:00Z',
    autorNome: 'Consultoria Tributária Especializada',
    tags: ['Otimizado', 'Crédito Pleno', 'Reprecificação'],
    statusAprovacao: 'Homologado',
    estrategiaResumo: 'Estratégia recomendada para neutralizar impactos e expandir o EBITDA pós-2026.',
  },
];
