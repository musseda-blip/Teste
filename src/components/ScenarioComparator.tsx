import React, { useState } from 'react';
import { 
  GitCompare, 
  Plus, 
  Save, 
  FileDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  ShieldCheck,
  Building2,
  Trash2,
  Play
} from 'lucide-react';
import { SavedSimulation } from '../types/simulation';
import { ExecutiveKPIs, SensitivityParams, YearPeriod } from '../types/tax';
import { Language, DICTIONARY } from '../utils/i18n';

interface ScenarioComparatorProps {
  currentKPIs: ExecutiveKPIs;
  currentParams: SensitivityParams;
  savedSimulations: SavedSimulation[];
  onSaveSimulation: (nome: string, descricao: string) => void;
  onLoadSimulation: (sim: SavedSimulation) => void;
  selectedYear: YearPeriod;
  onExportReportPDF: () => void;
  currentLanguage: Language;
}

export const ScenarioComparator: React.FC<ScenarioComparatorProps> = ({
  currentKPIs,
  currentParams,
  savedSimulations,
  onSaveSimulation,
  onLoadSimulation,
  selectedYear,
  onExportReportPDF,
  currentLanguage,
}) => {
  const t = DICTIONARY[currentLanguage];

  const currentLiveSimulation: SavedSimulation = {
    id: 'live_current',
    nome: '⚡ Cenário em Tempo Real (Live Cockpit)',
    descricao: 'Parâmetros atualmente selecionados no cockpit interativo.',
    anoBase: selectedYear,
    segmento: currentParams.segmento,
    sensitivityParams: { ...currentParams },
    calculatedKPIs: { ...currentKPIs },
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    autorNome: 'Consultor Ativo',
  };

  const allScenarios: SavedSimulation[] = [
    currentLiveSimulation,
    ...savedSimulations,
  ];

  const [scenarioAId, setScenarioAId] = useState<string>(allScenarios[0]?.id || 'live_current');
  const [scenarioBId, setScenarioBId] = useState<string>(
    allScenarios.length > 1 ? allScenarios[1]?.id : allScenarios[0]?.id
  );

  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [newSimDesc, setNewSimDesc] = useState('');

  const simA = allScenarios.find((s) => s.id === scenarioAId) || allScenarios[0];
  const simB = allScenarios.find((s) => s.id === scenarioBId) || allScenarios[1] || allScenarios[0];

  const formatRS = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  // Delta calculations (B vs A)
  const kpisA = simA.calculatedKPIs;
  const kpisB = simB.calculatedKPIs;

  const cbsDiff = simB.sensitivityParams.aliqCbsEstimada - simA.sensitivityParams.aliqCbsEstimada;
  const ibsDiff = simB.sensitivityParams.aliqIbsEstimada - simA.sensitivityParams.aliqIbsEstimada;
  const isDiff = simB.sensitivityParams.aliqImpostoSeletivoEstimada - simA.sensitivityParams.aliqImpostoSeletivoEstimada;
  
  const cargaAliqA = kpisA.cargaTributariaReformaPercent;
  const cargaAliqB = kpisB.cargaTributariaReformaPercent;
  const cargaAliqDiff = cargaAliqB - cargaAliqA;

  const tributosDiffRS = kpisB.tributosReforma - kpisA.tributosReforma;
  const creditosDiffRS = kpisB.creditosReforma - kpisA.creditosReforma;
  const ebitdaDiffRS = kpisB.ebitdaReforma - kpisA.ebitdaReforma;
  const ebitdaMargemDiff = kpisB.margemEbitdaReformaPercent - kpisA.margemEbitdaReformaPercent;
  const repasseDiff = simB.sensitivityParams.repasseTributarioPercent - simA.sensitivityParams.repasseTributarioPercent;

  const handleSaveCurrentAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSimName.trim()) return;

    onSaveSimulation(newSimName, newSimDesc);
    setIsSavingModalOpen(false);
    setNewSimName('');
    setNewSimDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                {t.comparator.scenarioA} vs {t.comparator.scenarioB}
              </span>
              <span className="text-xs font-bold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Ano Base {selectedYear}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              {t.comparator.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {t.comparator.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSavingModalOpen(true)}
              className="px-4 py-2.5 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.actions.save}</span>
            </button>

            <button
              onClick={onExportReportPDF}
              className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{t.actions.exportPDF}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors: Scenario A (Base) vs Scenario B (Target) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Scenario A Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.comparator.scenarioA} (Linha de Base)
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
              Referência
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Selecione o Cenário A:
            </label>
            <select
              value={scenarioAId}
              onChange={(e) => setScenarioAId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl p-3 outline-none focus:border-[#00D280] cursor-pointer"
            >
              {allScenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.segmento} - {s.anoBase})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Alíquotas Aplicadas:</span>
              <span className="font-bold text-slate-900 font-mono">
                CBS {simA.sensitivityParams.aliqCbsEstimada}% • IBS {simA.sensitivityParams.aliqIbsEstimada}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Repasse Comercial:</span>
              <span className="font-bold text-slate-900 font-mono">
                {simA.sensitivityParams.repasseTributarioPercent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">EBITDA Projetado:</span>
              <span className="font-bold text-slate-900 font-mono">{formatRS(kpisA.ebitdaReforma)}</span>
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md border border-slate-700">
            VS
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
            Diferencial
          </span>
        </div>

        {/* Scenario B Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
              {t.comparator.scenarioB} (Cenário Estratégico)
            </span>
            <span className="text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              Projeção
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Selecione o Cenário B:
            </label>
            <select
              value={scenarioBId}
              onChange={(e) => setScenarioBId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl p-3 outline-none focus:border-[#00D280] cursor-pointer"
            >
              {allScenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.segmento} - {s.anoBase})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Alíquotas Aplicadas:</span>
              <span className="font-bold text-slate-900 font-mono">
                CBS {simB.sensitivityParams.aliqCbsEstimada}% • IBS {simB.sensitivityParams.aliqIbsEstimada}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Repasse Comercial:</span>
              <span className="font-bold text-slate-900 font-mono">
                {simB.sensitivityParams.repasseTributarioPercent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">EBITDA Projetado:</span>
              <span className="font-bold text-slate-900 font-mono">{formatRS(kpisB.ebitdaReforma)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights: Key Rate Differences (IBS / CBS / IS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CBS Rate Delta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">CBS Federal</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono">
              {simA.sensitivityParams.aliqCbsEstimada}% → {simB.sensitivityParams.aliqCbsEstimada}%
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {cbsDiff >= 0 ? `+${cbsDiff.toFixed(2)}` : cbsDiff.toFixed(2)} p.p.
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Diferencial de Alíquota Federal</span>
        </div>

        {/* IBS Rate Delta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">IBS Estadual/Mun.</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono">
              {simA.sensitivityParams.aliqIbsEstimada}% → {simB.sensitivityParams.aliqIbsEstimada}%
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {ibsDiff >= 0 ? `+${ibsDiff.toFixed(2)}` : ibsDiff.toFixed(2)} p.p.
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Diferencial Subnacional</span>
        </div>

        {/* EBITDA Difference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">Impacto no EBITDA</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00D280]" />
          </div>
          <div className={`text-xl font-black font-mono ${ebitdaDiffRS >= 0 ? 'text-[#059669]' : 'text-rose-600'}`}>
            {ebitdaDiffRS >= 0 ? `+${formatRS(ebitdaDiffRS)}` : formatRS(ebitdaDiffRS)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {ebitdaMargemDiff >= 0 ? `+${ebitdaMargemDiff.toFixed(2)} p.p.` : `${ebitdaMargemDiff.toFixed(2)} p.p.`} de Margem
          </span>
        </div>

        {/* Credits Difference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">Créditos de Insumos</span>
            <Sparkles className="w-3.5 h-3.5 text-[#00D280]" />
          </div>
          <div className="text-xl font-black text-[#059669] font-mono">
            +{formatRS(Math.abs(creditosDiffRS))}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ganho por Não-Cumulatividade</span>
        </div>
      </div>

      {/* Comprehensive Side-by-Side Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Quadro Geral de Indicadores Comparativos (B vs A)
            </h3>
            <p className="text-xs text-slate-500">
              Contraste detalhado de receitas, tributos, margens e sensibilidade
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLoadSimulation(simB)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-700" />
              <span>Carregar Cenário B no Cockpit</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Indicador Financeiro / Fiscal</th>
                <th className="py-3 px-4">Cenário A ({simA.nome.substring(0, 22)})</th>
                <th className="py-3 px-4">Cenário B ({simB.nome.substring(0, 22)})</th>
                <th className="py-3 px-4 text-right">Variação Absoluta (B - A)</th>
                <th className="py-3 px-4 text-center">Impacto Estratégico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Receita Bruta */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Receita Bruta Faturada</td>
                <td className="py-3 px-4 font-mono font-medium">{formatRS(kpisA.receitaBruta)}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatRS(kpisB.receitaBruta)}</td>
                <td className="py-3 px-4 font-mono text-right font-bold text-slate-800">
                  {formatRS(kpisB.receitaBruta - kpisA.receitaBruta)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Faturamento
                  </span>
                </td>
              </tr>

              {/* Volume Tributos Totais */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Volume Total de Tributos</td>
                <td className="py-3 px-4 font-mono">{formatRS(kpisA.tributosReforma)}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatRS(kpisB.tributosReforma)}</td>
                <td className="py-3 px-4 font-mono text-right font-bold text-slate-900">
                  <span className={tributosDiffRS <= 0 ? 'text-[#059669]' : 'text-rose-600'}>
                    {tributosDiffRS > 0 ? `+${formatRS(tributosDiffRS)}` : formatRS(tributosDiffRS)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tributosDiffRS <= 0 ? 'bg-emerald-100 text-[#059669]' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {tributosDiffRS <= 0 ? 'Economia Fiscal' : 'Maior Desembolso'}
                  </span>
                </td>
              </tr>

              {/* Créditos de Insumos */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Créditos de Insumos (Não-Cumulatividade)</td>
                <td className="py-3 px-4 font-mono">{formatRS(kpisA.creditosReforma)}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatRS(kpisB.creditosReforma)}</td>
                <td className="py-3 px-4 font-mono text-right font-bold text-[#059669]">
                  +{formatRS(creditosDiffRS)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669]">
                    Geração de Crédito
                  </span>
                </td>
              </tr>

              {/* EBITDA Projetado */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-emerald-50/20">
                <td className="py-3 px-4 font-bold text-slate-900">EBITDA Operacional Projetado</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{formatRS(kpisA.ebitdaReforma)}</td>
                <td className="py-3 px-4 font-mono font-black text-slate-900">{formatRS(kpisB.ebitdaReforma)}</td>
                <td className="py-3 px-4 font-mono text-right font-black">
                  <span className={ebitdaDiffRS >= 0 ? 'text-[#059669]' : 'text-rose-600'}>
                    {ebitdaDiffRS >= 0 ? `+${formatRS(ebitdaDiffRS)}` : formatRS(ebitdaDiffRS)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ebitdaDiffRS >= 0 ? 'bg-emerald-100 text-[#059669]' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {ebitdaDiffRS >= 0 ? 'Ganho de EBITDA' : 'Redução de EBITDA'}
                  </span>
                </td>
              </tr>

              {/* Margem EBITDA */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Margem EBITDA (%)</td>
                <td className="py-3 px-4 font-mono">{kpisA.margemEbitdaReformaPercent.toFixed(2)}%</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{kpisB.margemEbitdaReformaPercent.toFixed(2)}%</td>
                <td className="py-3 px-4 font-mono text-right font-bold">
                  <span className={ebitdaMargemDiff >= 0 ? 'text-[#059669]' : 'text-rose-600'}>
                    {ebitdaMargemDiff >= 0 ? `+${ebitdaMargemDiff.toFixed(2)}` : ebitdaMargemDiff.toFixed(2)} p.p.
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ebitdaMargemDiff >= 0 ? 'bg-emerald-100 text-[#059669]' : 'bg-rose-100 text-rose-700'
                  }`}>
                    Rentabilidade
                  </span>
                </td>
              </tr>

              {/* Repasse Tributário */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Premissa de Repasse de Preços</td>
                <td className="py-3 px-4 font-mono">{simA.sensitivityParams.repasseTributarioPercent}%</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{simB.sensitivityParams.repasseTributarioPercent}%</td>
                <td className="py-3 px-4 font-mono text-right font-bold text-slate-800">
                  {repasseDiff >= 0 ? `+${repasseDiff}` : repasseDiff} p.p.
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Pricing
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Simulation Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Gravar Novo Cenário de Simulação</h3>
                <p className="text-xs text-slate-500">Salve o estado atual do cockpit no repositório corporativo</p>
              </div>
            </div>

            <form onSubmit={handleSaveCurrentAsNew} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Cenário</label>
                <input
                  type="text"
                  required
                  value={newSimName}
                  onChange={(e) => setNewSimName(e.target.value)}
                  placeholder="Ex: Cenário Otimizado 2026 - Repasse B2B 100%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição & Premissas</label>
                <textarea
                  rows={3}
                  value={newSimDesc}
                  onChange={(e) => setNewSimDesc(e.target.value)}
                  placeholder="Descreva as hipóteses de mercado, mix de produtos e alíquotas aplicadas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSavingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00D280] text-slate-950 font-black hover:bg-[#00b870] cursor-pointer"
                >
                  Gravar Cenário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
