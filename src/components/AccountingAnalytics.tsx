import React from 'react';
import { Layers3, FileSpreadsheet, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { DREComparative, BalancoPatrimonialComparative } from '../types/tax';

interface AccountingAnalyticsProps {
  dreData: DREComparative[];
  balancoData: BalancoPatrimonialComparative[];
  selectedYear: number;
}

export const AccountingAnalytics: React.FC<AccountingAnalyticsProps> = ({
  dreData,
  balancoData,
  selectedYear,
}) => {
  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Top Banner Accounting Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Módulo Contábil & IFRS
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Ano Fiscal {selectedYear}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              DRE Comparativa & Balanço Patrimonial Refletido
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Adequação ao CPC 30 e IFRS: Tributação por fora da base de cálculo, eliminação de distorções na Receita Bruta e reclassificação de impostos recuperáveis.
            </p>
          </div>
        </div>
      </div>

      {/* DRE Comparativa Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#00D280]" />
              <span>DRE Comparativa - Demonstração do Resultado do Exercício</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reflexos diretos da transição tributária no resultado operacional e EBITDA
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 font-mono font-medium">
            Ano em Foco: {selectedYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Conta Contábil</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3 text-right">Sistema Legado</th>
                <th className="py-3 px-3 text-right">2026 (Teste)</th>
                <th className="py-3 px-3 text-right">2027 (CBS)</th>
                <th className="py-3 px-3 text-right">2033 (Definitivo)</th>
                <th className="py-3 px-3 text-right">Variação R$</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {dreData.map((row, idx) => {
                const isHighlight = row.conta.includes('LUCRO BRUTO') || row.conta.includes('EBITDA') || row.conta.includes('RECEITA LÍQUIDA');
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isHighlight ? 'bg-slate-50 font-bold' : ''}`}>
                    <td className={`py-2.5 px-3 font-sans ${isHighlight ? 'text-slate-900 font-black' : 'text-slate-700'}`}>{row.conta}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.codigoContabil}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatRS(row.valorAtual)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-800">{formatRS(row.valorReforma2026)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-800">{formatRS(row.valorReforma2027)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-black">{formatRS(row.valorReformaDefinitivo2033)}</td>
                    <td className={`py-2.5 px-3 text-right font-black ${row.variacaoAbsoluta >= 0 ? 'text-[#059669]' : 'text-orange-600'}`}>
                      {formatRS(row.variacaoAbsoluta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balanço Patrimonial Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers3 className="w-4 h-4 text-[#00D280]" />
              <span>Balanço Patrimonial Refletido (Ativo, Passivo e PL)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reclassificação de saldos credores de IBS/CBS e obrigações passivas no Comitê Gestor
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Grupo</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Descrição da Conta Contábil</th>
                <th className="py-3 px-3 text-right">Saldo Atual</th>
                <th className="py-3 px-3 text-right">Saldo Reforma (Definitivo)</th>
                <th className="py-3 px-3 text-left">Reflexo Patrimonial / Justificativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {[...balancoData]
                .sort((a, b) => {
                  const grupoOrder: Record<string, number> = {
                    'ATIVO': 1,
                    'PASSIVO': 2,
                    'PATRIMÔNIO LÍQUIDO': 3,
                  };
                  const diffGrupo = (grupoOrder[a.grupo] ?? 99) - (grupoOrder[b.grupo] ?? 99);
                  if (diffGrupo !== 0) return diffGrupo;
                  return a.codigoContabil.localeCompare(b.codigoContabil);
                })
                .map((row, idx) => {
                  const getGrupoColor = (grupo: string) => {
                    if (grupo === 'ATIVO') return 'text-slate-900';
                    if (grupo === 'PASSIVO') return 'text-orange-600';
                    if (grupo === 'PATRIMÔNIO LÍQUIDO') return 'text-[#059669]';
                    return 'text-slate-700';
                  };

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className={`py-2.5 px-3 font-sans font-bold ${getGrupoColor(row.grupo)}`}>{row.grupo}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.codigoContabil}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{row.descricaoConta}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{formatRS(row.valorAtual)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-900 font-black">{formatRS(row.valorReformaDefinitivo)}</td>
                      <td className="py-2.5 px-3 font-sans text-[11px] text-slate-500">{row.reflexoPatrimonial}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
