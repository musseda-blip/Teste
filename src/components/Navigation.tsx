import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  DollarSign, 
  FileSpreadsheet, 
  Sliders, 
  Globe2, 
  ShieldCheck, 
  Layers,
  Calendar,
  PieChart,
  RefreshCw,
  Database,
  FileUp,
  FileDown,
  GitCompare,
  BookOpen,
  Palette,
  LogOut,
  User,
  Building2,
  Globe,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Compass,
  MapPin,
  Plus,
  FileText,
  Eye
} from 'lucide-react';
import { YearPeriod, EconomicSegment } from '../types/tax';
import { SimuladorReformaLogo } from './SimuladorReformaLogo';
import { SaaSCompany, SaaSUser, WhiteLabelConfig } from '../types/auth';
import { Language, DICTIONARY } from '../utils/i18n';

export interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedYear: YearPeriod;
  setSelectedYear: (year: YearPeriod) => void;
  selectedSegment: EconomicSegment;
  setSelectedSegment: (segment: EconomicSegment) => void;
  onOpenValidation: () => void;
  currentUser: SaaSUser;
  currentCompany: SaaSCompany;
  companies: SaaSCompany[];
  onSwitchCompany: (companyId: string) => void;
  onLogout: () => void;
  onOpenUserGuide: () => void;
  onOpenWhiteLabel: () => void;
  onOpenSavedSimulations: () => void;
  onOpenOnboardingTour?: () => void;
  onExportReportPDF: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  whiteLabel: WhiteLabelConfig;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isCadastroExpanded?: boolean;
  setIsCadastroExpanded?: (expanded: boolean) => void;
  onNovoCadastro?: () => void;
  onEmpresasCadastradas?: () => void;
  isNovoCadastroActive?: boolean;
  isDocumentosExpanded?: boolean;
  setIsDocumentosExpanded?: (expanded: boolean) => void;
  onImportarDocumentos?: () => void;
  onVisualizarDocumentos?: () => void;
  documentosViewMode?: 'importar' | 'visualizar';
}

