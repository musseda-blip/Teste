export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tabs: {
    dashboard: string;
    comparador: string;
    assessment: string;
    fiscal: string;
    financeiro: string;
    produtos: string;
    sensibilidade: string;
    operacional: string;
    cadastro: string;
    importacao: string;
    governanca: string;
    benchmark: string;
  };
  navigation: {
    year: string;
    segment: string;
    company: string;
    saveSimulation: string;
    loadSimulation: string;
    exportReport: string;
    userGuide: string;
    whiteLabel: string;
    logout: string;
    loggedAs: string;
    switchCompany: string;
  };
  actions: {
    save: string;
    cancel: string;
    confirm: string;
    exportCSV: string;
    exportPDF: string;
    compare: string;
    newSimulation: string;
    loadPreset: string;
    filter: string;
    search: string;
    audit: string;
    close: string;
    apply: string;
    next: string;
    previous: string;
  };
  comparator: {
    title: string;
    subtitle: string;
    scenarioA: string;
    scenarioB: string;
    diffSummary: string;
    rateComparison: string;
    financialComparison: string;
    cbsRate: string;
    ibsRate: string;
    isRate: string;
    effectiveRate: string;
    totalTax: string;
    ebitdaImpact: string;
    cashFlowImpact: string;
    creditsGenerated: string;
    recommendedPricing: string;
    deltaNote: string;
  };
  assessment: {
    title: string;
    subtitle: string;
    roadmapTitle: string;
    diagnosticTitle: string;
    maturityScore: string;
    step: string;
    phase: string;
    impact: string;
    status: string;
    responsible: string;
    deadline: string;
    deliverable: string;
    aiRecommendation: string;
    completed: string;
    inProgress: string;
    planned: string;
  };
}

