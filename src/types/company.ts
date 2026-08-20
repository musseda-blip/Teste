import { EconomicSegment } from './tax';

export type RegimeTributario = 'Lucro Real' | 'Lucro Presumido' | 'Simples Nacional';
export type RegimeApuracao = 'Não-Cumulativo' | 'Cumulativo' | 'Misto' | 'Simples';
export type TipoEstabelecimento = 'Matriz' | 'Filial';
export type TipoOperacao = 'Produtos' | 'Serviços' | 'Produtos e Serviços';
export type PerfilMercado = 'B2B' | 'B2C' | 'Ambos (B2B + B2C)';

export interface DataGovernanceAudit {
  campo: string;
  origem: 'Manual (Usuário)' | 'Preset de Setor' | 'ERP Integrado' | 'SPED / Arquivo Fiscal' | 'Receita Federal (CNPJ)';
  dataAtualizacao: string;
  statusValidacao: 'Validado' | 'Em Análise' | 'Pendente de Documento' | 'Auditoria Aprovada';
  fonte: string;
  premissaUtilizada: string;
  confiabilidade: 'Alta (100%)' | 'Média (85%)' | 'Estimada / Preset';
}

export interface FilialInfo {
  id: string;
  nome: string;
  cnpj: string;
  uf: string;
  municipio: string;
  tipoEstabelecimento: 'Filial';
}

export interface EconomicGroup {
  id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
  organizacaoAdministradoraId?: string;
}

export interface CompanyRegistration {
  id: string;
  organizacaoAdministradoraId?: string;
  organizacaoAdministradoraNome?: string;
  grupoEconomicoId?: string;
  grupoEconomicoNome?: string;
  matrizId?: string;
  matrizNome?: string;
  filiais?: FilialInfo[];

  // 1. Cadastro Inicial Enxuto
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  tipoEstabelecimento: TipoEstabelecimento;
  uf: string;
  municipio: string;
  regimeTributario: RegimeTributario;
  regimeApuracao: RegimeApuracao;
  cnaePrincipal: string;
  cnaeDescricao: string;
  setor: EconomicSegment;
  subsegmento: string;
  tipoOperacao: TipoOperacao;
  perfilMercado: PerfilMercado;
  operacoes: {
    internas: boolean;
    interestaduais: boolean;
    importacao: boolean;
    exportacao: boolean;
  };

  // 2. Dados Fiscais Complementares (Direcionados por Setor & Operação)
  dadosFiscais: {
    ncmPrincipal: string;
    nbsPrincipal: string;
    cfopPrincipal: string;
    cstPrincipal: string;
    csosnPrincipal: string;
    cestPrincipal: string;
    codigoServicoMunicipal: string;
    regimeEspecial: string;
    beneficioFiscal: string;
    ufOrigem: string;
    ufDestino: string;
    municipioOrigem: string;
    municipioDestino: string;
    camposDinamicosSetor: Record<string, any>;
  };

  // 3. Dados Econômicos & Financeiros
  dadosEconomicos: {
    receitaMensalMedia: number;
    receitaAnual: number;
    custosInsumos: number;
    despesasOperacionais: number;
    margemBrutaPercent: number;
    ebitda: number;
    comprasTotais: number;
    creditosTributariosAtuais: number;
    distribuicaoUfs: { uf: string; percentual: number }[];
    percentualB2B: number;
    percentualB2C: number;
    percentualImportacao: number;
    percentualExportacao: number;
  };

  // 4. Governança e Rastreabilidade de Cada Dado
  auditoriaCampos: Record<string, DataGovernanceAudit>;
}

export const DEFAULT_ECONOMIC_GROUPS: EconomicGroup[] = [
  { 
    id: 'grp_novera', 
    nome: 'Grupo Novera', 
    codigo: 'GRP-001', 
    descricao: 'Conglomerado Industrial e de Serviços Avançados',
    organizacaoAdministradoraId: 'org_equality'
  },
  { 
    id: 'grp_vertice', 
    nome: 'Grupo Vértice', 
    codigo: 'GRP-002', 
    descricao: 'Rede Corporativa de Comércio Varejista e Logística Integrada',
    organizacaoAdministradoraId: 'org_equality'
  },
  { 
    id: 'grp_ebitax', 
    nome: 'Grupo Equality / EBITax', 
    codigo: 'GRP-003', 
    descricao: 'Holding de Tecnologia Tributária e Inteligência Fiscal',
    organizacaoAdministradoraId: 'org_ebitax'
  },
];

