import React from 'react';
import { X, CheckCircle2, ShieldCheck, FileCheck, Layers } from 'lucide-react';

interface AcceptanceCriteriaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcceptanceCriteriaDrawer: React.FC<AcceptanceCriteriaDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const criteriaList = [
    { id: 1, title: 'Dashboard Executivo Interativo', desc: 'KPIs, Waterfall, Timeline, Matriz de Riscos e respostas às 19 perguntas executivas.' },
    { id: 2, title: 'Dashboard Fiscal Independente', desc: 'Carga tributária PIS, COFINS, ICMS, ISS, IPI, CBS, IBS, IS, Split Payment e Cashback.' },
    { id: 3, title: 'Dashboard Financeiro', desc: 'Receita Bruta/Líquida, Margens, EBITDA, Fluxo de Caixa, Capital de Giro e Preço ideal.' },
    { id: 4, title: 'Dashboard Contábil (DRE/Balanço)', desc: 'DRE comparativa e Balanço Patrimonial com reclassificação de impostos por fora.' },
    { id: 5, title: 'Visão por Produto Detalhada', desc: 'Ficha por produto com GTIN, NCM, CEST, marca, margem, markup e classificação.' },
    { id: 6, title: 'Visão por Item de Nota Fiscal', desc: 'Cada item tratado como unidade individual com alíquotas, bases e tributação.' },
    { id: 7, title: 'Visão por Nota Fiscal (NF-e)', desc: 'Cabeçalho, emitente, destinatário, rota UF origem/destino e totais consolidados.' },
    { id: 8, title: 'Matriz Temporal de Alíquotas (2026-2033)', desc: 'Matriz sem invenção de alíquotas futuras refletindo as datas legais de transição.' },
    { id: 9, title: 'Comparativo Sistema Atual (Legado)', desc: 'Regras tributárias vigentes para o período em análise.' },
    { id: 10, title: 'Comparativo Transição Ano a Ano', desc: 'Cálculos individuais para 2026, 2027, 2028, 2029, 2030, 2031 e 2032.' },
    { id: 11, title: 'Comparativo Sistema Definitivo (2033+)', desc: 'Modelo definitivo do IBS e CBS sem coexistência de tributos antigos.' },
    { id: 12, title: 'Visão Mensal de Impacto', desc: 'Demonstrativo mensal de receitas, créditos, débitos e fluxo de caixa.' },
    { id: 13, title: 'Visão Anual de Impacto', desc: 'Evolução acumulada ano a ano da carga líquida e EBITDA.' },
    { id: 14, title: 'Matriz de Impacto Tridimensional', desc: 'Conexão simultânea entre o impacto Fiscal, Financeiro e Contábil.' },
    { id: 15, title: 'Matriz de Sensibilidade Interativa', desc: 'Simulador de sliders de preço, repasse, créditos e alíquotas com recálculo instantâneo.' },
    { id: 16, title: 'Drill-Down Universal em Hierarquia', desc: 'Navegação do Grupo/Empresa até o Item, NCM, Tributo e Base Legal.' },
    { id: 17, title: 'Memória de Cálculo Auditável', desc: 'Passo a passo com fórmula, artigo, inciso, parágrafo e versão normativa.' },
    { id: 18, title: 'Rastreabilidade Ponto a Ponto', desc: 'Conectividade do indicador até o XML da Nota Fiscal e Lei oficial.' },
    { id: 19, title: 'Base Legal e Fontes Oficiais', desc: 'Links e registros da EC 132/2023, LC 214/2025, Planalto, Receita e CONFAZ.' },
    { id: 20, title: 'Demonstrativo de Impacto Fiscal', desc: 'Variação nominal e percentual de débitos e créditos de CBS/IBS.' },
    { id: 21, title: 'Demonstrativo de Impacto Financeiro', desc: 'Liquidez, retenção no Split Payment e necessidade de capital de giro.' },
    { id: 22, title: 'Demonstrativo de Impacto Contábil', desc: 'Lançamentos projetados e impacto no Plano de Contas corporativo.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans">Validação de Critérios de Aceitação</h2>
              <p className="text-xs text-slate-500">
                Verificação dos 22 Requisitos de Conformidade
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

        {/* List of Criteria */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {criteriaList.map((c) => (
            <div
              key={c.id}
              className="bg-slate-50 hover:bg-emerald-50/20 p-3.5 rounded-xl border border-slate-200 flex items-start space-x-3 transition-colors"
            >
              <div className="mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D280]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{c.id}. {c.title}</h4>
                  <span className="text-[10px] bg-emerald-50 text-[#059669] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    Atendido
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00D280] animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800">100% de Aderência (22/22 Requisitos)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer font-bold shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
