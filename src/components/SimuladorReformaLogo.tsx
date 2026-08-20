import React from 'react';

interface SimuladorReformaLogoProps {
  variant?: 'dark' | 'light' | 'full-color';
  showSubtitle?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SimuladorReformaLogo: React.FC<SimuladorReformaLogoProps> = ({
  variant = 'dark',
  showSubtitle = true,
  className = '',
  size = 'md'
}) => {
  // Variant styling: 'dark' means on dark background (white text), 'light' means on light background (slate text)
  const isDarkBg = variant === 'dark';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9.5 h-9.5',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Tech Product Logo Emblem: Dual-Tax Engine & Reform Node */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#0F172A] to-[#022C22] p-[1.5px] shadow-md shadow-[#00D280]/20 ring-1 ring-[#00D280]/30 transition-transform duration-200 hover:scale-105 group`}>
        <div className="w-full h-full bg-[#091120] rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Subtle glowing background aura */}
          <div className="absolute inset-0 bg-radial from-[#00D280]/25 via-transparent to-transparent opacity-60 pointer-events-none" />
          
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="srtEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E68C" />
                <stop offset="100%" stopColor="#00A862" />
              </linearGradient>
              <linearGradient id="srtSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* Hexagonal Outer Frame Segment */}
            <path 
              d="M50 8 L85 28 V72 L50 92 L15 72 V28 Z" 
              stroke="url(#srtEmeraldGrad)" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.8"
            />

            {/* Left Flow Wing: CBS / Federal (Cyan) */}
            <path 
              d="M26 36 L50 50 V78 L26 64 Z" 
              fill="url(#srtSkyGrad)" 
              opacity="0.9"
            />

            {/* Right Flow Wing: IBS / Subnacional (Emerald) */}
            <path 
              d="M74 36 L50 50 V78 L74 64 Z" 
              fill="url(#srtEmeraldGrad)" 
              opacity="0.95"
            />

            {/* Top Convergence Chevron: Não-Cumulatividade Plena */}
            <path 
              d="M50 22 L70 34 L50 46 L30 34 Z" 
              fill="#FFFFFF" 
            />

            {/* Central Precision Core Dot */}
            <circle cx="50" cy="50" r="4" fill="#091120" />
            <circle cx="50" cy="50" r="2.5" fill="#00D280" />
          </svg>
        </div>
      </div>

      {/* Wordmark for Simulador de Reforma Tributária */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-base sm:text-lg font-sans ${isDarkBg ? 'text-white' : 'text-slate-900'}`}>
            SIMULADOR
          </span>
          <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#00D280] font-sans">
            TRIBUTÁRIO
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold tracking-wider uppercase ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
              Reforma Tributária
            </span>
            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-[#00D280] border border-emerald-500/30">
              EC 132 • LC 214
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
