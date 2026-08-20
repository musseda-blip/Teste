import React from 'react';
import { X, Layers, ExternalLink, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { TaxItem } from '../types/tax';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item: TaxItem | null;
  selectedYear: number;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  item,
  selectedYear,
}) => {
  if (!isOpen) return null;

  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans">{title}</h2>
              <p className="text-xs text-slate-500">
                Memória de Cálculo Determinística & Rastreabilidade Normativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans">
          {item ? (
            <>
              {/* Item Hierarchy Metadata */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Nota Fiscal:</span>
                  <span className="text-slate-900 font-bold block">NF {item.numNota} (Série {item.serie})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Produto / NCM:</span>
                  <span className="text-slate-900 font-bold block">{item.produtoCodigo} (NCM {item.ncm})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Origem → Destino:</span>
                  <span className="text-slate-700 block">{item.ufOrigem} ({item.municipioOrigem}) → {item.ufDestino} ({item.municipioDestino})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">CFOP / CST:</span>
                  <span className="text-slate-700 block">{item.cfop} / CST {item.cst}</span>
                </div>
              </div>

              {/* Step by Step Calculation Breakdown Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Detalhamento da Memória de Cálculo Passo a Passo ({selectedYear}):
                </h3>

                <div className="space-y-3 font-mono">
                  {/* Step 1: Base de Cálculo Líquida */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-900 font-bold">
                      <span>Passo 1: Formação da Base de Cálculo Líquida (Expurgo de Impostos Legados)</span>
                      <span className="text-[#059669] font-bold">{formatRS(item.valorLiquido ?? (item.valorTotal - item.totalTributosAtual))}</span>
                    </div>
                    <p className="font-sans text-slate-500 text-[11px] mt-1 leading-relaxed">
                      Valor Bruto da Operação: <strong className="text-slate-700">{formatRS(item.valorTotal)}</strong> (-) Tributos Legados por dentro: <strong className="text-slate-700">{formatRS(item.totalTributosAtual)}</strong> (ICMS {formatRS(item.vlrIcmsAtual)} + PIS/COFINS {formatRS(item.vlrPisAtual + item.vlrCofinsAtual)} + IPI/ISS {formatRS(item.vlrIpiAtual + item.vlrIssAtual)}) = <strong>Valor Líquido {formatRS(item.valorLiquido ?? (item.valorTotal - item.totalTributosAtual))}</strong>. A CBS e o IBS incidem "por fora" sobre este valor líquido, eliminando bitributação (imposto sobre imposto).
                    </p>
                  </div>

                  {/* Step 2: CBS Calculation */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-900 font-bold">
                      <span>Passo 2: Apuração da CBS Federal ({item.aliqCbsReforma.toFixed(2)}%)</span>
                      <span className="text-slate-900 font-bold">{formatRS(item.vlrCbsReforma)}</span>
                    </div>
                    <p className="font-sans text-slate-500 text-[11px] mt-1">
                      <strong className="text-slate-800">Base Legal:</strong> {item.baseLegalReforma} (Art. 15 LC 214/2025). Alíquota unificada federal.
                    </p>
                  </div>

                  {/* Step 3: IBS Calculation */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-900 font-bold">
                      <span>Passo 3: Apuração do IBS Estadual/Municipal ({ (item.aliqIbsEstadualReforma + item.aliqIbsMunicipalReforma).toFixed(2) }%)</span>
                      <span className="text-slate-900 font-bold">{formatRS(item.vlrIbsTotalReforma)}</span>
                    </div>
                    <p className="font-sans text-slate-500 text-[11px] mt-1">
                      <strong className="text-slate-800">Base Legal:</strong> Art. 22 LC 214/2025. Arrecadação destinada integralmente ao Município ({item.municipioDestino}) e UF ({item.ufDestino}) de destino.
                    </p>
                  </div>

                  {/* Step 4: Non-Cumulativity Credits */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-900 font-bold">
                      <span>Passo 4: Aproveitamento de Créditos Plenos sobre Insumos</span>
                      <span className="text-[#059669] font-bold">-{formatRS(item.creditosReforma)}</span>
                    </div>
                    <p className="font-sans text-slate-500 text-[11px] mt-1">
                      <strong className="text-slate-800">Base Legal:</strong> Art. 28 LC 214/2025. Não-cumulatividade plena financeira imediata sobre aquisições operacionais.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-[#00D280] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-900 text-sm">Rastreabilidade e Memória de Cálculo Auditadas</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Todas as regras aplicadas seguem estritamente a ordem de auditoria (Legislação → Cadastro → Empresa → Filial → NF → Item → Produto → NCM → Tributos).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Fonte Oficial: Diário Oficial da União • LC 214/2025 & EC 132/2023
          </span>
          <button
            onClick={onClose}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer font-bold shadow-xs"
          >
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};