export interface NavTabItem {
  id: string;
  label: string;
  fullName: string;
  description: string;
  category: 'Parâmetros & Dados' | 'Operacional & Fiscal' | 'Estratégico & Gestão';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  selectedSegment,
  setSelectedSegment,
  onOpenValidation,
  currentUser,
  currentCompany,
  companies,
  onSwitchCompany,
  onLogout,
  onOpenUserGuide,
  onOpenWhiteLabel,
  onOpenSavedSimulations,
  onOpenOnboardingTour,
  onExportReportPDF,
  currentLanguage,
  onLanguageChange,
  whiteLabel,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  isCadastroExpanded,
  setIsCadastroExpanded,
  onNovoCadastro,
  onEmpresasCadastradas,
  isNovoCadastroActive = false,
  isDocumentosExpanded,
  setIsDocumentosExpanded,
  onImportarDocumentos,
  onVisualizarDocumentos,
  documentosViewMode = 'importar',
}) => {
  const t = DICTIONARY[currentLanguage];
  const [pendingSegment, setPendingSegment] = useState<EconomicSegment>(selectedSegment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [localMobileOpen, setLocalMobileOpen] = useState(false);
  const [localCadastroExpanded, setLocalCadastroExpanded] = useState(false);
  const [localDocumentosExpanded, setLocalDocumentosExpanded] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<NavTabItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const collapsed = isCollapsed !== undefined ? isCollapsed : localCollapsed;
  const setCollapsed = setIsCollapsed || setLocalCollapsed;
  const mobileOpen = isMobileOpen !== undefined ? isMobileOpen : localMobileOpen;
  const setMobileOpen = setIsMobileOpen || setLocalMobileOpen;
  const cadastroExpanded = isCadastroExpanded !== undefined ? isCadastroExpanded : localCadastroExpanded;
  const setCadastroExpanded = setIsCadastroExpanded || setLocalCadastroExpanded;
  const documentosExpanded = isDocumentosExpanded !== undefined ? isDocumentosExpanded : localDocumentosExpanded;
  const setDocumentosExpanded = setIsDocumentosExpanded || setLocalDocumentosExpanded;

  const handleApplySegment = () => {
    setIsUpdating(true);
    setSelectedSegment(pendingSegment);
    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  };

  const navTabs: NavTabItem[] = [
    // 1º Tópico: Parâmetros & Dados
    { 
      id: 'cadastro', 
      label: t.tabs.cadastro, 
      fullName: currentLanguage === 'pt' ? 'Cadastro Corporativo & Parâmetros da Empresa' : currentLanguage === 'es' ? 'Datos Maestros Corporativos & Parámetros' : 'Corporate Master Data & Tax Setup',
      description: currentLanguage === 'pt' ? 'Configuração da empresa, CNAE, regimes especiais, dados econômicos e governança de auditoria.' : 'Company configuration, CNAE, special regimes, financial inputs and audit governance.',
      category: 'Parâmetros & Dados',
      icon: Database 
    },
    { 
      id: 'importacao', 
      label: t.tabs.importacao, 
      fullName: currentLanguage === 'pt' ? 'Documentos Fiscais (Importação & Visualização)' : currentLanguage === 'es' ? 'Documentos Fiscales (Importación & Visualización)' : 'Fiscal Documents (Import & View)',
      description: currentLanguage === 'pt' ? 'Gestão, importação e visualização de documentos fiscais eletrônicos (NF-e, NFS-e, CT-e, SPED e planilhas).' : 'Management, import and viewing of electronic fiscal documents (NF-e, NFS-e, CT-e, SPED and spreadsheets).',
      category: 'Parâmetros & Dados',
      icon: FileText 
    },
    { 
      id: 'governance', 
      label: t.tabs.governanca, 
      fullName: currentLanguage === 'pt' ? 'Governança Regulatória & Base Legal (LC 214/25)' : currentLanguage === 'es' ? 'Gobernanza Regulatoria & Normas (LC 214/25)' : 'Regulatory Governance & Legal Framework (LC 214/25)',
      description: currentLanguage === 'pt' ? 'Acompanhamento da LC 214/2025, Emenda Constitucional 132/2023 e diretrizes do Comitê Gestor.' : 'Monitoring of LC 214/2025, Constitutional Amendment 132/2023 and Management Committee rules.',
      category: 'Parâmetros & Dados',
      icon: Globe2 
    },
    { 
      id: 'benchmark', 
      label: t.tabs.benchmark, 
      fullName: currentLanguage === 'pt' ? 'Benchmark de Mercado de Softwares Fiscais' : currentLanguage === 'es' ? 'Benchmark de Software de Mercado' : 'Market Tax Software Benchmark',
      description: currentLanguage === 'pt' ? 'Comparativo técnico entre soluções de mercado (Simulador Tributário, Thomson Reuters, Avalara, Synchro, etc.).' : 'Technical comparative analysis across market platforms (Tax Simulator, Thomson Reuters, Avalara, Synchro).',
      category: 'Parâmetros & Dados',
      icon: Layers 
    },

    // 2º Tópico: Estratégico & Gestão (Em Destaque C-Suite)
    { 
      id: 'executive', 
      label: t.tabs.dashboard, 
      fullName: currentLanguage === 'pt' ? 'Dashboard Executivo: Cockpit C-Suite' : currentLanguage === 'es' ? 'Dashboard Ejecutivo: Cockpit C-Suite' : 'Executive Dashboard: C-Suite Cockpit',
      description: currentLanguage === 'pt' ? 'Visão consolidada de tributos líquidos, EBITDA projetado, fluxo de caixa e timeline 2026-2033.' : 'Consolidated view of net tax burden, EBITDA projections, cash flow and timeline 2026-2033.',
      category: 'Estratégico & Gestão',
      icon: BarChart3 
    },
    { 
      id: 'comparator', 
      label: t.tabs.comparador, 
      fullName: currentLanguage === 'pt' ? 'Comparador A/B de Cenários de Simulação' : currentLanguage === 'es' ? 'Comparador A/B de Escenarios de Simulación' : 'A/B Simulation Scenario Comparator',
      description: currentLanguage === 'pt' ? 'Comparação lado a lado de alíquotas CBS/IBS, créditos tributários e impacto no EBITDA.' : 'Side-by-side comparison of CBS/IBS tax rates, tax credits and EBITDA delta.',
      category: 'Estratégico & Gestão',
      icon: GitCompare, 
      badge: 'A vs B' 
    },
    { 
      id: 'assessment', 
      label: t.tabs.assessment, 
      fullName: currentLanguage === 'pt' ? 'Assessment do Cliente & Roadmap de 5 Fases' : currentLanguage === 'es' ? 'Assessment del Cliente & Hoja de Ruta de 5 Fases' : 'Client Assessment & 5-Phase Roadmap',
      description: currentLanguage === 'pt' ? 'Diagnóstico de prontidão e plano de ação pós-simulação para implantação da Reforma.' : 'Readiness diagnosis and post-simulation action plan for Tax Reform rollout.',
      category: 'Estratégico & Gestão',
      icon: ShieldCheck, 
      badge: '5 Fases' 
    },

    // 3º Tópico: Operacional & Fiscal
    { 
      id: 'fiscal', 
      label: t.tabs.fiscal, 
      fullName: currentLanguage === 'pt' ? 'Apuração Fiscal & Matriz de Alíquotas CBS/IBS' : currentLanguage === 'es' ? 'Liquidación Fiscal & Matriz de Alícuotas CBS/IBS' : 'Tax Calculation & CBS/IBS Tax Rate Matrix',
      description: currentLanguage === 'pt' ? 'Cálculo analítico por item e nota: PIS/COFINS/ICMS/ISS vs. CBS/IBS/IS com Split Payment.' : 'Item-level tax calculation: legacy taxes vs. CBS/IBS/IS with Split Payment details.',
      category: 'Operacional & Fiscal',
      icon: FileSpreadsheet 
    },
    { 
      id: 'operational', 
      label: t.tabs.operacional, 
      fullName: currentLanguage === 'pt' ? 'Análise de Unidades, Filiais, UFs & Princípio do Destino' : currentLanguage === 'es' ? 'Análisis de Unidades, Sucursales, UFs & Principio del Destino' : 'Units, Branches, States & Destination Principle',
      description: currentLanguage === 'pt' ? 'Mapeamento de rotas interestaduais, fim da guerra fiscal e transferência de arrecadação da Origem para o Destino (IBS).' : 'Interstate route mapping, end of tax war and revenue shift from origin to consumption destination (IBS).',
      category: 'Operacional & Fiscal',
      icon: MapPin 
    },
    { 
      id: 'financial', 
      label: t.tabs.financeiro, 
      fullName: currentLanguage === 'pt' ? 'Financeiro, DRE Projetada & Fluxo de Caixa' : currentLanguage === 'es' ? 'Financiero, DRE Proyectada & Flujo de Caja' : 'Financials, Projected P&L & Cash Flow',
      description: currentLanguage === 'pt' ? 'Demonstrativo de resultado com impacto na margem bruta, EBITDA e capital de giro.' : 'Comparative income statement showing impact on gross margin, EBITDA and working capital.',
      category: 'Operacional & Fiscal',
      icon: DollarSign 
    },
    { 
      id: 'product', 
      label: t.tabs.produtos, 
      fullName: currentLanguage === 'pt' ? 'Gestão de Itens, Produtos & Margens' : currentLanguage === 'es' ? 'Gestión de Ítems, Productos & Márgenes' : 'Items, Products & Margin Management',
      description: currentLanguage === 'pt' ? 'Classificação por NCM/NBS, regimes favorecidos, cesta básica e markup por SKU.' : 'SKU-level classification, reduced tax regimes, basic food basket and markup analysis.',
      category: 'Operacional & Fiscal',
      icon: Package 
    },
    { 
      id: 'scenario', 
      label: t.tabs.sensibilidade, 
      fullName: currentLanguage === 'pt' ? 'Simulador de Sensibilidade & Repasse de Preços' : currentLanguage === 'es' ? 'Simulador de Sensibilidad & Ajuste de Precios' : 'Sensitivity Simulator & Price Elasticity',
      description: currentLanguage === 'pt' ? 'Simulação de elasticidade de preços, repasse ao consumidor e compensação de custos.' : 'Interactive pricing elasticity simulation, pass-through rates and cost offset analysis.',
      category: 'Operacional & Fiscal',
      icon: Sliders 
    },
  ];

  const categories: Array<'Parâmetros & Dados' | 'Estratégico & Gestão' | 'Operacional & Fiscal'> = [
    'Parâmetros & Dados',
    'Estratégico & Gestão',
    'Operacional & Fiscal',
  ];

  const years: YearPeriod[] = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
  const segments: EconomicSegment[] = [
    'Comércio',
    'Indústria',
    'Serviços',
    'Varejo',
    'Atacado',
    'Tecnologia / SaaS',
    'Agronegócio',
    'Saúde',
    'Educação',
    'Construção Civil',
    'Logística / Transporte',
    'Energia',
    'Exportação',
    'Zona Franca de Manaus',
  ];

  const activeTabObj = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* VERTICAL SIDEBAR NAVIGATION (LEFT ORIENTATION) */}
      {/* ========================================================================= */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 text-white transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-68'
        } ${
          mobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-850 bg-slate-950 flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              {whiteLabel.enabled ? (
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00D280] text-slate-950 font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                    {whiteLabel.brandName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-black tracking-tight text-white block truncate">
                      {whiteLabel.brandName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate -mt-0.5">
                      {whiteLabel.partnerName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <SimuladorReformaLogo variant="dark" size="sm" />
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto">
              <SimuladorReformaLogo variant="dark" size="sm" showSubtitle={false} />
            </div>
          )}

          {/* Desktop Collapse / Mobile Close Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title={collapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Multi-Tenant Selector in Sidebar */}
        <div className="p-3 border-b border-slate-850 bg-slate-900/60 flex-shrink-0">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-black text-slate-400 tracking-wider px-1">
                <span>Organização Administradora</span>
                <span className="text-[#00D280] font-mono">SaaS Active</span>
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 space-x-2">
                <Building2 className="w-4 h-4 text-[#00D280] flex-shrink-0" />
                <select
                  value={currentCompany.id}
                  onChange={(e) => onSwitchCompany(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-100 outline-none cursor-pointer w-full truncate"
                  title="Trocar Organização Administradora"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`Organização Administradora: ${currentCompany.name}`}>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[#00D280]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Vertical Navigation Links (Scrollable Module List) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 no-scrollbar">
          {categories.map((cat) => {
            const catTabs = navTabs.filter((t) => t.category === cat);
            const isStrategic = cat === 'Estratégico & Gestão';

            return (
              <div 
                key={cat} 
                className={`space-y-1 ${
                  isStrategic && !collapsed 
                    ? 'p-2 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 shadow-xs ring-1 ring-emerald-500/10' 
                    : isStrategic && collapsed 
                    ? 'p-1 rounded-xl bg-emerald-950/30 border border-emerald-500/30' 
                    : ''
                }`}
              >
                {/* Category Header */}
                {!collapsed ? (
                  <div className={`px-2 py-1 text-[11px] font-black uppercase tracking-wider flex items-center justify-between ${
                    isStrategic ? 'text-[#00D280]' : 'text-slate-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {isStrategic && <Sparkles className="w-3 h-3 text-[#00D280]" />}
                      <span>{cat}</span>
                    </span>
                    {isStrategic && (
                      <span className="text-[9px] bg-[#00D280]/20 text-[#00D280] font-black px-1.5 py-0.2 rounded border border-[#00D280]/30 tracking-tight">
                        C-SUITE
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-1.5" />
                )}

                {/* Vertical Items */}
                <div className="space-y-1">
                  {catTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isCadastroTab = tab.id === 'cadastro';
                    const isDocumentosTab = tab.id === 'importacao';
                    const isActive = 
                      (isCadastroTab && (activeTab === 'cadastro' || isNovoCadastroActive)) ||
                      (isDocumentosTab && activeTab === 'importacao') ||
                      (!isCadastroTab && !isDocumentosTab && activeTab === tab.id);
                    
                    return (
                      <div key={tab.id} className="space-y-1">
                        <button
                          onClick={() => {
                            if (isCadastroTab) {
                              if (activeTab === 'cadastro' || isNovoCadastroActive) {
                                setCadastroExpanded(!cadastroExpanded);
                              } else {
                                setActiveTab('cadastro');
                                setCadastroExpanded(true);
                              }
                            } else if (isDocumentosTab) {
                              if (activeTab === 'importacao') {
                                setDocumentosExpanded(!documentosExpanded);
                              } else {
                                setActiveTab('importacao');
                                setDocumentosExpanded(true);
                              }
                            } else {
                              setActiveTab(tab.id);
                            }
                            if (mobileOpen) setMobileOpen(false);
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({ x: rect.right + 12, y: rect.top });
                            setHoveredTab(tab);
                          }}
                          onMouseLeave={() => setHoveredTab(null)}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-150 cursor-pointer relative group ${
                            isActive
                              ? 'bg-[#00D280] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                              : isStrategic
                              ? 'text-slate-200 hover:text-white hover:bg-emerald-950/50'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
                          } ${collapsed ? 'justify-center px-0 py-2.5' : ''}`}
                          title={collapsed ? `${tab.fullName} - ${tab.description}` : undefined}
                        >
                          <div className={`flex-shrink-0 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isStrategic ? 'text-emerald-400 group-hover:text-white' : 'text-slate-400 group-hover:text-white'}`} />
                          </div>

                          {!collapsed && (
                            <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                              <span className="truncate">{tab.label}</span>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
                                {tab.badge && (
                                  <span
                                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                      isActive ? 'bg-slate-950 text-[#00D280]' : isStrategic ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50' : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {tab.badge}
                                  </span>
                                )}
                                {(isCadastroTab || isDocumentosTab) && (
                                  <ChevronDown 
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      (isCadastroTab && cadastroExpanded) || (isDocumentosTab && documentosExpanded) ? 'rotate-180' : ''
                                    } ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} 
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Active Bar Indicator */}
                          {isActive && !collapsed && (
                            <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
                          )}
                        </button>

                        {/* Submenus exclusivos de Cadastro & Dados */}
                        {isCadastroTab && cadastroExpanded && !collapsed && (
                          <div className="pl-6 pr-1 pt-1 pb-1 space-y-1 animate-in slide-in-from-top-1 duration-150">
                            {/* 1. Novo Cadastro */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNovoCadastro) {
                                  onNovoCadastro();
                                } else {
                                  setActiveTab('cadastro');
                                }
                                if (mobileOpen) setMobileOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isNovoCadastroActive
                                  ? 'bg-[#00D280] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/80 bg-slate-950/80'
                              }`}
                              title="Iniciar Novo Cadastro de Empresa"
                            >
                              <Plus className={`w-3.5 h-3.5 flex-shrink-0 ${isNovoCadastroActive ? 'text-slate-950' : 'text-[#00D280]'}`} />
                              <span className="truncate">Novo Cadastro</span>
                            </button>

                            {/* 2. Empresas Cadastradas */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEmpresasCadastradas) {
                                  onEmpresasCadastradas();
                                } else {
                                  setActiveTab('cadastro');
                                }
                                if (mobileOpen) setMobileOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                !isNovoCadastroActive && activeTab === 'cadastro'
                                  ? 'bg-[#00D280] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/80 bg-slate-950/80'
                              }`}
                              title="Visualizar Empresas Cadastradas (Empilhamento Hierárquico)"
                            >
                              <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${!isNovoCadastroActive && activeTab === 'cadastro' ? 'text-slate-950' : 'text-[#00D280]'}`} />
                              <span className="truncate">Empresas Cadastradas</span>
                            </button>
                          </div>
                        )}

                        {/* Submenus exclusivos de Documentos Fiscais */}
                        {isDocumentosTab && documentosExpanded && !collapsed && (
                          <div className="pl-6 pr-1 pt-1 pb-1 space-y-1 animate-in slide-in-from-top-1 duration-150">
                            {/* 1. Importar Documentos Fiscais */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onImportarDocumentos) {
                                  onImportarDocumentos();
                                } else {
                                  setActiveTab('importacao');
                                }
                                if (mobileOpen) setMobileOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'importacao' && documentosViewMode === 'importar'
                                  ? 'bg-[#00D280] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/80 bg-slate-950/80'
                              }`}
                              title="Importar Documentos Fiscais (SPED, XML NF-e, NFS-e, CT-e e Planilhas)"
                            >
                              <FileUp className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'importacao' && documentosViewMode === 'importar' ? 'text-slate-950' : 'text-[#00D280]'}`} />
                              <span className="truncate">Importar Documentos Fiscais</span>
                            </button>

                            {/* 2. Visualizar Documentos Fiscais */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onVisualizarDocumentos) {
                                  onVisualizarDocumentos();
                                } else {
                                  setActiveTab('importacao');
                                }
                                if (mobileOpen) setMobileOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'importacao' && documentosViewMode === 'visualizar'
                                  ? 'bg-[#00D280] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/80 bg-slate-950/80'
                              }`}
                              title="Visualizar Documentos Fiscais Cadastrados e Importados"
                            >
                              <Eye className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'importacao' && documentosViewMode === 'visualizar' ? 'text-slate-950' : 'text-[#00D280]'}`} />
                              <span className="truncate">Visualizar Documentos Fiscais</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer & Quick Actions */}
        <div className="p-3 border-t border-slate-850 bg-slate-950/90 space-y-2 flex-shrink-0">
          {/* Quick PDF Report Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportReportPDF}
              className={`flex-1 flex items-center justify-center space-x-2 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black text-xs py-2 rounded-xl shadow-md transition-all cursor-pointer ${
                collapsed ? 'px-0' : 'px-3'
              }`}
              title="Exportar Relatório Estratégico em PDF"
            >
              <FileDown className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Relatório PDF</span>}
            </button>

            {onOpenOnboardingTour && !collapsed && (
              <button
                onClick={onOpenOnboardingTour}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#00D280] border border-slate-800 transition-colors cursor-pointer flex-shrink-0"
                title="Abrir Tour Interativo de Onboarding"
              >
                <Compass className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Profile & Mini Controls */}
          {!collapsed ? (
            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate leading-tight">
                    {currentUser.roleLabel || (currentUser.role === 'admin' ? 'Administrador' : 'Especialista Fiscal')}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-800 transition-colors cursor-pointer flex-shrink-0"
                title="Sair da Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 pt-1">
              <div 
                className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs"
                title={`${currentUser.name} (${currentUser.roleLabel})`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Sair da Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Engine Tag */}
          {!collapsed && (
            <div className="text-[10px] text-center text-slate-400 font-mono pt-1">
              EBITax Reform Engine v4.5
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* TOP HEADER UTILITY BAR (ACROSS TOP OF CONTENT AREA) */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-850 text-white transition-all duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-68'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Active Module Breadcrumb */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              title="Abrir Menu de Navegação"
            >
              <Menu className="w-5 h-5 text-[#00D280]" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00D280] hidden sm:inline">
                  {activeTabObj.category}
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <h1 className="text-xs sm:text-sm font-black text-white truncate">
                  {activeTabObj.fullName}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                {activeTabObj.description}
              </p>
            </div>
          </div>

          {/* Right: Year, Sector & Global Utility Tools */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Year Period Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 space-x-1.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#00D280]" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value) as YearPeriod)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                title="Selecionar Ano de Apuração e Transição Tributária (2025-2033)"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y} {y === 2026 ? '(Transição)' : y === 2027 ? '(CBS Plena)' : y === 2033 ? '(Definitivo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Economic Sector Selector */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 space-x-1.5 shadow-xs">
              <PieChart className="w-3.5 h-3.5 text-[#00D280] ml-1.5" />
              <select
                value={pendingSegment}
                onChange={(e) => setPendingSegment(e.target.value as EconomicSegment)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
                title="Selecionar Setor Econômico da Empresa"
              >
                {segments.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={handleApplySegment}
                disabled={isUpdating}
                className="bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 shadow-xs"
                title="Aplicar Alíquotas e Regras Setoriais"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>Aplicar</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-1 space-x-0.5 text-xs">
              <Globe className="w-3 h-3 text-slate-400 mr-0.5" />
              <button
                onClick={() => onLanguageChange('pt')}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer text-[11px] ${
                  currentLanguage === 'pt' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer text-[11px] ${
                  currentLanguage === 'en' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('es')}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer text-[11px] ${
                  currentLanguage === 'es' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ES
              </button>
            </div>

            {/* Action Modals Triggers */}
            {onOpenOnboardingTour && (
              <button
                onClick={onOpenOnboardingTour}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#00D280]/15 hover:bg-[#00D280]/25 text-[#00D280] border border-[#00D280]/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Abrir Tour Interativo de Onboarding (4 Etapas do Simulador)"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Tour</span>
              </button>
            )}

            <button
              onClick={onOpenUserGuide}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Abrir Guia Passo a Passo & Manual do Usuário"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#00D280]" />
              <span className="hidden lg:inline">Guia</span>
            </button>

            <button
              onClick={onOpenSavedSimulations}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Ver Simulações Salvas e Gerenciar Cenários"
            >
              <Layers className="w-3.5 h-3.5 text-[#00D280]" />
              <span className="hidden lg:inline">Cenários</span>
            </button>

            <button
              onClick={onOpenWhiteLabel}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-[#00D280] border border-slate-800 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Personalizar Identidade Visual (White-Label)"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tooltip on Sidebar Hover in Desktop Mode */}
      {hoveredTab && (
        <div 
          className="fixed pointer-events-none z-50 bg-slate-950/95 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md max-w-xs transition-opacity duration-150 animate-in fade-in zoom-in-95"
          style={{ 
            left: Math.min(window.innerWidth - 300, tooltipPos.x), 
            top: Math.max(10, Math.min(window.innerHeight - 100, tooltipPos.y)) 
          }}
        >
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#00D280]/20 text-[#00D280] uppercase tracking-wider">
              {hoveredTab.category}
            </span>
            {hoveredTab.badge && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredTab.badge}
              </span>
            )}
          </div>
          <div className="text-xs font-extrabold text-white leading-snug">
            {hoveredTab.fullName}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            {hoveredTab.description}
          </div>
        </div>
      )}
    </>
  );
};


