import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { LoginScreen } from './components/LoginScreen';
import { ScenarioComparator } from './components/ScenarioComparator';
import { ClientAssessmentRoadmap } from './components/ClientAssessmentRoadmap';
import { UserGuideModal } from './components/UserGuideModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { WhiteLabelSettingsModal } from './components/WhiteLabelSettingsModal';
import { SavedSimulationsModal } from './components/SavedSimulationsModal';
import { CadastroDados } from './components/CadastroDados';
import { ImportacaoFiscal } from './components/ImportacaoFiscal';
import { VisualizacaoDocumentos } from './components/VisualizacaoDocumentos';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FiscalAnalytics } from './components/FiscalAnalytics';
import { ProductAnalytics } from './components/ProductAnalytics';
import { FinancialAnalytics } from './components/FinancialAnalytics';
import { AccountingAnalytics } from './components/AccountingAnalytics';
import { ScenarioAnalytics } from './components/ScenarioAnalytics';
import { OperationalAnalytics } from './components/OperationalAnalytics';
import { Governance } from './components/Governance';
import { MarketBenchmark } from './components/MarketBenchmark';
import { DrillDownModal } from './components/DrillDownModal';
import { AcceptanceCriteriaDrawer } from './components/AcceptanceCriteriaDrawer';
import { WhatsAppSupport } from './components/WhatsAppSupport';
import { SimuladorReformaLogo } from './components/SimuladorReformaLogo';

import { YearPeriod, EconomicSegment, SensitivityParams, TaxItem } from './types/tax';
import { 
  CompanyRegistration, 
  INITIAL_COMPANY_DATA, 
  EconomicGroup, 
  DEFAULT_COMPANIES_REGISTRY, 
  DEFAULT_ECONOMIC_GROUPS, 
  createBlankCompanyRegistration 
} from './types/company';
import { 
  SaaSUser, 
  SaaSCompany, 
  WhiteLabelConfig, 
  DEFAULT_SAAS_USERS, 
  DEFAULT_COMPANIES, 
  DEFAULT_WHITE_LABEL_CONFIG 
} from './types/auth';
import { 
  SavedSimulation, 
  AssessmentStep, 
  DEFAULT_SAVED_SIMULATIONS, 
  DEFAULT_ASSESSMENT_STEPS 
} from './types/simulation';
import { calculateEngine } from './utils/taxEngine';
import { getSectorPriceRule } from './data/taxRules';
import { Language, DICTIONARY } from './utils/i18n';
import { generateStrategicReportPDF } from './utils/pdfReportGenerator';
import { MessageCircle, ExternalLink, CheckCircle2, FileText } from 'lucide-react';

