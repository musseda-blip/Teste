import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { MARKET_BENCHMARK_LIST } from '../data/marketBenchmark';

export const MarketBenchmark: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSplitPayment, setFilterSplitPayment] = useState(false);

  const filteredList = MARKET_BENCHMARK_LIST.filter(s => {
    const matchesSearch = s.software.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.focoMercado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSplit = !filterSplitPayment || s.splitPaymentReady;
    return matchesSearch && matchesSplit;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Market Benchmark */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Benchmark de Mercado
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                10 Principais Softwares Fiscais
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Matriz Comparativa de Softwares Fiscais e Engines Tributárias
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Mapeamento de maturidade funcional e aderência aos mandatos da Reforma Tributária (CBS, IBS, Imposto Seletivo e Split Payment).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por software, fabricante ou ERP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#00D280] w-full placeholder:text-slate-400"
          />
        </div>

        <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer select-none px-2 py-1">
          <input
            type="checkbox"
            checked={filterSplitPayment}
            onChange={(e) => setFilterSplitPayment(e.target.checked)}
            className="rounded border-slate-300 text-[#00D280] focus:ring-0 cursor-pointer w-4 h-4 accent-[#00D280]"
          />
          <span>Somente Softwares com Suporte a Split Payment</span>
        </label>
      </div>

      {/* Software Benchmark Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">Software / Fabricante</th>
              <th className="py-3 px-3">Foco Principal de Mercado</th>
              <th className="py-3 px-3">Cobertura da Reforma & ERPs</th>
              <th className="py-3 px-3 text-center">Split Payment</th>
              <th className="py-3 px-3 text-center">Engine Item</th>
              <th className="py-3 px-3 text-center">DRE Impact</th>
              <th className="py-3 px-3">Posicionamento & Diferencial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.map((s) => {
              const isSimulador = s.id === 1;
              return (
                <tr 
                  key={s.id} 
                  className={`transition-colors ${isSimulador ? 'bg-[#00D280]/5 hover:bg-[#00D280]/10 font-medium' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-3.5 px-3 font-mono text-slate-400 font-bold">
                    {String(s.id).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold block text-sm ${isSimulador ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                        {s.software}
                      </span>
                      {isSimulador && (
                        <span className="bg-[#00D280] text-[#0F172A] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                          Destaque
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{s.fabricante}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 max-w-xs">{s.focoMercado}</td>
                  <td className="py-3.5 px-3 text-slate-700 max-w-xs font-mono text-[11px]">
                    <span className="block text-slate-900 font-semibold">{s.coberturaReforma}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">ERP: {s.integracaoErp}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {s.splitPaymentReady ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00D280] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline" />
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {s.itemLevelEngine ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00D280] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline" />
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {s.dreImpactModule ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00D280] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline" />
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {s.diferencialEbitax}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