export const INITIAL_COMPANY_DATA: CompanyRegistration = {
  id: 'comp_ebitax_matriz',
  organizacaoAdministradoraId: 'org_ebitax',
  organizacaoAdministradoraNome: 'EBITax Tech S/A',
  grupoEconomicoId: 'grp_ebitax',
  grupoEconomicoNome: 'Grupo Equality / EBITax',
  razaoSocial: 'EBITax Inteligência Tributária & Tecnologia S.A.',
  nomeFantasia: 'EBITax Enterprise Platform',
  cnpj: '38.492.812/0001-94',
  tipoEstabelecimento: 'Matriz',
  uf: 'SP',
  municipio: 'São Paulo',
  filiais: [
    {
      id: 'fil_ebitax_rj',
      nome: 'Filial Rio de Janeiro',
      cnpj: '38.492.812/0002-75',
      uf: 'RJ',
      municipio: 'Rio de Janeiro',
      tipoEstabelecimento: 'Filial',
    }
  ],
  regimeTributario: 'Lucro Real',
  regimeApuracao: 'Não-Cumulativo',
  cnaePrincipal: '6202-3/00',
  cnaeDescricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
  setor: 'Tecnologia / SaaS',
  subsegmento: 'Software as a Service (Cloud & B2B)',
  tipoOperacao: 'Serviços',
  perfilMercado: 'B2B',
  operacoes: {
    internas: true,
    interestaduais: true,
    importacao: true,
    exportacao: true,
  },
  dadosFiscais: {
    ncmPrincipal: '8471.50.10',
    nbsPrincipal: '1.0101.10.00',
    cfopPrincipal: '5.933 / 6.933',
    cstPrincipal: '01',
    csosnPrincipal: 'N/A (Lucro Real)',
    cestPrincipal: '21.030.00',
    codigoServicoMunicipal: '01.01.01 - Análise e Desenvolvimento de Sistemas',
    regimeEspecial: 'Regime Geral Não-Cumulativo CBS/IBS (LC 214/2025)',
    beneficioFiscal: 'Lei do Bem (Lei 11.196/05) - Incentivo à Inovação Tecnológica',
    ufOrigem: 'SP',
    ufDestino: 'RJ',
    municipioOrigem: 'São Paulo',
    municipioDestino: 'Rio de Janeiro',
    camposDinamicosSetor: {
      modeloServidores: 'Nuvem Exterior (AWS/Azure/GCP US)',
      naturezaSoftware: 'SaaS Padronizado (Download/Cloud)',
      contratosRecorrentes: true,
    }
  },
  dadosEconomicos: {
    receitaMensalMedia: 4500000,
    receitaAnual: 54000000,
    custosInsumos: 16200000,
    despesasOperacionais: 22680000,
    margemBrutaPercent: 70.0,
    ebitda: 15120000,
    comprasTotais: 16200000,
    creditosTributariosAtuais: 1518750,
    distribuicaoUfs: [
      { uf: 'SP', percentual: 45 },
      { uf: 'RJ', percentual: 20 },
      { uf: 'MG', percentual: 12 },
      { uf: 'RS', percentual: 8 },
      { uf: 'PR', percentual: 7 },
      { uf: 'Outros Estados', percentual: 8 },
    ],
    percentualB2B: 90,
    percentualB2C: 10,
    percentualImportacao: 25,
    percentualExportacao: 15,
  },
  auditoriaCampos: {
    cnpj: {
      campo: 'CNPJ',
      origem: 'Receita Federal (CNPJ)',
      dataAtualizacao: '2026-08-15',
      statusValidacao: 'Validado',
      fonte: 'Base CNPJ RFB / Consulta Pública Automatizada',
      premissaUtilizada: 'Empresa Ativa e Regular na Receita Federal',
      confiabilidade: 'Alta (100%)',
    },
    regimeTributario: {
      campo: 'Regime Tributário',
      origem: 'Manual (Usuário)',
      dataAtualizacao: '2026-08-15',
      statusValidacao: 'Validado',
      fonte: 'Declaração Anual ECF / EFD Contribuições',
      premissaUtilizada: 'Lucro Real Não-Cumulativo para PIS/COFINS e IBS/CBS',
      confiabilidade: 'Alta (100%)',
    },
    setor: {
      campo: 'Setor de Atuação',
      origem: 'Preset de Setor',
      dataAtualizacao: '2026-08-15',
      statusValidacao: 'Auditoria Aprovada',
      fonte: 'Classificação CNAE 6202-3/00 Tecnologia e Software',
      premissaUtilizada: 'Preset Tecnologia/SaaS: Créditos plenos de infraestrutura em nuvem e bens de capital',
      confiabilidade: 'Alta (100%)',
    },
    receitaAnual: {
      campo: 'Receita Anual Consolidada',
      origem: 'ERP Integrado',
      dataAtualizacao: '2026-08-15',
      statusValidacao: 'Validado',
      fonte: 'Livro Fiscal Digital / EFD Contribuições 2025/2026',
      premissaUtilizada: 'Faturamento histórico de R$ 54.000.000,00',
      confiabilidade: 'Alta (100%)',
    },
  }
};