export default function App() {
  // Authentication & SaaS Multi-Tenant State
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(() => {
    const saved = localStorage.getItem('tax_reform_user');
    return saved ? JSON.parse(saved) : DEFAULT_SAAS_USERS[0];
  });
  const [companies, setCompanies] = useState<SaaSCompany[]>(DEFAULT_COMPANIES);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    const saved = localStorage.getItem('tax_reform_active_org_id');
    if (saved && DEFAULT_COMPANIES.some(c => c.id === saved)) {
      return saved;
    }
    return DEFAULT_COMPANIES[0].id;
  });

  useEffect(() => {
    localStorage.setItem('tax_reform_active_org_id', currentCompanyId);
  }, [currentCompanyId]);

  // Localization / Multi-language State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt');

  // White-Label Config
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(() => {
    const saved = localStorage.getItem('tax_reform_whitelabel');
    return saved ? JSON.parse(saved) : DEFAULT_WHITE_LABEL_CONFIG;
  });

  // App Navigation & Selected Controls
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [selectedYear, setSelectedYear] = useState<YearPeriod>(2026);
  const [selectedSegment, setSelectedSegment] = useState<EconomicSegment>('Tecnologia / SaaS');
  const [companyData, setCompanyData] = useState<CompanyRegistration>(INITIAL_COMPANY_DATA);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Hierarchical Companies Registry & Economic Groups State
  const [companiesRegistry, setCompaniesRegistry] = useState<CompanyRegistration[]>(() => {
    const saved = localStorage.getItem('tax_reform_companies_registry');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANIES_REGISTRY;
  });
  const [economicGroups, setEconomicGroups] = useState<EconomicGroup[]>(() => {
    const saved = localStorage.getItem('tax_reform_economic_groups');
    return saved ? JSON.parse(saved) : DEFAULT_ECONOMIC_GROUPS;
  });
  const [isCadastroExpanded, setIsCadastroExpanded] = useState<boolean>(false);
  const [cadastroViewMode, setCadastroViewMode] = useState<'lista' | 'novo' | 'cadastro'>('lista');
  const [isDocumentosExpanded, setIsDocumentosExpanded] = useState<boolean>(false);
  const [documentosViewMode, setDocumentosViewMode] = useState<'importar' | 'visualizar'>('importar');

  // Simulations Repository State
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>(() => {
    const saved = localStorage.getItem('tax_reform_simulations');
    return saved ? JSON.parse(saved) : DEFAULT_SAVED_SIMULATIONS;
  });

  // Assessment & Change Management Roadmap State
  const [assessmentSteps, setAssessmentSteps] = useState<AssessmentStep[]>(() => {
    const saved = localStorage.getItem('tax_reform_assessment');
    return saved ? JSON.parse(saved) : DEFAULT_ASSESSMENT_STEPS;
  });

  // Sensitivity Parameters
  const [sensitivityParams, setSensitivityParams] = useState<SensitivityParams>({
    precoVendaAdjPercent: 0,
    custoInsumoAdjPercent: 0,
    repasseTributarioPercent: 100,
    aproveitamentoCreditoInsumosPercent: 100,
    aliqCbsEstimada: 8.8,
    aliqIbsEstimada: 17.7,
    aliqImpostoSeletivoEstimada: 5.0,
    mixProdutos: 'Atual',
    segmento: selectedSegment,
    anoSimulacao: selectedYear,
  });

  // Modals & Drawers Visibility
  const [onboardingTourOpen, setOnboardingTourOpen] = useState<boolean>(() => {
    const dontShow = localStorage.getItem('ebitax_onboarding_dont_show');
    const completed = localStorage.getItem('ebitax_onboarding_completed');
    return !dontShow && !completed;
  });
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [whiteLabelOpen, setWhiteLabelOpen] = useState(false);
  const [savedSimulationsOpen, setSavedSimulationsOpen] = useState(false);
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [selectedItemForDrill, setSelectedItemForDrill] = useState<TaxItem | null>(null);
  const [criteriaDrawerOpen, setCriteriaDrawerOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tax_reform_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tax_reform_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tax_reform_whitelabel', JSON.stringify(whiteLabel));
  }, [whiteLabel]);

  useEffect(() => {
    localStorage.setItem('tax_reform_simulations', JSON.stringify(savedSimulations));
  }, [savedSimulations]);

  useEffect(() => {
    localStorage.setItem('tax_reform_assessment', JSON.stringify(assessmentSteps));
  }, [assessmentSteps]);

  useEffect(() => {
    localStorage.setItem('tax_reform_companies_registry', JSON.stringify(companiesRegistry));
  }, [companiesRegistry]);

  useEffect(() => {
    localStorage.setItem('tax_reform_economic_groups', JSON.stringify(economicGroups));
  }, [economicGroups]);

  // Hierarchical Registration Handlers
  const handleNovoCadastro = () => {
    setActiveTab('cadastro');
    setIsCadastroExpanded(true);
    setCadastroViewMode('novo');
    const targetGroup = economicGroups.length > 0 ? economicGroups[0] : DEFAULT_ECONOMIC_GROUPS[0];
    const blank = createBlankCompanyRegistration(undefined, targetGroup);
    setCompanyData(blank);
  };

  const handleOpenEmpresasCadastradas = () => {
    setActiveTab('cadastro');
    setIsCadastroExpanded(true);
    setCadastroViewMode('lista');
  };

  const handleSelectCompany = (companyId: string) => {
    const found = companiesRegistry.find((c) => c.id === companyId);
    if (found) {
      setCompanyData(found);
      if (found.setor !== selectedSegment) {
        setSelectedSegment(found.setor);
      }
      setCadastroViewMode('cadastro');
    }
  };

  const handleSaveCompany = (company: CompanyRegistration, isNew: boolean) => {
    if (isNew) {
      setCompaniesRegistry((prev) => [company, ...prev]);
      setCompanyData(company);
      setCadastroViewMode('cadastro');
    } else {
      setCompaniesRegistry((prev) =>
        prev.map((c) => (c.id === company.id ? company : c))
      );
      setCompanyData(company);
    }
  };

  const handleAddNewEconomicGroup = (group: EconomicGroup) => {
    setEconomicGroups((prev) => [...prev, group]);
  };

  // Fiscal Documents Navigation Handlers
  const handleImportarDocumentos = () => {
    setActiveTab('importacao');
    setIsDocumentosExpanded(true);
    setDocumentosViewMode('importar');
  };

  const handleVisualizarDocumentos = () => {
    setActiveTab('importacao');
    setIsDocumentosExpanded(true);
    setDocumentosViewMode('visualizar');
  };

  // Current Company Lookup
  const currentCompany = companies.find((c) => c.id === currentCompanyId) || companies[0];

  // Sync year and segment to params
  const currentParams: SensitivityParams = {
    ...sensitivityParams,
    anoSimulacao: selectedYear,
    segmento: selectedSegment,
  };

  // Run calculation engine deterministically
  const engineResult = calculateEngine(currentParams);

  // Auth Handlers
  const handleLoginSuccess = (user: SaaSUser, company?: SaaSCompany) => {
    setCurrentUser(user);
    if (company) {
      setCurrentCompanyId(company.id);
    } else if (user.companyIds && user.companyIds.length > 0) {
      setCurrentCompanyId(user.companyIds[0]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Simulation Handlers
  const handleSaveCurrentSimulation = (nome: string, descricao: string) => {
    const newSim: SavedSimulation = {
      id: `sim_${Date.now()}`,
      nome: nome.trim() || `Simulação ${selectedSegment} (${selectedYear})`,
      descricao: descricao.trim() || `Cenário calculado em ${new Date().toLocaleDateString('pt-BR')}`,
      anoBase: selectedYear,
      segmento: selectedSegment,
      sensitivityParams: { ...currentParams },
      calculatedKPIs: { ...engineResult.kpis },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      autorNome: currentUser?.name || 'Consultor Fiscal',
      companyId: currentCompany.id,
    };

    setSavedSimulations((prev) => [newSim, ...prev]);
  };

  const handleLoadSimulation = (sim: SavedSimulation) => {
    setSelectedYear(sim.anoBase);
    setSelectedSegment(sim.segmento);
    setSensitivityParams(sim.sensitivityParams);
    setActiveTab('executive');
  };

  const handleDeleteSimulation = (id: string) => {
    setSavedSimulations((prev) => prev.filter((s) => s.id !== id));
  };

  // PDF Export Trigger
  const handleExportPDF = () => {
    generateStrategicReportPDF({
      kpis: engineResult.kpis,
      companyData,
      selectedYear,
      sensitivityParams: currentParams,
      savedSimulations,
      assessmentSteps,
      currentLanguage,
      whiteLabel,
    });
  };

  const handleOpenKpiDrillDown = (title: string) => {
    setDrillTitle(`Auditoria e Drill-Down: ${title}`);
    setSelectedItemForDrill(engineResult.items[0] || null);
    setDrillModalOpen(true);
  };

  const handleOpenCalculationMemory = (item: TaxItem) => {
    setDrillTitle(`Memória de Cálculo: Item ${item.produtoCodigo} (NCM ${item.ncm})`);
    setSelectedItemForDrill(item);
    setDrillModalOpen(true);
  };

  // If user is not authenticated, show Enterprise Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        companies={companies}
        whiteLabel={whiteLabel}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
    );
  }

  const t = DICTIONARY[currentLanguage];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#00D280]/20 selection:text-slate-900">
      {/* Navigation (Vertical Sidebar + Top Header Utility Bar) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedYear={selectedYear}
        setSelectedYear={(yr) => {
          setSelectedYear(yr);
          setSensitivityParams((p) => ({ ...p, anoSimulacao: yr }));
        }}
        selectedSegment={selectedSegment}
        setSelectedSegment={(seg) => {
          setSelectedSegment(seg);
          const priceAdj = getSectorPriceRule(seg);
          setSensitivityParams((p) => ({ 
            ...p, 
            segmento: seg, 
            precoVendaAdjPercent: priceAdj 
          }));
        }}
        onOpenValidation={() => setCriteriaDrawerOpen(true)}
        currentUser={currentUser}
        currentCompany={currentCompany}
        companies={companies}
        onSwitchCompany={setCurrentCompanyId}
        onLogout={handleLogout}
        onOpenUserGuide={() => setUserGuideOpen(true)}
        onOpenOnboardingTour={() => setOnboardingTourOpen(true)}
        onOpenWhiteLabel={() => setWhiteLabelOpen(true)}
        onOpenSavedSimulations={() => setSavedSimulationsOpen(true)}
        onExportReportPDF={handleExportPDF}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        whiteLabel={whiteLabel}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isMobileOpen={mobileDrawerOpen}
        setIsMobileOpen={setMobileDrawerOpen}
        isCadastroExpanded={isCadastroExpanded}
        setIsCadastroExpanded={setIsCadastroExpanded}
        onNovoCadastro={handleNovoCadastro}
        onEmpresasCadastradas={handleOpenEmpresasCadastradas}
        isNovoCadastroActive={activeTab === 'cadastro' && cadastroViewMode === 'novo'}
        isDocumentosExpanded={isDocumentosExpanded}
        setIsDocumentosExpanded={setIsDocumentosExpanded}
        onImportarDocumentos={handleImportarDocumentos}
        onVisualizarDocumentos={handleVisualizarDocumentos}
        documentosViewMode={documentosViewMode}
      />

      {/* Main Content Area beside Vertical Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-68'
      }`}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Executive Dashboard */}
          {activeTab === 'executive' && (
            <ExecutiveDashboard
              companyData={companyData}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              onNavigateToDocumentos={handleVisualizarDocumentos}
              onNavigateToCadastro={handleOpenEmpresasCadastradas}
              whiteLabel={whiteLabel}
            />
          )}

          {/* Scenario Comparator */}
          {activeTab === 'comparator' && (
            <ScenarioComparator
              currentKPIs={engineResult.kpis}
              currentParams={currentParams}
              savedSimulations={savedSimulations}
              onSaveSimulation={handleSaveCurrentSimulation}
              onLoadSimulation={handleLoadSimulation}
              selectedYear={selectedYear}
              onExportReportPDF={handleExportPDF}
              currentLanguage={currentLanguage}
            />
          )}

          {/* Client Assessment Roadmap */}
          {activeTab === 'assessment' && (
            <ClientAssessmentRoadmap
              steps={assessmentSteps}
              onUpdateSteps={setAssessmentSteps}
              companyData={companyData}
              selectedYear={selectedYear}
              onExportReportPDF={handleExportPDF}
              currentLanguage={currentLanguage}
            />
          )}

          {/* Fiscal Analytics */}
          {activeTab === 'fiscal' && (
            <FiscalAnalytics
              items={engineResult.items}
              notas={engineResult.notas}
              onOpenCalculationMemory={handleOpenCalculationMemory}
              selectedYear={selectedYear}
            />
          )}

          {/* Operational Analytics (Unidades, Filiais & Princípio do Destino) */}
          {activeTab === 'operational' && (
            <OperationalAnalytics
              items={engineResult.items}
              selectedYear={selectedYear}
            />
          )}

          {/* Financial Analytics */}
          {activeTab === 'financial' && (
            <FinancialAnalytics
              kpis={engineResult.kpis}
              selectedYear={selectedYear}
            />
          )}

          {/* Product Analytics */}
          {activeTab === 'product' && (
            <ProductAnalytics
              produtos={engineResult.produtos}
              selectedYear={selectedYear}
            />
          )}

          {/* Accounting Analytics (DRE & Balanço) */}
          {activeTab === 'accounting' && (
            <AccountingAnalytics
              dreData={engineResult.dreData}
              balancoData={engineResult.balancoData}
              selectedYear={selectedYear}
            />
          )}

          {/* Scenario & Sensitivity Sliders */}
          {activeTab === 'scenario' && (
            <ScenarioAnalytics
              sensitivityParams={currentParams}
              setSensitivityParams={setSensitivityParams}
              kpis={engineResult.kpis}
              selectedYear={selectedYear}
            />
          )}

          {/* Company Registration */}
          {activeTab === 'cadastro' && (
            <CadastroDados
              currentCompany={currentCompany}
              companyData={companyData}
              onUpdateCompanyData={setCompanyData}
              companiesRegistry={companiesRegistry}
              economicGroups={economicGroups}
              onSaveCompany={handleSaveCompany}
              onSelectCompany={handleSelectCompany}
              selectedSegment={selectedSegment}
              onSegmentChange={(newSeg) => {
                setSelectedSegment(newSeg);
                const priceAdj = getSectorPriceRule(newSeg);
                setSensitivityParams((p) => ({
                  ...p,
                  segmento: newSeg,
                  precoVendaAdjPercent: priceAdj,
                }));
              }}
              selectedYear={selectedYear}
              initialViewMode={cadastroViewMode}
              onViewModeChange={setCadastroViewMode}
              onAddNewEconomicGroup={handleAddNewEconomicGroup}
            />
          )}

          {/* Tax Invoices & Fiscal Documents */}
          {activeTab === 'importacao' && documentosViewMode === 'importar' && (
            <ImportacaoFiscal
              companyData={companyData}
              onNavigateToCadastro={() => setActiveTab('cadastro')}
              onNavigateToVisualizar={() => setDocumentosViewMode('visualizar')}
              selectedYear={selectedYear}
              currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : undefined}
              currentOrgId={currentCompanyId}
            />
          )}

          {/* Visualizar Documentos Fiscais */}
          {activeTab === 'importacao' && documentosViewMode === 'visualizar' && (
            <VisualizacaoDocumentos
              companyData={companyData}
              onNavigateToImport={() => setDocumentosViewMode('importar')}
              onNavigateToCadastro={() => setActiveTab('cadastro')}
              selectedYear={selectedYear}
              onYearChange={(yr) => {
                setSelectedYear(yr);
                setSensitivityParams((p) => ({ ...p, anoSimulacao: yr }));
              }}
            />
          )}

          {/* Tax Law & Governance */}
          {activeTab === 'governance' && <Governance />}

          {/* Market Benchmark */}
          {activeTab === 'benchmark' && <MarketBenchmark />}
        </main>

        {/* Enterprise Deloitte/Accenture Grade Clean Footer */}
        <footer className="border-t border-slate-200 bg-slate-900 py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
              {whiteLabel.enabled ? (
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold text-sm">{whiteLabel.brandName}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400">{whiteLabel.partnerName}</span>
                </div>
              ) : (
                <SimuladorReformaLogo variant="dark" size="sm" />
              )}

              <div className="flex items-center gap-4 text-xs">
                <a
                  href="https://wa.me/5511961759438?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20Simulador%20de%20Reforma%20Tribut%C3%A1ria."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00D280] hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Especialista: +55 11 96175-9438</span>
                </a>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                Simulador Tax Reform • Governança & Planejamento Tributário em conformidade com a EC 132/2023 e LC 214/2025
              </span>
              <span className="font-mono text-slate-400">
                Tax Dual Engine Enterprise v4.5 (CBS / IBS / IS / Split Payment)
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating WhatsApp Support Button with Phone +55 11 96175-9438 */}
      <WhatsAppSupport />

      {/* Interactive User Guide & Manual Modal */}
      <UserGuideModal
        isOpen={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
        currentLanguage={currentLanguage}
        onOpenOnboardingTour={() => setOnboardingTourOpen(true)}
      />

      {/* Interactive Onboarding Tour Stepper Modal (4 Logical Stages) */}
      <OnboardingTourModal
        isOpen={onboardingTourOpen}
        onClose={() => setOnboardingTourOpen(false)}
        onNavigateToTab={(tabId) => setActiveTab(tabId)}
        currentLanguage={currentLanguage}
        onExportReportPDF={handleExportPDF}
      />

      {/* White-Label Customization Modal */}
      <WhiteLabelSettingsModal
        isOpen={whiteLabelOpen}
        onClose={() => setWhiteLabelOpen(false)}
        config={whiteLabel}
        onSaveConfig={setWhiteLabel}
      />

      {/* Saved Simulations Repository Modal */}
      <SavedSimulationsModal
        isOpen={savedSimulationsOpen}
        onClose={() => setSavedSimulationsOpen(false)}
        savedSimulations={savedSimulations}
        onLoadSimulation={handleLoadSimulation}
        onDeleteSimulation={handleDeleteSimulation}
      />

      {/* KPI Drill Down / Calculation Memory Modal */}
      <DrillDownModal
        isOpen={drillModalOpen}
        onClose={() => setDrillModalOpen(false)}
        title={drillTitle}
        item={selectedItemForDrill}
        selectedYear={selectedYear}
      />

      {/* Acceptance Criteria Validation Drawer */}
      <AcceptanceCriteriaDrawer
        isOpen={criteriaDrawerOpen}
        onClose={() => setCriteriaDrawerOpen(false)}
      />
    </div>
  );
}
