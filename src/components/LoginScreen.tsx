import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building2, UserCheck, ArrowRight, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_USERS } from '../data/mockUsers';
import { SaaSCompany, SaaSUser, WhiteLabelConfig } from '../types/auth';
import { SimuladorReformaLogo } from './SimuladorReformaLogo';
import { Language } from '../utils/i18n';

interface LoginScreenProps {
  onLoginSuccess: (user: SaaSUser, company: SaaSCompany) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  whiteLabel?: WhiteLabelConfig;
  companies?: SaaSCompany[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  currentLanguage,
  onLanguageChange,
  whiteLabel,
  companies = MOCK_COMPANIES,
}) => {
  const [email, setEmail] = useState('admin@equalityit.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'comp_equality');
  const [selectedUserPreset, setSelectedUserPreset] = useState<string>('user_admin');

  const handleSelectPresetUser = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setSelectedUserPreset(user.id);
      setEmail(user.email);
      setPassword('••••••••••••');
      if (user.companyIds && user.companyIds.length > 0) {
        setSelectedCompanyId(user.companyIds[0]);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || MOCK_USERS[0];
    const company = companies.find((c) => c.id === selectedCompanyId) || companies[0];

    onLoginSuccess(
      {
        ...user,
        companyIds: [company.id],
      },
      company
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden selection:bg-[#00D280] selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D280]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 z-20">
        <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
        <button
          onClick={() => onLanguageChange('pt')}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
            currentLanguage === 'pt' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          PT
        </button>
        <button
          onClick={() => onLanguageChange('en')}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
            currentLanguage === 'en' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => onLanguageChange('es')}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
            currentLanguage === 'es' ? 'bg-[#00D280] text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          ES
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Context */}
          <div className="lg:col-span-6 space-y-6 text-white">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#00D280]">
              <ShieldCheck className="w-4 h-4" />
              <span>Plataforma SaaS Multi-Tenant & Governança C-Level</span>
            </div>

            <div>
              <div className="mb-4">
                {whiteLabel?.enabled ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-9 h-9 rounded-xl bg-[#00D280] text-slate-950 font-black flex items-center justify-center text-base">
                      {whiteLabel.brandName.charAt(0)}
                    </span>
                    <span className="text-xl font-black text-white">{whiteLabel.brandName}</span>
                  </div>
                ) : (
                  <SimuladorReformaLogo variant="dark" size="lg" />
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Simulador de Reforma Tributária
              </h1>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Ambiente de alta precisão para simulação de impactos fiscais, financeiros e contábeis da Reforma Tributária (EC 132/2023 & LC 214/2025).
              </p>
            </div>

            {/* Value Pillars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#00D280] mt-0.5 flex-shrink-0" />
                <span><strong>Comparador de Cenários:</strong> Contraste dinâmico de alíquotas IBS/CBS, EBITDA e fluxo de caixa.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#00D280] mt-0.5 flex-shrink-0" />
                <span><strong>Assessment & Roadmap:</strong> Plano de ação e transição estruturado em 5 fases para o cliente.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#00D280] mt-0.5 flex-shrink-0" />
                <span><strong>Relatórios Executivos & CSV:</strong> Exportação instantânea em PDF auditável e planilha Excel.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Acesso Corporativo Seguro</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione o perfil do usuário ou informe suas credenciais corporativas.
                </p>
              </div>

              {/* Demo Account Quick Selectors */}
              <div className="mb-6 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Perfis Rápidos Pré-Configurados:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MOCK_USERS.map((u) => {
                    const isSelected = selectedUserPreset === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectPresetUser(u.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00D280]/15 border-[#00D280] text-white ring-1 ring-[#00D280]/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate text-white">{u.name.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{u.role === 'admin' ? 'Admin / Diretor' : u.role === 'fiscal_analyst' ? 'Especialista Tax' : 'CFO Executivo'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="usuario@empresa.com.br"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#00D280] text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#00D280] text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Company Tenant Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Organização / Empresa Tenant
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#00D280] text-white text-xs rounded-xl pl-10 pr-8 py-3 outline-none appearance-none cursor-pointer"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.segment})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#00D280]/20 cursor-pointer"
                >
                  <span>Entrar no Cockpit da Reforma</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-500">
                  Simulador de Reforma Tributária • Tecnologia Tributária Corporativa &bull; Suporte: +55 11 96175-9438
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
