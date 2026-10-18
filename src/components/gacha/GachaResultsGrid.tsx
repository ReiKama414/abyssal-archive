'use client';

import React, { useEffect, useState } from 'react';
import { PulledCard } from '@/types';
import { Card3D } from '@/components/card/Card3D';
import { useAppStore } from '@/lib/store';
import { RotateCcw, CheckCircle2, ChevronDown, Trophy } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';
import { ribbonCannons, DEFAULT_RIBBON_PALETTES } from '@/lib/ribbons';

interface GachaResultsGridProps {
  cards: PulledCard[];
  onReplay: () => void;
  onContinue: () => void;
}

export const GachaResultsGrid: React.FC<GachaResultsGridProps> = ({
  cards,
  onReplay,
  onContinue,
}) => {
  const { setInspectedCard, setCurrentView } = useAppStore();
  const [showScrollHint, setShowScrollHint] = useState(cards.length > 4);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const hasHighRarity = cards.some(
      (c) => c.card.rarity === 'SSR' || c.card.rarity === 'UR' || c.card.rarity === 'EX'
    );
    if (hasHighRarity) {
      ribbonCannons.fire({
        count: 42,
        origin: 'cannon-both',
        colors: DEFAULT_RIBBON_PALETTES.prismatic,
      });
    }
  }, [cards]);

  useEffect(() => {
    if (cards.length <= 4) {
      setShowScrollHint(false);
      return;
    }
    const onScroll = () => {
      if (window.scrollY > 120) setShowScrollHint(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [cards.length]);

  const handleCardClick = (pulled: PulledCard) => {
    audio.playClick?.();
    setInspectedCard({ card: pulled.card, variant: pulled.variant });
  };

  const handleShowcase = () => {
    audio.playClick?.();
    setCurrentView('showcase');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-28 animate-in fade-in duration-300">
      {/* Result Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-hud font-semibold tracking-[0.16em] uppercase mb-2">
          <AbyssalSigil className="w-4 h-4" />
          <span>GACHA COMPLETED // 獲得卡牌一覽</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-white tracking-wide">
          恭喜獲得 {cards.length} 張卡牌！
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          點擊任意卡牌可開啟 3D 全螢幕檢視、翻面、查看背景故事與閃卡光澤
        </p>
        {cards.length > 4 && (
          <p className="mt-2 text-[11px] text-cyan-300/90 font-medium">
            共 {cards.length} 張 · 向下捲動可查看全部卡牌
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-4 sm:gap-6 justify-items-center mb-10 ${
          cards.length === 1
            ? 'grid-cols-1 max-w-[280px] mx-auto'
            : cards.length === 5
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
        }`}
      >
        {cards.map((pulled, idx) => (
          <div
            key={`${pulled.card.id}-${idx}`}
            className="flex flex-col items-center animate-in zoom-in-90 duration-300"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* New Card Ribbon Badge */}
            {pulled.isNew && (
              <span className="mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-bounce">
                NEW!
              </span>
            )}

            <Card3D
              card={pulled.card}
              variant={pulled.variant}
              size={cards.length === 1 ? 'lg' : 'md'}
              interactive={true}
              onClick={() => handleCardClick(pulled)}
            />
          </div>
        ))}
      </div>

      {/* Sticky bottom actions — always reachable on short viewports */}
      <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto px-3 pointer-events-auto">
          {showScrollHint && (
            <div className="mb-2 flex justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold backdrop-blur-md animate-pulse">
                <ChevronDown className="w-3 h-3" />
                向下捲動查看其餘卡牌
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            <button
              onClick={onReplay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>重播開包</span>
            </button>

            <button
              onClick={handleShowcase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-100 border border-indigo-600/60 text-xs font-bold transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>加入 3D 展廳</span>
            </button>

            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,242,255,0.35)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>完成並返回卡包</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
