import { SaaSCompany, SaaSUser, WhiteLabelConfig } from '../types/auth';

export const MOCK_COMPANIES: SaaSCompany[] = [
  {
    id: 'comp_equality',
    name: 'Equality Tech Group SA (Matriz)',
    cnpj: '12.345.678/0001-90',
    segment: 'Tecnologia / SaaS',
    colorScheme: '#00D280',
  },
  {
    id: 'comp_varejo',
    name: 'Nexus Varejo & E-Commerce Brasil',
    cnpj: '98.765.432/0001-10',
    segment: 'Varejo',
    colorScheme: '#0284C7',
  },
  {
    id: 'comp_industria',
    name: 'Atlas Indústria & Logística Global',
    cnpj: '45.678.901/0001-23',
    segment: 'Indústria',
    colorScheme: '#D97706',
  },
];

export const MOCK_USERS: SaaSUser[] = [
  {
    id: 'user_admin',
    name: 'Dr. Milton Epelboin',
    email: 'admin@equalityit.com.br',
    role: 'admin',
    roleLabel: 'Administrador Global & Sócio-Diretor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyIds: ['comp_equality', 'comp_varejo', 'comp_industria'],
  },
  {
    id: 'user_analyst',
    name: 'Juliana Costa',
    email: 'juliana.costa@equalityit.com.br',
    role: 'fiscal_analyst',
    roleLabel: 'Especialista Fiscal & Tax Tech',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    companyIds: ['comp_equality', 'comp_varejo'],
  },
  {
    id: 'user_csuite',
    name: 'Rodrigo Mendonça',
    email: 'cfo@empresa.com.br',
    role: 'c_level',
    roleLabel: 'CFO / Diretor Financeiro (C-Level)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyIds: ['comp_varejo', 'comp_industria'],
  },
];

export const DEFAULT_WHITELABEL: WhiteLabelConfig = {
  enabled: false,
  brandName: 'Simulador de Reforma Tributária',
  partnerName: 'Tax Intelligence Advisory',
  logoText: 'Simulador Tributário',
  primaryColor: '#00D280',
  reportHeader: 'Simulador de Reforma Tributária • Relatório Estratégico',
  customDisclaimer: 'Documento confidencial gerado pelo Simulador de Reforma Tributária. Todos os direitos reservados.',
  supportPhone: '+55 11 96175-9438',
};