export const DICTIONARY: Record<Language, Translations> = {
  pt: {
    appName: 'Simulador Tax Reform',
    appSubtitle: 'Enterprise Dual Taxation & Executive C-Suite Impact Cockpit',
    tabs: {
      dashboard: 'Dashboard Executivo',
      comparador: 'Comparador de Cenários',
      assessment: 'Assessment & Roadmap',
      fiscal: 'Apuração Fiscal',
      financeiro: 'Financeiro & DRE',
      produtos: 'Produtos & Margens',
      sensibilidade: 'Simulador & Sensibilidade',
      operacional: 'Unidades & Destino',
      cadastro: 'Cadastro & Dados',
      importacao: 'Documentos Fiscais',
      governanca: 'Governança & Leis',
      benchmark: 'Benchmark Softwares',
    },
    navigation: {
      year: 'Ano Fiscal',
      segment: 'Setor Econômico',
      company: 'Empresa Ativa',
      saveSimulation: 'Salvar Simulação',
      loadSimulation: 'Minhas Simulações',
      exportReport: 'Relatório Executivo PDF',
      userGuide: 'Guia & Manual',
      whiteLabel: 'White-Label',
      logout: 'Sair da Sessão',
      loggedAs: 'Conectado como',
      switchCompany: 'Trocar Organização',
    },
    actions: {
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      exportCSV: 'Exportar Dados (CSV)',
      exportPDF: 'Exportar Relatório PDF',
      compare: 'Comparar Cenários',
      newSimulation: 'Nova Simulação',
      loadPreset: 'Carregar Predefinição',
      filter: 'Filtrar',
      search: 'Pesquisar...',
      audit: 'Auditar',
      close: 'Fechar',
      apply: 'Aplicar',
      next: 'Próximo',
      previous: 'Anterior',
    },
    comparator: {
      title: 'Comparador Lado a Lado de Cenários de Simulação',
      subtitle: 'Contraste entre alíquotas de IBS/CBS, carga tributária líquida, EBITDA e fluxo de caixa projetados.',
      scenarioA: 'Cenário Base (A)',
      scenarioB: 'Cenário Proposto / Otimizado (B)',
      diffSummary: 'Diferenciais & Variação Estratégica',
      rateComparison: 'Comparativo de Alíquotas Aplicadas (CBS / IBS / IS)',
      financialComparison: 'Impacto Financeiro & Resultados Consolidados',
      cbsRate: 'Alíquota CBS Federal',
      ibsRate: 'Alíquota IBS Estadual/Municipal',
      isRate: 'Imposto Seletivo (IS)',
      effectiveRate: 'Carga Tributária Efetiva',
      totalTax: 'Volume Total de Tributos',
      ebitdaImpact: 'EBITDA Operacional',
      cashFlowImpact: 'Fluxo de Caixa Líquido',
      creditsGenerated: 'Créditos Tomados de Insumos',
      recommendedPricing: 'Necessidade de Repasse de Preço',
      deltaNote: 'Diferença favorável (verde) indica otimização tributária ou ganho de margem operacional.',
    },
    assessment: {
      title: 'Assessment de Transição & Plano de Ação Estratégico',
      subtitle: 'Roteiro sequencial de implantação pós-simulação para mitigar riscos fiscais, financeiros e sistêmicos.',
      roadmapTitle: 'Roadmap de Ação por Fases',
      diagnosticTitle: 'Diagnóstico de Maturidade Tributária',
      maturityScore: 'Índice de Prontidão da Reforma',
      step: 'Etapa',
      phase: 'Fase',
      impact: 'Nível de Impacto',
      status: 'Status',
      responsible: 'Responsável',
      deadline: 'Prazo Estimado',
      deliverable: 'Entregável Principal',
      aiRecommendation: 'Recomendação Consultiva Especializada',
      completed: 'Concluído',
      inProgress: 'Em Andamento',
      planned: 'Planejado',
    },
  },
  en: {
    appName: 'Tax Reform Simulator',
    appSubtitle: 'Enterprise Dual Taxation & Executive C-Suite Impact Cockpit',
    tabs: {
      dashboard: 'Executive Dashboard',
      comparador: 'Scenario Comparator',
      assessment: 'Assessment & Roadmap',
      fiscal: 'Tax Calculation',
      financeiro: 'Financials & P&L',
      produtos: 'Products & Margins',
      sensibilidade: 'Simulator & Sensitivity',
      operacional: 'Units & Destination',
      cadastro: 'Master Data Setup',
      importacao: 'Fiscal Documents',
      governanca: 'Governance & Laws',
      benchmark: 'Software Benchmark',
    },
    navigation: {
      year: 'Fiscal Year',
      segment: 'Economic Sector',
      company: 'Active Company',
      saveSimulation: 'Save Simulation',
      loadSimulation: 'My Simulations',
      exportReport: 'Executive PDF Report',
      userGuide: 'Guide & Manual',
      whiteLabel: 'White-Label',
      logout: 'Sign Out',
      loggedAs: 'Signed in as',
      switchCompany: 'Switch Organization',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      exportCSV: 'Export Data (CSV)',
      exportPDF: 'Export PDF Report',
      compare: 'Compare Scenarios',
      newSimulation: 'New Simulation',
      loadPreset: 'Load Preset',
      filter: 'Filter',
      search: 'Search...',
      audit: 'Audit',
      close: 'Close',
      apply: 'Apply',
      next: 'Next',
      previous: 'Previous',
    },
    comparator: {
      title: 'Side-by-Side Simulation Scenario Comparator',
      subtitle: 'Contrast applied IBS/CBS rates, net tax burden, EBITDA and cash flow projections.',
      scenarioA: 'Base Scenario (A)',
      scenarioB: 'Optimized Scenario (B)',
      diffSummary: 'Key Differences & Strategic Variance',
      rateComparison: 'Applied Tax Rates Comparison (CBS / IBS / IS)',
      financialComparison: 'Financial Impact & Consolidated Results',
      cbsRate: 'Federal CBS Rate',
      ibsRate: 'State/City IBS Rate',
      isRate: 'Selective Tax (IS)',
      effectiveRate: 'Effective Tax Burden',
      totalTax: 'Total Tax Volume',
      ebitdaImpact: 'Operating EBITDA',
      cashFlowImpact: 'Net Cash Flow',
      creditsGenerated: 'Input Tax Credits Claimed',
      recommendedPricing: 'Pricing Adjustment Requirement',
      deltaNote: 'Favorable difference (green) indicates tax optimization or operating margin gain.',
    },
    assessment: {
      title: 'Transition Assessment & Strategic Action Plan',
      subtitle: 'Sequential implementation roadmap post-simulation to mitigate fiscal, financial and ERP risks.',
      roadmapTitle: 'Phased Action Roadmap',
      diagnosticTitle: 'Tax Readiness Assessment',
      maturityScore: 'Tax Reform Readiness Index',
      step: 'Step',
      phase: 'Phase',
      impact: 'Impact Level',
      status: 'Status',
      responsible: 'Owner',
      deadline: 'Target Date',
      deliverable: 'Key Deliverable',
      aiRecommendation: 'Advisory Strategic Recommendation',
      completed: 'Completed',
      inProgress: 'In Progress',
      planned: 'Planned',
    },
  },
  es: {
    appName: 'Simulador Reforma Tributaria',
    appSubtitle: 'Cockpit Ejecutivo de Impacto y Dual IVA para C-Suite',
    tabs: {
      dashboard: 'Dashboard Ejecutivo',
      comparador: 'Comparador de Escenarios',
      assessment: 'Assessment & Hoja de Ruta',
      fiscal: 'Liquidación Fiscal',
      financeiro: 'Financiero & P&L',
      produtos: 'Productos & Márgenes',
      sensibilidade: 'Simulador & Sensibilidad',
      operacional: 'Unidades & Destino',
      cadastro: 'Datos Maestros',
      importacao: 'Documentos Fiscales',
      governanca: 'Gobernanza & Normas',
      benchmark: 'Benchmark de Software',
    },
    navigation: {
      year: 'Año Fiscal',
      segment: 'Sector Económico',
      company: 'Empresa Activa',
      saveSimulation: 'Guardar Simulación',
      loadSimulation: 'Mis Simulaciones',
      exportReport: 'Informe Ejecutivo PDF',
      userGuide: 'Guía & Manual',
      whiteLabel: 'Marca Blanca',
      logout: 'Cerrar Sesión',
      loggedAs: 'Conectado como',
      switchCompany: 'Cambiar Organización',
    },
    actions: {
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      exportCSV: 'Exportar Datos (CSV)',
      exportPDF: 'Exportar Informe PDF',
      compare: 'Comparar Escenarios',
      newSimulation: 'Nueva Simulación',
      loadPreset: 'Cargar Ajustes Predefinidos',
      filter: 'Filtrar',
      search: 'Buscar...',
      audit: 'Auditar',
      close: 'Cerrar',
      apply: 'Aplicar',
      next: 'Siguiente',
      previous: 'Anterior',
    },
    comparator: {
      title: 'Comparador de Escenarios de Simulación Lado a Lado',
      subtitle: 'Contraste entre alícuotas de IBS/CBS aplicadas, carga tributaria neta, EBITDA y flujo de caja.',
      scenarioA: 'Escenario Base (A)',
      scenarioB: 'Escenario Optimizado (B)',
      diffSummary: 'Diferencias & Variación Estratégica',
      rateComparison: 'Comparativa de Alícuotas Aplicadas (CBS / IBS / IS)',
      financialComparison: 'Impacto Financiero & Resultados Consolidados',
      cbsRate: 'Alícuota CBS Federal',
      ibsRate: 'Alícuota IBS Estatal/Municipal',
      isRate: 'Impuesto Selectivo (IS)',
      effectiveRate: 'Carga Tributaria Efectiva',
      totalTax: 'Volumen Total de Tributos',
      ebitdaImpact: 'EBITDA Operativo',
      cashFlowImpact: 'Flujo de Caja Neto',
      creditsGenerated: 'Créditos Tomados de Insumos',
      recommendedPricing: 'Necesidad de Ajuste de Precios',
      deltaNote: 'Diferencia favorable (verde) indica optimización tributaria o ganancia de margen operativo.',
    },
    assessment: {
      title: 'Assessment de Transición & Plan de Acción Estratégico',
      subtitle: 'Hoja de ruta secuencial post-simulación para mitigar riesgos fiscales, financieros y de ERP.',
      roadmapTitle: 'Hoja de Ruta por Fases',
      diagnosticTitle: 'Diagnóstico de Madurez Tributaria',
      maturityScore: 'Índice de Preparación de Reforma',
      step: 'Paso',
      phase: 'Fase',
      impact: 'Nivel de Impacto',
      status: 'Estado',
      responsible: 'Responsable',
      deadline: 'Plazo Estimado',
      deliverable: 'Entregable Clave',
      aiRecommendation: 'Recomendación Consultiva Especializada',
      completed: 'Completado',
      inProgress: 'En Progreso',
      planned: 'Planificado',
    },
  },
};
