import { EconomicSegment } from '../types/tax';

export interface SectorPreset {
  setor: EconomicSegment;
  subsegmentoPadrao: string;
  subsegmentosDisponiveis: string[];
  cnaePadrao: string;
  cnaeDescricao: string;
  tipoOperacaoPadrao: 'Produtos' | 'Serviços' | 'Produtos e Serviços';
  perfilMercadoPadrao: 'B2B' | 'B2C' | 'Ambos (B2B + B2C)';
  ncmOuNbsLabel: 'NBS (Serviços)' | 'NCM (Mercadorias/Produtos)' | 'NCM & NBS Misto';
  codigoFiscalPrincipal: string;
  cfopPrincipal: string;
  cstPrincipal: string;
  beneficioFiscalSugerido: string;
  regimeEspecialSugerido: string;
  camposDinamicos: {
    chave: string;
    label: string;
    tipo: 'select' | 'boolean' | 'number' | 'text';
    opcoes?: string[];
    valorPadrao: any;
    descricaoAjuda: string;
  }[];
  premissasEconomicasSugeridas: {
    receitaMensalMedia: number;
    receitaAnual: number;
    custosInsumos: number;
    despesasOperacionais: number;
    margemBrutaPercent: number;
    ebitda: number;
    comprasTotais: number;
    creditosTributariosAtuais: number;
    percentualB2B: number;
    percentualB2C: number;
    percentualImportacao: number;
    percentualExportacao: number;
  };
}

