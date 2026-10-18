'use client';

import React from 'react';

interface AbyssalSigilProps {
  className?: string;
  glow?: boolean;
}

export const AbyssalSigil: React.FC<AbyssalSigilProps> = ({
  className = 'w-4 h-4',
  glow = false,
}) => {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/abyssal-sigil.png"
        alt="Abyssal Sigil"
        className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,242,255,0.6)]"
      />
      {glow && (
        <span className="absolute inset-0 rounded-full bg-cyan-400/20 blur-sm pointer-events-none" />
      )}
    </span>
  );
};
