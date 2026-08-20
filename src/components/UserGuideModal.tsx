import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileSpreadsheet, 
  TrendingUp, 
  Sliders, 
  ShieldCheck,
  Building2,
  FileDown,
  GitCompare,
  Compass
} from 'lucide-react';
import { Language } from '../utils/i18n';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onOpenOnboardingTour?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onOpenOnboardingTour,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'step_by_step' | 'manual_normativo'>('step_by_step');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const guideSteps = [
    {
      stepNumber: 1,
      title: 'Passo 1: Setup Cadastral & Seleção de Regime',
      icon: Building2,
      summary: 'Configuração da empresa ativa, regime tributário (Lucro Real/Presumido) e parâmetros setoriais.',
      details: [
        'Acesse a aba "Cadastro & Dados" para revisar a Razão Social, CNPJ e classificação de CNAE/NCM principal.',
        'Selecione o Setor Econômico no seletor global para carregar presets calibrados (ex: Tecnologia/SaaS, Varejo, Indústria).',
        'Valide as margens operacionais e o perfil de clientes (B2B vs B2C) que orientam o modelo de créditos.',
      ],
    },
    {
      stepNumber: 2,
      title: 'Passo 2: Importação e Validação de Documentos Fiscais',
      icon: FileSpreadsheet,
      summary: 'Carregamento de notas fiscais (XML NF-e, NFS-e, SPED) para processamento pelo motor tributário.',
      details: [
        'Na aba "Importação Fiscal", faça o upload de arquivos XML ou planilhas CSV.',
        'O motor fiscal processa cada item individualmente, calculando os tributos do sistema atual (PIS/COFINS/ICMS/ISS) e os da Reforma (CBS/IBS/IS).',
        'Utilize o botão "Exportar Dados (CSV)" na aba Apuração Fiscal para auditar as transações detalhadas no Excel.',
      ],
    },
    {
      stepNumber: 3,
      title: 'Passo 3: Análise do Dashboard Executivo & DRE',
      icon: TrendingUp,
      summary: 'Visão holística dos impactos na carga tributária, EBITDA, margens e fluxo de caixa.',
      details: [
        'Explore o Dashboard Executivo para acompanhar o Waterfall de transição e os KPIs estratégicos.',
        'Consulte a DRE Comparativa na aba "Financeiro & DRE" para entender a reclassificação de tributos cobrados "por fora".',
        'Verifique a projeção de retenção no Split Payment e a necessidade de capital de giro adicional.',
      ],
    },
    {
      stepNumber: 4,
      title: 'Passo 4: Simulador de Sensibilidade & Alíquotas',
      icon: Sliders,
      summary: 'Teste de estresse com sliders de repasse de preços, créditos de insumos e variação de alíquotas.',
      details: [
        'Acesse a aba "Simulador & Sensibilidade" para calibrar o percentual de repasse comercial aos clientes.',
        'Ajuste o índice de tomada de créditos sobre insumos (não-cumulatividade plena de serviços e materiais).',
        'Visualize em tempo real a curva de sensibilidade e a nova margem líquida gerada.',
      ],
    },
    {
      stepNumber: 5,
      title: 'Passo 5: Salvar e Comparar Cenários Lado a Lado',
      icon: GitCompare,
      summary: 'Contraste direto entre cenários estratégicos com destaque nas alíquotas de IBS/CBS aplicadas.',
      details: [
        'Acesse a aba "Comparador de Cenários" e clique em "Salvar Estado Atual como Novo Cenário".',
        'Compare o Cenário A (Base) contra o Cenário B (Otimizado), visualizando a variação em p.p. da CBS Federal e IBS Estadual/Municipal.',
        'Analise a tabela comparativa de EBITDA, créditos fiscais e necessidade de reajuste de preço.',
      ],
    },
    {
      stepNumber: 6,
      title: 'Passo 6: Assessment de Transição & Roadmap do Cliente',
      icon: ShieldCheck,
      summary: 'Planejamento de mudança estruturado em 5 fases para orientar o projeto pós-simulação.',
      details: [
        'Na aba "Assessment & Roadmap", acompanhe o Índice de Prontidão da Reforma.',
        'Gerencie as 5 Fases: Diagnóstico NCM/NBS, Parametrização ERP, Split Payment, Cadeia de Fornecedores e Reprecificação.',
        'Registre responsáveis, prazos e anotações executivas de comitê.',
      ],
    },
    {
      stepNumber: 7,
      title: 'Passo 7: Exportação de Relatórios Executivos em PDF',
      icon: FileDown,
      summary: 'Geração de dossiê completo de estratégia para conselhos e diretoria C-Level.',
      details: [
        'Clique no botão "Relatório Executivo PDF" na barra superior.',
        'O sistema gera automaticamente um documento multipágina formatado com síntese de KPIs, comparativo de cenários e roadmap.',
        'Suporte a personalização White-Label com logomarca e dados da sua consultoria.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans">
                Guia do Usuário & Manual da Solução
              </h2>
              <p className="text-xs text-slate-500">
                Passo a passo operacional e fundamentação regulatória da Reforma Tributária
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

        {/* Tab Toggle */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'step_by_step'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Roteiro Passo a Passo Interativo (7 Etapas)
          </button>
          <button
            onClick={() => setActiveTab('manual_normativo')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'manual_normativo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Manual Conceitual & Regras da Reforma (LC 214)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 font-sans">
          {activeTab === 'step_by_step' ? (
            <div className="space-y-6">
              {/* Stepper Dots */}
              <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
                {guideSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <button
                      key={step.stepNumber}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex-shrink-0 ${
                        isCurrent
                          ? 'bg-[#00D280]/15 border-[#00D280] text-slate-900 font-bold ring-1 ring-[#00D280]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#059669]' : 'text-slate-400'}`} />
                      <span className="text-[11px]">Passo {step.stepNumber}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Content */}
              {(() => {
                const step = guideSteps[currentStepIndex];
                const Icon = step.icon;
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-50 text-[#059669] rounded-xl border border-emerald-200">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                          Etapa {step.stepNumber} de {guideSteps.length}
                        </span>
                        <h3 className="text-base font-black text-slate-900">{step.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                      {step.summary}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Procedimento Recomendado:
                      </span>
                      {step.details.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start space-x-2.5 bg-white p-3 rounded-xl border border-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#00D280] mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Stepper Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-40 flex items-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Passo Anterior</span>
                </button>

                <button
                  disabled={currentStepIndex === guideSteps.length - 1}
                  onClick={() => setCurrentStepIndex((prev) => Math.min(guideSteps.length - 1, prev + 1))}
                  className="px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center space-x-2 cursor-pointer"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Concept 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">1. O Modelo do IVA Dual (CBS + IBS)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A Emenda Constitucional 132/2023 extingue 5 tributos (PIS, COFINS, IPI, ICMS e ISS) e cria o modelo de IVA Dual: a <strong>CBS</strong> (Contribuição sobre Bens e Serviços, federal) e o <strong>IBS</strong> (Imposto sobre Bens e Serviços, estadual e municipal), além do <strong>Imposto Seletivo (IS)</strong>.
                </p>
              </div>

              {/* Concept 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">2. Cobrança "Por Fora" e Transparência Fiscal</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao contrário do ICMS e PIS/COFINS atuais que incidem "por dentro" sobre sua própria base, a CBS e o IBS são calculados "por fora". O imposto passa a ser somado ao valor dos produtos/serviços, alterando a estrutura da DRE e o preço de faturamento.
                </p>
              </div>

              {/* Concept 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">3. Não-Cumulatividade Plena Financeira</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conforme a LC 214/2025, quase todas as aquisições corporativas (inclusive serviços intelectuais, softwares, marketing, energia e aluguéis) geram crédito integral imediato, desde que o imposto tenha sido recolhido na etapa anterior.
                </p>
              </div>

              {/* Concept 4 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">4. Mecanismo de Split Payment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A liquidação financeira dos pagamentos (via PIX, boleto e cartões) segregará automaticamente o valor dos tributos diretamente para o Comitê Gestor (CGIBS), reduzindo a retenção transitória no caixa da empresa vendedora.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            Simulador de Reforma Tributária &bull; Suporte & Dúvidas: +55 11 96175-9438
          </span>
          <div className="flex items-center space-x-2">
            {onOpenOnboardingTour && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboardingTour();
                }}
                className="bg-[#00D280] hover:bg-[#00b870] text-slate-950 text-xs px-4 py-2 rounded-xl font-black transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Abrir Tour Interativo (4 Etapas)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-5 py-2 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Fechar Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
