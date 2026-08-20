import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Database, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw, 
  Save, 
  Sliders, 
  Info, 
  Layers, 
  ExternalLink,
  MapPin,
  Tag,
  Briefcase,
  TrendingUp,
  Percent,
  FileSpreadsheet,
  FileCheck2,
  Lock,
  Search,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Layers2
} from 'lucide-react';
import { EconomicSegment, YearPeriod } from '../types/tax';
import { SaaSCompany } from '../types/auth';
import { 
  CompanyRegistration, 
  RegimeTributario, 
  RegimeApuracao, 
  TipoEstabelecimento, 
  TipoOperacao, 
  PerfilMercado,
  DataGovernanceAudit,
  EconomicGroup,
  FilialInfo,
  DEFAULT_ECONOMIC_GROUPS,
  createBlankCompanyRegistration
} from '../types/company';
import { SECTOR_PRESETS } from '../data/sectorPresets';

export interface CadastroDadosProps {
  currentCompany?: SaaSCompany;
  companyData: CompanyRegistration;
  onUpdateCompanyData: (newData: CompanyRegistration) => void;
  companiesRegistry?: CompanyRegistration[];
  economicGroups?: EconomicGroup[];
  onSaveCompany?: (company: CompanyRegistration, isNew: boolean) => void;
  onSelectCompany?: (companyId: string) => void;
  onDeleteCompany?: (companyId: string) => void;
  selectedSegment: EconomicSegment;
  onSegmentChange: (newSegment: EconomicSegment) => void;
  selectedYear: YearPeriod;
  initialViewMode?: 'lista' | 'novo' | 'cadastro';
  onViewModeChange?: (mode: 'lista' | 'novo' | 'cadastro') => void;
  onAddNewEconomicGroup?: (group: EconomicGroup) => void;
}

