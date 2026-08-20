import React, { useState } from 'react';
import { 
  Globe2, 
  MapPin, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Info,
  HelpCircle,
  Sparkles,
  Calculator,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { TaxItem, YearPeriod } from '../types/tax';

interface OperationalAnalyticsProps {
  items: TaxItem[];
  selectedYear?: YearPeriod;
}

export const OperationalAnalytics: React.FC<OperationalAnalyticsProps> = ({ 
  items,
  selectedYear = 2026 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUfDestino, setSelectedUfDestino] = useState<string>('todos');

  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const formatRSCompact = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filialNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produtoDescricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ncm.includes(searchTerm) ||
      item.ufOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ufDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.municipioOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.municipioDestino.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUf = selectedUfDestino === 'todos' || item.ufDestino === selectedUfDestino;

    return matchesSearch && matchesUf;
  });

  const totalValorBruto = items.reduce((acc, i) => acc + i.valorTotal, 0);
  const totalIcmsLegado = items.reduce((acc, i) => acc + i.vlrIcmsAtual, 0);
  const totalPisCofinsLegado = items.reduce((acc, i) => acc + (i.vlrPisAtual + i.vlrCofinsAtual), 0);
  
  // Valor Líquido = Valor Bruto - ICMS - PIS - COFINS (ou total tributos por dentro)
  const getItemValorLiquido = (item: TaxItem) => {
    const deducoesLegadas = item.vlrIcmsAtual + item.vlrPisAtual + item.vlrCofinsAtual;
    const calcLiq = item.valorTotal - deducoesLegadas;
    return item.valorLiquido ?? Math.max(0, calcLiq);
  };

  const totalValorLiquido = items.reduce((acc, i) => acc + getItemValorLiquido(i), 0);
  const totalCbsDestino = items.reduce((acc, i) => acc + i.vlrCbsReforma, 0);
  const totalIbsDestino = items.reduce((acc, i) => acc + i.vlrIbsTotalReforma, 0);
  const totalRotasInterestaduais = items.filter(i => i.ufOrigem !== i.ufDestino).length;
  const percInterestadual = items.length > 0 ? (totalRotasInterestaduais / items.length) * 100 : 0;

  const ufsDestino = Array.from(new Set(items.map(i => i.ufDestino)));

  // Exportação direta da tabela para CSV
  const handleExportOperationalCSV = () => {
    const headers = [
      'Empresa_Origem',
      'Filial_Origem',
      'UF_Origem',
      'Municipio_Origem',
      'UF_Destino',
      'Municipio_Destino',
      'Item_Produto',
      'Codigo_Produto',
      'NCM',
      'Quantidade',
      'Unidade',
      'Valor_Bruto_Operacao_BRL',
      'ICMS_Legado_Deduzido_BRL',
      'PIS_COFINS_Legado_Deduzido_BRL',
      'Valor_Liquido_Base_CBS_IBS_BRL',
      `CBS_Reforma_${selectedYear}_BRL`,
      `IBS_Reforma_Destino_${selectedYear}_BRL`,
      'Impacto_Arrecadacao_Destino'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredItems.map(item => {
      const vlrLiq = getItemValorLiquido(item);
      return [
        escapeCSV(item.empresaNome),
        escapeCSV(item.filialNome),
        escapeCSV(item.ufOrigem),
        escapeCSV(item.municipioOrigem),
        escapeCSV(item.ufDestino),
        escapeCSV(item.municipioDestino),
        escapeCSV(item.produtoDescricao),
        escapeCSV(item.produtoCodigo),
        escapeCSV(item.ncm),
        item.quantidade,
        escapeCSV(item.unidade),
        item.valorTotal.toFixed(2).replace('.', ','),
        item.vlrIcmsAtual.toFixed(2).replace('.', ','),
        (item.vlrPisAtual + item.vlrCofinsAtual).toFixed(2).replace('.', ','),
        vlrLiq.toFixed(2).replace('.', ','),
        item.vlrCbsReforma.toFixed(2).replace('.', ','),
        item.vlrIbsTotalReforma.toFixed(2).replace('.', ','),
        escapeCSV(`Transferência ao Destino (${item.ufDestino})`)
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rotas_interestaduais_unidades_destino_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Operational Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                MÓDULO OPERACIONAL & PRINCÍPIO DO DESTINO
              </span>
              <span className="text-[10px] font-bold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2 py-0.5 rounded-md">
                EC 132/2023 & LC 214/2025 • Ano {selectedYear}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2 tracking-tight font-sans">
              Análise de Unidades, Filiais, UFs e Municípios
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
              Fim da Guerra Fiscal: Deslocamento da arrecadação do local de produção (Origem) para o local de consumo (Destino) via Comitê Gestor do IBS.
            </p>
          </div>
        </div>

        {/* Informative Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Valor Bruto Total</span>
            <span className="text-base font-black text-slate-900 block mt-0.5">{formatRS(totalValorBruto)}</span>
            <span className="text-[10px] text-slate-500">{items.length} itens operacionais</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#059669] block tracking-wider">Valor Líquido (Base CBS/IBS)</span>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Base Pura</span>
            </div>
            <span className="text-base font-black text-[#059669] block mt-0.5">{formatRS(totalValorLiquido)}</span>
            <span className="text-[10px] text-emerald-700">Expurgo de ICMS/PIS/COFINS</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">CBS Reforma (Federal)</span>
            <span className="text-base font-black text-slate-800 block mt-0.5">{formatRS(totalCbsDestino)}</span>
            <span className="text-[10px] text-slate-500">Sobre base líquida</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">IBS Destino (CGIBS)</span>
            <span className="text-base font-black text-slate-900 block mt-0.5">{formatRS(totalIbsDestino)}</span>
            <span className="text-[10px] text-slate-500">100% transferido ao destino</span>
          </div>
        </div>
      </div>

      {/* Regra de Ouro: Cálculo por Fora sobre o Valor Líquido */}
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#00D280]/20 p-2 rounded-lg text-[#00D280] border border-[#00D280]/30 shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00D280]">Regra de Cálculo LC 214/2025: Base Líquida & Cálculo "Por Fora"</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              O CBS e o IBS incidem exclusivamente sobre o <strong>Valor Líquido</strong> (Valor Bruto (-) ICMS (-) PIS (-) COFINS), eliminando tributação sobre tributo e efeito cascata.
            </p>
          </div>
        </div>
        <div className="bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-center shrink-0">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Fórmula Legal</span>
          <span className="text-[11px] font-mono font-bold text-emerald-400">Vlr Líquido = Bruto - (ICMS + PIS + COFINS)</span>
        </div>
      </div>

      {/* Operações Interestaduais & Destino */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-[#00D280]" />
              <span>Distribuição de Operações por Rota Interestadual (Origem → Destino)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Exibição compacta autoajustável com {filteredItems.length} registros fiscais
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar empresa, rota, NCM ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00D280] w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedUfDestino}
              onChange={(e) => setSelectedUfDestino(e.target.value)}
              className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00D280] font-medium text-slate-700"
            >
              <option value="todos">Todos os Destinos ({ufsDestino.length} UFs)</option>
              {ufsDestino.map((uf) => (
                <option key={uf} value={uf}>Destino: {uf}</option>
              ))}
            </select>

            <button
              onClick={handleExportOperationalCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs cursor-pointer"
              title="Exportar tabela de rotas operacionais para Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#00D280]" />
              <span>Exportar Tabela (CSV)</span>
            </button>
          </div>
        </div>

        {/* Tabela com linhas menores, autoajustáveis e colunas alinhadas */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-[11px] text-slate-700 border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[9px] tracking-wider font-bold">
                <th className="py-2 px-2.5 whitespace-nowrap">Empresa / Filial Origem</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Rota (Origem → Destino)</th>
                <th className="py-2 px-2.5">Item / Produto</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Valor Bruto (Operação)</th>
                <th className="py-2 px-2.5 text-right bg-emerald-50/70 text-[#059669] whitespace-nowrap">Valor Líquido (Base CBS/IBS)</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">CBS Reforma ({selectedYear})</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">IBS Reforma (Destino)</th>
                <th className="py-2 px-2.5 text-center whitespace-nowrap">Impacto de Arrecadação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredItems.map((item) => {
                const valorLiq = getItemValorLiquido(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Empresa / Filial */}
                    <td className="py-2 px-2.5 font-sans leading-tight">
                      <span className="font-bold text-slate-900 block text-[11px] truncate max-w-[180px]" title={item.empresaNome}>
                        {item.empresaNome}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate max-w-[180px]">
                        {item.filialNome}
                      </span>
                    </td>

                    {/* Rota (Origem -> Destino) */}
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <span className="text-slate-800 font-bold">{item.ufOrigem}</span>
                      <span className="text-slate-400 text-[10px]"> ({item.municipioOrigem})</span> 
                      <ArrowRight className="w-2.5 h-2.5 inline mx-1 text-slate-400" /> 
                      <span className="text-[#059669] font-bold">{item.ufDestino}</span>
                      <span className="text-emerald-700 text-[10px]"> ({item.municipioDestino})</span>
                    </td>

                    {/* Item / Produto */}
                    <td className="py-2 px-2.5 font-sans leading-tight">
                      <span className="text-slate-900 font-medium block text-[11px] truncate max-w-[220px]" title={item.produtoDescricao}>
                        {item.produtoDescricao}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        NCM {item.ncm} • {item.quantidade} {item.unidade}
                      </span>
                    </td>

                    {/* Valor Bruto */}
                    <td className="py-2 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatRS(item.valorTotal)}
                    </td>

                    {/* Valor Líquido (Base CBS/IBS) - Inserida imediatamente após Valor Bruto */}
                    <td className="py-2 px-2.5 text-right font-bold text-[#059669] bg-emerald-50/30 whitespace-nowrap">
                      <div>{formatRS(valorLiq)}</div>
                      <span className="text-[8px] text-emerald-600 font-sans font-normal block leading-none">
                        base pura sem imposto
                      </span>
                    </td>

                    {/* CBS Reforma (Destino/Federal) */}
                    <td className="py-2 px-2.5 text-right font-bold text-slate-800 whitespace-nowrap">
                      <div>{formatRS(item.vlrCbsReforma)}</div>
                      <span className="text-[8px] text-slate-400 font-sans font-normal block leading-none">
                        {item.aliqCbsReforma.toFixed(1)}% federal
                      </span>
                    </td>

                    {/* IBS Reforma (Destino) */}
                    <td className="py-2 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      <div>{formatRS(item.vlrIbsTotalReforma)}</div>
                      <span className="text-[8px] text-emerald-700 font-sans font-normal block leading-none">
                        destino ({item.ufDestino})
                      </span>
                    </td>

                    {/* Impacto de Arrecadação */}
                    <td className="py-2 px-2.5 text-center font-sans whitespace-nowrap">
                      <span className="bg-emerald-50 text-[#059669] px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#059669]" />
                        <span>Destino ({item.ufDestino})</span>
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                    Nenhuma rota ou item fiscal encontrado para o filtro aplicado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