export const DEFAULT_COMPANIES_REGISTRY: CompanyRegistration[] = [
  // Grupo Equality / EBITax (EBITax Tech S/A) — Padrão Ativo
  INITIAL_COMPANY_DATA,

  // Grupo Novera (Equality Tech S/A)
  {
    id: 'comp_novera_ind',
    organizacaoAdministradoraId: 'org_equality',
    organizacaoAdministradoraNome: 'Equality Tech S/A',
    grupoEconomicoId: 'grp_novera',
    grupoEconomicoNome: 'Grupo Novera',
    razaoSocial: 'Novera Indústria S.A.',
    nomeFantasia: 'Novera Indústria',
    cnpj: '18.234.567/0001-44',
    tipoEstabelecimento: 'Matriz',
    uf: 'SP',
    municipio: 'São Paulo',
    filiais: [
      {
        id: 'fil_novera_campinas',
        nome: 'Filial Campinas',
        cnpj: '18.234.567/0002-25',
        uf: 'SP',
        municipio: 'Campinas',
        tipoEstabelecimento: 'Filial',
      },
      {
        id: 'fil_novera_jundiai_ind',
        nome: 'Filial Jundiaí',
        cnpj: '18.234.567/0005-78',
        uf: 'SP',
        municipio: 'Jundiaí',
        tipoEstabelecimento: 'Filial',
      }
    ],
    regimeTributario: 'Lucro Real',
    regimeApuracao: 'Não-Cumulativo',
    cnaePrincipal: '2869-1/00',
    cnaeDescricao: 'Fabricação de máquinas e equipamentos para uso industrial específico',
    setor: 'Indústria',
    subsegmento: 'Manufatura & Automação Industrial',
    tipoOperacao: 'Produtos',
    perfilMercado: 'B2B',
    operacoes: {
      internas: true,
      interestaduais: true,
      importacao: true,
      exportacao: true,
    },
    dadosFiscais: {
      ncmPrincipal: '8479.89.99',
      nbsPrincipal: '1.0101.10.00',
      cfopPrincipal: '5.101 / 6.101',
      cstPrincipal: '00',
      csosnPrincipal: 'N/A (Lucro Real)',
      cestPrincipal: '21.030.00',
      codigoServicoMunicipal: '14.01 - Manutenção de Máquinas',
      regimeEspecial: 'Regime Geral Não-Cumulativo CBS/IBS (LC 214/2025)',
      beneficioFiscal: 'RECAP - Regime Especial de Aquisição de Bens de Capital',
      ufOrigem: 'SP',
      ufDestino: 'RJ',
      municipioOrigem: 'São Paulo',
      municipioDestino: 'Rio de Janeiro',
      camposDinamicosSetor: {
        consumoEnergiaIndustrial: 'Alta Tensão (Crédito Integral IBS/CBS)',
        creditoAtivoImobilizado: 'Apropriação Imediata na Reforma',
      }
    },
    dadosEconomicos: {
      receitaMensalMedia: 6500000,
      receitaAnual: 78000000,
      custosInsumos: 39000000,
      despesasOperacionais: 23400000,
      margemBrutaPercent: 50.0,
      ebitda: 15600000,
      comprasTotais: 39000000,
      creditosTributariosAtuais: 3607500,
      distribuicaoUfs: [
        { uf: 'SP', percentual: 50 },
        { uf: 'RJ', percentual: 20 },
        { uf: 'MG', percentual: 15 },
        { uf: 'RS', percentual: 10 },
        { uf: 'PR', percentual: 5 },
      ],
      percentualB2B: 95,
      percentualB2C: 5,
      percentualImportacao: 30,
      percentualExportacao: 20,
    },
    auditoriaCampos: {
      cnpj: {
        campo: 'CNPJ',
        origem: 'Receita Federal (CNPJ)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Base CNPJ RFB / Consulta Pública Automatizada',
        premissaUtilizada: 'Empresa Ativa e Regular na Receita Federal',
        confiabilidade: 'Alta (100%)',
      },
      regimeTributario: {
        campo: 'Regime Tributário',
        origem: 'Manual (Usuário)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Declaração Anual ECF / EFD Contribuições',
        premissaUtilizada: 'Lucro Real Não-Cumulativo para PIS/COFINS e IBS/CBS',
        confiabilidade: 'Alta (100%)',
      },
      setor: {
        campo: 'Setor de Atuação',
        origem: 'Preset de Setor',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Auditoria Aprovada',
        fonte: 'Classificação CNAE 2869-1/00 Indústria de Transformação',
        premissaUtilizada: 'Preset Industrial: Créditos plenos de energia e bens de capital',
        confiabilidade: 'Alta (100%)',
      },
      receitaAnual: {
        campo: 'Receita Anual Consolidada',
        origem: 'ERP Integrado',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Livro Fiscal Digital / EFD Contribuições 2025/2026',
        premissaUtilizada: 'Faturamento histórico de R$ 78.000.000,00',
        confiabilidade: 'Alta (100%)',
      },
    }
  },
  {
    id: 'comp_novera_serv',
    organizacaoAdministradoraId: 'org_equality',
    organizacaoAdministradoraNome: 'Equality Tech S/A',
    grupoEconomicoId: 'grp_novera',
    grupoEconomicoNome: 'Grupo Novera',
    razaoSocial: 'Novera Serviços S.A.',
    nomeFantasia: 'Novera Tech & Services',
    cnpj: '18.234.567/0003-06',
    tipoEstabelecimento: 'Matriz',
    uf: 'SP',
    municipio: 'São Paulo',
    filiais: [
      {
        id: 'fil_novera_jundiai',
        nome: 'Filial Jundiaí',
        cnpj: '18.234.567/0004-97',
        uf: 'SP',
        municipio: 'Jundiaí',
        tipoEstabelecimento: 'Filial',
      }
    ],
    regimeTributario: 'Lucro Real',
    regimeApuracao: 'Não-Cumulativo',
    cnaePrincipal: '6209-1/00',
    cnaeDescricao: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação',
    setor: 'Serviços',
    subsegmento: 'Engenharia de Sistemas & Suporte Técnico',
    tipoOperacao: 'Serviços',
    perfilMercado: 'B2B',
    operacoes: {
      internas: true,
      interestaduais: true,
      importacao: false,
      exportacao: true,
    },
    dadosFiscais: {
      ncmPrincipal: '8523.80.00',
      nbsPrincipal: '1.0101.20.00',
      cfopPrincipal: '5.933 / 6.933',
      cstPrincipal: '01',
      csosnPrincipal: 'N/A (Lucro Real)',
      cestPrincipal: '21.030.00',
      codigoServicoMunicipal: '01.07 - Suporte Técnico e Manutenção',
      regimeEspecial: 'Regime Geral Não-Cumulativo CBS/IBS (LC 214/2025)',
      beneficioFiscal: 'Nenhum (Tributação Geral com Crédito Pleno ao Tomador)',
      ufOrigem: 'SP',
      ufDestino: 'SP',
      municipioOrigem: 'São Paulo',
      municipioDestino: 'São Paulo',
      camposDinamicosSetor: {
        naturezaServico: 'Serviços B2B Integrados',
        creditosTomador: '100% de aproveitamento pelo cliente corporativo',
      }
    },
    dadosEconomicos: {
      receitaMensalMedia: 2800000,
      receitaAnual: 33600000,
      custosInsumos: 10080000,
      despesasOperacionais: 15120000,
      margemBrutaPercent: 70.0,
      ebitda: 8400000,
      comprasTotais: 10080000,
      creditosTributariosAtuais: 932400,
      distribuicaoUfs: [
        { uf: 'SP', percentual: 65 },
        { uf: 'RJ', percentual: 20 },
        { uf: 'MG', percentual: 15 },
      ],
      percentualB2B: 100,
      percentualB2C: 0,
      percentualImportacao: 5,
      percentualExportacao: 15,
    },
    auditoriaCampos: {
      cnpj: {
        campo: 'CNPJ',
        origem: 'Receita Federal (CNPJ)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Base CNPJ RFB',
        premissaUtilizada: 'Matriz de Serviços Regular',
        confiabilidade: 'Alta (100%)',
      }
    }
  },
  {
    id: 'comp_novera_log',
    organizacaoAdministradoraId: 'org_equality',
    organizacaoAdministradoraNome: 'Equality Tech S/A',
    grupoEconomicoId: 'grp_novera',
    grupoEconomicoNome: 'Grupo Novera',
    razaoSocial: 'Novera Logística S.A.',
    nomeFantasia: 'Novera Express & Logística',
    cnpj: '18.234.567/0006-59',
    tipoEstabelecimento: 'Matriz',
    uf: 'SP',
    municipio: 'São Paulo',
    filiais: [
      {
        id: 'fil_novera_guarulhos',
        nome: 'Filial Guarulhos',
        cnpj: '18.234.567/0007-30',
        uf: 'SP',
        municipio: 'Guarulhos',
        tipoEstabelecimento: 'Filial',
      }
    ],
    regimeTributario: 'Lucro Real',
    regimeApuracao: 'Não-Cumulativo',
    cnaePrincipal: '4930-2/02',
    cnaeDescricao: 'Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal e interestadual',
    setor: 'Logística / Transporte',
    subsegmento: 'Transporte Rodoviário & Operador Logístico Multimodal',
    tipoOperacao: 'Serviços',
    perfilMercado: 'B2B',
    operacoes: {
      internas: true,
      interestaduais: true,
      importacao: false,
      exportacao: false,
    },
    dadosFiscais: {
      ncmPrincipal: '8704.23.10',
      nbsPrincipal: '1.0501.10.00',
      cfopPrincipal: '5.353 / 6.353',
      cstPrincipal: '00',
      csosnPrincipal: 'N/A (Lucro Real)',
      cestPrincipal: 'N/A',
      codigoServicoMunicipal: '16.01 - Transporte de Carga',
      regimeEspecial: 'Regime Geral CBS/IBS com Crédito Amplo sobre Frotas e Combustíveis',
      beneficioFiscal: 'Crédito financeiro pleno na aquisição de combustíveis e pneus',
      ufOrigem: 'SP',
      ufDestino: 'MG',
      municipioOrigem: 'São Paulo',
      municipioDestino: 'Belo Horizonte',
      camposDinamicosSetor: {
        combustivelFrota: 'Diesel S10 com Crédito CBS/IBS',
        pedagioOperacional: 'Geração de Crédito Financeiro na Reforma',
      }
    },
    dadosEconomicos: {
      receitaMensalMedia: 3200000,
      receitaAnual: 38400000,
      custosInsumos: 26880000,
      despesasOperacionais: 7680000,
      margemBrutaPercent: 30.0,
      ebitda: 3840000,
      comprasTotais: 26880000,
      creditosTributariosAtuais: 2486400,
      distribuicaoUfs: [
        { uf: 'SP', percentual: 50 },
        { uf: 'MG', percentual: 30 },
        { uf: 'RJ', percentual: 20 },
      ],
      percentualB2B: 100,
      percentualB2C: 0,
      percentualImportacao: 0,
      percentualExportacao: 0,
    },
    auditoriaCampos: {
      cnpj: {
        campo: 'CNPJ',
        origem: 'Receita Federal (CNPJ)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Base CNPJ RFB',
        premissaUtilizada: 'Operador Logístico Regular',
        confiabilidade: 'Alta (100%)',
      }
    }
  },

  // Grupo Vértice (Equality Tech S/A)
  {
    id: 'comp_vertice_com',
    organizacaoAdministradoraId: 'org_equality',
    organizacaoAdministradoraNome: 'Equality Tech S/A',
    grupoEconomicoId: 'grp_vertice',
    grupoEconomicoNome: 'Grupo Vértice',
    razaoSocial: 'Vértice Comércio S.A.',
    nomeFantasia: 'Vértice Distribuição & Comércio',
    cnpj: '24.789.101/0001-33',
    tipoEstabelecimento: 'Matriz',
    uf: 'SP',
    municipio: 'São Paulo',
    filiais: [
      {
        id: 'fil_vertice_sorocaba',
        nome: 'Filial Sorocaba',
        cnpj: '24.789.101/0002-14',
        uf: 'SP',
        municipio: 'Sorocaba',
        tipoEstabelecimento: 'Filial',
      }
    ],
    regimeTributario: 'Lucro Real',
    regimeApuracao: 'Não-Cumulativo',
    cnaePrincipal: '4649-4/99',
    cnaeDescricao: 'Comércio atacadista de outros equipamentos e artigos de uso pessoal e doméstico',
    setor: 'Comércio',
    subsegmento: 'Comércio Atacadista & Distribuição B2B/B2C',
    tipoOperacao: 'Produtos',
    perfilMercado: 'Ambos (B2B + B2C)',
    operacoes: {
      internas: true,
      interestaduais: true,
      importacao: true,
      exportacao: false,
    },
    dadosFiscais: {
      ncmPrincipal: '8528.52.00',
      nbsPrincipal: '1.0101.10.00',
      cfopPrincipal: '5.102 / 6.102',
      cstPrincipal: '00',
      csosnPrincipal: 'N/A (Lucro Real)',
      cestPrincipal: '21.030.00',
      codigoServicoMunicipal: 'N/A',
      regimeEspecial: 'Regime Geral Não-Cumulativo CBS/IBS (LC 214/2025)',
      beneficioFiscal: 'Nenhum (Extinção dos Benefícios de ICMS pela Reforma)',
      ufOrigem: 'SP',
      ufDestino: 'PR',
      municipioOrigem: 'São Paulo',
      municipioDestino: 'Curitiba',
      camposDinamicosSetor: {
        icmsStLegado: 'Substituição Tributária Extinta com CBS/IBS',
        principioDestino: 'Arrecadação transferida integralmente ao Estado de destino',
      }
    },
    dadosEconomicos: {
      receitaMensalMedia: 8200000,
      receitaAnual: 98400000,
      custosInsumos: 68880000,
      despesasOperacionais: 19680000,
      margemBrutaPercent: 30.0,
      ebitda: 9840000,
      comprasTotais: 68880000,
      creditosTributariosAtuais: 6371400,
      distribuicaoUfs: [
        { uf: 'SP', percentual: 40 },
        { uf: 'PR', percentual: 25 },
        { uf: 'SC', percentual: 20 },
        { uf: 'RS', percentual: 15 },
      ],
      percentualB2B: 60,
      percentualB2C: 40,
      percentualImportacao: 40,
      percentualExportacao: 0,
    },
    auditoriaCampos: {
      cnpj: {
        campo: 'CNPJ',
        origem: 'Receita Federal (CNPJ)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Base CNPJ RFB',
        premissaUtilizada: 'Matriz Comercial Regular',
        confiabilidade: 'Alta (100%)',
      }
    }
  },
  {
    id: 'comp_vertice_log',
    organizacaoAdministradoraId: 'org_equality',
    organizacaoAdministradoraNome: 'Equality Tech S/A',
    grupoEconomicoId: 'grp_vertice',
    grupoEconomicoNome: 'Grupo Vértice',
    razaoSocial: 'Vértice Logística S.A.',
    nomeFantasia: 'Vértice Log Express',
    cnpj: '24.789.101/0003-03',
    tipoEstabelecimento: 'Matriz',
    uf: 'SP',
    municipio: 'São Paulo',
    filiais: [
      {
        id: 'fil_vertice_guarulhos',
        nome: 'Filial Guarulhos',
        cnpj: '24.789.101/0004-86',
        uf: 'SP',
        municipio: 'Guarulhos',
        tipoEstabelecimento: 'Filial',
      }
    ],
    regimeTributario: 'Lucro Real',
    regimeApuracao: 'Não-Cumulativo',
    cnaePrincipal: '4930-2/02',
    cnaeDescricao: 'Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional',
    setor: 'Logística / Transporte',
    subsegmento: 'Transporte Rodoviário & Operador Logístico Multimodal',
    tipoOperacao: 'Serviços',
    perfilMercado: 'B2B',
    operacoes: {
      internas: true,
      interestaduais: true,
      importacao: false,
      exportacao: false,
    },
    dadosFiscais: {
      ncmPrincipal: '8704.23.10',
      nbsPrincipal: '1.0501.10.00',
      cfopPrincipal: '5.353 / 6.353',
      cstPrincipal: '00',
      csosnPrincipal: 'N/A (Lucro Real)',
      cestPrincipal: 'N/A',
      codigoServicoMunicipal: '16.01 - Transporte de Carga',
      regimeEspecial: 'Regime Geral CBS/IBS com Crédito Amplo sobre Frotas e Combustíveis',
      beneficioFiscal: 'Crédito financeiro pleno na aquisição de combustíveis e pneus',
      ufOrigem: 'SP',
      ufDestino: 'MG',
      municipioOrigem: 'São Paulo',
      municipioDestino: 'Belo Horizonte',
      camposDinamicosSetor: {
        combustivelFrota: 'Diesel S10 com Crédito CBS/IBS',
        pedagioOperacional: 'Geração de Crédito Financeiro na Reforma',
      }
    },
    dadosEconomicos: {
      receitaMensalMedia: 4100000,
      receitaAnual: 49200000,
      custosInsumos: 27060000,
      despesasOperacionais: 14760000,
      margemBrutaPercent: 45.0,
      ebitda: 7380000,
      comprasTotais: 27060000,
      creditosTributariosAtuais: 2503050,
      distribuicaoUfs: [
        { uf: 'SP', percentual: 45 },
        { uf: 'MG', percentual: 30 },
        { uf: 'RJ', percentual: 25 },
      ],
      percentualB2B: 100,
      percentualB2C: 0,
      percentualImportacao: 0,
      percentualExportacao: 0,
    },
    auditoriaCampos: {
      cnpj: {
        campo: 'CNPJ',
        origem: 'Receita Federal (CNPJ)',
        dataAtualizacao: '2026-08-15',
        statusValidacao: 'Validado',
        fonte: 'Base CNPJ RFB',
        premissaUtilizada: 'Operador Logístico Regular',
        confiabilidade: 'Alta (100%)',
      }
    }
  }
];

