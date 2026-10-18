'use client';

import React, { useState } from 'react';
import { CardDefinition } from '@/types';
import { generateCardSvg } from '@/lib/art/cardArtGenerator';
import { withBase } from '@/lib/basePath';

interface CardArtViewProps {
  card: CardDefinition;
  isLiving?: boolean;
}

export const CardArtView: React.FC<CardArtViewProps> = ({ card, isLiving = false }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const svgContent = React.useMemo(() => {
    return generateCardSvg(card, isLiving);
  }, [card, isLiving]);

  // If a custom image URL is provided and has not failed, render the image with overlay
  if (card.customImageUrl && !imageFailed) {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-2xl pointer-events-none select-none">
        {/* Base Image with subtle breathing scale if Living Card */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBase(card.customImageUrl)}
          alt={card.name}
          className={`w-full h-full object-cover transition-transform duration-1000 ${
            isLiving ? 'animate-[pulse_4s_ease-in-out_infinite] scale-[1.03]' : ''
          }`}
          onError={() => setImageFailed(true)}
        />

        {/* Ambient lighting vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        {/* Dynamic Living Card Effects: Multi-layer ambient caustics, floating particles, and water/rain shimmer */}
        {isLiving && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Living Breathing Caustics Overlay */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-color-dodge animate-pulse"
              style={{
                background: `radial-gradient(ellipse at 50% 40%, ${card.palette.glow}44 0%, transparent 70%)`,
              }}
            />

            {/* Rising Bioluminescent Particles & Underwater Currents */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-30 animate-[spin_30s_linear_infinite]" />

            {/* Cyberpunk Rain / Light Shimmer Streaks */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />

            {/* Living Card Indicator Stamp */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400 shadow-[0_0_12px_rgba(0,242,255,0.7)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[8px] font-mono font-black text-cyan-200 tracking-wider uppercase">
                LIVING CARD
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: Procedural High-Res Multi-Layer Vector Artwork
  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-2xl pointer-events-none select-none"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
