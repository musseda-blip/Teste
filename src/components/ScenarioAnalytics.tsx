import React from 'react';
import { Sliders, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Calculator, Sparkles } from 'lucide-react';
import { SensitivityParams, ExecutiveKPIs, YearPeriod } from '../types/tax';

interface ScenarioAnalyticsProps {
  sensitivityParams: SensitivityParams;
  setSensitivityParams: React.Dispatch<React.SetStateAction<SensitivityParams>>;
  kpis: ExecutiveKPIs;
  selectedYear: number;
}

export const ScenarioAnalytics: React.FC<ScenarioAnalyticsProps> = ({
  sensitivityParams,
  setSensitivityParams,
  kpis,
  selectedYear,
}) => {
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const resetParams = () => {
    setSensitivityParams({
      precoVendaAdjPercent: 0,
      custoInsumoAdjPercent: 0,
      repasseTributarioPercent: 100,
      aproveitamentoCreditoInsumosPercent: 100,
      aliqCbsEstimada: 8.8,
      aliqIbsEstimada: 17.7,
      aliqImpostoSeletivoEstimada: 5.0,
      mixProdutos: 'Atual',
      segmento: 'Tecnologia / SaaS',
      anoSimulacao: selectedYear as YearPeriod,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Scenario Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Simulador de Sensibilidade
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Motor Dinâmico
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Análise de Sensibilidade & Otimização de Margens
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Altere as premissas em tempo real: <strong className="text-slate-800">Preço → Repasse → Créditos → Alíquotas</strong> e observe o recálculo imediato da DRE, EBITDA e Caixa.
            </p>
          </div>

          <button
            onClick={resetParams}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start md:self-auto font-semibold shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00D280]" />
            <span>Restaurar Premissas</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Controls Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-[#00D280]" />
            <span>Premissas & Variáveis</span>
          </h3>

          {/* Slider 1: Repasse de Preços */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="text-slate-700 font-semibold">Repasse ao Preço de Venda (%):</label>
              <span className="font-mono text-[#059669] font-bold">{sensitivityParams.precoVendaAdjPercent > 0 ? '+' : ''}{sensitivityParams.precoVendaAdjPercent}%</span>
            </div>
            <input
              type="range"
              min="-15"
              max="25"
              step="1"
              value={sensitivityParams.precoVendaAdjPercent}
              onChange={(e) => setSensitivityParams(p => ({ ...p, precoVendaAdjPercent: Number(e.target.value) }))}
              className="w-full accent-[#00D280] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Capacidade da empresa de repassar a variação de carga ao preço final</span>
          </div>

          {/* Slider 2: Aproveitamento de Créditos */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="text-slate-700 font-semibold">Aproveitamento Crédito Insumos (%):</label>
              <span className="font-mono text-[#059669] font-bold">{sensitivityParams.aproveitamentoCreditoInsumosPercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={sensitivityParams.aproveitamentoCreditoInsumosPercent}
              onChange={(e) => setSensitivityParams(p => ({ ...p, aproveitamentoCreditoInsumosPercent: Number(e.target.value) }))}
              className="w-full accent-[#00D280] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Eficiência na tomada de créditos sobre insumos, licenças e serviços</span>
          </div>

          {/* Slider 3: Alíquota Estimada CBS */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="text-slate-700 font-semibold">Alíquota CBS Federal (%):</label>
              <span className="font-mono text-slate-900 font-bold">{sensitivityParams.aliqCbsEstimada}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="0.1"
              value={sensitivityParams.aliqCbsEstimada}
              onChange={(e) => setSensitivityParams(p => ({ ...p, aliqCbsEstimada: Number(e.target.value) }))}
              className="w-full accent-[#0F172A] cursor-pointer"
            />
          </div>

          {/* Slider 4: Alíquota Estimada IBS */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="text-slate-700 font-semibold">Alíquota IBS Estadual/Mun (%):</label>
              <span className="font-mono text-slate-900 font-bold">{sensitivityParams.aliqIbsEstimada}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="22"
              step="0.1"
              value={sensitivityParams.aliqIbsEstimada}
              onChange={(e) => setSensitivityParams(p => ({ ...p, aliqIbsEstimada: Number(e.target.value) }))}
              className="w-full accent-[#0F172A] cursor-pointer"
            />
          </div>

          {/* Slider 5: Imposto Seletivo */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="text-slate-700 font-semibold">Alíquota Imposto Seletivo (%):</label>
              <span className="font-mono text-orange-600 font-bold">{sensitivityParams.aliqImpostoSeletivoEstimada}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={sensitivityParams.aliqImpostoSeletivoEstimada}
              onChange={(e) => setSensitivityParams(p => ({ ...p, aliqImpostoSeletivoEstimada: Number(e.target.value) }))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Recalculated Output Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Calculator className="w-4 h-4 text-[#00D280]" />
            <span>Resultado Recalculado em Tempo Real</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Carga Tributária Recalculada</span>
              <span className="text-2xl font-black text-slate-900 block mt-1 font-mono">{formatRS(kpis.tributosReforma)}</span>
              <span className="text-xs text-slate-500 font-semibold block mt-1 font-mono">
                Alíquota Efetiva: {kpis.cargaTributariaReformaPercent.toFixed(2)}% da Receita
              </span>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80">
              <span className="text-xs text-slate-600 block font-semibold">EBITDA Recalculado</span>
              <span className="text-2xl font-black text-[#059669] block mt-1 font-mono">{formatRS(kpis.ebitdaReforma)}</span>
              <span className="text-xs text-[#059669] font-bold block mt-1 font-mono">
                Margem EBITDA: {kpis.margemEbitdaReformaPercent.toFixed(2)}%
              </span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Crédito Estimado de Insumos</span>
              <span className="text-xl font-bold text-slate-900 block mt-1 font-mono">{formatRS(kpis.creditosReforma)}</span>
              <span className="text-xs text-slate-400 block mt-1">Não-cumulatividade plena aplicada</span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Fluxo de Caixa Operacional</span>
              <span className="text-xl font-bold text-slate-900 block mt-1 font-mono">{formatRS(kpis.fluxoCaixaReforma)}</span>
              <span className="text-xs text-slate-400 block mt-1">Líquido de Split Payment no banco</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Diagnóstico Automático de Sensibilidade:</span>
            Para cada +1,0% de ajuste no preço de venda com repasse B2B, a margem EBITDA recupera +0,85 pontos percentuais de rentabilidade, compensando integralmente a elevação de alíquota nominal do CBS/IBS nos serviços e tecnologia.
          </div>
        </div>
      </div>
    </div>
  );
};