export const createBlankCompanyRegistration = (
  customId?: string, 
  defaultGroup?: EconomicGroup,
  organizacaoAdministradora?: { id: string; name: string }
): CompanyRegistration => {
  const id = customId || `comp_${Date.now()}`;
  return {
    id,
    organizacaoAdministradoraId: organizacaoAdministradora?.id || 'org_equality',
    organizacaoAdministradoraNome: organizacaoAdministradora?.name || 'Equality Tech S/A',
    grupoEconomicoId: defaultGroup?.id || '',
    grupoEconomicoNome: defaultGroup?.nome || '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    tipoEstabelecimento: '' as any,
    uf: '',
    municipio: '',
    filiais: [],
    regimeTributario: '' as any,
    regimeApuracao: '' as any,
    cnaePrincipal: '',
    cnaeDescricao: '',
    setor: '' as any,
    subsegmento: '',
    tipoOperacao: '' as any,
    perfilMercado: '' as any,
    operacoes: {
      internas: false,
      interestaduais: false,
      importacao: false,
      exportacao: false,
    },
    dadosFiscais: {
      ncmPrincipal: '',
      nbsPrincipal: '',
      cfopPrincipal: '',
      cstPrincipal: '',
      csosnPrincipal: '',
      cestPrincipal: '',
      codigoServicoMunicipal: '',
      regimeEspecial: '',
      beneficioFiscal: '',
      ufOrigem: '',
      ufDestino: '',
      municipioOrigem: '',
      municipioDestino: '',
      camposDinamicosSetor: {}
    },
    dadosEconomicos: {
      receitaMensalMedia: 0,
      receitaAnual: 0,
      custosInsumos: 0,
      despesasOperacionais: 0,
      margemBrutaPercent: 0,
      ebitda: 0,
      comprasTotais: 0,
      creditosTributariosAtuais: 0,
      distribuicaoUfs: [],
      percentualB2B: 0,
      percentualB2C: 0,
      percentualImportacao: 0,
      percentualExportacao: 0,
    },
    auditoriaCampos: {}
  };
};

