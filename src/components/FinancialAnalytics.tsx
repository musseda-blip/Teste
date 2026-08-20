import React from 'react';
import { DollarSign, TrendingUp, Activity, PieChart, RefreshCw, Award, ArrowUpRight } from 'lucide-react';
import { ExecutiveKPIs } from '../types/tax';

interface FinancialAnalyticsProps {
  kpis: ExecutiveKPIs;
  selectedYear: number;
}

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  kpis,
  selectedYear,
}) => {
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const precoAjustadoIdeal = kpis.receitaBruta * (1 + Math.max(0, kpis.impactoFiscalPercent / 100));

  return (
    <div className="space-y-6">
      {/* Top Banner Financial Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Módulo Financeiro & Fluxo
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Ano Fiscal {selectedYear}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Demonstrativo Financeiro, Fluxo de Caixa e Capital de Giro
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Análise de EBITDA, precificação para manutenção de margem, ROI de adequação fiscal e liquidez no Split Payment.
            </p>
          </div>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Receita Bruta x Líquida</span>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 block font-mono">{formatRS(kpis.receitaBruta)}</span>
            <span className="text-xs text-[#059669] font-bold mt-1 block font-mono">
              Líquida pós-IBS/CBS: {formatRS(kpis.receitaLiquida)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">EBITDA Operacional</span>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 block font-mono">{formatRS(kpis.ebitdaReforma)}</span>
            <span className="text-xs text-[#059669] font-bold mt-1 block font-mono">
              Margem EBITDA: {kpis.margemEbitdaReformaPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Preço p/ Manter Margem</span>
          <div className="mt-3">
            <span className="text-2xl font-black text-orange-600 block font-mono">{formatRS(precoAjustadoIdeal)}</span>
            <span className="text-xs text-slate-500 mt-1 block font-mono">
              Repasse recomendado: +{Math.max(0, kpis.impactoFiscalPercent).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* ROI & Payback Analysis Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Award className="w-4 h-4 text-[#00D280]" />
          <span>Indicadores de ROI & Payback do Projeto de Adequação Fiscal</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-semibold text-[11px]">Investimento em Adequação:</span>
            <span className="text-lg font-black text-slate-900 block mt-1 font-mono">R$ 250.000,00</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Parametrização ERP + Consultoria Tributária Especializada</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-semibold text-[11px]">Ganho Anual de Eficiência:</span>
            <span className="text-lg font-black text-[#059669] block mt-1 font-mono">{formatRS(Math.abs(kpis.creditosReforma * 0.3))}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Aproveitamento Pleno de Insumos</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-semibold text-[11px]">Payback Estimado:</span>
            <span className="text-lg font-black text-slate-900 block mt-1 font-mono">4.2 Meses</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Retorno do Capital Aplicado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