export const CadastroDados: React.FC<CadastroDadosProps> = ({
  currentCompany,
  companyData,
  onUpdateCompanyData,
  companiesRegistry = [],
  economicGroups = DEFAULT_ECONOMIC_GROUPS,
  onSaveCompany,
  onSelectCompany,
  onDeleteCompany,
  selectedSegment,
  onSegmentChange,
  selectedYear,
  initialViewMode = 'lista',
  onViewModeChange,
  onAddNewEconomicGroup,
}) => {
  // Active Administrating Organization
  const currentOrgId = currentCompany?.id || 'org_master';
  const currentOrgName = currentCompany?.name || (
    currentOrgId === 'org_master'
      ? 'Administrador S/A'
      : currentOrgId === 'org_equality'
        ? 'Equality Tech S/A'
        : 'EBITax Tech S/A'
  );

  // Filter economic groups: If master (Administrador S/A), allow consolidated access to all groups
  const activeEconomicGroups = economicGroups.filter((g) => {
    if (currentOrgId === 'org_master') {
      return true; // Consolidated access to all economic groups
    }
    if (currentOrgId === 'org_equality') {
      return g.organizacaoAdministradoraId === 'org_equality' || g.id === 'grp_novera' || g.id === 'grp_vertice';
    } else if (currentOrgId === 'org_ebitax') {
      return g.organizacaoAdministradoraId === 'org_ebitax' || g.id === 'grp_ebitax';
    }
    return g.organizacaoAdministradoraId === currentOrgId;
  });

  // Navigation & View Modes: 'lista' (Hierarquia & Lista) vs 'cadastro' (4 Abas do Cadastro)
  const [viewMode, setViewMode] = useState<'lista' | 'cadastro'>(
    initialViewMode === 'novo' || initialViewMode === 'cadastro' ? 'cadastro' : 'lista'
  );
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(initialViewMode === 'novo');
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'fiscais' | 'economicos' | 'governanca'>('geral');
  const [formData, setFormData] = useState<CompanyRegistration>(() => {
    if (initialViewMode === 'novo') {
      return createBlankCompanyRegistration(undefined, undefined, { id: currentOrgId, name: currentOrgName });
    }
    return companyData;
  });
  const [selectedFilial, setSelectedFilial] = useState<FilialInfo | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState<string>('');
  const [presetAppliedAlert, setPresetAppliedAlert] = useState<string | null>(null);

  // Group expansion state for Hierarchical Table (default: collapsed)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Search & List UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Filial Modal / Inline creation
  const [showAddFilialModal, setShowAddFilialModal] = useState(false);
  const [newFilialName, setNewFilialName] = useState('');
  const [newFilialCnpj, setNewFilialCnpj] = useState('');
  const [newFilialUf, setNewFilialUf] = useState('SP');
  const [newFilialMunicipio, setNewFilialMunicipio] = useState('');

  // Sync if external initialViewMode or companyData changes
  useEffect(() => {
    if (initialViewMode === 'novo') {
      const blank = createBlankCompanyRegistration(
        undefined, 
        undefined, 
        { id: currentOrgId, name: currentOrgName }
      );
      setFormData(blank);
      setSelectedFilial(null);
      setIsCreatingNew(true);
      setViewMode('cadastro');
      setActiveSubTab('geral');
      setHasUnsavedChanges(false);
    } else if (initialViewMode === 'cadastro') {
      setViewMode('cadastro');
      setIsCreatingNew(false);
      setFormData(companyData);
    } else if (initialViewMode === 'lista') {
      setViewMode('lista');
      setIsCreatingNew(false);
    }
  }, [initialViewMode, currentOrgId]);

  // Current sector preset
  const currentPreset = SECTOR_PRESETS[formData.setor] || SECTOR_PRESETS['Tecnologia / SaaS'];

  // Handle Sector Change (Preset as driver)
  const handleSectorChange = (newSector: EconomicSegment) => {
    const preset = SECTOR_PRESETS[newSector];
    if (!preset) return;

    const updatedFormData: CompanyRegistration = {
      ...formData,
      setor: newSector,
      subsegmento: preset.subsegmentoPadrao,
      cnaePrincipal: preset.cnaePadrao,
      cnaeDescricao: preset.cnaeDescricao,
      tipoOperacao: preset.tipoOperacaoPadrao,
      perfilMercado: preset.perfilMercadoPadrao,
      dadosFiscais: {
        ...formData.dadosFiscais,
        ncmPrincipal: preset.ncmOuNbsLabel.includes('NCM') ? preset.codigoFiscalPrincipal : formData.dadosFiscais.ncmPrincipal,
        nbsPrincipal: preset.ncmOuNbsLabel.includes('NBS') ? preset.codigoFiscalPrincipal : formData.dadosFiscais.nbsPrincipal,
        cfopPrincipal: preset.cfopPrincipal,
        cstPrincipal: preset.cstPrincipal,
        beneficioFiscal: preset.beneficioFiscalSugerido,
        regimeEspecial: preset.regimeEspecialSugerido,
        camposDinamicosSetor: preset.camposDinamicos.reduce((acc, field) => {
          acc[field.chave] = field.valorPadrao;
          return acc;
        }, {} as Record<string, any>),
      },
      dadosEconomicos: {
        ...formData.dadosEconomicos,
        ...preset.premissasEconomicasSugeridas,
      },
      auditoriaCampos: {
        ...formData.auditoriaCampos,
        setor: {
          campo: 'Setor de Atuação',
          origem: 'Preset de Setor',
          dataAtualizacao: new Date().toISOString().split('T')[0],
          statusValidacao: 'Auditoria Aprovada',
          fonte: `Preset Setorial Automatizado: ${newSector}`,
          premissaUtilizada: `Parâmetros econômicos e fiscais direcionados para ${preset.subsegmentoPadrao}`,
          confiabilidade: 'Alta (100%)',
        }
      }
    };

    setFormData(updatedFormData);
    setHasUnsavedChanges(true);
    setPresetAppliedAlert(`Preset do setor "${newSector}" carregado com sucesso!`);
    setTimeout(() => setPresetAppliedAlert(null), 5000);
  };

  // Start a new company registration (Ajuste 1: Totalmente limpo)
  const handleStartNovoCadastro = (defaultGroup?: EconomicGroup) => {
    const blank = createBlankCompanyRegistration(
      undefined, 
      defaultGroup, 
      { id: currentOrgId, name: currentOrgName }
    );
    setFormData(blank);
    setSelectedFilial(null);
    setIsCreatingNew(true);
    setViewMode('cadastro');
    setActiveSubTab('geral');
    setHasUnsavedChanges(false);
    onViewModeChange?.('novo');
  };

  // Open an existing company for editing
  const handleOpenExistingCompany = (company: CompanyRegistration, filial?: FilialInfo) => {
    setFormData(company);
    setSelectedFilial(filial || null);
    setIsCreatingNew(false);
    setViewMode('cadastro');
    setActiveSubTab('geral');
    setHasUnsavedChanges(false);
    if (onSelectCompany) {
      onSelectCompany(company.id);
    } else {
      onUpdateCompanyData(company);
    }
    if (company.setor && company.setor !== selectedSegment) {
      onSegmentChange(company.setor);
    }
    onViewModeChange?.('cadastro');
  };

  // Save changes (creates a new record if isCreatingNew, updates existing if not)
  const handleSaveAndPropagate = () => {
    let companyToSave = { ...formData };
    
    // Maintain organization context
    if (!companyToSave.organizacaoAdministradoraId) {
      companyToSave.organizacaoAdministradoraId = currentOrgId;
      companyToSave.organizacaoAdministradoraNome = currentOrgName;
    }

    // If no corporate name provided yet, set a default
    if (!companyToSave.razaoSocial.trim()) {
      companyToSave.razaoSocial = companyToSave.nomeFantasia.trim() || 'Nova Empresa Cadastrada S.A.';
    }
    if (!companyToSave.nomeFantasia.trim()) {
      companyToSave.nomeFantasia = companyToSave.razaoSocial;
    }
    if (!companyToSave.cnpj.trim()) {
      companyToSave.cnpj = `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`;
    }

    // Ensure group name is synced
    const grp = activeEconomicGroups.find(g => g.id === companyToSave.grupoEconomicoId);
    if (grp) {
      companyToSave.grupoEconomicoNome = grp.nome;
    }

    if (onSaveCompany) {
      onSaveCompany(companyToSave, isCreatingNew);
    } else {
      onUpdateCompanyData(companyToSave);
    }

    if (companyToSave.setor && companyToSave.setor !== selectedSegment) {
      onSegmentChange(companyToSave.setor);
    }

    setFormData(companyToSave);
    setIsCreatingNew(false);
    setHasUnsavedChanges(false);
    setSaveToastMessage('✓ Alterações salvas com sucesso.');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4500);
  };

  // Add a filial to current form data
  const handleAddFilialToMatriz = () => {
    if (!newFilialName.trim()) return;
    const filial: FilialInfo = {
      id: `fil_${Date.now()}`,
      nome: newFilialName.trim(),
      cnpj: newFilialCnpj.trim() || `${formData.cnpj.slice(0, 10)}0002-${Math.floor(10 + Math.random() * 89)}`,
      uf: newFilialUf,
      municipio: newFilialMunicipio.trim() || 'São Paulo',
      tipoEstabelecimento: 'Filial',
    };

    const updatedFiliais = [...(formData.filiais || []), filial];
    setFormData({
      ...formData,
      filiais: updatedFiliais,
    });
    setHasUnsavedChanges(true);
    setNewFilialName('');
    setNewFilialCnpj('');
    setNewFilialMunicipio('');
    setShowAddFilialModal(false);
  };

  // Remove a filial from current form data
  const handleRemoveFilial = (filialId: string) => {
    const updatedFiliais = (formData.filiais || []).filter(f => f.id !== filialId);
    setFormData({
      ...formData,
      filiais: updatedFiliais,
    });
    setHasUnsavedChanges(true);
  };

  // Create a new Economic Group inline
  const handleCreateEconomicGroup = () => {
    if (!newGroupNameInput.trim()) return;
    const newGroup: EconomicGroup = {
      id: `grp_${Date.now()}`,
      nome: newGroupNameInput.trim(),
      codigo: `GRP-00${economicGroups.length + 1}`,
      descricao: `Grupo Econômico Corporativo ${newGroupNameInput.trim()}`,
      organizacaoAdministradoraId: currentOrgId,
    };

    if (onAddNewEconomicGroup) {
      onAddNewEconomicGroup(newGroup);
    }
    setFormData({
      ...formData,
      grupoEconomicoId: newGroup.id,
      grupoEconomicoNome: newGroup.nome,
    });
    setHasUnsavedChanges(true);
    setNewGroupNameInput('');
    setShowAddGroupModal(false);
  };

  // Filtered companies in hierarchical view - scoped by currentOrgId and activeEconomicGroups
  const filteredCompanies = companiesRegistry.filter((comp) => {
    // If master organization (Administrador S/A), allow consolidated access to all companies
    if (currentOrgId !== 'org_master') {
      // Check if company belongs to the active organization or its groups
      const matchesOrg = 
        comp.organizacaoAdministradoraId === currentOrgId ||
        activeEconomicGroups.some(g => g.id === comp.grupoEconomicoId || g.nome === comp.grupoEconomicoNome);

      if (!matchesOrg) return false;
    }

    const matchesSearch = 
      comp.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.cnpj.includes(searchTerm) ||
      (comp.grupoEconomicoNome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.setor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.uf || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.filiais || []).some(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || f.cnpj.includes(searchTerm));

    const matchesGroup = 
      selectedGroupFilter === 'all' || comp.grupoEconomicoId === selectedGroupFilter;

    return matchesSearch && matchesGroup;
  });

  // Helper formatting currency
  const formatRS = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* VISTA 1: ESTRUTURA HIERÁRQUICA & LISTA DE EMPRESAS (Grupos -> Matrizes -> Filiais) */}
      {/* ========================================================================= */}
      {viewMode === 'lista' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-slate-900 text-white rounded-xl">
                  <Building2 className="w-6 h-6 text-[#00D280]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                      Empresas Cadastradas
                    </h1>
                    <span className="text-[10px] font-bold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2 py-0.5 rounded-md">
                      Ano-Base: {selectedYear}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                      currentOrgId === 'org_master'
                        ? 'bg-slate-900 text-[#00D280] border-slate-700 font-mono'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {currentOrgName} {currentOrgId === 'org_master' ? '• Visão Master Consolidada' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                    Visualize o empilhamento organizacional dos grupos econômicos, matrizes e filiais.
                  </p>
                </div>
              </div>

              {/* Botão de Ação em Destaque: Novo Cadastro */}
              <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
                <button
                  onClick={() => handleStartNovoCadastro()}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#00D280] hover:bg-[#00ba70] text-slate-950 text-xs font-black rounded-xl shadow-md shadow-[#00D280]/20 transition-all cursor-pointer hover:scale-[1.02]"
                  title="Criar Novo Cadastro de Empresa"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>+ Novo Cadastro</span>
                </button>
              </div>
            </div>

            {/* Save Toast */}
            {saveToast && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-900 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#00D280] flex-shrink-0" />
                <span className="font-semibold">{saveToastMessage}</span>
              </div>
            )}

            {/* Search and Filters Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por grupo, matriz, filial, CNPJ ou UF..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D280]/30 focus:border-[#00D280]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Grupo:</span>
                <select
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                >
                  <option value="all">Todos os Grupos ({activeEconomicGroups.length})</option>
                  {activeEconomicGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABELA DE EMPRESAS CADASTRADAS (EMPILHAMENTO HIERÁRQUICO) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold border-b border-slate-800">Grupo Econômico</th>
                    <th className="py-3.5 px-4 font-bold border-b border-slate-800">Matriz</th>
                    <th className="py-3.5 px-4 font-bold border-b border-slate-800">Filial</th>
                    <th className="py-3.5 px-4 font-bold border-b border-slate-800">Status</th>
                    <th className="py-3.5 px-4 font-bold border-b border-slate-800 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeEconomicGroups
                    .filter(group => selectedGroupFilter === 'all' || selectedGroupFilter === group.id)
                    .map((group) => {
                      const isExpanded = !!expandedGroups[group.id];
                      const groupCompanies = filteredCompanies.filter(
                        c => c.grupoEconomicoId === group.id || c.grupoEconomicoNome === group.nome
                      );

                      if (selectedGroupFilter !== 'all' && groupCompanies.length === 0 && searchTerm) {
                        return null;
                      }

                      const totalMatrizes = groupCompanies.filter(c => c.tipoEstabelecimento === 'Matriz').length || (groupCompanies.length > 0 ? groupCompanies.length : 0);
                      const totalFiliais = groupCompanies.reduce((acc, c) => acc + (c.filiais?.length || 0), 0);

                      return (
                        <React.Fragment key={group.id}>
                          {/* ESTADO RECOLHIDO: UMA ÚNICA LINHA COM CONTADORES E DISCRETO DIVISOR */}
                          {!isExpanded ? (
                            <tr 
                              onClick={() => toggleGroupExpand(group.id)}
                              className="hover:bg-slate-50/80 cursor-pointer transition-colors border-b-2 border-slate-200"
                            >
                              {/* Coluna 1: Grupo Econômico com chevron › */}
                              <td className="py-4 px-4 font-bold text-slate-900">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500 font-black text-base select-none">›</span>
                                  <span className="text-sm font-black text-slate-900">{group.nome}</span>
                                  {group.codigo && (
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                      {group.codigo}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Coluna 2: Matriz (Resumo) */}
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold text-slate-800">
                                  {totalMatrizes} {totalMatrizes === 1 ? 'matriz' : 'matrizes'}
                                </span>
                              </td>

                              {/* Coluna 3: Filial (Resumo) */}
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold text-slate-800">
                                  {totalFiliais} {totalFiliais === 1 ? 'filial' : 'filiais'}
                                </span>
                              </td>

                              {/* Coluna 4: Status */}
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Ativa
                                </span>
                              </td>

                              {/* Coluna 5: Ações */}
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupExpand(group.id);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <span>Expandir</span>
                                  <span className="font-black text-sm">›</span>
                                </button>
                              </td>
                            </tr>
                          ) : (
                            /* ESTADO EXPANDIDO: CABEÇALHO DO GRUPO (⌄) E LINHAS DAS MATRIZES E FILIAIS */
                            <>
                              <tr className="bg-slate-100/90 border-b border-slate-200">
                                <td colSpan={5} className="py-3 px-4">
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => toggleGroupExpand(group.id)}
                                      className="flex items-center space-x-2 text-left cursor-pointer group"
                                    >
                                      <span className="text-[#00D280] font-black text-base select-none">⌄</span>
                                      <span className="text-sm font-black text-slate-900">{group.nome}</span>
                                      <span className="text-xs font-bold text-slate-500">
                                        ({totalMatrizes} {totalMatrizes === 1 ? 'matriz' : 'matrizes'} &bull; {totalFiliais} {totalFiliais === 1 ? 'filial' : 'filiais'})
                                      </span>
                                    </button>

                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleStartNovoCadastro(group)}
                                        className="text-xs font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-[#00D280]" />
                                        <span>+ Nova Empresa no Grupo</span>
                                      </button>
                                      <button
                                        onClick={() => toggleGroupExpand(group.id)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
                                      >
                                        Recolher ✕
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>

                              {/* Linhas das Matrizes & Filiais pertencentes ao grupo */}
                              {groupCompanies.length === 0 ? (
                                <tr className="border-b-2 border-slate-200">
                                  <td colSpan={5} className="py-6 px-4 text-center text-slate-500 italic bg-slate-50/50">
                                    Nenhuma empresa cadastrada neste grupo econômico.{' '}
                                    <button
                                      onClick={() => handleStartNovoCadastro(group)}
                                      className="text-[#00D280] font-bold hover:underline ml-1 cursor-pointer"
                                    >
                                      + Cadastrar Matriz
                                    </button>
                                  </td>
                                </tr>
                              ) : (
                                groupCompanies.map((matriz) => {
                                  const hasFiliais = (matriz.filiais || []).length > 0;

                                  if (hasFiliais) {
                                    return (
                                      <React.Fragment key={matriz.id}>
                                        {matriz.filiais!.map((filial) => (
                                          <tr
                                            key={`${matriz.id}_${filial.id}`}
                                            onClick={() => handleOpenExistingCompany(matriz, filial)}
                                            className="border-b border-slate-100 hover:bg-emerald-50/40 cursor-pointer transition-colors"
                                          >
                                            {/* Coluna 1: Grupo Econômico (indentação em árvore) */}
                                            <td className="py-3 px-4 pl-8 text-xs text-slate-500">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-slate-300 font-mono">├──</span>
                                                <span className="font-semibold text-slate-600">{group.nome}</span>
                                              </div>
                                            </td>

                                            {/* Coluna 2: Matriz */}
                                            <td className="py-3 px-4 text-xs font-bold text-slate-900">
                                              <div className="flex items-center space-x-2">
                                                <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                                <span>{matriz.nomeFantasia || matriz.razaoSocial}</span>
                                              </div>
                                              <span className="text-[10px] text-slate-400 font-mono block pl-5.5">
                                                CNPJ: {matriz.cnpj}
                                              </span>
                                            </td>

                                            {/* Coluna 3: Filial */}
                                            <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 font-mono text-xs">└──</span>
                                                <span className="font-bold text-slate-900">{filial.nome}</span>
                                              </div>
                                              <span className="text-[10px] text-slate-500 font-mono block pl-5">
                                                {filial.cnpj} &bull; {filial.municipio}-{filial.uf}
                                              </span>
                                            </td>

                                            {/* Coluna 4: Status */}
                                            <td className="py-3 px-4">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Ativa
                                              </span>
                                            </td>

                                            {/* Coluna 5: Ações */}
                                            <td className="py-3 px-4 text-right">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenExistingCompany(matriz, filial);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1"
                                              >
                                                <span>Abrir Cadastro</span>
                                                <ArrowRight className="w-3 h-3 text-[#00D280]" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </React.Fragment>
                                    );
                                  } else {
                                    // Matriz sem filiais (Matriz Principal)
                                    return (
                                      <tr
                                        key={matriz.id}
                                        onClick={() => handleOpenExistingCompany(matriz)}
                                        className="border-b border-slate-100 hover:bg-emerald-50/40 cursor-pointer transition-colors"
                                      >
                                        {/* Coluna 1: Grupo Econômico */}
                                        <td className="py-3 px-4 pl-8 text-xs text-slate-500">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-slate-300 font-mono">├──</span>
                                            <span className="font-semibold text-slate-600">{group.nome}</span>
                                          </div>
                                        </td>

                                        {/* Coluna 2: Matriz */}
                                        <td className="py-3 px-4 text-xs font-bold text-slate-900">
                                          <div className="flex items-center space-x-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                            <span>{matriz.nomeFantasia || matriz.razaoSocial}</span>
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-mono block pl-5.5">
                                            CNPJ: {matriz.cnpj}
                                          </span>
                                        </td>

                                        {/* Coluna 3: Filial (Matriz Principal) */}
                                        <td className="py-3 px-4 text-xs text-slate-600">
                                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                            Matriz Principal
                                          </span>
                                        </td>

                                        {/* Coluna 4: Status */}
                                        <td className="py-3 px-4">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Ativa
                                          </span>
                                        </td>

                                        {/* Coluna 5: Ações */}
                                        <td className="py-3 px-4 text-right">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenExistingCompany(matriz);
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1"
                                          >
                                            <span>Abrir Cadastro</span>
                                            <ArrowRight className="w-3 h-3 text-[#00D280]" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  }
                                })
                              )}

                              {/* Linha divisória horizontal discreta entre os grupos */}
                              <tr className="border-b-2 border-slate-200">
                                <td colSpan={5} className="py-0 h-0" />
                              </tr>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: TELA DE CADASTRO DA EMPRESA COM AS 4 ABAS HABILITADAS            */}
      {/* ========================================================================= */}
      {viewMode === 'cadastro' && (
        <div className="space-y-6">
          {/* Header Context Banner with Back Button & Hierarchy Identification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                      {isCreatingNew ? 'Novo Cadastro de Empresa' : `Cadastro da Empresa: ${formData.nomeFantasia || formData.razaoSocial}`}
                    </h1>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      isCreatingNew
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {isCreatingNew ? 'Novo Registro em Criação' : 'Registro Ativo & Editável'}
                    </span>
                    <span className="text-[10px] font-bold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2 py-0.5 rounded-md">
                      Ano-Base: {selectedYear}
                    </span>
                  </div>
                  
                  {/* Identificação Hierárquica no Topo: Organização Administradora → Grupo Econômico → Matriz → Filial */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 mt-2.5 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold">Organização Administradora:</span>{' '}
                      <strong className="text-slate-900">{currentOrgName}</strong>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <div>
                      <span className="text-slate-400 font-bold">Grupo Econômico:</span>{' '}
                      <strong className="text-slate-900">{formData.grupoEconomicoNome || (isCreatingNew ? 'A selecionar' : 'Grupo Novera')}</strong>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <div>
                      <span className="text-slate-400 font-bold">Matriz:</span>{' '}
                      <strong className="text-slate-900">{formData.razaoSocial || formData.nomeFantasia || (isCreatingNew ? 'A definir' : 'Matriz Principal')}</strong>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <div>
                      <span className="text-slate-400 font-bold">Filial:</span>{' '}
                      <strong className="text-slate-900">{selectedFilial ? selectedFilial.nome : (formData.tipoEstabelecimento === 'Filial' ? (formData.nomeFantasia || 'Filial Operacional') : (isCreatingNew ? 'A definir' : 'Matriz Principal'))}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Voltar e Salvar */}
              <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end">
                <button
                  onClick={() => {
                    setViewMode('lista');
                    onViewModeChange?.('lista');
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  title="Retornar para Empresas Cadastradas"
                >
                  <span>← Voltar</span>
                </button>

                <button
                  onClick={handleSaveAndPropagate}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                    hasUnsavedChanges || isCreatingNew
                      ? 'bg-[#00D280] hover:bg-[#00ba70] text-slate-950 font-black shadow-md shadow-[#00D280]/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Save className={`w-4 h-4 ${hasUnsavedChanges || isCreatingNew ? 'text-slate-950' : 'text-[#00D280]'}`} />
                  <span>{isCreatingNew ? 'Salvar Cadastro' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>

            {/* Preset Alert Toast */}
            {presetAppliedAlert && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#00D280]" />
                  <span>{presetAppliedAlert} Premissas de CNAE, NCM/NBS, impostos e custos foram atualizadas.</span>
                </div>
                <button onClick={() => setPresetAppliedAlert(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">
                  ✕
                </button>
              </div>
            )}

            {/* Save Confirmation Toast */}
            {saveToast && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-900 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#00D280] flex-shrink-0" />
                <span>{saveToastMessage || 'Premissas atualizadas com sucesso! Toda a plataforma e cálculos foram sincronizados.'}</span>
              </div>
            )}

            {/* Governance Quick Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Razão Social Ativa</div>
                <div className="text-xs font-bold text-slate-900 truncate mt-0.5">{formData.razaoSocial || 'Novo Registro'}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{formData.cnpj || 'CNPJ a definir'} &bull; {formData.tipoEstabelecimento} ({formData.uf})</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Regime & Enquadramento</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{formData.regimeTributario}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{formData.regimeApuracao} &bull; {formData.tipoOperacao}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Setor Direcionador</div>
                <div className="text-xs font-bold text-slate-900 truncate mt-0.5">{formData.setor}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{formData.subsegmento}</div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                <div className="text-[10px] text-[#059669] uppercase font-bold tracking-wider">Grupo & Governança</div>
                <div className="flex items-center space-x-1 text-xs font-bold text-emerald-800 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00D280]" />
                  <span className="truncate">{formData.grupoEconomicoNome || 'Grupo Novera'}</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Auditoria & Rastreabilidade Ativas</div>
              </div>
            </div>
          </div>

          {/* AS 4 ABAS HABILITADAS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveSubTab('geral')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'geral'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#00D280]" />
              <span>1. Cadastro Inicial & Perfil</span>
            </button>

            <button
              onClick={() => setActiveSubTab('fiscais')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'fiscais'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-[#00D280]" />
              <span>2. Parâmetros Fiscais Setoriais</span>
            </button>

            <button
              onClick={() => setActiveSubTab('economicos')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'economicos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4 text-[#00D280]" />
              <span>3. Premissas Econômicas & Volume</span>
            </button>

            <button
              onClick={() => setActiveSubTab('governanca')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'governanca'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#00D280]" />
              <span>4. Governança, Auditoria & Importação</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: CADASTRO INICIAL ENXUTO & PERFIL CORPORATIVO                      */}
          {/* ========================================================================= */}
          {activeSubTab === 'geral' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 font-sans">
                      <Building2 className="w-4 h-4 text-[#00D280]" />
                      <span>Identificação, Grupo Econômico & Estrutura Empresarial</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dados corporativos essenciais utilizados como âncora cadastral para a apuração de IBS, CBS e Split Payment.
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-semibold self-start sm:self-auto">
                    Campos Obrigatórios
                  </span>
                </div>

                {/* Grupo Econômico & Associação */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#00D280]" />
                      <span>Grupo Econômico Vinculado</span>
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.grupoEconomicoId || ''}
                        onChange={(e) => {
                          const grp = economicGroups.find(g => g.id === e.target.value);
                          setFormData({
                            ...formData,
                            grupoEconomicoId: e.target.value,
                            grupoEconomicoNome: grp?.nome || formData.grupoEconomicoNome,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      >
                        {economicGroups.map((g) => (
                          <option key={g.id} value={g.id}>{g.nome} ({g.codigo || 'GRP'})</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowAddGroupModal(true)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        + Novo Grupo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Tipo de Estabelecimento</label>
                    <select
                      value={formData.tipoEstabelecimento}
                      onChange={(e) => {
                        setFormData({ ...formData, tipoEstabelecimento: e.target.value as TipoEstabelecimento });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    >
                      <option value="Matriz">🏢 Empresa Matriz</option>
                      <option value="Filial">🏬 Filial Operacional</option>
                    </select>
                  </div>
                </div>

                {/* Razão Social, Fantasia e CNPJ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Razão Social */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Razão Social</label>
                    <input
                      type="text"
                      value={formData.razaoSocial}
                      onChange={(e) => {
                        setFormData({ ...formData, razaoSocial: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: Novera Indústria S.A."
                    />
                  </div>

                  {/* Nome Fantasia */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nome Fantasia / Marca</label>
                    <input
                      type="text"
                      value={formData.nomeFantasia}
                      onChange={(e) => {
                        setFormData({ ...formData, nomeFantasia: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: Novera Indústria"
                    />
                  </div>

                  {/* CNPJ */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CNPJ</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => {
                        setFormData({ ...formData, cnpj: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  {/* UF */}
                  <div className="grid grid-cols-2 gap-2 md:col-span-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">UF</label>
                      <select
                        value={formData.uf}
                        onChange={(e) => {
                          setFormData({ ...formData, uf: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280] font-mono"
                      >
                        {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'AM', 'PA', 'ES', 'MT', 'MS'].map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Município</label>
                      <input
                        type="text"
                        value={formData.municipio}
                        onChange={(e) => {
                          setFormData({ ...formData, municipio: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>
                </div>

                {/* Gestão de Filiais (se Matriz) */}
                {formData.tipoEstabelecimento === 'Matriz' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-4 h-4 text-[#00D280]" />
                        <span className="text-xs font-bold text-slate-900">Filiais Vinculadas à Matriz ({formData.filiais?.length || 0})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddFilialModal(true)}
                        className="px-3 py-1.5 text-xs font-bold bg-[#00D280] text-slate-950 rounded-lg hover:bg-[#00ba70] transition-all cursor-pointer"
                      >
                        + Adicionar Filial
                      </button>
                    </div>

                    {(formData.filiais || []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Nenhuma filial vinculada ainda. Clique em "+ Adicionar Filial" para cadastrar filiais operacionais.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {formData.filiais!.map((filial) => (
                          <div key={filial.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-slate-800">{filial.nome}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {filial.cnpj} &bull; {filial.municipio} - {filial.uf}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFilial(filial.id)}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              title="Remover Filial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Regime Tributário & Apuração */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Regime Tributário</label>
                    <select
                      value={formData.regimeTributario}
                      onChange={(e) => {
                        const reg = e.target.value as RegimeTributario;
                        setFormData({ 
                          ...formData, 
                          regimeTributario: reg,
                          regimeApuracao: reg === 'Lucro Real' ? 'Não-Cumulativo' : reg === 'Lucro Presumido' ? 'Cumulativo' : 'Simples'
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    >
                      <option value="Lucro Real">Lucro Real</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                    </select>
                    <span className="text-[10px] text-slate-500">
                      {formData.regimeTributario === 'Lucro Real' ? 'Créditos plenos e apuração direta' : 'Incidência presumida com transição CBS/IBS'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Regime de Apuração PIS/COFINS</label>
                    <select
                      value={formData.regimeApuracao}
                      onChange={(e) => {
                        setFormData({ ...formData, regimeApuracao: e.target.value as RegimeApuracao });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    >
                      <option value="Não-Cumulativo">Não-Cumulativo (Alíquotas 1,65% / 7,60%)</option>
                      <option value="Cumulativo">Cumulativo (Alíquotas 0,65% / 3,00%)</option>
                      <option value="Misto">Misto</option>
                      <option value="Simples">Simples Nacional (Regime Único)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">Extinção integral prevista para 2027 com a CBS plena</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CNAE Principal</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.cnaePrincipal}
                        onChange={(e) => {
                          setFormData({ ...formData, cnaePrincipal: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="0000-0/00"
                      />
                      <input
                        type="text"
                        value={formData.cnaeDescricao}
                        onChange={(e) => {
                          setFormData({ ...formData, cnaeDescricao: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Descrição da atividade econômica"
                      />
                    </div>
                  </div>
                </div>

                {/* Setor Preset Driver + Segmento + Operação */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
                  {/* Setor Preset Driver */}
                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00D280]" />
                        <span>Setor (Preset Direcionador)</span>
                      </label>
                      <span className="text-[10px] bg-white text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Modelagem Ativa
                      </span>
                    </div>
                    <select
                      value={formData.setor}
                      onChange={(e) => handleSectorChange(e.target.value as EconomicSegment)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280] cursor-pointer"
                    >
                      {Object.keys(SECTOR_PRESETS).map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      O setor atua como DIRECIONADOR: carrega apenas as premissas, códigos fiscais e regras específicas deste segmento.
                    </p>
                  </div>

                  {/* Subsegmento */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Subsegmento de Atuação</label>
                    <select
                      value={formData.subsegmento}
                      onChange={(e) => {
                        setFormData({ ...formData, subsegmento: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    >
                      {currentPreset.subsegmentosDisponiveis.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500">Especialização para determinação das regras da LC 214/2025</span>
                  </div>

                  {/* Tipo de Operação */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Tipo de Operação</label>
                    <select
                      value={formData.tipoOperacao}
                      onChange={(e) => {
                        setFormData({ ...formData, tipoOperacao: e.target.value as TipoOperacao });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    >
                      <option value="Produtos">Produtos / Mercadorias (NCM / NF-e)</option>
                      <option value="Serviços">Serviços (NBS / NFS-e)</option>
                      <option value="Produtos e Serviços">Produtos e Serviços (Operações Mistas)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">Determina a exibição condicional de NCM e NBS</span>
                  </div>
                </div>

                {/* Perfil de Mercado & Escopo de Operações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Perfil de Mercado</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['B2B', 'B2C', 'Ambos (B2B + B2C)'] as PerfilMercado[]).map((perfil) => (
                        <button
                          key={perfil}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, perfilMercado: perfil });
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            formData.perfilMercado === perfil
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {perfil}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {formData.perfilMercado === 'B2B' ? 'Creditamento integral para os adquirentes PJ' : 'Consumidor final e aderência a Split Payment e Cashback'}
                    </span>
                  </div>

                  {/* Escopo de Operações */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Escopo Geográfico das Operações</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'internas', label: 'Internas' },
                        { key: 'interestaduais', label: 'Interestaduais' },
                        { key: 'importacao', label: 'Importação' },
                        { key: 'exportacao', label: 'Exportação' },
                      ].map(({ key, label }) => {
                        const isChecked = (formData.operacoes as any)[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                operacoes: {
                                  ...formData.operacoes,
                                  [key]: !isChecked,
                                }
                              });
                              setHasUnsavedChanges(true);
                            }}
                            className={`px-2.5 py-2 text-xs font-semibold rounded-lg border text-left flex items-center space-x-1.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-[#00D280]' : 'bg-slate-300'}`} />
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-slate-500">Princípio do Destino (IBS arrecadado na UF/Município consumidor)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: PARÂMETROS FISCAIS DIRECIONADOS POR SETOR                           */}
          {/* ========================================================================= */}
          {activeSubTab === 'fiscais' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 font-sans">
                      <FileText className="w-4 h-4 text-[#00D280]" />
                      <span>Parâmetros Fiscais & Classificações Tributárias</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exibição direcionada exclusivamente aos códigos e campos pertinentes ao setor <strong className="text-slate-900">{formData.setor}</strong> e tipo de operação <strong className="text-slate-900">{formData.tipoOperacao}</strong>.
                    </p>
                  </div>
                  <span className="text-xs text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg font-mono font-semibold self-start sm:self-auto">
                    {currentPreset.ncmOuNbsLabel}
                  </span>
                </div>

                {/* Códigos Fiscais Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(formData.tipoOperacao === 'Produtos' || formData.tipoOperacao === 'Produtos e Serviços') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>NCM Principal (Mercadorias)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Mercadoria</span>
                      </label>
                      <input
                        type="text"
                        value={formData.dadosFiscais.ncmPrincipal}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            dadosFiscais: { ...formData.dadosFiscais, ncmPrincipal: e.target.value }
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Ex: 8471.50.10"
                      />
                      <span className="text-[10px] text-slate-500">Alíquota padrão ou alíquota seletiva (IS)</span>
                    </div>
                  )}

                  {(formData.tipoOperacao === 'Serviços' || formData.tipoOperacao === 'Produtos e Serviços') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>NBS Principal (Serviços)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Serviço</span>
                      </label>
                      <input
                        type="text"
                        value={formData.dadosFiscais.nbsPrincipal}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            dadosFiscais: { ...formData.dadosFiscais, nbsPrincipal: e.target.value }
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Ex: 1.0101.10.00"
                      />
                      <span className="text-[10px] text-slate-500">Nomenclatura Brasileira de Serviços (NBS)</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CFOP Predominante</label>
                    <input
                      type="text"
                      value={formData.dadosFiscais.cfopPrincipal}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosFiscais: { ...formData.dadosFiscais, cfopPrincipal: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: 5.102 / 6.102 ou 5.933"
                    />
                    <span className="text-[10px] text-slate-500">Identificação da natureza da circulação</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CST Predominante</label>
                    <input
                      type="text"
                      value={formData.dadosFiscais.cstPrincipal}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosFiscais: { ...formData.dadosFiscais, cstPrincipal: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: 00 (Tributada integralmente)"
                    />
                    <span className="text-[10px] text-slate-500">Transição para a nova tabela de CST de IBS/CBS</span>
                  </div>

                  {(formData.setor === 'Comércio' || formData.setor === 'Varejo' || formData.setor === 'Atacado' || formData.setor === 'Indústria') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">CEST (Código Especificador de ST)</label>
                      <input
                        type="text"
                        value={formData.dadosFiscais.cestPrincipal}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            dadosFiscais: { ...formData.dadosFiscais, cestPrincipal: e.target.value }
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Ex: 21.030.00"
                      />
                      <span className="text-[10px] text-slate-500">Histórico legado de Substituição Tributária</span>
                    </div>
                  )}

                  {(formData.tipoOperacao === 'Serviços' || formData.tipoOperacao === 'Produtos e Serviços') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Código de Serviço Municipal (LC 116)</label>
                      <input
                        type="text"
                        value={formData.dadosFiscais.codigoServicoMunicipal}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            dadosFiscais: { ...formData.dadosFiscais, codigoServicoMunicipal: e.target.value }
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                        placeholder="Ex: 01.01 - Análise e desenvolvimento de sistemas"
                      />
                      <span className="text-[10px] text-slate-500">Substituído pelo IBS municipal / estadual</span>
                    </div>
                  )}
                </div>

                {/* Regimes Especiais & Benefícios Fiscais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Regime Especial na Reforma Tributária</label>
                    <input
                      type="text"
                      value={formData.dadosFiscais.regimeEspecial}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosFiscais: { ...formData.dadosFiscais, regimeEspecial: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: Regime Geral Não-Cumulativo CBS/IBS (LC 214/2025)"
                    />
                    <span className="text-[10px] text-slate-500">LC 214/2025: Regimes diferenciados, combustíveis, serviços financeiros, etc.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Benefício Fiscal Legado / Fundo de Compensação</label>
                    <input
                      type="text"
                      value={formData.dadosFiscais.beneficioFiscal}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosFiscais: { ...formData.dadosFiscais, beneficioFiscal: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                      placeholder="Ex: Fundo de Compensação de Benefícios Fiscais (FCBF)"
                    />
                    <span className="text-[10px] text-slate-500">Transição decrescente dos incentivos regionais de ICMS até 2032</span>
                  </div>
                </div>

                {/* Campos Dinâmicos Específicos do Setor */}
                {currentPreset.camposDinamicos.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#00D280]" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Campos Especializados do Setor: {formData.setor}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPreset.camposDinamicos.map((field) => {
                        const val = formData.dadosFiscais.camposDinamicosSetor[field.chave] ?? field.valorPadrao;
                        return (
                          <div key={field.chave} className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <label className="text-xs font-semibold text-slate-800">{field.label}</label>
                            {field.tipo === 'select' && field.opcoes ? (
                              <select
                                value={val}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    dadosFiscais: {
                                      ...formData.dadosFiscais,
                                      camposDinamicosSetor: {
                                        ...formData.dadosFiscais.camposDinamicosSetor,
                                        [field.chave]: e.target.value,
                                      }
                                    }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                              >
                                {field.opcoes.map((op) => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>
                            ) : field.tipo === 'boolean' ? (
                              <div className="flex items-center space-x-3 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      dadosFiscais: {
                                        ...formData.dadosFiscais,
                                        camposDinamicosSetor: {
                                          ...formData.dadosFiscais.camposDinamicosSetor,
                                          [field.chave]: !val,
                                        }
                                      }
                                    });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                    val ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {val ? 'Habilitado / Sim' : 'Desabilitado / Não'}
                                </button>
                              </div>
                            ) : (
                              <input
                                type={field.tipo === 'number' ? 'number' : 'text'}
                                value={val}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    dadosFiscais: {
                                      ...formData.dadosFiscais,
                                      camposDinamicosSetor: {
                                        ...formData.dadosFiscais.camposDinamicosSetor,
                                        [field.chave]: field.tipo === 'number' ? Number(e.target.value) : e.target.value,
                                      }
                                    }
                                  });
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                              />
                            )}
                            {field.descricaoAjuda && (
                              <span className="text-[10px] text-slate-500 block">{field.descricaoAjuda}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: PREMISSAS ECONÔMICAS & VOLUME                                      */}
          {/* ========================================================================= */}
          {activeSubTab === 'economicos' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 font-sans">
                      <DollarSign className="w-4 h-4 text-[#00D280]" />
                      <span>Premissas Financeiras, Volume & Estrutura de Custos</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Base quantitativa utilizada para alimentar o simulador em tempo real, cálculos de fluxo de caixa e DRE comparativa.
                    </p>
                  </div>
                  <span className="text-xs text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-3 py-1 rounded-lg font-bold">
                    Ano: {selectedYear}
                  </span>
                </div>

                {/* Bloco 1: Receitas e Volumes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Receita Anual Projetada</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.receitaAnual}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            receitaAnual: val,
                            receitaMensalMedia: val / 12,
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">{formatRS(formData.dadosEconomicos.receitaAnual)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Receita Mensal Média</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.receitaMensalMedia}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            receitaMensalMedia: val,
                            receitaAnual: val * 12,
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">{formatRS(formData.dadosEconomicos.receitaMensalMedia)} / mês</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Custos de Insumos / Fornecedores</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.custosInsumos}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            custosInsumos: val,
                            comprasTotais: val,
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">Base geradora de créditos de CBS/IBS</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Despesas Operacionais (OPEX)</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.despesasOperacionais}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            despesasOperacionais: val,
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">{formatRS(formData.dadosEconomicos.despesasOperacionais)}</span>
                  </div>
                </div>

                {/* Bloco 2: Margens e Créditos Atuais */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Margem Bruta Estimada (%)</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.margemBrutaPercent}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            margemBrutaPercent: Number(e.target.value),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">EBITDA Estimado</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.ebitda}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            ebitda: Number(e.target.value),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">{formatRS(formData.dadosEconomicos.ebitda)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Créditos Tributários Atuais (PIS/COFINS/ICMS)</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.creditosTributariosAtuais}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            creditosTributariosAtuais: Number(e.target.value),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                    <span className="text-[10px] text-slate-500">{formatRS(formData.dadosEconomicos.creditosTributariosAtuais)}</span>
                  </div>
                </div>

                {/* Bloco 3: Split B2B/B2C e Foreign Trade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">% Vendas B2B</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.percentualB2B}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            percentualB2B: val,
                            percentualB2C: Math.max(0, 100 - val),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">% Vendas B2C</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.percentualB2C}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            percentualB2C: val,
                            percentualB2B: Math.max(0, 100 - val),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">% Insumos Importados</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.percentualImportacao}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            percentualImportacao: Number(e.target.value),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">% Vendas Exportação (Alíquota Zero)</label>
                    <input
                      type="number"
                      value={formData.dadosEconomicos.percentualExportacao}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          dadosEconomicos: {
                            ...formData.dadosEconomicos,
                            percentualExportacao: Number(e.target.value),
                          }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: GOVERNANÇA, AUDITORIA & IMPORTAÇÃO                                */}
          {/* ========================================================================= */}
          {activeSubTab === 'governanca' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 font-sans">
                      <ShieldCheck className="w-4 h-4 text-[#00D280]" />
                      <span>Rastreabilidade, Auditoria de Campos & Linhagem de Dados</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Controle rigoroso de origem de cada parâmetro cadastral para auditoria e governança tributária.
                    </p>
                  </div>
                  <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-bold">
                    Trilha de Auditoria Conforme
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Campo / Parâmetro</th>
                        <th className="py-2.5 px-3">Origem do Dado</th>
                        <th className="py-2.5 px-3">Status de Validação</th>
                        <th className="py-2.5 px-3">Fonte / Documento</th>
                        <th className="py-2.5 px-3">Premissa Utilizada</th>
                        <th className="py-2.5 px-3">Confiabilidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.values(formData.auditoriaCampos || {}).map((audit, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{audit.campo}</td>
                          <td className="py-2.5 px-3 text-slate-700">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium">
                              {audit.origem}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D280]" />
                              <span>{audit.statusValidacao}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{audit.fonte}</td>
                          <td className="py-2.5 px-3 text-slate-600">{audit.premissaUtilizada}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{audit.confiabilidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CRIAR NOVO GRUPO ECONÔMICO */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#00D280]" />
                <h3 className="text-base font-black text-slate-900">Novo Grupo Econômico</h3>
              </div>
              <button 
                onClick={() => setShowAddGroupModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nome do Grupo Econômico</label>
                <input
                  type="text"
                  value={newGroupNameInput}
                  onChange={(e) => setNewGroupNameInput(e.target.value)}
                  placeholder="Ex: Grupo Industrial São Paulo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D280]/30 focus:border-[#00D280]"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                O Grupo Econômico agrupa matrizes e filiais para consolidação de balanços, simulação de créditos intramunicipais/interestaduais e governança corporativa.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateEconomicGroup}
                disabled={!newGroupNameInput.trim()}
                className="px-4 py-2 text-xs font-black bg-[#00D280] text-slate-950 rounded-xl hover:bg-[#00ba70] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                Criar e Vincular Grupo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR FILIAL */}
      {showAddFilialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-[#00D280]" />
                <h3 className="text-base font-black text-slate-900">Adicionar Filial Operacional</h3>
              </div>
              <button 
                onClick={() => setShowAddFilialModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nome da Filial</label>
                <input
                  type="text"
                  value={newFilialName}
                  onChange={(e) => setNewFilialName(e.target.value)}
                  placeholder="Ex: Filial Campinas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">CNPJ da Filial</label>
                <input
                  type="text"
                  value={newFilialCnpj}
                  onChange={(e) => setNewFilialCnpj(e.target.value)}
                  placeholder="00.000.000/0002-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">UF</label>
                  <select
                    value={newFilialUf}
                    onChange={(e) => setNewFilialUf(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                  >
                    {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'AM', 'PA', 'ES', 'MT', 'MS'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Município</label>
                  <input
                    type="text"
                    value={newFilialMunicipio}
                    onChange={(e) => setNewFilialMunicipio(e.target.value)}
                    placeholder="Ex: Campinas"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00D280]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddFilialModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddFilialToMatriz}
                disabled={!newFilialName.trim()}
                className="px-4 py-2 text-xs font-black bg-[#00D280] text-slate-950 rounded-xl hover:bg-[#00ba70] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                Salvar Filial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
