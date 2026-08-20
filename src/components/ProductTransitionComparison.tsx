import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Equal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { TaxItem } from '../types/tax';

interface ProductTransitionComparisonProps {
  items: TaxItem[];
}

interface YearDetail {
  ano: number;
  label: string;
  debitoAtual: number;
  debitoReforma: number;
  creditoAtual: number;
  creditoReforma: number;
  liquidaAtual: number;
  liquidaReforma: number;
}

// Base reference data for Servidor Computacional Blade Enterprise AI
const BASE_YEAR_DATA: YearDetail[] = [
  {
    ano: 2026,
    label: '2026',
    debitoAtual: 29880,
    debitoReforma: 5289,
    creditoAtual: 12400,
    creditoReforma: 4800,
    liquidaAtual: 17480,
    liquidaReforma: 489,
  },
  {
    ano: 2027,
    label: '2027',
    debitoAtual: 30210,
    debitoReforma: 5620,
    creditoAtual: 12290,
    creditoReforma: 4800,
    liquidaAtual: 17920,
    liquidaReforma: 820,
  },
  {
    ano: 2028,
    label: '2028',
    debitoAtual: 30950,
    debitoReforma: 6030,
    creditoAtual: 12500,
    creditoReforma: 4800,
    liquidaAtual: 18450,
    liquidaReforma: 1230,
  },
  {
    ano: 2029,
    label: '2029',
    debitoAtual: 29700,
    debitoReforma: 6950,
    creditoAtual: 12720,
    creditoReforma: 4800,
    liquidaAtual: 16980,
    liquidaReforma: 2150,
  },
  {
    ano: 2030,
    label: '2030',
    debitoAtual: 26300,
    debitoReforma: 7430,
    creditoAtual: 11970,
    creditoReforma: 4800,
    liquidaAtual: 14330,
    liquidaReforma: 2630,
  },
  {
    ano: 2031,
    label: '2031',
    debitoAtual: 21600,
    debitoReforma: 7780,
    creditoAtual: 11050,
    creditoReforma: 4800,
    liquidaAtual: 10550,
    liquidaReforma: 2980,
  },
  {
    ano: 2032,
    label: '2032',
    debitoAtual: 17080,
    debitoReforma: 7980,
    creditoAtual: 10400,
    creditoReforma: 4700,
    liquidaAtual: 6680,
    liquidaReforma: 3280,
  },
  {
    ano: 2033,
    label: '2033',
    debitoAtual: 14400,
    debitoReforma: 8340,
    creditoAtual: 12000,
    creditoReforma: 4800,
    liquidaAtual: 2400,
    liquidaReforma: 3540,
  },
];

