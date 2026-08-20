import React from 'react';
import { 
  X, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  Calculator,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { FiscalDocument } from '../types/fiscalEngine';
import { DocumentComparativeAnalysis } from '../utils/fiscalDocumentTaxEngine';
import { YearPeriod } from '../types/tax';

export interface DrillDownTarget {
  tipo: 'receita' | 'tributos_atuais' | 'tributos_reforma' | 'diferenca' | 'creditos' | 'dre_linha' | 'qualidade';
  titulo: string;
  subtitulo: string;
  valorPrincipal: string;
  detalheCalculo: string;
  linhaDreCodigo?: string;
}

interface ExecutiveDrillDownSheetProps {
  isOpen: boolean;
  onClose: () => void;
  target: DrillDownTarget | null;
  documentosDetalhados: Array<{
    documento: FiscalDocument;
    analise: DocumentComparativeAnalysis;
  }>;
  selectedYear: YearPeriod;
  onNavigateToDocumento?: (docId: string) => void;
}

export const ExecutiveDrillDownSheet: React.FC<ExecutiveDrillDownSheetProps> = ({
  isOpen,
  onClose,
  target,
  documentosDetalhados,
  selectedYear,
  onNavigateToDocumento
}) => {
  if (!isOpen || !target) return null;

  const formatRS = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200 animate-in slide-in-from-right duration-300"
      >
        {/* Header do Side-Sheet */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#00D280]" />
                Rastreabilidade C-Level • Nível 3
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Ano {selectedYear}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {target.titulo}
            </h2>
            <p className="text-xs text-slate-500">
              {target.subtitulo}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Fechar detalhamento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Valor Consolidado e Fórmula de Origem */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Total Consolidado Auditado
            </span>
            <span className="text-2xl font-black text-[#00D280] tracking-tight">
              {target.valorPrincipal}
            </span>
          </div>
          <div className="text-right text-xs max-w-xs text-slate-300">
            <span className="font-semibold text-white block mb-0.5">Origem dos Dados:</span>
            <span>{target.detalheCalculo}</span>
          </div>
        </div>

        {/* Lista de Documentos Fiscais Vinculados que Compõem o Valor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Documentos Fiscais na Base ({documentosDetalhados.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Clique em um documento para inspecionar
            </span>
          </div>

          <div className="space-y-3">
            {documentosDetalhados.map(({ documento, analise }) => {
              const isSaida = documento.tipoOperacao === 'Saída';
              const vlrDoc = documento.totais?.valorTotalDocumento || analise.totais.valorTotalBruto;
              const totalAtualDoc = analise.totais.totalTributosAtuais;
              const totalReformaDoc = analise.totais.totalReforma;
              const diffDoc = totalReformaDoc - totalAtualDoc;

              return (
                <div 
                  key={documento.id}
                  className="border border-slate-200 hover:border-[#00D280] rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-all duration-200 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                          isSaida 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {documento.modelo} • {documento.tipoOperacao.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Nº {documento.numero}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1 line-clamp-1">
                        {isSaida 
                          ? `Tomador: ${documento.tomador?.razaoSocial || 'Não informado'}` 
                          : `Emitente: ${documento.emitente?.razaoSocial || 'Não informado'}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {formatRS(vlrDoc)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes Tributários do Documento */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Sistema Atual:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatRS(totalAtualDoc)}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Reforma ({selectedYear}):</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatRS(totalReformaDoc)}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Variação Nominal:</span>
                      <span className={`font-bold font-mono ${diffDoc > 0 ? 'text-orange-600' : 'text-[#059669]'}`}>
                        {diffDoc > 0 ? `+${formatRS(diffDoc)}` : formatRS(diffDoc)}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Documento */}
                  {documento.itens && documento.itens.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate pr-2">
                        Item: {documento.itens[0].descricao}
                      </span>
                      {onNavigateToDocumento && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToDocumento(documento.id);
                          }}
                          className="text-[#059669] hover:text-[#047857] font-semibold text-[10px] flex items-center gap-1 shrink-0 hover:underline"
                        >
                          Ver Doc Completo <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer do Side-Sheet com Preservação de Estado */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Padrão de Auditoria Big4 • Preservação Total de Contexto
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Voltar à Visão Executiva
          </button>
        </div>
      </div>
    </div>
  );
};
