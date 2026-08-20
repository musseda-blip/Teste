import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  MoreVertical, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Printer, 
  FileCode2, 
  CheckCircle2, 
  Sparkles,
  Info,
  X,
  Hash,
  Layers3,
  Square,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { FiscalDocument, FiscalItem } from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { getAllFiscalDocuments, getFiscalDocumentsByCompany } from '../utils/fiscalStorage';
import { calculateFiscalDocumentAnalysis } from '../utils/fiscalDocumentTaxEngine';

interface VisualizacaoDocumentosProps {
  companyData: CompanyRegistration;
  onNavigateToImport?: () => void;
  onNavigateToCadastro?: () => void;
  selectedYear: YearPeriod;
  onYearChange?: (year: YearPeriod) => void;
  initialDocumentId?: string | null;
}

export const VisualizacaoDocumentos: React.FC<VisualizacaoDocumentosProps> = ({
  companyData,
  onNavigateToImport,
  onNavigateToCadastro,
  selectedYear,
  onYearChange,
  initialDocumentId
}) => {
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocumentId || null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(initialDocumentId ? 'detail' : 'list');
  const [reformYear, setReformYear] = useState<YearPeriod>(selectedYear || 2026);
  const [searchTerm, setSearchTerm] = useState('');
  const [papelFilter, setPapelFilter] = useState<string>('todos');
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Carregar exatamente os 5 documentos NFS-e com 1 item cada vinculados à empresa ativa
  const loadDocuments = () => {
    const docs = getFiscalDocumentsByCompany(companyData);
    setDocuments(docs);
    if (initialDocumentId && docs.some(d => d.id === initialDocumentId)) {
      setSelectedDocId(initialDocumentId);
      setViewMode('detail');
    } else if (docs.length > 0 && !selectedDocId) {
      setSelectedDocId(docs[0].id);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [companyData.id, companyData.cnpj, companyData.razaoSocial]);

  // Sincronizar ano da reforma
  useEffect(() => {
    if (selectedYear) {
      setReformYear(selectedYear);
    }
  }, [selectedYear]);

  // Identificação do papel da empresa no documento NFS-e
  const getDocumentRoleInfo = (doc: FiscalDocument) => {
    const activeCnpjClean = (companyData.cnpj || '').replace(/\D/g, '');
    const emitCnpjClean = (doc.emitente?.cnpjCpf || '').replace(/\D/g, '');

    if (activeCnpjClean && emitCnpjClean && activeCnpjClean === emitCnpjClean) {
      return {
        role: 'Prestador de Serviços',
        roleType: 'prestador',
        badgeText: 'PRESTADOR (RECEITA)',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        contraparteLabel: 'Tomador do Serviço',
        contraparteNome: doc.destinatario?.razaoSocial || doc.tomador?.razaoSocial || 'Cliente',
        contraparteCnpj: doc.destinatario?.cnpjCpf || doc.tomador?.cnpjCpf || 'Não informado',
        direction: 'saida'
      };
    } else {
      return {
        role: 'Tomador de Serviços',
        roleType: 'tomador',
        badgeText: 'TOMADOR (DESPESA / CRÉDITO)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        contraparteLabel: 'Prestador do Serviço',
        contraparteNome: doc.emitente?.razaoSocial || 'Fornecedor de Serviços',
        contraparteCnpj: doc.emitente?.cnpjCpf || 'Não informado',
        direction: 'entrada'
      };
    }
  };

  // Documento selecionado para a tela de visualização
  const currentDoc = useMemo(() => {
    if (!selectedDocId) return documents.length > 0 ? documents[0] : null;
    return documents.find(d => d.id === selectedDocId) || documents[0] || null;
  }, [selectedDocId, documents]);

  // Análise tributária e comparativo
  const analysis = useMemo(() => {
    if (!currentDoc) return null;
    return calculateFiscalDocumentAnalysis(currentDoc, companyData, reformYear);
  }, [currentDoc, companyData, reformYear]);

  // Lista filtrada
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const roleInfo = getDocumentRoleInfo(doc);

      const matchesSearch = 
        (doc.numero && doc.numero.includes(searchTerm)) ||
        (doc.chaveAcesso && doc.chaveAcesso.includes(searchTerm)) ||
        (doc.emitente?.razaoSocial && doc.emitente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.destinatario?.razaoSocial && doc.destinatario.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.tomador?.razaoSocial && doc.tomador.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.naturezaOperacao && doc.naturezaOperacao.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPapel = papelFilter === 'todos' || 
        (papelFilter === 'saida' && roleInfo.direction === 'saida') ||
        (papelFilter === 'entrada' && roleInfo.direction === 'entrada') ||
        (papelFilter === roleInfo.roleType);

      return matchesSearch && matchesPapel;
    });
  }, [documents, searchTerm, papelFilter, companyData.cnpj]);

  // Métricas agregadas
  const metrics = useMemo(() => {
    let totalPrestados = 0;
    let totalTomados = 0;
    let totalValor = 0;

    documents.forEach(doc => {
      const roleInfo = getDocumentRoleInfo(doc);
      const val = doc.totais.valorTotalDocumento || 0;
      totalValor += val;
      if (roleInfo.direction === 'saida') {
        totalPrestados++;
      } else {
        totalTomados++;
      }
    });

    return {
      totalDocs: documents.length,
      totalPrestados,
      totalTomados,
      totalValor
    };
  }, [documents, companyData.cnpj]);

  const handleCopy = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleDownloadXml = () => {
    if (!currentDoc || !currentDoc.arquivoOriginal) return;
    const blob = new Blob([currentDoc.arquivoOriginal], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDoc.nomeOriginal || `NFSe_${currentDoc.numero || 'doc'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (val: number | null | undefined) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatPercent = (val: number | null | undefined) => {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  const formatDateTime = (dtStr?: string | null) => {
    if (!dtStr) return 'Não informado';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dtStr;
    }
  };

  // ===========================================================================
  // VALIDAÇÃO DE VÍNCULO CADASTRAL OBRIGATÓRIO (PROMPT MESTRE & AMARRAÇÃO)
  // ===========================================================================
  if (!companyData || (!companyData.cnpj && !companyData.razaoSocial)) {
    return (
      <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">Vínculo Cadastral Ausente</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Nenhuma empresa cadastrada está vinculada a este contexto. Para visualizar e auditar documentos fiscais, selecione ou cadastre uma empresa em <strong>Cadastro &amp; Dados &rarr; Empresas Cadastradas</strong>.
          </p>
        </div>
        {onNavigateToCadastro && (
          <button
            onClick={onNavigateToCadastro}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Ir para Cadastro de Empresas</span>
          </button>
        )}
      </div>
    );
  }

  // ===========================================================================
  // TELA 1: LISTA DE DOCUMENTOS (TÍTULO OBRIGATÓRIO: DOCUMENTOS FISCAIS)
  // ===========================================================================
  if (viewMode === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* 1. Contexto Cadastral Obrigatório e Título Oficial */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
              <FileText className="w-6 h-6 text-[#00D280]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Organização Administradora: {companyData.organizacaoAdministradoraNome || 'EBITax Tech S/A'}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Grupo Econômico: {companyData.grupoEconomicoNome || 'Grupo Equality / EBITax'}
                </span>
              </div>
              
              {/* TÍTULO OBRIGATÓRIO: DOCUMENTOS FISCAIS */}
              <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans mt-1">
                DOCUMENTOS FISCAIS
              </h1>

              {/* Contexto Completo da Empresa Selecionada */}
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap font-medium">
                <span>Empresa: <strong className="text-slate-900">{companyData.nomeFantasia || companyData.razaoSocial || 'Não informado'}</strong></span>
                <span>&bull;</span>
                <span>CNPJ: <strong className="text-slate-900 font-mono">{companyData.cnpj || 'Não informado'}</strong></span>
                <span>&bull;</span>
                <span>Estabelecimento: <strong className="text-slate-900">{companyData.tipoEstabelecimento || 'Matriz'} ({companyData.uf || 'SP'})</strong></span>
                <span>&bull;</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  Segmento: {companyData.setor || 'Não informado'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Regime: {companyData.regimeTributario || 'Não informado'}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas Rápidas do Lote de 5 NFS-e */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Total Documentos</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">{metrics.totalDocs} NFS-e</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Serviços Prestados</span>
              <span className="text-lg font-black text-indigo-700 mt-0.5 block">{metrics.totalPrestados} notas</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Serviços Tomados</span>
              <span className="text-lg font-black text-purple-700 mt-0.5 block">{metrics.totalTomados} notas</span>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Transição 2026 (Teste)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">EC 132/23</span>
              </div>
              <span className="text-xs font-black text-emerald-900 mt-1 block">
                CBS 0,90% • IBS 0,10%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Barra de Filtros e Busca */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por número da NFS-e, tomador, prestador ou serviço..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#00D280]/20 focus:border-[#00D280]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros em Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Operação:</span>
                <select
                  value={papelFilter}
                  onChange={(e) => setPapelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-[#00D280]/20 cursor-pointer"
                >
                  <option value="todos">Todas as Operações</option>
                  <option value="saida">Serviços Prestados (Receita)</option>
                  <option value="entrada">Serviços Tomados (Despesa / Crédito)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Lista dos 5 Documentos NFS-e com Checkbox Obrigatório */}
        <div className="space-y-3.5">
          {filteredDocuments.map((doc, index) => {
            const roleInfo = getDocumentRoleInfo(doc);
            const isSelected = selectedDocId === doc.id;
            const docLabel = `NFS-e 00${index + 1}`;

            return (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setViewMode('detail');
                }}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md cursor-pointer ${
                  isSelected ? 'border-[#00D280] ring-2 ring-[#00D280]/20 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações Principais do Documento com Checkbox Obrigatório */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Checkbox Obrigatório do Documento */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocId(doc.id);
                          setViewMode('detail');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all"
                        title={`Selecionar ${docLabel}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#00D280] fill-slate-900" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-mono">{docLabel}</span>
                      </button>

                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                        NFS-e
                      </span>
                      <span className="text-base font-black text-slate-900">
                        Nº {doc.numero}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Série {doc.serie}
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${roleInfo.badgeColor}`}>
                        {roleInfo.badgeText}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Autorizada
                      </span>
                    </div>

                    {/* Descrição do Serviço */}
                    <div className="text-xs font-semibold text-slate-800">
                      {doc.naturezaOperacao}
                    </div>

                    {/* Item Único da NFS-e */}
                    {doc.itens?.[0] && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                        <span className="truncate">
                          <strong>Item 1:</strong> {doc.itens[0].descricao}
                        </span>
                        <span className="font-mono text-slate-500 flex-shrink-0 text-[11px]">
                          Cód. Serviço: {doc.itens[0].codigoServico || '01.01.01'}
                        </span>
                      </div>
                    )}

                    {/* Contraparte & Localização */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {roleInfo.contraparteLabel}
                        </span>
                        <span className="font-bold text-slate-900 truncate block" title={roleInfo.contraparteNome}>
                          {roleInfo.contraparteNome}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {roleInfo.contraparteCnpj}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Data de Emissão</span>
                        <span className="font-bold text-slate-800 block">
                          {formatDateTime(doc.dataEmissao)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Ref: {doc.periodoReferencia || '08/2026'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Município & UF</span>
                        <span className="font-bold text-slate-800 block">
                          {doc.municipioOrigem || 'São Paulo'} ({doc.ufOrigem || 'SP'})
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          CFOP: {doc.cfopPrincipal || doc.itens[0]?.cfop || '5933'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tributos Teste 2026</span>
                        <span className="text-[11px] font-bold text-emerald-800 block">
                          CBS: {formatCurrency(doc.totais.valorCBS || (doc.totais.valorTotalDocumento * 0.009))} (0,9%)
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 block">
                          IBS: {formatCurrency(doc.totais.valorIBSTotal || (doc.totais.valorTotalDocumento * 0.001))} (0,1%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Valor Total & Botão de Ação */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Valor dos Serviços</span>
                      <span className="text-lg font-black text-slate-900 tracking-tight block">
                        {formatCurrency(doc.totais.valorTotalDocumento)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocId(doc.id);
                          setViewMode('detail');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00D280]" />
                        <span>Visualizar Detalhes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDocuments.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Nenhum documento encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // TELA 2: VISUALIZAÇÃO DO DOCUMENTO FISCAL (TEMPLATE MESTRE INALTERÁVEL)
  // ===========================================================================
  if (!currentDoc) {
    return null;
  }

  const roleInfo = getDocumentRoleInfo(currentDoc);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* CABEÇALHO DA TELA & CARD PRINCIPAL DO DOCUMENTO                            */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Barra Superior do Cabeçalho: APENAS O BOTÃO VOLTAR PARA A LISTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
              <FileText className="w-6 h-6 text-[#00D280]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Organização: {companyData.organizacaoAdministradoraNome || 'EBITax Tech S/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Grupo: {companyData.grupoEconomicoNome || 'Grupo Equality / EBITax'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                  VISUALIZAR DOCUMENTO FISCAL
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NFS-e Municipal
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {roleInfo.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consulte os detalhes da nota fiscal e simule os impactos da Reforma Tributária.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Seletor rápido entre as 5 NFS-e */}
            {documents.length > 1 && (
              <select
                value={selectedDocId || currentDoc.id}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer max-w-[260px] truncate"
              >
                {documents.map((d, i) => (
                  <option key={d.id} value={d.id}>
                    NFS-e 00{i + 1} ({d.numero}) - {d.naturezaOperacao.substring(0, 24)}...
                  </option>
                ))}
              </select>
            )}

            {/* BOTÃO EXCLUSIVO DE RETORNO CONFORME PROMPT MESTRE */}
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Voltar para a lista de documentos fiscais"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a lista</span>
            </button>
          </div>
        </div>

        {/* Card Principal do Documento (Cabeçalho com Chave, Status e Ações) */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4.5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                NFS-e
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-slate-900">
                    Número {currentDoc.numero}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Série {currentDoc.serie}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Autorizada
                  </span>
                </div>
                {/* Chave de Acesso */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Chave de acesso:</span>
                  <code className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 tracking-tight select-all">
                    {currentDoc.chaveAcesso 
                      ? currentDoc.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim() 
                      : '3550 3080 0001 2890 3849 2812 0001 9400 0100'}
                  </code>
                  <button
                    onClick={() => handleCopy(currentDoc.chaveAcesso || '', setCopiedKey)}
                    className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Copiar Chave de Acesso"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botões Ver XML e Mais Ações */}
            <div className="flex items-center gap-2 self-end lg:self-auto relative">
              <button
                onClick={() => setShowXmlModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#00D280]" />
                <span>Ver XML</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                  <span>Mais ações</span>
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1 text-xs animate-in fade-in">
                    <button
                      onClick={() => {
                        handleDownloadXml();
                        setShowActionsDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Baixar Arquivo XML Original</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCopy(currentDoc.hashSha256 || '', setCopiedHash);
                        setShowActionsDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left font-medium cursor-pointer"
                    >
                      <Hash className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Hash SHA-256</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setShowActionsDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left font-medium cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Imprimir Relatório Fiscal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BLOCOS ESTRUTURADOS DE CAMPOS DO DOCUMENTO                                 */}
          {/* ========================================================================= */}
          
          {/* Bloco 1: Identificação dos Participantes & Operação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3 border-t border-slate-200/80">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">EMPRESA</div>
              <div className="text-xs font-bold text-slate-900 truncate mt-0.5" title={companyData.nomeFantasia || companyData.razaoSocial}>
                {companyData.nomeFantasia || companyData.razaoSocial || 'Não informado'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">ESTABELECIMENTO</div>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                {companyData.tipoEstabelecimento || 'Matriz'} ({companyData.uf || 'SP'})
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">PRESTADOR / EMITENTE</div>
              <div 
                className="text-xs font-bold text-slate-900 truncate mt-0.5" 
                title={roleInfo.roleType === 'prestador' ? (companyData.razaoSocial || companyData.nomeFantasia) : currentDoc.emitente?.razaoSocial}
              >
                {roleInfo.roleType === 'prestador' 
                  ? (companyData.razaoSocial || companyData.nomeFantasia || 'Não informado') 
                  : (currentDoc.emitente?.razaoSocial || currentDoc.emitente?.nomeFantasia || 'Fornecedor de Serviços')}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {roleInfo.roleType === 'prestador' 
                  ? (companyData.cnpj || 'Não informado') 
                  : (currentDoc.emitente?.cnpjCpf || 'Não informado')}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">TOMADOR DO SERVIÇO</div>
              <div 
                className="text-xs font-bold text-slate-900 truncate mt-0.5" 
                title={roleInfo.roleType === 'tomador' ? (companyData.razaoSocial || companyData.nomeFantasia) : (currentDoc.destinatario?.razaoSocial || currentDoc.tomador?.razaoSocial)}
              >
                {roleInfo.roleType === 'tomador' 
                  ? (companyData.razaoSocial || companyData.nomeFantasia || 'Não informado') 
                  : (currentDoc.destinatario?.razaoSocial || currentDoc.tomador?.razaoSocial || 'Cliente / Tomador')}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {roleInfo.roleType === 'tomador' 
                  ? (companyData.cnpj || 'Não informado') 
                  : (currentDoc.destinatario?.cnpjCpf || currentDoc.tomador?.cnpjCpf || 'Não informado')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">OPERAÇÃO</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {currentDoc.tipoOperacao || (roleInfo.roleType === 'prestador' ? 'Saída' : 'Entrada')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">NATUREZA DA OPERAÇÃO</div>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5" title={currentDoc.naturezaOperacao}>
                {currentDoc.naturezaOperacao || 'Não informado'}
              </div>
            </div>
          </div>

          {/* Bloco 2: Datas, Origem, Destino e Códigos Fiscais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-200/80">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">DATA DE EMISSÃO</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {formatDateTime(currentDoc.dataEmissao)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">COMPETÊNCIA</div>
              <div className="text-xs font-medium text-slate-700 mt-0.5">
                {currentDoc.periodoReferencia || '08/2026'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">MUNICÍPIO PRESTAÇÃO</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {currentDoc.municipioOrigem || 'São Paulo'} - {currentDoc.ufOrigem || 'SP'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">MUNICÍPIO TOMADOR</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {currentDoc.municipioDestino || 'São Paulo'} - {currentDoc.ufDestino || 'SP'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">CÓDIGO DO SERVIÇO / NBS</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono">
                {currentDoc.itens[0]?.codigoServico || '01.01.01'} / {currentDoc.itens[0]?.nbs || '1.0101.10.00'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">VALOR DO SERVIÇO</div>
              <div className="text-sm font-black text-[#00D280] bg-slate-900 px-2 py-0.5 rounded mt-0.5 inline-block">
                {formatCurrency(currentDoc.totais.valorTotalDocumento)}
              </div>
            </div>
          </div>

          {/* Bloco 3: Status, Protocolo, Ambiente e Tributação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">STATUS</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autorizada pela Prefeitura</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">CÓDIGO DE VERIFICAÇÃO</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                890A-BC12-DF34
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">AMBIENTE</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {currentDoc.ambiente || 'Produção'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">REGIME TRIBUTÁRIO</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {companyData.regimeTributario || 'Não informado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUADRO 2 — ITENS E TRIBUTOS (EXATAMENTE 1 ITEM POR NFS-e)                  */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              2. ITENS E TRIBUTOS (Detalhamento do Serviço)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detalhamento do item de serviço e da tributação aplicada no sistema atual e simulada na Reforma.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            1 item cadastrado
          </span>
        </div>

        {/* Tabela do Item Único */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white font-black text-[11px] tracking-wider uppercase border-b border-slate-800">
                  <th className="py-3 px-3 w-10 text-center">Item</th>
                  <th className="py-3 px-3 min-w-[220px]">Descrição do Serviço</th>
                  <th className="py-3 px-3 font-mono">Cód. Serviço / NBS</th>
                  <th className="py-3 px-3 font-mono">CFOP</th>
                  <th className="py-3 px-3 text-right">Vlr. Bruto (R$)</th>
                  <th className="py-3 px-3 text-right">Desconto (R$)</th>
                  <th className="py-3 px-3 text-right text-emerald-300">Vlr. Líquido (R$)</th>
                  
                  {/* ISS */}
                  <th className="py-3 px-3 text-right bg-slate-850">ISS Alíquota (%)</th>
                  <th className="py-3 px-3 text-right bg-slate-850">ISS Valor (R$)</th>
                  
                  {/* PIS */}
                  <th className="py-3 px-3 text-right">PIS Alíquota (%)</th>
                  <th className="py-3 px-3 text-right">PIS Valor (R$)</th>
                  
                  {/* COFINS */}
                  <th className="py-3 px-3 text-right bg-slate-850">COFINS Alíquota (%)</th>
                  <th className="py-3 px-3 text-right bg-slate-850">COFINS Valor (R$)</th>
                  
                  {/* IBS */}
                  <th className="py-3 px-3 text-right bg-emerald-950/60 text-emerald-300">IBS Alíquota (%)</th>
                  <th className="py-3 px-3 text-right bg-emerald-950/60 text-emerald-300">IBS Valor (R$)</th>
                  
                  {/* CBS */}
                  <th className="py-3 px-3 text-right bg-emerald-900/60 text-emerald-300">CBS Alíquota (%)</th>
                  <th className="py-3 px-3 text-right bg-emerald-900/60 text-emerald-300">CBS Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {analysis?.itensCalculados.map((it, idx) => (
                  <tr 
                    key={it.numeroItem || idx} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {it.numeroItem || 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-xs" title={it.descricao}>
                      {it.descricao}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {it.item.codigoServico || '01.01.01'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {it.cfop || '5933'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(it.valorBruto)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {it.desconto > 0 ? formatCurrency(it.desconto) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/30">
                      {formatCurrency(it.valorLiquido)}
                    </td>

                    {/* ISS */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 bg-slate-50/50">
                      {it.item.tributacao?.issqn?.aliquota ? formatPercent(it.item.tributacao.issqn.aliquota) : '5,00%'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 bg-slate-50/50">
                      {formatCurrency(it.item.tributacao?.issqn?.valor || (it.valorBruto * 0.05))}
                    </td>

                    {/* PIS */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {it.pisAliquota > 0 ? formatPercent(it.pisAliquota) : '1,65%'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(it.pisValor)}
                    </td>

                    {/* COFINS */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 bg-slate-50/50">
                      {it.cofinsAliquota > 0 ? formatPercent(it.cofinsAliquota) : '7,60%'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 bg-slate-50/50">
                      {formatCurrency(it.cofinsValor)}
                    </td>

                    {/* IBS */}
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 bg-emerald-50/40 font-bold">
                      {formatPercent(it.ibsAliquota)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40">
                      {formatCurrency(it.ibsValor)}
                    </td>

                    {/* CBS */}
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 bg-emerald-50/60 font-bold">
                      {formatPercent(it.cbsAliquota)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/60">
                      {formatCurrency(it.cbsValor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOTALIZAÇÃO — SISTEMA ATUAL (Card Estruturado)                             */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
          TOTALIZAÇÃO — SISTEMA ATUAL
        </h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Base e Ajustes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Valor dos serviços</span>
              <span className="font-bold text-slate-900">{formatCurrency(analysis?.totais.valorProdutos)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Descontos</span>
              <span className="font-medium text-slate-700">{formatCurrency(analysis?.totais.valorDescontos)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Valor líquido tributável</span>
              <span className="font-bold text-slate-900">{formatCurrency(analysis?.totais.valorLiquidoOperacao)}</span>
            </div>
          </div>

          {/* Composição Tributária Atual (+) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 lg:col-span-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Composição dos Tributos Embutidos
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">(+) ISS</span>
                <span className="font-bold text-slate-900">{formatCurrency(currentDoc.totais.valorISS || (currentDoc.totais.valorTotalDocumento * 0.05))}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">(+) PIS</span>
                <span className="font-bold text-slate-900">{formatCurrency(analysis?.totais.totalPIS)}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">(+) COFINS</span>
                <span className="font-bold text-slate-900">{formatCurrency(analysis?.totais.totalCOFINS)}</span>
              </div>
            </div>
          </div>

          {/* VALOR TOTAL BRUTO em Verde */}
          <div className="p-4 rounded-xl bg-emerald-950 text-white flex flex-col justify-between border border-emerald-500/30 shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                VALOR TOTAL BRUTO
              </span>
              <p className="text-[10px] text-emerald-200/80 mt-0.5">
                Líquido + ISS + PIS + COFINS
              </p>
            </div>
            <div className="text-xl font-black text-[#00D280] tracking-tight mt-2">
              {formatCurrency(analysis?.totais.valorTotalBruto)}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUADRO 3 — COMPARATIVO: SISTEMA ATUAL X REFORMA TRIBUTÁRIA                 */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              3. COMPARATIVO: SISTEMA ATUAL X REFORMA TRIBUTÁRIA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulação fiscal não presuntiva com aplicação das regras temporais da Reforma Tributária (EC 132/23 e LC 214/25).
            </p>
          </div>

          {/* Seletor do Ano da Reforma */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600">Ano da reforma:</span>
            <select
              value={reformYear}
              onChange={(e) => {
                const yr = Number(e.target.value) as YearPeriod;
                setReformYear(yr);
                if (onYearChange) onYearChange(yr);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value={2026}>2026 (Ano-Teste — 0,90% CBS / 0,10% IBS)</option>
              <option value={2027}>2027 (Transição CBS 8,80% / IBS 0,10%)</option>
              <option value={2028}>2028 (Transição CBS 8,80% / IBS 0,10%)</option>
              <option value={2029}>2029 (Transição IBS 10% / ICMS-ISS 90%)</option>
              <option value={2030}>2030 (Transição IBS 20% / ICMS-ISS 80%)</option>
              <option value={2031}>2031 (Transição IBS 30% / ICMS-ISS 70%)</option>
              <option value={2032}>2032 (Transição IBS 40% / ICMS-ISS 60%)</option>
              <option value={2033}>2033 (Vigência Plena — CBS 8,80% + IBS 17,70%)</option>
            </select>
          </div>
        </div>

        {/* 3 Quadros: Sistema Atual | Reforma Tributária | Diferença / Variação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Quadro 1: SISTEMA ATUAL */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  SISTEMA ATUAL
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {companyData.regimeTributario}
                </span>
              </div>

              <div className="mt-3">
                <table className="w-full text-xs text-left table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[23%]" />
                    <col className="w-[17%]" />
                    <col className="w-[28%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="pb-2 text-left font-bold pr-1">TRIBUTO</th>
                      <th className="pb-2 text-right font-bold px-1">BASE (R$)</th>
                      <th className="pb-2 text-right font-bold px-1">ALÍQ. (%)</th>
                      <th className="pb-2 text-right font-bold pl-1">VALOR (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 font-medium">
                    {analysis?.quadroSistemaAtual.linhasTributos.map((row, idx) => (
                      <tr key={idx} className={row.tipo === 'neutro' ? 'font-bold text-slate-900 bg-white/60' : 'text-slate-700'}>
                        <td className="py-2 pr-1.5 text-left align-top">
                          <div className="font-bold leading-tight text-slate-900">{row.tributo}</div>
                          {row.notaExplicativa && (
                            <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                              {row.notaExplicativa}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-1 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap align-top text-[11px]">
                          {formatCurrency(row.baseCalculo)}
                        </td>
                        <td className="py-2 px-1 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap align-top text-[11px]">
                          {row.aliquota > 0 ? formatPercent(row.aliquota) : '-'}
                        </td>
                        <td className="py-2 pl-1.5 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap align-top text-[11px]">
                          {row.tipo === 'negativo' ? `-${formatCurrency(row.valor)}` : formatCurrency(row.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200/80 mt-auto">
              <span className="text-xs font-bold text-slate-800">VLR. LÍQUIDO</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {formatCurrency(analysis?.quadroSistemaAtual.valorLiquido)}
              </span>
            </div>
          </div>

          {/* Quadro 2: REFORMA TRIBUTÁRIA ({reformYear}) */}
          <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00D280]" />
                  <span>REFORMA TRIBUTÁRIA ({reformYear})</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                  {reformYear === 2026 ? 'Ano-Teste' : (reformYear === 2033 ? 'Vigência Plena' : 'Transição Gradual')}
                </span>
              </div>

              <div className="mt-3">
                <table className="w-full text-xs text-left table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[23%]" />
                    <col className="w-[17%]" />
                    <col className="w-[28%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-[10px] font-bold text-emerald-900/70 uppercase border-b border-emerald-200">
                      <th className="pb-2 text-left font-bold pr-1">TRIBUTO</th>
                      <th className="pb-2 text-right font-bold px-1">BASE (R$)</th>
                      <th className="pb-2 text-right font-bold px-1">ALÍQ. (%)</th>
                      <th className="pb-2 text-right font-bold pl-1">VALOR (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-200/60 font-medium">
                    {analysis?.quadroReforma.linhasTributos.map((row, idx) => (
                      <tr key={idx} className={row.tipo === 'neutro' ? 'font-bold text-slate-900 bg-white/70' : 'text-slate-800'}>
                        <td className="py-2 pr-1.5 text-left align-top">
                          <div className="font-bold leading-tight text-emerald-950">{row.tributo}</div>
                          {row.notaExplicativa && (
                            <div className="text-[10px] text-emerald-800/80 font-normal leading-tight mt-0.5">
                              {row.notaExplicativa}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-1 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap align-top text-[11px]">
                          {formatCurrency(row.baseCalculo)}
                        </td>
                        <td className="py-2 px-1 text-right font-mono tabular-nums font-bold text-emerald-800 whitespace-nowrap align-top text-[11px]">
                          {formatPercent(row.aliquota)}
                        </td>
                        <td className={`py-2 pl-1.5 text-right font-mono tabular-nums font-bold whitespace-nowrap align-top text-[11px] ${
                          row.tipo === 'positivo' ? 'text-emerald-900' : 'text-slate-900'
                        }`}>
                          {row.tipo === 'positivo' ? `+${formatCurrency(row.valor)}` : formatCurrency(row.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200 flex items-center justify-between bg-emerald-100/70 p-3 rounded-lg border border-emerald-300 mt-auto">
              <span className="text-xs font-bold text-emerald-950">TOTAL REFORMA ({reformYear})</span>
              <span className="text-sm font-black text-emerald-950 font-mono">
                {formatCurrency(analysis?.quadroReforma.totalReforma)}
              </span>
            </div>
          </div>

          {/* Quadro 3: DIFERENÇA / VARIAÇÃO */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  DIFERENÇA / VARIAÇÃO
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Comparativo Nominal
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {/* 1. ISS / ICMS (Sistema Atual) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{analysis?.graficoDiferenca.issIcms.label}</span>
                    <span className="text-slate-600 font-mono flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-slate-500" />
                      {formatCurrency(analysis?.graficoDiferenca.issIcms.variacao)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-slate-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((analysis?.graficoDiferenca.issIcms.valor || 1) / ((analysis?.totais.valorTotalBruto || 1) * 0.15)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* 2. PIS (Sistema Atual) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">PIS</span>
                    <span className="text-slate-600 font-mono flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-slate-500" />
                      {formatCurrency(analysis?.graficoDiferenca.pis.variacao)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-slate-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((analysis?.totais.totalPIS || 1) / ((analysis?.totais.valorTotalBruto || 1) * 0.05)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* 3. COFINS (Sistema Atual) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">COFINS</span>
                    <span className="text-slate-600 font-mono flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-slate-500" />
                      {formatCurrency(analysis?.graficoDiferenca.cofins.variacao)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-slate-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((analysis?.totais.totalCOFINS || 1) / ((analysis?.totais.valorTotalBruto || 1) * 0.15)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Linha Total Atual */}
                <div className="p-2 bg-slate-200/70 rounded-lg flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span>TOTAL ATUAL</span>
                  <span className="font-mono text-slate-900">
                    {formatCurrency(analysis?.graficoDiferenca.totalAtual)}
                  </span>
                </div>

                {/* 4. IBS (Reforma - Visual da Reforma Tributária) */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-950 font-bold">IBS ({formatPercent(analysis?.graficoDiferenca.ibs.aliquota)})</span>
                    <span className="text-emerald-800 font-mono font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      +{formatCurrency(analysis?.graficoDiferenca.ibs.valor)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((analysis?.totais.ibsValor || 1) / ((analysis?.totais.valorTotalBruto || 1) * 0.15)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* 5. CBS (Reforma - Visual da Reforma Tributária) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-950 font-bold">CBS ({formatPercent(analysis?.graficoDiferenca.cbs.aliquota)})</span>
                    <span className="text-emerald-800 font-mono font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      +{formatCurrency(analysis?.graficoDiferenca.cbs.valor)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((analysis?.totais.cbsValor || 1) / ((analysis?.totais.valorTotalBruto || 1) * 0.15)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Linha Total Reforma */}
                <div className="p-2 bg-emerald-100/90 rounded-lg flex items-center justify-between text-[11px] font-bold text-emerald-950 border border-emerald-300">
                  <span>TOTAL REFORMA {reformYear}</span>
                  <span className="font-mono text-emerald-950 font-bold">
                    {formatCurrency(analysis?.graficoDiferenca.totalReforma)}
                  </span>
                </div>
              </div>
            </div>

            {/* Impacto Nominal e Variação */}
            <div className="pt-3 border-t border-slate-200 space-y-2 mt-auto">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-xs font-black text-slate-900 block">IMPACTO NOMINAL</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Variação: {analysis?.totais.diffTotalPercent !== undefined ? `${analysis.totais.diffTotalPercent > 0 ? '+' : ''}${analysis.totais.diffTotalPercent.toFixed(2)}%` : '0,00%'}
                  </span>
                </div>
                <span className={`text-sm font-black font-mono flex items-center gap-1 ${
                  (analysis?.totais.diffTotalCarga || 0) <= 0 ? 'text-emerald-700' : 'text-slate-900'
                }`}>
                  {(analysis?.totais.diffTotalCarga || 0) <= 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                  )}
                  {(analysis?.totais.diffTotalCarga || 0) > 0 ? `+${formatCurrency(analysis?.totais.diffTotalCarga)}` : formatCurrency(analysis?.totais.diffTotalCarga)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/80 rounded-lg border border-slate-200/60 text-[11px]">
                <span className="font-bold text-slate-600">Impacto Líquido (Créditos):</span>
                <span className="text-slate-500 font-medium italic">Não determinado para este documento</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RODAPÉ METODOLÓGICO E REGULATÓRIO (FORA DOS QUADROS)                       */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Notas Metodológicas e Parâmetros Regulatórios (LC 214/2025 e EC 132/2023)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed text-slate-600">
            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/70">
              <span className="font-bold text-slate-800 block">1. Estimativa de Referência do Simulador:</span>
              <p>
                As alíquotas de CBS (8,80%) e IBS (17,70%), totalizando 26,50% na vigência plena, foram adotadas como parâmetro de referência estimativo deste simulador, não constituindo determinação legal definitiva.
              </p>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/70">
              <span className="font-bold text-slate-800 block">2. Regra de Transição Temporal ({reformYear}):</span>
              <p>
                {reformYear === 2026 && 'Ano de teste com CBS a 0,90% e IBS a 0,10% compensáveis com tributos federais (PIS/COFINS), mantendo 100% da carga atual.'}
                {(reformYear === 2027 || reformYear === 2028) && 'Extinção do PIS/COFINS, vigência plena da CBS a 8,80% e IBS transitório a 0,10%, mantendo 100% do ICMS/ISS.'}
                {reformYear === 2029 && 'Início da transição do IBS a 10% da referência e redução de 10% do ICMS/ISS (mantém 90%).'}
                {reformYear === 2030 && 'IBS a 20% da referência e redução de 20% do ICMS/ISS (mantém 80%).'}
                {reformYear === 2031 && 'IBS a 30% da referência e redução de 30% do ICMS/ISS (mantém 70%).'}
                {reformYear === 2032 && 'IBS a 40% da referência e redução de 40% do ICMS/ISS (mantém 60%).'}
                {reformYear === 2033 && 'Vigência plena e integral do novo modelo: CBS a 8,80% e IBS a 17,70%, com extinção definitiva do ICMS e ISS.'}
              </p>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/70">
              <span className="font-bold text-slate-800 block">3. Impacto Líquido após Créditos:</span>
              <p>
                Impacto líquido após créditos não determinado para este documento. A determinação do efeito caixa efetivo depende da estrutura de aquisições de insumos e compras da empresa contratante.
              </p>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/70">
              <span className="font-bold text-slate-800 block">4. Fonte dos Dados:</span>
              <p>
                Documento fiscal nº {currentDoc.numero || currentDoc.id} ({currentDoc.tipoDocumento}) emitido por {currentDoc.emitente.razaoSocial} • Regime: {companyData.regimeTributario}.
              </p>
            </div>

            {/* 5. AVALIAÇÃO CONCLUSIVA E IMPACTO DE TRANSIÇÃO */}
            {(() => {
              const totalAtual = analysis?.graficoDiferenca.totalAtual ?? analysis?.totais.totalTributosAtuais ?? 0;
              const totalReforma = analysis?.graficoDiferenca.totalReforma ?? analysis?.totais.totalReforma ?? 0;
              const diffNominal = totalReforma - totalAtual;
              const diffPercent = totalAtual > 0 ? (diffNominal / totalAtual) * 100 : 0;
              
              let maisOuMenos = 'sem variação';
              if (totalReforma > totalAtual) {
                maisOuMenos = 'a mais';
              } else if (totalReforma < totalAtual) {
                maisOuMenos = 'a menos';
              }

              const diffFormatada = formatCurrency(Math.abs(diffNominal));
              const diffComSinal = diffNominal > 0 ? `+${formatCurrency(diffNominal)}` : formatCurrency(diffNominal);
              const percentComSinal = diffPercent !== 0 
                ? `${diffPercent > 0 ? '+' : ''}${diffPercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                : '0,00%';

              return (
                <div className="col-span-1 md:col-span-2 space-y-3.5 bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs">
                  <span className="font-bold text-slate-900 block text-xs tracking-tight">
                    5. AVALIAÇÃO CONCLUSIVA E IMPACTO DE TRANSIÇÃO ({reformYear})
                  </span>

                  {/* BLOCO 1 — CENÁRIO SIMULADO */}
                  <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
                    <p>
                      Com base na análise do documento fiscal selecionado nesta tela, simulando a emissão desta mesma operação sob as regras vigentes em <strong>{reformYear}</strong>:
                    </p>
                    <p>
                      Se este documento fosse emitido em <strong>{reformYear}</strong>, a carga tributária calculada no cenário da Reforma seria de <strong>{formatCurrency(totalReforma)}</strong>, com CBS de <strong>{formatPercent(analysis?.totais.cbsAliquota)}</strong> e IBS de <strong>{formatPercent(analysis?.totais.ibsAliquota)}</strong>, comparada aos <strong>{formatCurrency(totalAtual)}</strong> apurados no Sistema Atual.
                    </p>
                  </div>

                  {/* BLOCO 2 — IMPACTO NOMINAL */}
                  <div className="space-y-1 text-xs text-slate-700 leading-relaxed pt-2.5 border-t border-slate-100">
                    <p>
                      O impacto nominal calculado é de <strong>{diffComSinal}</strong> (<strong>{percentComSinal}</strong>), representando a diferença entre os tributos calculados no Sistema Atual e o cenário da Reforma para o documento selecionado.
                    </p>
                    <p>
                      {maisOuMenos === 'sem variação' ? (
                        <>O impacto nominal indica equivalência de tributos calculados (<strong>sem variação</strong>).</>
                      ) : (
                        <>O impacto nominal indica uma diferença de tributos calculados de <strong>{maisOuMenos} {diffFormatada}</strong>, equivalente a <strong>{percentComSinal}</strong>.</>
                      )}
                    </p>
                  </div>

                  {/* BLOCO 3 — IMPACTO LÍQUIDO APÓS CRÉDITOS */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-1.5">
                    <span className="font-bold text-slate-800">Impacto Líquido após Créditos:</span>
                    <span className="text-slate-600 font-medium">Não determinado para este documento.</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE VISUALIZAÇÃO DO XML ORIGINAL                                     */}
      {/* ========================================================================= */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-5 h-5 text-[#00D280]" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">
                    Arquivo XML Original do Documento Fiscal
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentDoc.nomeOriginal} • Hash SHA-256: {currentDoc.hashSha256?.substring(0, 20)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(currentDoc.arquivoOriginal || '', setCopiedXml)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedXml ? 'Copiado!' : 'Copiar XML'}</span>
                </button>
                <button
                  onClick={handleDownloadXml}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D280] hover:bg-[#00b870] text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar XML</span>
                </button>
                <button
                  onClick={() => setShowXmlModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed select-all">
              <pre className="whitespace-pre-wrap break-all">
                {currentDoc.arquivoOriginal || '<!-- Conteúdo XML não disponível para este documento -->'}
              </pre>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-2xl">
              <span>Tamanho: {(currentDoc.tamanhoBytes / 1024).toFixed(1)} KB • Importado em {formatDateTime(currentDoc.dataHoraImportacao)}</span>
              <button
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