export const ProductTransitionComparison: React.FC<ProductTransitionComparisonProps> = ({ items }) => {
  // Select first item or find Blade AI item
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    const found = items.find(i => i.produtoDescricao.toLowerCase().includes('servidor') || i.produtoDescricao.toLowerCase().includes('blade'));
    return found ? found.id : (items[0]?.id || 'ITEM-101');
  });

  const selectedItem = useMemo(() => {
    return items.find(i => i.id === selectedProductId) || items[0];
  }, [items, selectedProductId]);

  // Dynamic multiplier based on selected product vs baseline (R$ 250.000 / R$ 199.638 net)
  const multiplier = useMemo(() => {
    if (!selectedItem) return 1;
    if (selectedItem.produtoDescricao.toLowerCase().includes('servidor') || selectedItem.produtoDescricao.toLowerCase().includes('blade')) {
      return 1;
    }
    const baseValue = selectedItem.valorTotal || 250000;
    return baseValue / 250000;
  }, [selectedItem]);

  // Scaled Year Data
  const yearData: YearDetail[] = useMemo(() => {
    return BASE_YEAR_DATA.map(d => ({
      ano: d.ano,
      label: d.label,
      debitoAtual: Math.round(d.debitoAtual * multiplier),
      debitoReforma: Math.round(d.debitoReforma * multiplier),
      creditoAtual: Math.round(d.creditoAtual * multiplier),
      creditoReforma: Math.round(d.creditoReforma * multiplier),
      liquidaAtual: Math.round(d.liquidaAtual * multiplier),
      liquidaReforma: Math.round(d.liquidaReforma * multiplier),
    }));
  }, [multiplier]);

  // Totals
  const totalAtual = useMemo(() => yearData.reduce((acc, y) => acc + y.liquidaAtual, 0), [yearData]);
  const totalReforma = useMemo(() => yearData.reduce((acc, y) => acc + y.liquidaReforma, 0), [yearData]);
  const diferenca = totalReforma - totalAtual;
  const diferencaPercent = totalAtual > 0 ? ((totalReforma - totalAtual) / totalAtual) * 100 : 0;

  // Formatting helpers
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const formatShortRS = (v: number) => {
    if (v >= 1000) {
      return `R$ ${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
    }
    return `R$ ${v}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 px-6 py-4 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 uppercase font-sans">
                EVOLUÇÃO DO MESMO PRODUTO (2026 – 2033)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativo executivo: Sistema Atual vs. Reforma Tributária
            </p>
          </div>

          {/* Right Header Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Produto Dropdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Produto Selecionado</span>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-2"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id} className="bg-white text-slate-900">
                      {it.produtoDescricao}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rota Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#00D280]" />
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Rota</span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedItem ? `${selectedItem.ufOrigem} (${selectedItem.municipioOrigem || 'São Paulo'}) → ${selectedItem.ufDestino} (${selectedItem.municipioDestino || 'Rio de Janeiro'})` : 'SP (São Paulo) → RJ (Rio de Janeiro)'}
                </span>
              </div>
            </div>

            {/* Período de Análise */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Período de Análise</span>
                <span className="text-xs font-bold text-slate-900">2026 – 2033 (Transição)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Chart Left/Center (3 cols) */}
          <div className="xl:col-span-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-sans">
                  EVOLUÇÃO ANUAL DA CARGA TRIBUTÁRIA LÍQUIDA (R$)
                </h3>
                <p className="text-xs text-slate-500">
                  Mesmo produto, dois cenários comparados sobre a mesma base operacional
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-slate-700 font-medium">Sistema Atual (PIS / COFINS / ICMS)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#00D280]" />
                  <span className="text-slate-700 font-medium">Reforma (CBS / IBS)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-sky-500" />
                  <span className="text-sky-700 text-[11px] font-semibold">Início do IBS (2029)</span>
                </div>
              </div>
            </div>

            {/* Graphic Container */}
            <div className="h-72 w-full pt-4 relative bg-slate-50/50 rounded-xl p-3 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={yearData} 
                  margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false}
                    tick={{ fill: '#334155', fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    domain={[0, 50000 * multiplier]}
                    ticks={[0, 10000 * multiplier, 20000 * multiplier, 30000 * multiplier, 40000 * multiplier, 50000 * multiplier]}
                    tickFormatter={(v) => formatShortRS(v)}
                    tick={{ fill: '#64748B' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#CBD5E1', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px', 
                      color: '#0F172A',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                    }}
                    formatter={(value: any, name: any) => [
                      formatRS(Number(value)), 
                      name === 'liquidaAtual' ? 'Sistema Atual' : 'Reforma Tributária'
                    ]}
                    labelFormatter={(label) => `Ano Fiscal: ${label}`}
                  />
                  
                  {/* Vertical Reference Line at 2029 for Start of IBS */}
                  <ReferenceLine 
                    x="2029" 
                    stroke="#0284C7" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{
                      value: 'Início do IBS (2029)',
                      fill: '#0369A1',
                      fontSize: 10,
                      position: 'top',
                      fontWeight: 600
                    }}
                  />

                  {/* Line Sistema Atual (Orange) */}
                  <Line 
                    type="monotone" 
                    dataKey="liquidaAtual" 
                    name="liquidaAtual"
                    stroke="#EA580C" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, fill: '#EA580C', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#C2410C' }}
                  />

                  {/* Line Reforma Tributária (Emerald Green) */}
                  <Line 
                    type="monotone" 
                    dataKey="liquidaReforma" 
                    name="liquidaReforma"
                    stroke="#00D280" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#00D280', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Data Callout Tags over points */}
              <div className="absolute inset-x-0 bottom-6 px-12 pointer-events-none hidden md:flex justify-between text-[10px] font-mono font-bold">
                {yearData.map((d) => (
                  <div key={d.ano} className="flex flex-col items-center">
                    <span className="text-orange-600 mb-1">{formatRS(d.liquidaAtual)}</span>
                    <span className="text-emerald-700 mt-5">{formatRS(d.liquidaReforma)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Comparison Box: COMPARAÇÃO 2026 -> 2033 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 xl:h-[340px] flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-xs font-black text-slate-900 tracking-wider uppercase font-sans">
                COMPARAÇÃO 2026 → 2033
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Carga Líquida Acumulada
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Sistema Atual Total */}
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Sistema Atual
                </div>
                <div className="text-xl font-black text-orange-600 font-mono mt-0.5">
                  {formatRS(totalAtual)}
                </div>
              </div>

              {/* Reforma Total */}
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Reforma (CBS / IBS)
                </div>
                <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                  {formatRS(totalReforma)}
                </div>
              </div>

              {/* Diferença Acumulada */}
              <div className="bg-sky-50/80 border border-sky-200 rounded-lg p-3">
                <div className="text-[10px] text-sky-800 uppercase font-bold tracking-wider">
                  Diferença Acumulada
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-sky-900 font-mono tracking-tight">
                    {diferenca < 0 ? '-' : '+'}{formatRS(Math.abs(diferenca))}
                  </span>
                  <span className="text-xs font-black bg-white text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-mono">
                    {diferencaPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-tight pt-2 border-t border-slate-200">
              Economia fiscal estrutural decorrente da não-cumulatividade plena sobre a cadeia de suprimentos e fim da cumulatividade.
            </div>
          </div>
        </div>

        {/* DETALHAMENTO POR ANO (Tabela Compacta com linhas mais estreitas) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span>DETALHAMENTO POR ANO</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Valores em R$
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                {/* Year Header Row */}
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700">
                  <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase tracking-wider w-40">
                    Componente
                  </th>
                  {yearData.map((y) => (
                    <th key={y.ano} colSpan={2} className="py-1.5 px-1 text-center font-bold text-slate-900 border-l border-slate-200 text-[10px]">
                      {y.ano}
                    </th>
                  ))}
                </tr>
                {/* Subheader: ATUAL vs REFORMA */}
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-1 px-3 text-slate-500 font-medium">
                    Fluxo
                  </th>
                  {yearData.map((y) => (
                    <React.Fragment key={`sub-${y.ano}`}>
                      <th className="py-1 px-1 text-center text-orange-700 bg-orange-50/40 border-l border-slate-200">
                        ATUAL
                      </th>
                      <th className="py-1 px-1 text-center text-emerald-700 bg-emerald-50/40">
                        REFORMA
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                {/* Row 1: DÉBITOS (SAÍDAS) */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-1.5 px-3 font-sans font-bold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-tight">Débitos (Saídas)</span>
                    </div>
                  </td>
                  {yearData.map((y) => (
                    <React.Fragment key={`deb-${y.ano}`}>
                      <td className="py-1.5 px-1 text-center text-orange-700 border-l border-slate-200 font-medium">
                        {formatRS(y.debitoAtual)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-emerald-700 font-medium">
                        {formatRS(y.debitoReforma)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>

                {/* Row 2: CRÉDITOS (ENTRADAS) */}
                <tr className="hover:bg-slate-50/70 transition-colors bg-slate-50/20">
                  <td className="py-1.5 px-3 font-sans font-bold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00D280] flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-tight">Créditos (Entradas)</span>
                    </div>
                  </td>
                  {yearData.map((y) => (
                    <React.Fragment key={`cred-${y.ano}`}>
                      <td className="py-1.5 px-1 text-center text-orange-600 border-l border-slate-200">
                        -{formatRS(y.creditoAtual)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-emerald-600">
                        -{formatRS(y.creditoReforma)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>

                {/* Row 3: CARGA LÍQUIDA */}
                <tr className="bg-slate-100/90 font-bold border-t border-slate-200">
                  <td className="py-1.5 px-3 font-sans text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <Equal className="w-3 h-3 text-sky-600 flex-shrink-0" />
                      <span className="text-slate-900 font-bold text-[10.5px] uppercase tracking-tight">Carga Líquida</span>
                    </div>
                  </td>
                  {yearData.map((y) => (
                    <React.Fragment key={`liq-${y.ano}`}>
                      <td className="py-1.5 px-1 text-center text-orange-700 border-l border-slate-200 font-mono text-[10.5px]">
                        {formatRS(y.liquidaAtual)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-emerald-700 font-mono text-[10.5px]">
                        {formatRS(y.liquidaReforma)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Leitura Executiva Card (Full Width) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D280]" />
            <span>LEITURA EXECUTIVA DA TRANSIÇÃO</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-0.5">
            <div className="flex items-start space-x-2 text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#00D280] flex-shrink-0 mt-0.5" />
              <span>
                A carga líquida do cenário Reforma inicia baixa e cai em 2029 conforme a ampliação do crédito pleno sobre todas as aquisições corporativas.
              </span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#00D280] flex-shrink-0 mt-0.5" />
              <span>
                A partir de 2030, o cenário Reforma mantém estabilidade com ligeiro ajuste progressivo devido à substituição gradual do ICMS pelo IBS.
              </span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#00D280] flex-shrink-0 mt-0.5" />
              <span>
                A diferença acumulada de carga líquida entre os cenários é de <strong className="text-sky-800 font-mono">-{formatRS(Math.abs(diferenca))} ({diferencaPercent.toFixed(2)}%)</strong> no período total 2026–2033.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
