import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FileDown,
  Download
} from 'lucide-react';
import { TaxItem, NotaFiscal } from '../types/tax';
import { TAX_MATRIX_TEMPORAL } from '../data/taxRules';
import { exportTaxItemsToCSV } from '../utils/exportUtils';

interface FiscalAnalyticsProps {
  items: TaxItem[];
  notas: NotaFiscal[];
  onOpenCalculationMemory: (item: TaxItem) => void;
  selectedYear: number;
}

export const FiscalAnalytics: React.FC<FiscalAnalyticsProps> = ({
  items,
  notas,
  onOpenCalculationMemory,
  selectedYear,
}) => {
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(notas[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const filteredItems = items.filter(i => 
    i.produtoDescricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.ncm.includes(searchTerm) ||
    i.numNota.includes(searchTerm)
  );

  const handleExportCSV = () => {
    const activeList = selectedNota ? selectedNota.itens : items;
    exportTaxItemsToCSV(activeList, selectedYear, selectedNota ? `NF_${selectedNota.numero}` : 'Consolidado');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Fiscal Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Módulo Fiscal & Apuração
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Ano Fiscal {selectedYear}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Detalhamento de Tributos, Bases de Cálculo e Alíquotas
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Navegação e Rastreabilidade Integral: <strong className="text-slate-800">Empresa → Filial → Operação → Nota Fiscal → Item → Produto → NCM → Tributos → Base Legal</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Matriz Temporal de Alíquotas (2026 - 2033) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#00D280]" />
              <span>Matriz Temporal de Alíquotas Oficiais (2026 - 2033)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reflete exclusivamente os parâmetros normativos previstos na EC 132/2023 e LC 214/2025
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 font-mono font-medium">
            Parâmetros Oficiais de Transição
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Tributo</th>
                <th className="py-3 px-3">Atual</th>
                <th className="py-3 px-3">2026</th>
                <th className="py-3 px-3">2027</th>
                <th className="py-3 px-3">2028</th>
                <th className="py-3 px-3">2029</th>
                <th className="py-3 px-3">2030</th>
                <th className="py-3 px-3">2031</th>
                <th className="py-3 px-3">2032</th>
                <th className="py-3 px-3">2033</th>
                <th className="py-3 px-3">Base Legal e Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {TAX_MATRIX_TEMPORAL.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{row.tributo}</td>
                  <td className="py-2.5 px-3 text-slate-500">{row.sistemaAtual.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2026 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2026.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2027 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2027.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2028 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2028.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2029 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2029.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2030 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2030.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2031 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2031.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2032 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2032.toFixed(2)}%</td>
                  <td className={`py-2.5 px-3 ${selectedYear === 2033 ? 'bg-[#00D280]/15 text-slate-900 font-black rounded' : ''}`}>{row.a2033.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-slate-600">
                    <span className="block text-slate-900 font-medium">{row.baseLegal}</span>
                    <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      row.statusRegulamentacao === 'Definido em Lei' 
                        ? 'bg-emerald-50 text-[#059669] border border-emerald-200' 
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {row.statusRegulamentacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visão Fiscal por Nota Fiscal (Header + Item Detail) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#00D280]" />
              <span>Visão Fiscal por Nota Fiscal & Detalhamento dos Itens</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecione uma Nota Fiscal para inspecionar os itens tributados individualmente ou exporte a planilha
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex-shrink-0"
              title="Exportar tabela de transações consolidada para Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#00D280]" />
              <span>Exportar Dados (CSV / Excel)</span>
            </button>

            {/* NF Selector Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-1 max-w-md">
              {notas.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNota(n)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xl transition-all cursor-pointer border whitespace-nowrap ${
                    selectedNota?.id === n.id
                      ? 'bg-[#0F172A] border-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  NF {n.numero}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Header Details of Selected NF */}
        {selectedNota && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Emitente:</span>
                <span className="text-slate-800 font-semibold truncate block">{selectedNota.emitente}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinatário:</span>
                <span className="text-slate-800 font-semibold truncate block">{selectedNota.destinatario}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Origem → Destino:</span>
                <span className="text-slate-900 font-mono font-bold block">{selectedNota.ufOrigem} ({selectedNota.municipioOrigem}) → {selectedNota.ufDestino} ({selectedNota.municipioDestino})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">CFOP / Regime:</span>
                <span className="text-slate-800 font-mono block">{selectedNota.cfopPredominante} • {selectedNota.regimeTributario}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Legado:</span>
                <span className="text-slate-700 font-mono font-semibold block">{formatRS(selectedNota.totalAtual)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Reforma ({selectedYear}):</span>
                <span className="text-[#059669] font-mono font-bold block">{formatRS(selectedNota.totalReforma)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Item Table for Selected NF */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Item / Produto</th>
                <th className="py-3 px-3">NCM</th>
                <th className="py-3 px-3">CFOP/CST</th>
                <th className="py-3 px-3 text-right">Vlr Bruto</th>
                <th className="py-3 px-3 text-right">Tributos Legado</th>
                <th className="py-3 px-3 text-right bg-emerald-50/60 text-[#059669]">Vlr Líquido (Base)</th>
                <th className="py-3 px-3 text-right">CBS ({selectedYear})</th>
                <th className="py-3 px-3 text-right">IBS ({selectedYear})</th>
                <th className="py-3 px-3 text-right">Imp. Seletivo</th>
                <th className="py-3 px-3 text-right">Total Reforma</th>
                <th className="py-3 px-3 text-center">Memória de Cálculo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(selectedNota?.itens || items).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-sans">
                    <span className="font-bold text-slate-900 block">{item.produtoDescricao}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.produtoCodigo} • {item.quantidade} {item.unidade} x {formatRS(item.valorUnitario)}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">{item.ncm}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{item.cfop} / {item.cst}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">{formatRS(item.valorTotal)}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{formatRS(item.totalTributosAtual)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#059669] bg-emerald-50/30">{formatRS(item.valorLiquido ?? (item.valorTotal - item.totalTributosAtual))}</td>
                  <td className="py-3 px-3 text-right text-slate-800">{formatRS(item.vlrCbsReforma)}</td>
                  <td className="py-3 px-3 text-right text-slate-800">{formatRS(item.vlrIbsTotalReforma)}</td>
                  <td className="py-3 px-3 text-right text-orange-600 font-semibold">{formatRS(item.vlrImpostoSeletivoReforma)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#059669]">{formatRS(item.totalTributosReforma)}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onOpenCalculationMemory(item)}
                      className="inline-flex items-center space-x-1 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Auditar</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split Payment & Cashback Mechanisms Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-orange-800 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Mecanismo de Split Payment Bancário</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            No ato da liquidação financeira da transação (PIX, Cartão ou Boleto), a instituição financeira segregará automaticamente a fatia correspondente à CBS (Receita Federal) e ao IBS (Comitê Gestor CGIBS), creditando somente a receita líquida do fornecedor.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-900 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Mecanismo de Cashback do IBS/CBS</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Substituição integral dos antigos benefícios fiscais por devolução de tributos (Cashback) a famílias de baixa renda e consumidores cadastrados no CadÚnico em contas de luz, gás e itens de consumo essencial.
          </p>
        </div>
      </div>
    </div>
  );
};
