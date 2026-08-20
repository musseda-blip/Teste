import React, { useState } from 'react';
import { X, Sparkles, Sliders, Check, Palette, Building2, Shield, Phone, FileText } from 'lucide-react';
import { WhiteLabelConfig } from '../types/auth';

interface WhiteLabelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhiteLabelConfig;
  onSaveConfig: (newConfig: WhiteLabelConfig) => void;
}

export const WhiteLabelSettingsModal: React.FC<WhiteLabelSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<WhiteLabelConfig>({ ...config });

  const colorPresets = [
    { name: 'Verde Esmeralda Tax', hex: '#00D280' },
    { name: 'Azul Corporativo', hex: '#0284C7' },
    { name: 'Roxo Enterprise', hex: '#7C3AED' },
    { name: 'Âmbar Executivo', hex: '#D97706' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-[#059669] p-2.5 rounded-xl border border-emerald-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans">
                Personalização White-Label & Marca
              </h2>
              <p className="text-xs text-slate-500">
                Configure a identidade visual da sua consultoria ou empresa
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Ativar Modo White-Label</span>
              <span className="text-slate-500 text-[11px]">Substitui a identidade padrão nos cabeçalhos e relatórios PDF</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D280]"></div>
            </label>
          </div>

          {/* Brand Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nome da Marca / Consultoria</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              placeholder="Ex: Sua Consultoria / Empresa"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
            />
          </div>

          {/* Partner Subtitle */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Subtítulo / Razão Social do Parceiro</label>
            <input
              type="text"
              value={form.partnerName}
              onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
              placeholder="Ex: Advisory & Tax Intelligence"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
            />
          </div>

          {/* Color Palettes */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">Cor Primária de Destaque</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {colorPresets.map((c) => {
                const isSelected = form.primaryColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setForm({ ...form, primaryColor: c.hex })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center space-x-2 ${
                      isSelected ? 'border-slate-900 bg-slate-100 font-bold' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span className="text-[11px] truncate">{c.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Header text */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Cabeçalho dos Relatórios PDF</label>
            <input
              type="text"
              value={form.reportHeader}
              onChange={(e) => setForm({ ...form, reportHeader: e.target.value })}
              placeholder="Texto impresso no topo do PDF"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
            />
          </div>

          {/* Disclaimer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                placeholder="+55 11 96175-9438"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Texto de Rodapé</label>
              <input
                type="text"
                value={form.customDisclaimer}
                onChange={(e) => setForm({ ...form, customDisclaimer: e.target.value })}
                placeholder="Ex: Documento Confidencial"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-[#00D280]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00D280] hover:bg-[#00b870] text-slate-950 font-black shadow-xs transition-colors cursor-pointer"
            >
              Salvar Preferências
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
