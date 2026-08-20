import React from 'react';
import { X, Layers, Trash2, ArrowUpRight, Calendar, User, Building2, CheckCircle2, Play } from 'lucide-react';
import { SavedSimulation } from '../types/simulation';

interface SavedSimulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSimulations: SavedSimulation[];
  onLoadSimulation: (sim: SavedSimulation) => void;
  onDeleteSimulation: (id: string) => void;
}

export const SavedSimulationsModal: React.FC<SavedSimulationsModalProps> = ({
  isOpen,
  onClose,
  savedSimulations,
  onLoadSimulation,
  onDeleteSimulation,
}) => {
  if (!isOpen) return null;

  const formatRS = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans">
                Repositório de Simulações & Cenários Gravados
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie cenários salvos para comparar ou restaurar no Cockpit
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

        {/* List Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {savedSimulations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma simulação salva ainda. Use o botão "Salvar Simulação" no comparador ou cockpit.
            </div>
          ) : (
            savedSimulations.map((sim) => (
              <div
                key={sim.id}
                className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900">{sim.nome}</h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                      Ano: {sim.anoBase}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-[#059669] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      {sim.segmento}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{sim.descricao}</p>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{sim.autorNome}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(sim.atualizadoEm).toLocaleDateString('pt-BR')}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-600 font-bold">
                      EBITDA: {formatRS(sim.calculatedKPIs.ebitdaReforma)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      onLoadSimulation(sim);
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Carregar no Cockpit</span>
                  </button>

                  <button
                    onClick={() => onDeleteSimulation(sim.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Excluir Simulação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Total de {savedSimulations.length} cenários salvos
          </span>
          <button
            onClick={onClose}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
