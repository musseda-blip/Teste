import React, { useState } from 'react';
import { MessageCircle, X, Phone, Clock, ArrowRight } from 'lucide-react';

export const WhatsAppSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+55 11 96175-9438';
  const cleanNumber = '5511961759438';
  const defaultMessage = encodeURIComponent(
    'Olá! Estou utilizando o Simulador de Reforma Tributária e gostaria de tirar dúvidas sobre os cálculos, regras de transição e alíquotas.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {/* Expanded Popover */}
        {isOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Popover Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Atendimento Especializado</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00D280] inline-block animate-pulse"></span>
                    Simulador Reforma Tributária • Suporte Fiscal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popover Body */}
            <div className="p-4 bg-slate-50 space-y-3 text-xs text-slate-600">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-slate-700 font-medium">
                  Precisa de suporte com as simulações da Reforma Tributária ou consultoria tributária personalizada?
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-[#00D280]" />
                  <span className="font-mono font-semibold text-slate-800">{phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Segunda a Sexta • 09h às 18h</span>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Conversar no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <p className="text-[10px] text-center text-slate-400">
                Resposta rápida por especialistas fiscais e tributários
              </p>
            </div>
          </div>
        )}

        {/* Floating Circle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-white cursor-pointer"
          title="Dúvidas e Atendimento Simulador Tributário"
          aria-label="Atendimento via WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D280]"></span>
            </span>
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-bold leading-tight">Dúvidas?</span>
            <span className="text-[10px] font-medium leading-none opacity-90">WhatsApp Online</span>
          </div>
        </button>
      </div>
    </>
  );
};
