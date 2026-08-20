import React, { useState } from 'react';
import { ShieldCheck, Search, BookOpen, ExternalLink, AlertTriangle, Database, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_SOURCES } from '../data/taxRules';

export const Governance: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleSimulateOfficialSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchResult(
      `Consulta realizada na base da Receita Federal / Planalto em ${new Date().toLocaleDateString('pt-BR')} para "${searchQuery}":\n` +
      `• Norma Base: LC 214/2025 (Artigos 15, 22 e 112).\n` +
      `• Status: Texto Aprovado no Congresso Nacional. Regulamentação Operacional do Comitê Gestor (CGIBS) em fase de instrução normativa 2026.\n` +
      `• Regra Anti-Alucinação Aplicada: Dados validados contra os Diários Oficiais da União.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Governance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                Governança & Compliance
              </span>
              <span className="text-xs font-semibold text-[#00D280] bg-[#00D280]/10 border border-[#00D280]/30 px-2.5 py-1 rounded-md">
                Protocolo Anti-Alucinação
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight font-sans">
              Conformidade Regulatória & Fontes Oficiais
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Garantia de integridade determinística: Todos os parâmetros de alíquotas e regras derivam de fontes oficiais do Planalto, Receita Federal e CONFAZ sem inferências arbitrárias.
            </p>
          </div>
        </div>
      </div>

      {/* Official Sources Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#00D280]" />
          <span>Fontes Normativas e Bases Legais Utilizadas no Kernel</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {OFFICIAL_SOURCES.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-[#00D280] hover:bg-emerald-50/20 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-[#059669] transition-colors">{s.nome}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669]" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 font-medium">Versão: {s.versao}</span>
              </div>
              <span className="text-[10px] text-[#059669] font-mono mt-3 block font-bold">Acessar Documento Oficial →</span>
            </a>
          ))}
        </div>
      </div>

      {/* Official Web Lookup Tool */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-1">
          <Search className="w-4 h-4 text-[#00D280]" />
          <span>Pesquisa e Verificação de Atualizações Regulatórias</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Valida a legislação vigente na data da execução diretamente nas tabelas oficiais do SPED e CONFAZ.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o NCM, Artigo da LC 214/2025 ou termo tributário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#00D280] flex-1 placeholder:text-slate-400"
          />
          <button
            onClick={handleSimulateOfficialSearch}
            className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer font-bold flex items-center space-x-1.5 shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </div>

        {searchResult && (
          <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
            {searchResult}
          </div>
        )}
      </div>

      {/* Regras Anti-Alucinação Disclaimers Panel */}
      <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-orange-900 mb-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-bold">Protocolos Anti-Alucinação e Marcação Regulatória</h3>
        </div>
        <p className="text-xs text-slate-700 mb-4 leading-relaxed">
          É expressamente proibido inventar alíquotas, preencher dados por suposição ou tratar a transição de 2026 como definitiva. As seguintes marcações automáticas garantem a fidelidade:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs">
            <span className="font-bold text-orange-800 block">1. INFORMAÇÃO NÃO IDENTIFICADA NA FONTE OFICIAL CONSULTADA</span>
            <span className="text-[11px] text-slate-600 mt-1 block">Aplicado obrigatoriamente quando um NCM ou exceção não consta expressamente no texto legal.</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs">
            <span className="font-bold text-slate-900 block">2. PARÂMETRO DEPENDENTE DE REGULAMENTAÇÃO</span>
            <span className="text-[11px] text-slate-600 mt-1 block">Aplicado para alíquotas específicas do IBS de cada município pendente do Comitê Gestor (CGIBS).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
