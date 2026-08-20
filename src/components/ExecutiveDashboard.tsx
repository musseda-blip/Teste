import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Layers, 
  Eye, 
  ArrowRight, 
  HelpCircle,
  BarChart3,
  FileSpreadsheet,
  FileCheck,
  Percent,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { WhiteLabelConfig } from '../types/auth';
import { 
  consolidateExecutiveDashboard, 
  ConsolidatedTaxMetrics, 
  DocumentQualityMetrics, 
  YearlyTransitionPoint, 
  DRELineItem, 
  ExecutiveReading, 
  ExecutiveQAItem 
} from '../utils/executiveConsolidationEngine';
import { 
  exportExecutiveDashboardPDF, 
  exportExecutiveDashboardXLSX 
} from '../utils/executiveExportEngine';
import { ExecutiveDrillDownSheet, DrillDownTarget } from './ExecutiveDrillDownSheet';

interface ExecutiveDashboardProps {
  companyData: CompanyRegistration;
  selectedYear: YearPeriod;
  onYearChange: (year: YearPeriod) => void;
  onNavigateToDocumentos?: (docId?: string) => void;
  onNavigateToCadastro?: () => void;
  whiteLabel?: WhiteLabelConfig;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  companyData,
  selectedYear,
  onYearChange,
  onNavigateToDocumentos,
  onNavigateToCadastro,
  whiteLabel
}) => {
  // Estado para Drill-Down Side-Sheet
  const [isDrillDownOpen, setIsDrillDownOpen] = useState<boolean>(false);
  const [drillDownTarget, setDrillDownTarget] = useState<DrillDownTarget | null>(null);

  // Estado para controle de expansão do Q&A
  const [expandedQA, setExpandedQA] = useState<Record<string, boolean>>({
    q1: true,
    q2: true
  });

  // Estado para controle de visibilidade das séries do gráfico
  const [visibleSeries, setVisibleSeries] = useState({
    totalAtual: true,
    totalReforma: true,
    cbs: true,
    ibs: true,
    legadoPisCofins: false,
    legadoIssIcms: false
  });

  // Modal de Detalhes da Auditoria de Confiabilidade
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);

  // Executa o Motor de Consolidação Executiva (Single Source of Truth)
  const consolidated = useMemo(() => {
    return consolidateExecutiveDashboard(companyData, selectedYear);
  }, [companyData, selectedYear]);

  const { quality, metrics, timeline, dre, reading, qa } = consolidated;

  // Formatadores Monetários e Percentuais
  const formatRS = (v: number | null | undefined) => {
    if (v === null || v === undefined) return 'Não determinado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);
  };

  const formatPercent = (v: number | null | undefined) => {
    if (v === null || v === undefined) return 'N/D';
    return `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Abrir Drill-Down
  const handleOpenDrillDown = (
    tipo: DrillDownTarget['tipo'],
    titulo: string,
    subtitulo: string,
    valorPrincipal: string,
    detalheCalculo: string,
    linhaDreCodigo?: string
  ) => {
    setDrillDownTarget({
      tipo,
      titulo,
      subtitulo,
      valorPrincipal,
      detalheCalculo,
      linhaDreCodigo
    });
    setIsDrillDownOpen(true);
  };

  // Exportações
  const handleExportPDF = () => {
    exportExecutiveDashboardPDF({
      company: companyData,
      selectedYear,
      metrics,
      quality,
      timeline,
      dre,
      reading,
      whiteLabel
    });
  };

  const handleExportXLSX = () => {
    exportExecutiveDashboardXLSX({
      company: companyData,
      selectedYear,
      metrics,
      quality,
      timeline,
      dre,
      reading,
      whiteLabel
    });
  };

  // Anos disponíveis para simulação
  const availableYears: YearPeriod[] = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          1. HEADER EXECUTIVO & GOVERNANÇA DA BASE DOCUMENTAL
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Identificação Corporativa */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#00D280]" />
                Painel Executivo C-Level
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {companyData.regimeTributario}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {companyData.setor}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {companyData.razaoSocial}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              CNPJ: {companyData.cnpj} • Município: {companyData.municipio} ({companyData.uf})
            </p>
          </div>

          {/* Seletor de Ano da Reforma & Ações de Exportação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Seletor de Ano */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 pl-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00D280]" />
                Ano da Reforma:
              </span>
              <div className="flex items-center gap-1">
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => onYearChange(yr)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedYear === yr
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de Exportação One-Click */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Exportar Dossiê Executivo em PDF de Alta Fidelidade"
              >
                <Download className="w-4 h-4" />
                Exportar PDF Executivo
              </button>

              <button
                onClick={handleExportXLSX}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Exportar Planilha XLSX / CSV Estruturada"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Exportar XLSX
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Governança e Confiabilidade Documental */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#00D280]" />
              <span>Índice de Confiabilidade da Base Documental:</span>
              <span className="font-mono text-sm font-black text-emerald-900 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                {quality.indiceConfiabilidade}%
              </span>
            </div>

            <button
              onClick={() => setShowQualityModal(true)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
            >
              Auditar Critérios ({quality.totalAuditados} Documentos)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Base Factual:</span>
            <span className="font-bold text-slate-700">{metrics.totalDocumentosSaida} Saídas Faturadas</span>
            <span>•</span>
            <span className="font-bold text-slate-700">{metrics.totalDocumentosEntrada} Aquisições/Tomadas</span>
            {onNavigateToDocumentos && (
              <button
                onClick={() => onNavigateToDocumentos()}
                className="ml-2 text-[#059669] hover:text-[#047857] font-bold flex items-center gap-0.5"
              >
                Ver Documentos <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CONSOLIDAÇÃO EXECUTIVA C-LEVEL: SISTEMA ATUAL × REFORMA TRIBUTÁRIA
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloco 1: SISTEMA ATUAL */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Quadro Comparativo
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  SISTEMA ATUAL
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Legado Vigente
              </span>
            </div>

            {/* Faturamento e Tributos */}
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">Receita Bruta Faturada:</span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {formatRS(metrics.receitaBruta)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">PIS/PASEP (1,65%):</span>
                  <span className="font-bold text-slate-800 font-mono">{formatRS(metrics.tributosAtuais.pis)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">COFINS (7,60%):</span>
                  <span className="font-bold text-slate-800 font-mono">{formatRS(metrics.tributosAtuais.cofins)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">ISSQN Municipal (5,00%):</span>
                  <span className="font-bold text-slate-800 font-mono">{formatRS(metrics.tributosAtuais.iss)}</span>
                </div>
                {metrics.tributosAtuais.icms > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">ICMS Estadual:</span>
                    <span className="font-bold text-slate-800 font-mono">{formatRS(metrics.tributosAtuais.icms)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
                  <span className="text-slate-900">Total Tributos Faturados:</span>
                  <span className="text-slate-900 font-mono text-sm">{formatRS(metrics.tributosAtuais.totalBruto)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Carga Tributária Efetiva:</span>
                <span className="font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {metrics.tributosAtuais.cargaEfetivaPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleOpenDrillDown(
                'tributos_atuais',
                'Detalhamento dos Tributos no Sistema Atual',
                'Composição dos tributos legados faturados nos documentos fiscais',
                formatRS(metrics.tributosAtuais.totalBruto),
                'Soma dos tributos PIS (1,65%), COFINS (7,60%) e ISS (5,00%) incidentes nas NFS-e de saída'
              )}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Memória e Documentos
            </button>
          </div>
        </div>

        {/* Bloco 2: REFORMA TRIBUTÁRIA */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Quadro Comparativo
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  REFORMA TRIBUTÁRIA
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                Simulação {selectedYear}
              </span>
            </div>

            {/* Base e Tributos Reforma */}
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">Base Tributável Reforma:</span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {formatRS(metrics.receitaLiquidaOperacao)}
                </span>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl space-y-2 border border-emerald-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700">CBS Federal ({metrics.tributosReforma.cbsAliquota.toFixed(2)}%):</span>
                  <span className="font-bold text-slate-900 font-mono">{formatRS(metrics.tributosReforma.cbsValor)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700">IBS Subnacional ({metrics.tributosReforma.ibsAliquota.toFixed(2)}%):</span>
                  <span className="font-bold text-slate-900 font-mono">{formatRS(metrics.tributosReforma.ibsValor)}</span>
                </div>
                {metrics.tributosReforma.isValor > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">Imposto Seletivo:</span>
                    <span className="font-bold text-slate-900 font-mono">{formatRS(metrics.tributosReforma.isValor)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs font-bold">
                  <span className="text-emerald-950">Total Reforma ({selectedYear}):</span>
                  <span className="text-emerald-950 font-mono text-sm">{formatRS(metrics.tributosReforma.totalBruto)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Carga Tributária Efetiva:</span>
                <span className="font-black text-emerald-950 font-mono bg-emerald-100/80 px-2 py-0.5 rounded">
                  {metrics.tributosReforma.cargaEfetivaPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleOpenDrillDown(
                'tributos_reforma',
                `Detalhamento dos Tributos na Reforma (${selectedYear})`,
                'Composição dos tributos CBS e IBS calculados pelo motor oficial',
                formatRS(metrics.tributosReforma.totalBruto),
                `Aplicação da CBS (${metrics.tributosReforma.cbsAliquota.toFixed(2)}%) e IBS (${metrics.tributosReforma.ibsAliquota.toFixed(2)}%) sobre as NFS-e faturadas`
              )}
              className="w-full py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Memória e Alíquotas
            </button>
          </div>
        </div>

        {/* Bloco 3: IMPACTO NOMINAL & VARIAÇÃO */}
        <div className={`rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
          metrics.diferenca.direcao === 'a menos'
            ? 'bg-emerald-950 text-white border-emerald-900'
            : metrics.diferenca.direcao === 'a mais'
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Variação Consolidada
                </span>
                <h3 className="text-lg font-black text-white">
                  IMPACTO NOMINAL
                </h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono flex items-center gap-1 ${
                metrics.diferenca.direcao === 'a menos'
                  ? 'bg-emerald-500 text-slate-950'
                  : metrics.diferenca.direcao === 'a mais'
                  ? 'bg-orange-500 text-slate-950'
                  : 'bg-slate-700 text-white'
              }`}>
                {metrics.diferenca.direcao === 'a menos' && <TrendingDown className="w-3.5 h-3.5" />}
                {metrics.diferenca.direcao === 'a mais' && <TrendingUp className="w-3.5 h-3.5" />}
                {metrics.diferenca.direcao.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Diferença em R$ (Ano {selectedYear}):</span>
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight block ${
                  metrics.diferenca.direcao === 'a menos' ? 'text-[#00D280]' : 'text-orange-400'
                }`}>
                  {metrics.diferenca.nominalBruta > 0 ? `+${formatRS(metrics.diferenca.nominalBruta)}` : formatRS(metrics.diferenca.nominalBruta)}
                </span>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Variação Percentual:</span>
                  <span className={`font-bold font-mono text-sm ${
                    metrics.diferenca.percentualBruto < 0 ? 'text-[#00D280]' : 'text-orange-400'
                  }`}>
                    {formatPercent(metrics.diferenca.percentualBruto)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Variação Alíquota Efetiva:</span>
                  <span className="font-bold text-white font-mono">
                    {(metrics.tributosReforma.cargaEfetivaPercent - metrics.tributosAtuais.cargaEfetivaPercent).toFixed(2)} p.p.
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {reading.impactoNominalTexto}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleOpenDrillDown(
                'diferenca',
                'Confronto Analítico da Variação de Carga',
                'Demonstração da diferença nominal entre o Sistema Atual e a Reforma',
                formatRS(metrics.diferenca.nominalBruta),
                `Subtração: Total Reforma (${formatRS(metrics.tributosReforma.totalBruto)}) - Total Atual (${formatRS(metrics.tributosAtuais.totalBruto)})`
              )}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Auditar Variação
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. GRÁFICO TEMPORAL DA TRANSIÇÃO (2026 A 2033)
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00D280]" />
              <h2 className="text-xl font-bold text-slate-900">
                Evolução Temporal da Carga Tributária (2026 a 2033)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Base documental factual estritamente constante. Aplicação das regras de transição da EC 132/2023 e LC 214/2025 para todos os anos.
            </p>
          </div>

          {/* Toggles Interativos de Séries */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setVisibleSeries(s => ({ ...s, totalAtual: !s.totalAtual }))}
              className={`px-2.5 py-1 rounded-md font-bold transition-all border ${
                visibleSeries.totalAtual
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              Sistema Atual
            </button>
            <button
              onClick={() => setVisibleSeries(s => ({ ...s, totalReforma: !s.totalReforma }))}
              className={`px-2.5 py-1 rounded-md font-bold transition-all border ${
                visibleSeries.totalReforma
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              Total Reforma
            </button>
            <button
              onClick={() => setVisibleSeries(s => ({ ...s, cbs: !s.cbs }))}
              className={`px-2.5 py-1 rounded-md font-bold transition-all border ${
                visibleSeries.cbs
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              CBS Federal
            </button>
            <button
              onClick={() => setVisibleSeries(s => ({ ...s, ibs: !s.ibs }))}
              className={`px-2.5 py-1 rounded-md font-bold transition-all border ${
                visibleSeries.ibs
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              IBS Subnacional
            </button>
          </div>
        </div>

        {/* Gráfico Recharts */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timeline}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="ano" 
                tickLine={false} 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight={700}
              />
              <YAxis 
                tickLine={false} 
                stroke="#64748b" 
                fontSize={11}
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as YearlyTransitionPoint;
                    return (
                      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 text-xs space-y-2 max-w-xs">
                        <div className="border-b border-slate-800 pb-1.5 flex justify-between items-center">
                          <span className="font-bold text-sm text-[#00D280]">Exercício {label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{data.fase}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Sistema Atual:</span>
                            <span className="font-bold font-mono">{formatRS(data.totalLegado)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">CBS ({data.cbsAliquota.toFixed(2)}%):</span>
                            <span className="font-bold text-blue-400 font-mono">{formatRS(data.cbsValor)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">IBS ({data.ibsAliquota.toFixed(2)}%):</span>
                            <span className="font-bold text-teal-400 font-mono">{formatRS(data.ibsValor)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                            <span className="text-white">Total Reforma:</span>
                            <span className="text-emerald-400 font-mono">{formatRS(data.totalReforma)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-0.5">
                            <span className="text-slate-400">Diferença Nominal:</span>
                            <span className={`font-mono font-bold ${data.diferencaNominal > 0 ? 'text-orange-400' : 'text-[#00D280]'}`}>
                              {data.diferencaNominal > 0 ? `+${formatRS(data.diferencaNominal)}` : formatRS(data.diferencaNominal)} ({formatPercent(data.diferencaPercentual)})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />

              {visibleSeries.totalAtual && (
                <Line
                  type="monotone"
                  dataKey="totalLegado"
                  name="Sistema Atual (Legado)"
                  stroke="#475569"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#475569' }}
                />
              )}

              {visibleSeries.cbs && (
                <Bar
                  dataKey="cbsValor"
                  name="CBS Federal"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              )}

              {visibleSeries.ibs && (
                <Bar
                  dataKey="ibsValor"
                  name="IBS Subnacional"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              )}

              {visibleSeries.totalReforma && (
                <Line
                  type="monotone"
                  dataKey="totalReforma"
                  name="Total Reforma"
                  stroke="#00D280"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#00D280' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de Detalhamento por Ano (2026 a 2033) */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Ano</th>
                <th className="p-3">Fase Regulatória</th>
                <th className="p-3 text-right">Legado (PIS/COF/ISS)</th>
                <th className="p-3 text-right">CBS (R$)</th>
                <th className="p-3 text-right">IBS (R$)</th>
                <th className="p-3 text-right">Total Reforma</th>
                <th className="p-3 text-right">Diferença vs Atual</th>
                <th className="p-3 text-right">Var. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {timeline.map(t => {
                const isSelected = t.ano === selectedYear;
                return (
                  <tr 
                    key={t.ano}
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-emerald-50/80 font-bold' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#00D280]" />}
                      {t.ano}
                    </td>
                    <td className="p-3 font-sans text-slate-600 font-normal">
                      {t.fase}
                    </td>
                    <td className="p-3 text-right text-slate-700">
                      {formatRS(t.totalLegado)}
                    </td>
                    <td className="p-3 text-right text-blue-700">
                      {formatRS(t.cbsValor)}
                    </td>
                    <td className="p-3 text-right text-teal-700">
                      {formatRS(t.ibsValor)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatRS(t.totalReforma)}
                    </td>
                    <td className={`p-3 text-right font-bold ${
                      t.diferencaNominal > 0 ? 'text-orange-600' : 'text-[#059669]'
                    }`}>
                      {t.diferencaNominal > 0 ? `+${formatRS(t.diferencaNominal)}` : formatRS(t.diferencaNominal)}
                    </td>
                    <td className={`p-3 text-right font-bold ${
                      t.diferencaPercentual > 0 ? 'text-orange-600' : 'text-[#059669]'
                    }`}>
                      {formatPercent(t.diferencaPercentual)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          4. DRE EXECUTIVA GERENCIAL — SISTEMA ATUAL × REFORMA TRIBUTÁRIA
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#00D280]" />
              <h2 className="text-xl font-bold text-slate-900">
                DRE Executiva Gerencial — Sistema Atual × Reforma ({selectedYear})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Demonstração gerencial dos impactos na margem operacional faturada com base exclusiva nos fatos documentados.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-16">Cód.</th>
                <th className="p-3.5">Linha Gerencial / Contábil</th>
                <th className="p-3.5 text-right w-36">Sistema Atual</th>
                <th className="p-3.5 text-right w-36">Reforma ({selectedYear})</th>
                <th className="p-3.5 text-right w-32">Diferença</th>
                <th className="p-3.5 text-right w-24">Var. %</th>
                <th className="p-3.5">Observações Fiscais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dre.map((item) => {
                const isHeader = item.isSubtotal || item.isTotal;
                return (
                  <tr 
                    key={item.codigo}
                    className={`transition-colors ${
                      item.isTotal 
                        ? 'bg-slate-900 text-white font-bold' 
                        : item.isSubtotal 
                        ? 'bg-slate-100 font-bold text-slate-900' 
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {item.codigo}
                    </td>
                    <td className={`p-3 ${isHeader ? 'font-bold' : ''}`}>
                      {item.descricao}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {item.valorAtual !== null ? formatRS(item.valorAtual) : <span className="text-slate-400 font-sans italic text-[11px]">Não determinado</span>}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {item.valorReforma !== null ? formatRS(item.valorReforma) : <span className="text-slate-400 font-sans italic text-[11px]">Não determinado</span>}
                    </td>
                    <td className={`p-3 text-right font-mono font-bold ${
                      item.diferenca && item.diferenca < 0 
                        ? 'text-orange-600' 
                        : item.diferenca && item.diferenca > 0 
                        ? 'text-[#059669]' 
                        : ''
                    }`}>
                      {item.diferenca !== null ? formatRS(item.diferenca) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatPercent(item.variacaoPercent)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500 font-sans">
                      {item.observacao || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          5. LEITURA EXECUTIVA DINÂMICA DA TRANSIÇÃO
      ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Info className="w-5 h-5 text-[#00D280]" />
          <h2 className="text-xl font-bold text-white">
            {reading.titulo}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <p>
              <strong className="text-white">Diagnóstico Geral: </strong>
              {reading.resumoCenario}
            </p>
            <p>
              <strong className="text-white">Comparativo do Exercício: </strong>
              {reading.comparativoAno}
            </p>
            <p>
              <strong className="text-white">Impacto Nominal: </strong>
              {reading.impactoNominalTexto}
            </p>
          </div>

          <div className="space-y-3">
            <p>
              <strong className="text-white">Receita Líquida: </strong>
              {reading.impactoReceitaLiquidaTexto}
            </p>
            <p>
              <strong className="text-white">Limitação de Créditos: </strong>
              {reading.limitacaoCreditosTexto}
            </p>
            <p>
              <strong className="text-white">Fluxo de Caixa vs Competência: </strong>
              {reading.limitacaoCaixaTexto}
            </p>
          </div>
        </div>

        {/* Extremos do Ciclo 2026-2033 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Ano de Maior Carga no Ciclo:</span>
            <span className="text-lg font-bold text-orange-400 font-mono block mt-1">
              {reading.anoMaiorImpacto.ano} — {formatRS(reading.anoMaiorImpacto.valor)}
            </span>
            <span className="text-slate-300 text-[11px] block mt-1">
              {reading.anoMaiorImpacto.motivo}
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Ano de Menor Carga no Ciclo:</span>
            <span className="text-lg font-bold text-[#00D280] font-mono block mt-1">
              {reading.anoMenorImpacto.ano} — {formatRS(reading.anoMenorImpacto.valor)}
            </span>
            <span className="text-slate-300 text-[11px] block mt-1">
              {reading.anoMenorImpacto.motivo}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. NOTA METODOLÓGICA E CONCLUSIVA OFICIAL
      ========================================================================= */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Nota Metodológica e Parâmetros Regulatórios
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">1. Base Documental Auditada</span>
            <p>
              Esta consolidação foi realizada exclusivamente com base nos {metrics.totalDocumentos} documentos fiscais vinculados ao contexto selecionado e nos respectivos cálculos realizados pelo sistema.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">2. Não Presunção de Créditos</span>
            <p>
              Eventuais créditos, ajustes ou efeitos financeiros não identificados ou não suportados pelos documentos vinculados não foram considerados nesta consolidação.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">3. Regime de Competência vs Caixa</span>
            <p>
              O resultado representa uma análise tributária baseada nos documentos disponíveis e não constitui, isoladamente, uma projeção definitiva de caixa ou resultado contábil.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. RISCOS, OPORTUNIDADES & Q&A ESTRATÉGICO (Q1 A Q8)
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#00D280]" />
            <h2 className="text-xl font-bold text-slate-900">
              Perguntas Estratégicas C-Level (Q&A Dinâmico)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Respostas executivas contextualizadas com os dados da empresa, setor e documentos fiscais auditados.
          </p>
        </div>

        <div className="space-y-3">
          {qa.map((item) => {
            const isExpanded = expandedQA[item.id] || false;
            return (
              <div 
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedQA(prev => ({ ...prev, [item.id]: !isExpanded }))}
                  className="w-full p-4 text-left bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                      {item.numero}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.pergunta}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{item.resposta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SIDE-SHEET DE RASTREABILIDADE (DRILL-DOWN)
      ========================================================================= */}
      <ExecutiveDrillDownSheet
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        target={drillDownTarget}
        documentosDetalhados={metrics.documentosDetalhados}
        selectedYear={selectedYear}
        onNavigateToDocumento={onNavigateToDocumentos}
      />

      {/* =========================================================================
          MODAL DE AUDITORIA DA QUALIDADE DA BASE DOCUMENTAL
      ========================================================================= */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#00D280]" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Auditoria de Confiabilidade da Base Documental
                  </h3>
                  <span className="text-xs text-slate-500">
                    Score Global: {quality.indiceConfiabilidade}% • Total: {quality.totalAuditados} Documentos
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowQualityModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {quality.criteriosAuditados.map((c, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.criterio}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      c.status === 'Conforme' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status} ({c.conformidadePercent}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{c.finalidade}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{c.detalhe}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowQualityModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
