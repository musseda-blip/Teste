import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  FileUp, 
  Sliders, 
  FileDown, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  Check, 
  HelpCircle, 
  Compass, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Play
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n';

export interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
  currentLanguage: Language;
  onExportReportPDF?: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  currentLanguage,
  onExportReportPDF,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Interactive mock states within the tour to make it tangible
  const [sampleRegime, setSampleRegime] = useState<'Lucro Real' | 'Lucro Presumido'>('Lucro Real');
  const [sampleSegment, setSampleSegment] = useState('Tecnologia / SaaS');
  const [sampleRepasse, setSampleRepasse] = useState(85);
  const [sampleCredito, setSampleCredito] = useState(90);
  const [sampleFilesCount, setSampleFilesCount] = useState(142);

  useEffect(() => {
    if (isOpen) {
      // Check if user previously checked "don't show"
      const saved = localStorage.getItem('ebitax_onboarding_dont_show');
      setDontShowAgain(saved === 'true');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('ebitax_onboarding_dont_show', 'true');
    } else {
      localStorage.removeItem('ebitax_onboarding_dont_show');
    }
    localStorage.setItem('ebitax_onboarding_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    {
      id: 'cadastro',
      stepNumber: 1,
      targetTab: 'cadastro',
      title: '1. Cadastro & Dados da Empresa',
      subtitle: 'Configuração do Perfil Corporativo & Regime Tributário',
      icon: Building2,
      badge: 'Passo Inicial',
      description:
        'O primeiro passo do fluxo consiste em definir a entidade corporativa, o regime tributário (Lucro Real ou Presumido), o setor econômico e as margens operacionais de referência.',
      keyPoints: [
        {
          label: 'Regime Tributário',
          text: 'Determina a metodologia de créditos no sistema atual (Cumulativo vs Não-Cumulativo) para o comparativo.',
        },
        {
          label: 'Setor Econômico & CNAE',
          text: 'Aplica automaticamente as alíquotas setoriais calibradas da LC 214/2025 e regimes diferenciados.',
        },
        {
          label: 'Mix de Clientes (B2B vs B2C)',
          text: 'Modela a elasticidade e o poder de repasse do IVA Dual (CBS/IBS) aos clientes finais.',
        },
      ],
      proTip:
        'Cadastre múltiplas filiais ou empresas no seletor de Organizações para simular grupos econômicos consolidados.',
    },
    {
      id: 'importacao',
      stepNumber: 2,
      targetTab: 'importacao',
      title: '2. Importação de Documentos Fiscais',
      subtitle: 'Ingestão de Arquivos XML (NF-e/NFS-e) e SPED Fiscal',
      icon: FileUp,
      badge: 'Motor de Apuração',
      description:
        'Carregue seus documentos fiscais reais ou utilize os dados pré-carregados para que o motor EBITax processe cada linha de produto e serviço com as regras da EC 132/2023.',
      keyPoints: [
        {
          label: 'Ingestão Multiformato',
          text: 'Suporte a lotes de arquivos XML de NF-e, NFS-e e relatórios do SPED Fiscal.',
        },
        {
          label: 'Cálculo Dual Linha a Linha',
          text: 'Apuração simultânea de PIS, COFINS, ICMS, ISS e IPI versus a nova CBS, IBS e Imposto Seletivo (IS).',
        },
        {
          label: 'Mapeamento de NCM/NBS',
          text: 'Identificação instantânea de alíquotas padrão, reduções de 60% (saúde/educação) e alíquota zero (cesta básica).',
        },
      ],
      proTip:
        'Você pode baixar o modelo de planilha CSV na aba Importação para conciliação em massa direto do ERP.',
    },
    {
      id: 'cenarios',
      stepNumber: 3,
      targetTab: 'scenario',
      title: '3. Ajuste de Cenários & Sensibilidade',
      subtitle: 'Simulação de Alíquotas, Repasse de Preço & Créditos de Insumos',
      icon: Sliders,
      badge: 'Modelagem Estratégica',
      description:
        'Teste hipóteses e estresse financeiro ajustando a curva de repasse comercial de preços, aproveitamento da não-cumulatividade plena sobre insumos e alíquotas projetadas.',
      keyPoints: [
        {
          label: 'Elasticidade & Repasse de Preço',
          text: 'Simule o impacto de repassar 0% a 100% da nova carga aos clientes sem perder competitividade.',
        },
        {
          label: 'Crédito Amplo sobre Insumos',
          text: 'Meça o benefício financeiro da nova regra onde todo bem e serviço adquirido gera crédito de CBS/IBS.',
        },
        {
          label: 'Split Payment & Capital de Giro',
          text: 'Projete a retenção automática no ato do pagamento e o efeito na necessidade de caixa.',
        },
      ],
      proTip:
        'Salve diferentes cenários na aba "Comparador" para contrapor hipóteses Otimista, Neutra e Conservadora.',
    },
    {
      id: 'relatorio',
      stepNumber: 4,
      targetTab: 'executive',
      title: '4. Relatório Final & Decisão Executiva',
      subtitle: 'Dashboard Executivo, Comparador de Cenários e Exportação PDF',
      icon: FileDown,
      badge: 'Entrega para C-Suite',
      description:
        'Visualize o impacto consolidado na carga tributária efetiva, DRE Comparativa e EBITDA, gerando um relatório em PDF de padrão internacional para Diretoria e Conselho.',
      keyPoints: [
        {
          label: 'Waterfall de Transição (2025-2033)',
          text: 'Gráfico claro mostrando a evolução da carga ao longo da transição gradual da CBS e IBS.',
        },
        {
          label: 'DRE & Balanço Reclassificados',
          text: 'Demonstração de resultados considerando os novos impostos calculados "por fora" da receita líquida.',
        },
        {
          label: 'Relatório Executivo em PDF',
          text: 'Exportação completa em PDF com memórias de cálculo, roadmap em 5 fases e sumário de governança.',
        },
      ],
      proTip:
        'Utilize o recurso White-Label para aplicar a marca e logo da sua consultoria ou empresa no relatório final.',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToModule = (tabId: string) => {
    onNavigateToTab(tabId);
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border-slate-700/60">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D280]/20 border border-[#00D280]/40 flex items-center justify-center text-[#00D280] shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00D280] bg-[#00D280]/10 px-2 py-0.5 rounded-md border border-[#00D280]/20">
                  Tour de Onboarding Interativo
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • Fluxo Lógico do Simulador
                </span>
              </div>
              <h2 id="onboarding-tour-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                Como navegar e extrair o máximo do EBITax Reform
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar Tour (Esc)"
              aria-label="Fechar Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEPPER PROGRESS BAR (INTERACTIVE STEP NODES) */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > idx;
              const isActive = currentStep === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#00D280]/10 border-[#00D280] shadow-md shadow-[#00D280]/10'
                      : isCompleted
                      ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-600'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#00D280] text-slate-950'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold truncate ${isActive ? 'text-[#00D280]' : isCompleted ? 'text-white' : 'text-slate-400'}`}>
                      {s.stepNumber}. {s.title.split('.')[1]?.trim() || s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE STEP CONTENT (EXPLANATION + INTERACTIVE MINI WIDGET) */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto max-h-[62vh] space-y-6">
          
          {/* Step Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00D280]/20 text-[#00D280]">
                  {currentStepData.badge}
                </span>
                <span className="text-xs text-slate-400">{currentStepData.subtitle}</span>
              </div>
              <h3 className="text-xl font-black text-white">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Direct Jump Button */}
            <button
              onClick={() => handleJumpToModule(currentStepData.targetTab)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-[#00D280] text-slate-200 hover:text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-[#00D280] shadow-sm flex-shrink-0 cursor-pointer"
              title={`Ir direto para a aba ${currentStepData.title}`}
            >
              <span>Abrir Módulo no Simulador</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid with Details + Interactive Mock Component */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Key Strategic Points */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00D280]" />
                <span>Principais Entregas & Parâmetros Desta Etapa</span>
              </h4>

              <div className="space-y-3">
                {currentStepData.keyPoints.map((kp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                    <div className="p-1 rounded-md bg-[#00D280]/15 text-[#00D280] mt-0.5 flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white">{kp.label}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {kp.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro Tip Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00D280] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Dica de Especialista Fiscal:</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">{currentStepData.proTip}</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Simulated Preview Widget */}
            <div className="lg:col-span-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-850">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#00D280] animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Prévia Interativa do Fluxo ({currentStep + 1}/4)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Sandbox Preview</span>
                </div>

                {/* Step 1 Preview Widget */}
                {currentStep === 0 && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Regime Tributário Atual
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSampleRegime('Lucro Real')}
                          className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                            sampleRegime === 'Lucro Real'
                              ? 'bg-[#00D280]/20 border-[#00D280] text-[#00D280]'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          Lucro Real (Não-Cumulativo)
                        </button>
                        <button
                          onClick={() => setSampleRegime('Lucro Presumido')}
                          className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                            sampleRegime === 'Lucro Presumido'
                              ? 'bg-[#00D280]/20 border-[#00D280] text-[#00D280]'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          Lucro Presumido (Cumulativo)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Setor Econômico Principal
                      </label>
                      <select
                        value={sampleSegment}
                        onChange={(e) => setSampleSegment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white outline-none cursor-pointer"
                      >
                        <option value="Tecnologia / SaaS">Tecnologia / SaaS (Serviços 26.5%)</option>
                        <option value="Comércio">Comércio / Varejo (Crédito Amplo)</option>
                        <option value="Indústria">Indústria / Transformação (Crédito Físico)</option>
                        <option value="Serviços em Geral">Serviços Regulados (LC 214)</option>
                      </select>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-bold text-[#00D280]">Resultado do Setup:</span> O motor carregará automaticamente alíquotas estimadas de <span className="font-mono text-white">CBS (8,8%)</span> e <span className="font-mono text-white">IBS (17,7%)</span> calibradas para este perfil.
                    </div>
                  </div>
                )}

                {/* Step 2 Preview Widget */}
                {currentStep === 1 && (
                  <div className="space-y-3 text-xs">
                    <div className="border-2 border-dashed border-slate-800 hover:border-[#00D280]/50 rounded-xl p-4 text-center bg-slate-900/50 transition-colors">
                      <FileUp className="w-7 h-7 text-[#00D280] mx-auto mb-1.5" />
                      <span className="font-bold text-white block text-xs">
                        {sampleFilesCount} Documentos Fiscais Pré-Carregados
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        XMLs de NF-e, NFS-e e itens do SPED Fiscal prontos para processamento
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Sistema Atual:</span>
                        <span className="font-bold text-rose-400">PIS/COFINS + ICMS + ISS</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Novo Sistema (IVA Dual):</span>
                        <span className="font-bold text-[#00D280]">CBS + IBS + IS</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                      <span>Memória de Cálculo:</span>
                      <span className="text-[#00D280] font-bold">Disponível item a item</span>
                    </div>
                  </div>
                )}

                {/* Step 3 Preview Widget */}
                {currentStep === 2 && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="font-bold text-slate-300">Repasse de Preço aos Clientes:</span>
                        <span className="font-mono font-black text-[#00D280]">{sampleRepasse}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sampleRepasse}
                        onChange={(e) => setSampleRepasse(Number(e.target.value))}
                        className="w-full accent-[#00D280] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="font-bold text-slate-300">Aproveitamento de Crédito em Insumos:</span>
                        <span className="font-mono font-black text-[#00D280]">{sampleCredito}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sampleCredito}
                        onChange={(e) => setSampleCredito(Number(e.target.value))}
                        className="w-full accent-[#00D280] cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Impacto Estimado no EBITDA:</span>
                      <span className={`font-mono font-black ${sampleRepasse >= 80 ? 'text-[#00D280]' : 'text-amber-400'}`}>
                        {sampleRepasse >= 80 ? '+2.4% Margem Otimizada' : '-1.1% Margem Pressionada'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 4 Preview Widget */}
                {currentStep === 3 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white">Relatório Estratégico em PDF</span>
                        <span className="text-[10px] bg-[#00D280]/20 text-[#00D280] font-black px-1.5 py-0.5 rounded">
                          Pronto para Exportar
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Inclui Sumário Executivo, DRE Comparativa, Análise de Sensibilidade e Matriz de Split Payment.
                      </p>
                    </div>

                    {onExportReportPDF && (
                      <button
                        onClick={onExportReportPDF}
                        className="w-full flex items-center justify-center space-x-2 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black py-2 rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Gerar PDF Agora (Download Imediato)</span>
                      </button>
                    )}

                    <div className="text-center text-[10px] text-slate-400">
                      Você pode também acessar o comparador lado a lado a qualquer momento.
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER CONTROLS */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Checkbox "Don't show again" */}
          <label className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#00D280] focus:ring-0 cursor-pointer accent-[#00D280]"
            />
            <span>Não exibir este tour automaticamente no início</span>
          </label>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00D280] hover:bg-[#00b870] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  handleClose();
                  onNavigateToTab('executive');
                }}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#00D280] hover:bg-[#00b870] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-[#00D280]/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Começar a Usar o Simulador</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
