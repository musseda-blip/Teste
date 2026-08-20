export type UserRole = 'admin' | 'fiscal_analyst' | 'c_level';

export interface SaaSCompany {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  logoUrl?: string;
  colorScheme?: string;
}

export interface SaaSUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarUrl?: string;
  companyIds: string[];
}

export interface WhiteLabelConfig {
  enabled: boolean;
  brandName: string;
  partnerName: string;
  logoText: string;
  primaryColor: string;
  reportHeader: string;
  customDisclaimer: string;
  supportPhone: string;
}

export const DEFAULT_COMPANIES: SaaSCompany[] = [
  {
    id: 'org_master',
    name: 'Administrador S/A',
    cnpj: '00.000.000/0001-00',
    segment: 'Controladoria & Gestão Master',
    colorScheme: '#00D280',
  },
  {
    id: 'org_equality',
    name: 'Equality Tech S/A',
    cnpj: '45.123.890/0001-22',
    segment: 'Tecnologia / SaaS',
    colorScheme: '#00D280',
  },
  {
    id: 'org_ebitax',
    name: 'EBITax Tech S/A',
    cnpj: '38.492.812/0001-94',
    segment: 'Tecnologia / SaaS',
    colorScheme: '#0ea5e9',
  },
];

export const DEFAULT_SAAS_USERS: SaaSUser[] = [
  {
    id: 'user_admin',
    name: 'Rodrigo Medeiros',
    email: 'admin@equalityit.com.br',
    role: 'admin',
    roleLabel: 'Administrador Master / Sócio Tributário',
    companyIds: ['org_master', 'org_equality', 'org_ebitax'],
  },
  {
    id: 'user_analyst',
    name: 'Juliana Costa',
    email: 'juliana.fiscal@equalityit.com.br',
    role: 'fiscal_analyst',
    roleLabel: 'Especialista em Tributos Indiretos',
    companyIds: ['org_master', 'org_equality'],
  },
  {
    id: 'user_cfo',
    name: 'Carlos Albuquerque',
    email: 'cfo@empresa.com.br',
    role: 'c_level',
    roleLabel: 'CFO / Diretor Financeiro',
    companyIds: ['org_master', 'org_equality', 'org_ebitax'],
  },
];

export const DEFAULT_WHITE_LABEL_CONFIG: WhiteLabelConfig = {
  enabled: false,
  brandName: 'Simulador de Reforma Tributária',
  partnerName: 'Tax Intelligence & Advisory',
  logoText: 'Simulador Tributário',
  primaryColor: '#00D280',
  reportHeader: 'Dossiê Executivo de Planejamento Tributário - Reforma Tributária (EC 132/2023 & LC 214/2025)',
  customDisclaimer: 'Simulação orientada por premissas de transição e alíquotas de referência da LC 214/2025.',
  supportPhone: '+55 11 96175-9438',
};
