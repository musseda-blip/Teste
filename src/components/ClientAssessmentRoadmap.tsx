import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  FileDown, 
  Edit3, 
  Calendar, 
  User, 
  Target, 
  TrendingUp,
  Award
} from 'lucide-react';
import { AssessmentStep } from '../types/simulation';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { Language, DICTIONARY } from '../utils/i18n';

interface ClientAssessmentRoadmapProps {
  steps: AssessmentStep[];
  onUpdateSteps: (updated: AssessmentStep[]) => void;
  companyData: CompanyRegistration;
  selectedYear: YearPeriod;
  onExportReportPDF: () => void;
  currentLanguage: Language;
}

export const ClientAssessmentRoadmap: React.FC<ClientAssessmentRoadmapProps> = ({
  steps,
  onUpdateSteps,
  companyData,
  selectedYear,
  onExportReportPDF,
  currentLanguage,
}) => {
  const t = DICTIONARY[currentLanguage];
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id || 'step_1');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const completedCount = steps.filter((s) => s.status === 'concluido').length;
  const inProgressCount = steps.filter((s) => s.status === 'em_andamento').length;
  const readinessScore = Math.round(((completedCount * 1.0 + inProgressCount * 0.5) / steps.length) * 100);

  const handleStatusChange = (stepId: string, newStatus: AssessmentStep['status']) => {
    const updated = steps.map((s) => (s.id === stepId ? { ...s, status: newStatus } : s));
    onUpdateSteps(updated);
  };

  const handleSaveNotes = (stepId: string) => {
    const updated = steps.map((s) => (s.id === stepId ? { ...s, observacoes: tempNotes } : s));
    onUpdateSteps(updated);
    setEditingNotesId(null);
  };

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Gestão de Mudança Pós-Simulação
              </span>
              <span className="text-xs font-bold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Assessment de Maturidade
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              {t.assessment.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {t.assessment.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="text-center pr-4 border-r border-slate-200">
              <div className="text-2xl font-black text-slate-900">{readinessScore}%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Índice de Prontidão
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00D280]" />
                <span>{completedCount} de {steps.length} Fases Concluídas</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{inProgressCount} Fases em Andamento</span>
              </div>
            </div>

            <button
              onClick={onExportReportPDF}
              className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ml-2"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Steps List on Left & Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Navigator (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Fases do Assessment & Transição:
          </div>

          {steps.map((step) => {
            const isSelected = activeStepId === step.id;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#00D280] shadow-md ring-2 ring-[#00D280]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {step.faseNome}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      step.status === 'concluido'
                        ? 'bg-emerald-100 text-[#059669]'
                        : step.status === 'em_andamento'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {step.status === 'concluido' ? 'Concluído' : step.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 leading-snug">{step.titulo}</h3>

                <div className="flex items-center space-x-3 mt-2.5 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{step.responsavel}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{step.prazoEstimado}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Detail Card (Right 7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            {/* Header of Active Step */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  {activeStep.faseNome}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  <select
                    value={activeStep.status}
                    onChange={(e) => handleStatusChange(activeStep.id, e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-[#00D280]"
                  >
                    <option value="planejado">Planejado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <h2 className="text-lg font-black text-slate-900 mt-3 font-sans">{activeStep.titulo}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeStep.descricao}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Impacto no Negócio</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{activeStep.impacto}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Responsável Líder</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">{activeStep.responsavel}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Prazo de Entrega</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{activeStep.prazoEstimado}</span>
              </div>
            </div>

            {/* Deliverable Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold">
                <Target className="w-4 h-4 text-[#00D280]" />
                <span>Entregável Principal Homologado:</span>
              </div>
              <p className="text-xs text-slate-600 pl-6">{activeStep.entregavel}</p>
            </div>

            {/* Advisory Recommendation Box */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-950 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <span>Diretriz Consultiva Estratégica:</span>
              </div>
              <p className="text-xs text-emerald-900 pl-6 leading-relaxed">
                {activeStep.recomendacaoIA}
              </p>
            </div>

            {/* Custom Notes Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Anotações do Comitê & Evidências:</span>
                {editingNotesId !== activeStep.id && (
                  <button
                    onClick={() => {
                      setEditingNotesId(activeStep.id);
                      setTempNotes(activeStep.observacoes || '');
                    }}
                    className="text-xs text-[#059669] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar Anotação</span>
                  </button>
                )}
              </div>

              {editingNotesId === activeStep.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Adicione observações, links de atas ou decisões executivas..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#00D280]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveNotes(activeStep.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#00D280] text-slate-950 text-xs font-black hover:bg-[#00b870] cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                  {activeStep.observacoes || 'Nenhuma observação registrada ainda. Clique em "Editar Anotação" para incluir notas da reunião de assessment.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