export const SECTOR_PRESETS: Record<EconomicSegment, SectorPreset> = {
  'Tecnologia / SaaS': {
    setor: 'Tecnologia / SaaS',
    subsegmentoPadrao: 'Software as a Service (Cloud & B2B)',
    subsegmentosDisponiveis: [
      'Software as a Service (Cloud & B2B)',
      'Licenciamento de Software Customizado',
      'Infraestrutura em Nuvem (IaaS/PaaS)',
      'Fintech & Plataformas de Pagamento',
      'Desenvolvimento Sob Encomenda'
    ],
    cnaePadrao: '6202-3/00',
    cnaeDescricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NBS (Serviços)',
    codigoFiscalPrincipal: '1.0101.10.00 (Serviços de Computação em Nuvem / SaaS)',
    cfopPrincipal: '5.933 / 6.933 (Prestação de Serviços com incidência de ISS/IBS)',
    cstPrincipal: '01 (Tributada com alíquota básica)',
    beneficioFiscalSugerido: 'Lei do Bem (Cap. III Lei 11.196/05) - P&D Tecnológico',
    regimeEspecialSugerido: 'Não aplicável - Regime Geral Não-Cumulativo IBS/CBS',
    camposDinamicos: [
      {
        chave: 'modeloServidores',
        label: 'Localização dos Servidores / Cloud Data Center',
        tipo: 'select',
        opcoes: ['Data Center Nacional (SP/RJ)', 'Nuvem Exterior (AWS/Azure/GCP US)', 'Híbrido (Multi-Cloud)'],
        valorPadrao: 'Nuvem Exterior (AWS/Azure/GCP US)',
        descricaoAjuda: 'Importante para creditamento de CBS/IBS na importação de serviços de computação em nuvem.'
      },
      {
        chave: 'naturezaSoftware',
        label: 'Classificação Operacional do Software',
        tipo: 'select',
        opcoes: ['SaaS Padronizado (Download/Cloud)', 'Software Customizado', 'Licença de Uso com Manutenção'],
        valorPadrao: 'SaaS Padronizado (Download/Cloud)',
        descricaoAjuda: 'Direciona a transição definitiva de ISS (2-5%) para IBS/CBS pleno com crédito total de insumos.'
      },
      {
        chave: 'contratosRecorrentes',
        label: 'Faturamento por Assinatura Recorrente (MRR/ARR)',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Impacto direto no Split Payment bancário nas cobranças de cartões e boletos.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 4500000,
      receitaAnual: 54000000,
      custosInsumos: 1350000, // 30% custos (cloud, data centers, dev tools)
      despesasOperacionais: 1890000, // 42% (pessoal, marketing, vendas)
      margemBrutaPercent: 70.0,
      ebitda: 15120000,
      comprasTotais: 16200000,
      creditosTributariosAtuais: 1518750, // Baixo crédito em PIS/COFINS e zero em ISS legado
      percentualB2B: 90,
      percentualB2C: 10,
      percentualImportacao: 25,
      percentualExportacao: 15
    }
  },

  'Comércio': {
    setor: 'Comércio',
    subsegmentoPadrao: 'Distribuição e Revenda de Mercadorias',
    subsegmentosDisponiveis: [
      'Distribuição e Revenda de Mercadorias',
      'Comércio Atacadista Multicanal',
      'Importação e Distribuição Comercial',
      'Distribuição Especializada de Equipamentos'
    ],
    cnaePadrao: '4651-6/01',
    cnaeDescricao: 'Comércio atacadista de equipamentos de informática e telecomunicações',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '8471.50.10 (Unidades de processamento digital de dados)',
    cfopPrincipal: '5.102 / 6.102 (Venda de mercadoria adquirida ou recebida de terceiros)',
    cstPrincipal: '00 (Tributada integralmente)',
    beneficioFiscalSugerido: 'TTD / Pró-Emprego / Benefício ICMS Estadual (Transição LC 214)',
    regimeEspecialSugerido: 'Substituição Tributária ICMS (Fase de extinção até 2032)',
    camposDinamicos: [
      {
        chave: 'icmsStAtual',
        label: 'Volume com ICMS Substituição Tributária (ST) Atual',
        tipo: 'select',
        opcoes: ['Alto (> 50% do faturamento)', 'Médio (20% a 50%)', 'Baixo (< 20%)', 'Inexistente'],
        valorPadrao: 'Médio (20% a 50%)',
        descricaoAjuda: 'Extinção do ICMS-ST pela Reforma simplifica o capital de giro e o estoque.'
      },
      {
        chave: 'canalDistribuicao',
        label: 'Canal Principal de Venda',
        tipo: 'select',
        opcoes: ['Venda Direta Representantes', 'B2B E-commerce Portal', 'Atacado Físico / CD', 'Híbrido'],
        valorPadrao: 'Híbrido',
        descricaoAjuda: 'Direciona as regras de Split Payment e emissão de NF-e.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 8500000,
      receitaAnual: 102000000,
      custosInsumos: 61200000, // 60% CMV
      despesasOperacionais: 20400000,
      margemBrutaPercent: 40.0,
      ebitda: 14280000,
      comprasTotais: 61200000,
      creditosTributariosAtuais: 13464000,
      percentualB2B: 85,
      percentualB2C: 15,
      percentualImportacao: 20,
      percentualExportacao: 5
    }
  },

  'Indústria': {
    setor: 'Indústria',
    subsegmentoPadrao: 'Manufatura e Transformação Eletroeletrônica',
    subsegmentosDisponiveis: [
      'Manufatura e Transformação Eletroeletrônica',
      'Indústria Metalmecânica & Autopeças',
      'Indústria Química & Petroquímica',
      'Indústria de Alimentos e Bebidas',
      'Indústria Farmacêutica'
    ],
    cnaePadrao: '2621-3/00',
    cnaeDescricao: 'Fabricação de equipamentos de informática e periféricos',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '8471.50.10 / 8504.40.90',
    cfopPrincipal: '5.101 / 6.101 (Venda de produção do estabelecimento)',
    cstPrincipal: '00 (Tributada integralmente no ICMS e IPI)',
    beneficioFiscalSugerido: 'Incentivos Regionais SUDENE / SUDAM / Lei de Informática',
    regimeEspecialSugerido: 'Crédito Presumido de IPI / Drawback Integrado',
    camposDinamicos: [
      {
        chave: 'imobilizadoCapex',
        label: 'Investimento Anual Médio em Ativo Imobilizado (Bens de Capital)',
        tipo: 'select',
        opcoes: ['Elevado (> R$ 5M/ano)', 'Moderado (R$ 1M a R$ 5M)', 'Baixo (< R$ 1M)'],
        valorPadrao: 'Elevado (> R$ 5M/ano)',
        descricaoAjuda: 'Extinção do CIAP (48 meses) com apropriação 100% imediata do crédito de IBS/CBS.'
      },
      {
        chave: 'insumosComIpi',
        label: 'Compra de Insumos com Incidência de IPI',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Extinção do IPI a partir de 2027 (exceto ZFM) zera resíduos tributários na cadeia.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 12000000,
      receitaAnual: 144000000,
      custosInsumos: 79200000, // 55% CPV
      despesasOperacionais: 36000000,
      margemBrutaPercent: 45.0,
      ebitda: 28800000,
      comprasTotais: 79200000,
      creditosTributariosAtuais: 19800000,
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 30,
      percentualExportacao: 20
    }
  },

  'Varejo': {
    setor: 'Varejo',
    subsegmentoPadrao: 'Varejo Multicanal & E-commerce',
    subsegmentosDisponiveis: [
      'Varejo Multicanal & E-commerce',
      'Supermercados e Hipermercados',
      'Lojas de Departamento e Magazines',
      'Varejo Especializado (Vestuário/Calçados)',
      'Farmácias e Drogarias'
    ],
    cnaePadrao: '4751-2/01',
    cnaeDescricao: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2C',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '8517.62.77 / 8471.30.12',
    cfopPrincipal: '5.102 / 5.405 (Venda no balcão / cupom NFC-e consumidor final)',
    cstPrincipal: '60 (ICMS cobrado anteriormente por ST) / 00',
    beneficioFiscalSugerido: 'Cashback do Povo (Devolução de IBS/CBS para famílias de baixa renda)',
    regimeEspecialSugerido: 'Split Payment nas adquirentes de Cartão e PIX',
    camposDinamicos: [
      {
        chave: 'meiosPagamento',
        label: 'Meio de Pagamento Predominante',
        tipo: 'select',
        opcoes: ['Cartão de Crédito/Débito e PIX (> 90%)', 'Boleto e Faturado (20-40%)', 'Dinheiro em Espécie (< 10%)'],
        valorPadrao: 'Cartão de Crédito/Débito e PIX (> 90%)',
        descricaoAjuda: 'Split Payment retém automaticamente o IBS/CBS na liquidação financeira.'
      },
      {
        chave: 'cashbackReforma',
        label: 'Aderência a Produtos Elegíveis ao Cashback',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Art. 102 da LC 214/2025 para devolução social de tributos.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 6000000,
      receitaAnual: 72000000,
      custosInsumos: 43200000, // 60% CMV
      despesasOperacionais: 18000000,
      margemBrutaPercent: 40.0,
      ebitda: 10800000,
      comprasTotais: 43200000,
      creditosTributariosAtuais: 9504000,
      percentualB2B: 15,
      percentualB2C: 85,
      percentualImportacao: 10,
      percentualExportacao: 0
    }
  },

  'Atacado': {
    setor: 'Atacado',
    subsegmentoPadrao: 'Atacadista Distribuidor Regional',
    subsegmentosDisponiveis: [
      'Atacadista Distribuidor Regional',
      'Atacarejo (Cash & Carry)',
      'Distribuidor Nacional de Insumos',
      'Comércio Atacadista de Alimentos'
    ],
    cnaePadrao: '4639-7/01',
    cnaeDescricao: 'Comércio atacadista de produtos alimentícios em geral',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '2106.90.90 / 1905.90.90',
    cfopPrincipal: '5.102 / 6.102 (Venda atacadista estadual e interestadual)',
    cstPrincipal: '00 / 10 (Tributada com cobrança por ST)',
    beneficioFiscalSugerido: 'Cesta Básica Nacional (Alíquota Zero de IBS/CBS)',
    regimeEspecialSugerido: 'Regime Especial Atacadista Estadual (DIFAL transição)',
    camposDinamicos: [
      {
        chave: 'cestaBasicaNacional',
        label: 'Composição de Itens da Cesta Básica Nacional',
        tipo: 'select',
        opcoes: ['Alta (> 50% dos itens - Alíquota Zero)', 'Média (20% a 50%)', 'Baixa (< 20%)'],
        valorPadrao: 'Média (20% a 50%)',
        descricaoAjuda: 'Itens da cesta básica possuem isenção com manutenção integral dos créditos.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 15000000,
      receitaAnual: 180000000,
      custosInsumos: 135000000, // 75% CMV
      despesasOperacionais: 27000000,
      margemBrutaPercent: 25.0,
      ebitda: 18000000,
      comprasTotais: 135000000,
      creditosTributariosAtuais: 29700000,
      percentualB2B: 90,
      percentualB2C: 10,
      percentualImportacao: 15,
      percentualExportacao: 5
    }
  },

  'Serviços': {
    setor: 'Serviços',
    subsegmentoPadrao: 'Serviços Profissionais e Consultoria Corporativa',
    subsegmentosDisponiveis: [
      'Serviços Profissionais e Consultoria Corporativa',
      'Engenharia, Arquitetura e Projetos',
      'Publicidade, Propaganda e Marketing',
      'Serviços Terceirizados (Facilities/Segurança)',
      'Consultoria Jurídica e Contábil'
    ],
    cnaePadrao: '7020-4/00',
    cnaeDescricao: 'Atividades de consultoria em gestão empresarial',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NBS (Serviços)',
    codigoFiscalPrincipal: '1.1401.10.00 (Serviços de Consultoria em Gestão)',
    cfopPrincipal: '5.933 (Prestação de serviços sujeita ao ISSQN)',
    cstPrincipal: '01 (Tributada integralmente)',
    beneficioFiscalSugerido: 'Regime Diferenciado para Profissões Regulamentadas (-30% ou 60% redutor)',
    regimeEspecialSugerido: 'Substituição do ISS municipal pelo IBS/CBS unificado',
    camposDinamicos: [
      {
        chave: 'profissaoRegulamentada',
        label: 'Sociedade de Profissão Intelectual Regulamentada',
        tipo: 'boolean',
        valorPadrao: false,
        descricaoAjuda: 'Art. 136 da LC 214/2025 prevê redução de 30% na alíquota de IBS/CBS para certas profissões.'
      },
      {
        chave: 'folhaPagamentoPercent',
        label: 'Peso da Folha de Pagamento sobre o Faturamento',
        tipo: 'select',
        opcoes: ['Elevado (> 50% - sem crédito de IBS/CBS)', 'Médio (25% a 50%)', 'Baixo (< 25%)'],
        valorPadrao: 'Elevado (> 50% - sem crédito de IBS/CBS)',
        descricaoAjuda: 'Salários não geram crédito de IBS/CBS, tornando o repasse de preço indispensável.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 3500000,
      receitaAnual: 42000000,
      custosInsumos: 1260000, // 30%
      despesasOperacionais: 1680000, // 40% (maior parte salários)
      margemBrutaPercent: 70.0,
      ebitda: 12600000,
      comprasTotais: 12600000,
      creditosTributariosAtuais: 1181250,
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 5,
      percentualExportacao: 10
    }
  },

  'Agronegócio': {
    setor: 'Agronegócio',
    subsegmentoPadrao: 'Produção Agrícola e Grãos (Soja, Milho, Trigo)',
    subsegmentosDisponiveis: [
      'Produção Agrícola e Grãos (Soja, Milho, Trigo)',
      'Pecuária de Corte e Leite',
      'Agroindústria Processadora',
      'Insumos e Fertilizantes Agrícolas',
      'Silvicultura e Florestamento'
    ],
    cnaePadrao: '0111-3/01',
    cnaeDescricao: 'Cultivo de soja e cereais',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '1201.90.00 (Grãos de soja mesmo triturados)',
    cfopPrincipal: '5.101 / 7.101 (Venda no mercado interno e exportação)',
    cstPrincipal: '40 (Isenta) / 51 (Diferimento)',
    beneficioFiscalSugerido: 'Insumos Agropecuários (Redução de 60% de alíquota ou Alíquota Zero)',
    regimeEspecialSugerido: 'Produtor Rural Pessoa Física (Limite R$ 3,6M - Não Contribuinte ou Opção Contribuinte)',
    camposDinamicos: [
      {
        chave: 'opcaoContribuinte',
        label: 'Enquadramento do Produtor Rural no IBS/CBS',
        tipo: 'select',
        opcoes: ['Pessoa Jurídica (Contribuinte Obrigatório)', 'Produtor PF (Optante como Contribuinte)', 'Produtor PF (Não Contribuinte - Crédito Presumido 0.8%)'],
        valorPadrao: 'Pessoa Jurídica (Contribuinte Obrigatório)',
        descricaoAjuda: 'Art. 147 da LC 214/2025: Crédito presumido repassado aos adquirentes.'
      },
      {
        chave: 'exportacaoPredominante',
        label: 'Destinação para Exportação (Imunidade Tributária)',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Exportações têm imunidade tributária com ressarcimento rápido de créditos acumulados.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 22000000,
      receitaAnual: 264000000,
      custosInsumos: 158400000, // 60% insumos (sementes, defensivos, diesel)
      despesasOperacionais: 52800000,
      margemBrutaPercent: 40.0,
      ebitda: 52800000,
      comprasTotais: 158400000,
      creditosTributariosAtuais: 19008000,
      percentualB2B: 98,
      percentualB2C: 2,
      percentualImportacao: 15,
      percentualExportacao: 65
    }
  },

  'Saúde': {
    setor: 'Saúde',
    subsegmentoPadrao: 'Hospitais, Clínicas e Diagnósticos por Imagem',
    subsegmentosDisponiveis: [
      'Hospitais, Clínicas e Diagnósticos por Imagem',
      'Indústria e Distribuição de Medicamentos',
      'Operadoras de Planos de Saúde',
      'Dispositivos e Equipamentos Médicos'
    ],
    cnaePadrao: '8610-1/01',
    cnaeDescricao: 'Atividades de atendimento hospitalar',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'Ambos (B2B + B2C)',
    ncmOuNbsLabel: 'NCM & NBS Misto',
    codigoFiscalPrincipal: '1.2001.10.00 / 3004.90.99',
    cfopPrincipal: '5.933 / 5.102',
    cstPrincipal: '00 / Isenção Parcial',
    beneficioFiscalSugerido: 'Serviços de Saúde e Dispositivos Médicos (Redução de 60% na Alíquota)',
    regimeEspecialSugerido: 'Alíquota Reduzida de IBS/CBS (10.6% nominal estimado)',
    camposDinamicos: [
      {
        chave: 'regimeDiferenciadoSaude',
        label: 'Aderência à Redução de 60% de Alíquota (Art. 135 LC 214)',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Tratamentos de saúde, cirurgias e diagnósticos contam com alíquota reduzida.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 7800000,
      receitaAnual: 93600000,
      custosInsumos: 37440000,
      despesasOperacionais: 32760000,
      margemBrutaPercent: 60.0,
      ebitda: 23400000,
      comprasTotais: 37440000,
      creditosTributariosAtuais: 4492800,
      percentualB2B: 40,
      percentualB2C: 60,
      percentualImportacao: 20,
      percentualExportacao: 0
    }
  },

  'Educação': {
    setor: 'Educação',
    subsegmentoPadrao: 'Ensino Superior & Pós-Graduação',
    subsegmentosDisponiveis: [
      'Ensino Superior & Pós-Graduação',
      'Educação Básica e Fundamental',
      'Cursos Técnicos e Profissionalizantes',
      'EdTechs e Plataformas EAD'
    ],
    cnaePadrao: '8532-5/00',
    cnaeDescricao: 'Educação superior - graduação e pós-graduação',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'B2C',
    ncmOuNbsLabel: 'NBS (Serviços)',
    codigoFiscalPrincipal: '1.1901.10.00 (Serviços de Ensino e Educação)',
    cfopPrincipal: '5.933',
    cstPrincipal: '01',
    beneficioFiscalSugerido: 'Serviços de Educação (Redução de 60% na Alíquota)',
    regimeEspecialSugerido: 'PROUNI / Benefícios Federais Mantidos',
    camposDinamicos: [
      {
        chave: 'adesaoProuni',
        label: 'Adesão ao PROUNI / Isenção Federal',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Manutenção de regras especiais de isenção conforme previsto na EC 132/2023.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 4200000,
      receitaAnual: 50400000,
      custosInsumos: 15120000,
      despesasOperacionais: 22680000,
      margemBrutaPercent: 70.0,
      ebitda: 12600000,
      comprasTotais: 15120000,
      creditosTributariosAtuais: 1814400,
      percentualB2B: 10,
      percentualB2C: 90,
      percentualImportacao: 5,
      percentualExportacao: 0
    }
  },

  'Construção Civil': {
    setor: 'Construção Civil',
    subsegmentoPadrao: 'Incorporação Imobiliária & Edificações',
    subsegmentosDisponiveis: [
      'Incorporação Imobiliária & Edificações',
      'Engenharia de Infraestrutura e Obras Pesadas',
      'Serviços Especializados de Construção'
    ],
    cnaePadrao: '4120-4/00',
    cnaeDescricao: 'Construção de edifícios',
    tipoOperacaoPadrao: 'Produtos e Serviços',
    perfilMercadoPadrao: 'Ambos (B2B + B2C)',
    ncmOuNbsLabel: 'NCM & NBS Misto',
    codigoFiscalPrincipal: '1.1601.10.00 / 6810.11.00',
    cfopPrincipal: '5.933 / 5.102',
    cstPrincipal: '00 / RET Especial',
    beneficioFiscalSugerido: 'Regime Especial de Bens Imóveis (Redução de 40% a 60% e Dedução de Terreno)',
    regimeEspecialSugerido: 'Regime Específico Imobiliário (Art. 238 LC 214/2025)',
    camposDinamicos: [
      {
        chave: 'deducaoTerreno',
        label: 'Dedução do Valor do Terreno da Base de Cálculo',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Permite abater o valor do custo de aquisição do terreno da base de IBS/CBS.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 9500000,
      receitaAnual: 114000000,
      custosInsumos: 62700000,
      despesasOperacionais: 22800000,
      margemBrutaPercent: 45.0,
      ebitda: 28500000,
      comprasTotais: 62700000,
      creditosTributariosAtuais: 7524000,
      percentualB2B: 50,
      percentualB2C: 50,
      percentualImportacao: 5,
      percentualExportacao: 0
    }
  },

  'Logística / Transporte': {
    setor: 'Logística / Transporte',
    subsegmentoPadrao: 'Transporte Rodoviário de Cargas & Logística Integrada',
    subsegmentosDisponiveis: [
      'Transporte Rodoviário de Cargas & Logística Integrada',
      'Armazenagem e Operador Logístico 3PL',
      'Transporte Aéreo e Ferroviário',
      'Transporte de Passageiros'
    ],
    cnaePadrao: '4930-2/02',
    cnaeDescricao: 'Transporte rodoviário de carga, intermunicipal e interestadual',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NBS (Serviços)',
    codigoFiscalPrincipal: '1.0501.10.00 (Serviços de Transporte Rodoviário de Carga)',
    cfopPrincipal: '5.352 / 6.352 (Prestação de serviço de transporte no CT-e)',
    cstPrincipal: '00 (Tributada pelo ICMS-Frete / IBS)',
    beneficioFiscalSugerido: 'Crédito Pleno sobre Combustíveis, Pneus e Frotas',
    regimeEspecialSugerido: 'Split Payment acoplado ao DACTE / MDF-e',
    camposDinamicos: [
      {
        chave: 'creditoCombustivel',
        label: 'Apropriação 100% de Créditos sobre Diesel e Lubrificantes',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Fim dos litígios de ICMS sobre combustível com a não-cumulatividade plena de IBS/CBS.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 6800000,
      receitaAnual: 81600000,
      custosInsumos: 44880000, // Diesel, pneus, manutenção
      despesasOperacionais: 16320000,
      margemBrutaPercent: 45.0,
      ebitda: 20400000,
      comprasTotais: 44880000,
      creditosTributariosAtuais: 5385600,
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 0,
      percentualExportacao: 5
    }
  },

  'Energia': {
    setor: 'Energia',
    subsegmentoPadrao: 'Geração Solar / Eólica e Mercado Livre (ACL)',
    subsegmentosDisponiveis: [
      'Geração Solar / Eólica e Mercado Livre (ACL)',
      'Distribuição e Transmissão de Energia',
      'Comercializadora de Energia Elétrica'
    ],
    cnaePadrao: '3511-5/01',
    cnaeDescricao: 'Geração de energia elétrica',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '2716.00.00 (Energia elétrica)',
    cfopPrincipal: '5.251 / 6.251',
    cstPrincipal: '00',
    beneficioFiscalSugerido: 'Regime Específico de Energia e Crédito Financeiro Imediato',
    regimeEspecialSugerido: 'Extinção de PIS/COFINS monofásico e ICMS por fora na conta',
    camposDinamicos: [
      {
        chave: 'mercadoEnergia',
        label: 'Ambiente de Contratação',
        tipo: 'select',
        opcoes: ['Ambiente de Contratação Livre (ACL)', 'Ambiente Regulado (ACR)', 'Geração Distribuída (GD)'],
        valorPadrao: 'Ambiente de Contratação Livre (ACL)',
        descricaoAjuda: 'Direciona as regras de liquidação na CCEE e apuração de IBS/CBS.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 18000000,
      receitaAnual: 216000000,
      custosInsumos: 97200000,
      despesasOperacionais: 32400000,
      margemBrutaPercent: 55.0,
      ebitda: 86400000,
      comprasTotais: 97200000,
      creditosTributariosAtuais: 11664000,
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 0,
      percentualExportacao: 0
    }
  },

  'Imobiliário': {
    setor: 'Imobiliário',
    subsegmentoPadrao: 'Locação, Gestão e Intermediação Imobiliária',
    subsegmentosDisponiveis: [
      'Locação, Gestão e Intermediação Imobiliária',
      'Loteamento e Desenvolvimento Urbano',
      'Fundos Imobiliários e Proptechs'
    ],
    cnaePadrao: '6810-2/02',
    cnaeDescricao: 'Aluguel de imóveis próprios',
    tipoOperacaoPadrao: 'Serviços',
    perfilMercadoPadrao: 'Ambos (B2B + B2C)',
    ncmOuNbsLabel: 'NBS (Serviços)',
    codigoFiscalPrincipal: '1.1801.10.00 (Serviços Imobiliários)',
    cfopPrincipal: '5.933',
    cstPrincipal: '01 / Regime Específico',
    beneficioFiscalSugerido: 'Regime Específico de Locação de Imóveis (Redução de 60% da alíquota)',
    regimeEspecialSugerido: 'Art. 245 LC 214/2025',
    camposDinamicos: [
      {
        chave: 'tipoImovel',
        label: 'Tipo Predominante de Imóvel',
        tipo: 'select',
        opcoes: ['Residencial (Locação B2C)', 'Comercial / Lajes Corporativas (B2B)', 'Logístico / Galpões (B2B)'],
        valorPadrao: 'Comercial / Lajes Corporativas (B2B)',
        descricaoAjuda: 'Locação comercial gera crédito de IBS/CBS para o locatário PJ.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 4800000,
      receitaAnual: 57600000,
      custosInsumos: 1152000,
      despesasOperacionais: 14400000,
      margemBrutaPercent: 80.0,
      ebitda: 42048000,
      comprasTotais: 1152000,
      creditosTributariosAtuais: 138240,
      percentualB2B: 80,
      percentualB2C: 20,
      percentualImportacao: 0,
      percentualExportacao: 0
    }
  },

  'Exportação': {
    setor: 'Exportação',
    subsegmentoPadrao: 'Trading Company & Exportadora Multissetorial',
    subsegmentosDisponiveis: [
      'Trading Company & Exportadora Multissetorial',
      'Exportadora de Commodities',
      'Exportadora de Manufaturados e Serviços'
    ],
    cnaePadrao: '4619-2/00',
    cnaeDescricao: 'Representantes comerciais e agentes do comércio de mercadorias',
    tipoOperacaoPadrao: 'Produtos e Serviços',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM & NBS Misto',
    codigoFiscalPrincipal: '8471.50.10 / 1201.90.00',
    cfopPrincipal: '7.101 / 7.102 (Exportação direta)',
    cstPrincipal: '41 (Não Tributada / Imunidade Constitucional)',
    beneficioFiscalSugerido: 'Imunidade Constitucional de Exportação (Art. 156-A CF/88)',
    regimeEspecialSugerido: 'Devolução Automática e Expressa de Créditos de IBS/CBS em até 60 dias',
    camposDinamicos: [
      {
        chave: 'prazoRessarcimento',
        label: 'Fluxo de Devolução de Créditos Acumulados',
        tipo: 'select',
        opcoes: ['Ressarcimento em Dinheiro (até 60 dias)', 'Compensação com Outros Tributos Federais'],
        valorPadrao: 'Ressarcimento em Dinheiro (até 60 dias)',
        descricaoAjuda: 'A Reforma garante a devolução rápida de créditos acumulados na exportação.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 16000000,
      receitaAnual: 192000000,
      custosInsumos: 115200000,
      despesasOperacionais: 28800000,
      margemBrutaPercent: 40.0,
      ebitda: 48000000,
      comprasTotais: 115200000,
      creditosTributariosAtuais: 13824000,
      percentualB2B: 100,
      percentualB2C: 0,
      percentualImportacao: 20,
      percentualExportacao: 80
    }
  },

  'Importação': {
    setor: 'Importação',
    subsegmentoPadrao: 'Importação Direta e Nacionalização Comercial',
    subsegmentosDisponiveis: [
      'Importação Direta e Nacionalização Comercial',
      'Importação por Conta e Ordem de Terceiros',
      'Importação por Encomenda'
    ],
    cnaePadrao: '4693-1/00',
    cnaeDescricao: 'Comércio atacadista de mercadorias em geral, com predominância de produtos importados',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '8471.50.10 / 8517.62.77',
    cfopPrincipal: '3.102 (Compra para comercialização originada de importação)',
    cstPrincipal: '00 / Tributada no Desembaraço',
    beneficioFiscalSugerido: 'Regime de Entreposto Aduaneiro / Drawback',
    regimeEspecialSugerido: 'IBS/CBS no Desembaraço com Crédito Imediato para a PJ Adquirente',
    camposDinamicos: [
      {
        chave: 'tipoDesembaraco',
        label: 'Modalidade de Desembaraço Aduaneiro',
        tipo: 'select',
        opcoes: ['Porto Seco / EADI', 'Porto Marítimo (Santos/Itajaí/Paranaguá)', 'Aeroporto Internacional (VCP/GRU)'],
        valorPadrao: 'Porto Marítimo (Santos/Itajaí/Paranaguá)',
        descricaoAjuda: 'Unificação do pagamento de IBS/CBS direto na Declaração de Importação (Duimp).'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 14000000,
      receitaAnual: 168000000,
      custosInsumos: 100800000,
      despesasOperacionais: 25200000,
      margemBrutaPercent: 40.0,
      ebitda: 42000000,
      comprasTotais: 100800000,
      creditosTributariosAtuais: 12096000,
      percentualB2B: 90,
      percentualB2C: 10,
      percentualImportacao: 80,
      percentualExportacao: 5
    }
  },

  'Zona Franca de Manaus': {
    setor: 'Zona Franca de Manaus',
    subsegmentoPadrao: 'Polo Industrial de Manaus (PIM) - Eletroeletrônicos',
    subsegmentosDisponiveis: [
      'Polo Industrial de Manaus (PIM) - Eletroeletrônicos',
      'Polo de Duas Rodas (Motocicletas/Bicicletas)',
      'Polo Químico e Termoplástico de Manaus',
      'Comércio Varejista e Atacadista ZFM / ALC'
    ],
    cnaePadrao: '2621-3/00',
    cnaeDescricao: 'Fabricação de equipamentos de informática no Polo Industrial de Manaus',
    tipoOperacaoPadrao: 'Produtos',
    perfilMercadoPadrao: 'B2B',
    ncmOuNbsLabel: 'NCM (Mercadorias/Produtos)',
    codigoFiscalPrincipal: '8471.50.10 / 8528.52.00',
    cfopPrincipal: '5.101 / 6.101 (Venda com benefício ZFM/PIM)',
    cstPrincipal: '00 com Crédito Presumido ZFM',
    beneficioFiscalSugerido: 'Garantia Constitucional do Tratamento Favorecido ZFM (Art. 92-B ADCT)',
    regimeEspecialSugerido: 'Crédito Presumido de IBS/CBS para manter a competitividade regional da ZFM',
    camposDinamicos: [
      {
        chave: 'possuiPPB',
        label: 'Aprovação de Processo Produtivo Básico (PPB SUFRAMA)',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'Condição indispensável para fruição do Crédito Presumido de IBS e CBS.'
      },
      {
        chave: 'manutencaoIPIZFM',
        label: 'Diferencial de Alíquota IPI mantido para produtos fabricados na ZFM',
        tipo: 'boolean',
        valorPadrao: true,
        descricaoAjuda: 'O IPI será mantido apenas para produtos com fabricação concorrente na ZFM.'
      }
    ],
    premissasEconomicasSugeridas: {
      receitaMensalMedia: 19000000,
      receitaAnual: 228000000,
      custosInsumos: 125400000,
      despesasOperacionais: 34200000,
      margemBrutaPercent: 45.0,
      ebitda: 68400000,
      comprasTotais: 125400000,
      creditosTributariosAtuais: 22572000,
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 40,
      percentualExportacao: 10
    }
  }
};
