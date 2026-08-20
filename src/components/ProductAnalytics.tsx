import React, { useState } from 'react';
import { Package, TrendingUp, AlertCircle, CheckCircle2, Search, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { ProductDetail, ProductTimelinePoint } from '../types/tax';

interface ProductAnalyticsProps {
  produtos: ProductDetail[];
  selectedYear: number;
}

export const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({
  produtos,
  selectedYear,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail>(produtos[0] || null);

  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Top Banner Product Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Módulo de Produtos & Margens
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Simulação por NCM & SKU
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Análise de Impacto por Produto e NCM
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Modelagem de precificação, repasse tributário, risco e projeção de margem bruta e EBITDA consolidado (2026 - 2033).
            </p>
          </div>
        </div>
      </div>

      {/* Product Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {produtos.map((p) => {
          const isSelected = selectedProduct?.codigo === p.codigo;
          return (
            <div
              key={p.codigo}
              onClick={() => setSelectedProduct(p)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-emerald-50/50 border-[#00D280] ring-2 ring-[#00D280]/30 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-[#00D280] hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-800 font-bold uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {p.codigo} • NCM {p.ncm}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{p.descricao}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.familia} • {p.categoria}</p>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  p.risco === 'Alto' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-[#059669] border border-emerald-200'
                }`}>
                  Risco {p.risco}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Receita Total:</span>
                  <span className="text-slate-900 font-bold block font-mono">{formatRS(p.receitaTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Margem Bruta:</span>
                  <span className="text-[#059669] font-bold block font-mono">{p.margemAtualPercent.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Carga Reforma:</span>
                  <span className="text-slate-800 font-bold block font-mono">{p.cargaTributariaReformaPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Analytics Detail */}
      {selectedProduct && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono font-bold">Ficha Analítica do Produto:</span>
              <h2 className="text-xl font-black text-slate-900">{selectedProduct.descricao}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                <span>GTIN: {selectedProduct.gtin}</span> • 
                <span>CEST: {selectedProduct.cest}</span> • 
                <span>Marca: {selectedProduct.marca}</span> • 
                <span>Fornecedor: {selectedProduct.fornecedorPrincipal}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-right">
              <span className="text-slate-500 block text-[11px]">Oportunidade Mapeada:</span>
              <span className="text-[#059669] font-bold">{selectedProduct.oportunidade}</span>
            </div>
          </div>

          {/* Comparative Table 2026 - 2033 for the Product */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-[#00D280]" />
                <span>Projeção Temporal de Desempenho Tributário & Financeiro (2026 - 2033)</span>
              </h3>
              <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 font-mono font-medium">
                Série Histórica e Projetada
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-3">Indicador</th>
                    <th className="py-3 px-3 text-right">Atual</th>
                    <th className="py-3 px-3 text-right">2026</th>
                    <th className="py-3 px-3 text-right">2027</th>
                    <th className="py-3 px-3 text-right">2028</th>
                    <th className="py-3 px-3 text-right">2029</th>
                    <th className="py-3 px-3 text-right">2030</th>
                    <th className="py-3 px-3 text-right">2031</th>
                    <th className="py-3 px-3 text-right">2032</th>
                    <th className="py-3 px-3 text-right">2033</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Receita Bruta</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-900">{formatRS(pt.receita)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Custo Total</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-500">{formatRS(pt.custo)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Tributos Brutos</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-800">{formatRS(pt.tributos)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Créditos de Insumos</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-[#059669] font-bold">{formatRS(pt.creditos)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors bg-slate-100/70 font-bold">
                    <td className="py-2.5 px-3 font-sans text-slate-900">Carga Líquida</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-900">{formatRS(pt.cargaLiquida)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Margem (%)</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-[#059669] font-bold">{pt.margemPercent.toFixed(1)}%</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Markup</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-500">{pt.markup.toFixed(2)}x</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">EBITDA Projetado</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-[#059669] font-bold">{formatRS(pt.ebitda)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Fluxo de Caixa</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-800 font-semibold">{formatRS(pt.fluxoCaixa)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Capital de Giro</td>
                    {selectedProduct.timelineData.map((pt, i) => (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-500">{formatRS(pt.capitalGiro)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
