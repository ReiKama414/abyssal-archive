'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '@/lib/store';
import { CARD_PACKS } from '@/data/packs';
import { ALL_CARDS } from '@/data/cards';
import { CARDS_MAP } from '@/lib/store';
import { CardPack } from '@/types';
import { isFestivalActive, getTimeUntilTaipeiMidnight } from '@/lib/time';
import { Flame, ChevronRight, Info } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';
import { withBase } from '@/lib/basePath';

export const PackSelector: React.FC = () => {
  const {
    selectedPack,
    setSelectedPack,
    userState,
    performPull,
    isPulling,
    setIsRatesModalOpen,
    infinitePulls,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'permanent' | 'festival'>('all');
  const [countdown, setCountdown] = useState(getTimeUntilTaipeiMidnight().formatted);
  const packsGridRef = useRef<HTMLDivElement>(null);

  // Live countdown to Taiwan midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilTaipeiMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP: Staggered animation when pack category tab changes
  useEffect(() => {
    if (!packsGridRef.current) return;
    const packs = packsGridRef.current.children;
    if (packs.length > 0) {
      gsap.fromTo(
        packs,
        { opacity: 0, y: 25, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleSelectPack = (pack: CardPack) => {
    audio.playHover?.();
    setSelectedPack(pack);
  };

  const handlePull = async (count: 1 | 5 | 10) => {
    audio.playClick?.();
    await performPull(count);
  };

  const remainingPulls = infinitePulls ? 999 : (userState?.dailyPullsRemaining ?? 10);

  const filteredPacks = CARD_PACKS.filter((p) => {
    if (activeTab === 'permanent') return p.isPermanent;
    if (activeTab === 'festival') return !p.isPermanent;
    return true;
  });

  const pullDisabled = {
    one: remainingPulls < 1 || isPulling,
    five: remainingPulls < 5 || isPulling,
    ten: remainingPulls < 10 || isPulling,
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 z-10 relative ${selectedPack ? 'pb-28' : ''}`}>
      {/* Top Banner: Daily Status & Pity Counters */}
      <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-hud tracking-[0.16em] text-cyan-400 uppercase font-semibold">
              DAILY GACHA // 每日免費抽卡
            </span>
            {infinitePulls && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse">
                DEV: 無限抽卡中
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white flex items-center gap-3 tracking-wide">
            <span>今日剩餘：</span>
            <span className={`font-mono tabular-nums ${infinitePulls ? 'text-amber-300 font-bold' : remainingPulls > 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
              {infinitePulls ? '∞ 無限抽卡' : `${remainingPulls} / 10 次`}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>台灣時間 00:00 重置（距離重置還有：</span>
            <span className="font-mono text-amber-300 font-semibold">{countdown}</span>
            <span>）</span>
          </p>
        </div>

        {/* Global Pity Status Progress */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* SR Pity */}
          <div className="flex-1 sm:flex-initial bg-slate-950/70 border border-purple-500/30 px-3.5 py-2 rounded-2xl flex flex-col">
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              SR 保底
            </span>
            <span className="text-sm font-mono font-black text-white">
              {userState?.srPity ?? 0} / 10
            </span>
          </div>

          {/* UR Pity */}
          <div className="flex-1 sm:flex-initial bg-slate-950/70 border border-rose-500/30 px-3.5 py-2 rounded-2xl flex flex-col">
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
              UR 保底
            </span>
            <span className="text-sm font-mono font-black text-white">
              {userState?.urPity ?? 0} / 50
            </span>
          </div>

          {/* EX Pity */}
          <div className="flex-1 sm:flex-initial bg-slate-950/70 border border-cyan-400/50 px-3.5 py-2 rounded-2xl flex flex-col shadow-[0_0_15px_rgba(0,242,255,0.15)]">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <AbyssalSigil className="w-3 h-3" />
              <span>EX 保底</span>
            </span>
            <span className="text-sm font-mono font-black text-cyan-200">
              {userState?.exPity ?? 0} / 200
            </span>
          </div>

          <button
            onClick={() => setIsRatesModalOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="查看完整機率說明"
          >
            <Info className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Series Category Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            audio.playClick?.();
            setActiveTab('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
            activeTab === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          全部卡包 ({CARD_PACKS.length})
        </button>
        <button
          onClick={() => {
            audio.playClick?.();
            setActiveTab('permanent');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
            activeTab === 'permanent'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          四大永久系列 (4)
        </button>
        <button
          onClick={() => {
            audio.playClick?.();
            setActiveTab('festival');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
            activeTab === 'festival'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          節慶限定活動 (9)
        </button>
      </div>

      {/* Main Grid: Card Packs */}
      <div
        ref={packsGridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredPacks.map((pack) => {
          const isSelected = selectedPack.id === pack.id;
          const isCurrentActive = isFestivalActive(pack.activeRange);
          const primaryFeatured = CARDS_MAP.get(pack.featuredCardIds[0]);
          const packTotalCards = ALL_CARDS.filter(c => c.series === pack.seriesId).length;

          return (
            <div
              key={pack.id}
              onClick={() => handleSelectPack(pack)}
              className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden border ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-400/80 shadow-[0_0_30px_rgba(0,242,255,0.25)] scale-[1.02]'
                  : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Dynamic Theme Glow Accent */}
              <div
                className="absolute -right-16 -top-16 w-36 h-36 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: pack.themeColor }}
              />

              {/* Pack Header & Badges */}
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pack.isPermanent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        永久卡包
                      </span>
                    ) : isCurrentActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/60 animate-pulse flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 fill-amber-400" />
                        <span>現正開放</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/40">
                        節慶系列 (預覽)
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                      共 {packTotalCards} 款卡牌
                    </span>
                  </div>

                  <span
                    className="w-3 h-3 rounded-full border border-slate-700 shrink-0"
                    style={{ backgroundColor: pack.themeColor }}
                  />
                </div>

                {/* Photorealistic 3D Foil Booster Pack Sleeve */}
                <div
                  className="w-full h-52 rounded-2xl relative overflow-hidden flex flex-col justify-between p-2.5 border shadow-2xl group-hover:scale-[1.02] transition-all duration-300 select-none"
                  style={{
                    borderColor: `${pack.themeColor}88`,
                    boxShadow: `0 12px 28px -6px ${pack.themeColor}33`,
                    background: `linear-gradient(135deg, #070d1d 0%, #030611 100%)`,
                  }}
                >
                  {/* Background Featured Card Illustration */}
                  {primaryFeatured?.customImageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={withBase(primaryFeatured.customImageUrl)}
                        alt={primaryFeatured.name}
                        className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500 opacity-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
                    </div>
                  )}

                  {/* Top Metallic Foil Crimping */}
                  <div
                    className="relative z-10 w-full h-5 rounded-t-lg flex items-center justify-between px-3 border-b border-white/20 shadow-md"
                    style={{
                      background: `repeating-linear-gradient(90deg, #1e293b, #1e293b 4px, #334155 4px, #334155 8px)`,
                    }}
                  >
                    <span className="text-[8px] font-display font-bold text-slate-300 tracking-widest uppercase">
                      ABYSSAL ARCHIVE TCG
                    </span>
                    <span className="text-[8px] font-mono text-cyan-300 font-bold">
                      POOL: {packTotalCards} CARDS
                    </span>
                  </div>

                  {/* Dynamic Prismatic Holographic Sheen Overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-cyan-400/30 to-purple-500/30 mix-blend-color-dodge" />

                  {/* Pack Title & Logo Area */}
                  <div className="relative z-20 text-center my-auto px-2">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-hud font-bold uppercase tracking-wider mb-1 border shadow-lg backdrop-blur-md"
                      style={{
                        backgroundColor: `${pack.themeColor}33`,
                        borderColor: pack.themeColor,
                        color: '#ffffff',
                      }}
                    >
                      <AbyssalSigil className="w-3.5 h-3.5" />
                      <span>{pack.nameEn}</span>
                    </div>
                    <h3 className="text-lg font-sans font-extrabold text-white text-center tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {pack.name}
                    </h3>
                  </div>

                  {/* Bottom Metallic Foil Crimping */}
                  <div
                    className="relative z-10 w-full h-4 rounded-b-lg flex items-center justify-between px-3 border-t border-white/20 shadow-md"
                    style={{
                      background: `repeating-linear-gradient(90deg, #1e293b, #1e293b 4px, #334155 4px, #334155 8px)`,
                    }}
                  >
                    <span className="text-[8px] font-mono text-slate-400">
                      ★ {primaryFeatured?.name || pack.featuredCardIds[0]}
                    </span>
                    <span className="text-[8px] font-mono text-amber-400 font-bold">
                      OFFICIAL EDITION
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>

                {/* Pack Card Pool Size Badge */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">全套卡池規模</span>
                  <span className="font-mono font-bold text-cyan-300">
                    共 {packTotalCards} 款卡牌 ({pack.isPermanent ? '常駐收錄' : '節慶限定'})
                  </span>
                </div>

                {/* Featured Cards Highlights */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                    本包焦點代表卡：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.featuredCardIds.slice(0, 3).map((cardId) => {
                      const featured = CARDS_MAP.get(cardId);
                      if (!featured) return null;
                      return (
                        <span
                          key={cardId}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-medium truncate max-w-[140px]"
                        >
                          <span className="text-amber-400 mr-1 font-bold">[{featured.rarity}]</span>
                          {featured.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inline select / selected hint — actual pull controls live in sticky dock */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {isSelected ? (
                  <div className="py-2.5 rounded-xl text-center text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/40">
                    已選擇 · 使用底部抽卡列進行召喚
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPack(pack)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-300 group-hover:text-cyan-300 bg-slate-800/60 group-hover:bg-slate-800 border border-slate-700/60 group-hover:border-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <span>選擇此卡包</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky pull dock — always visible above mobile bottom nav */}
      {selectedPack && (
        <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-30 pointer-events-none">
          <div className="max-w-xl mx-auto px-3 pointer-events-auto">
            <div className="p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
                <span className="text-[11px] text-slate-400 truncate">
                  當前卡包：
                  <strong className="text-cyan-300 font-bold ml-1">{selectedPack.name}</strong>
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {infinitePulls ? '∞' : `${remainingPulls}/10`} 抽
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={pullDisabled.one}
                  onClick={() => handlePull(1)}
                  className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  單抽
                </button>
                <button
                  disabled={pullDisabled.five}
                  onClick={() => handlePull(5)}
                  className="py-2.5 rounded-xl font-bold text-xs bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  五連抽
                </button>
                <button
                  disabled={pullDisabled.ten}
                  onClick={() => handlePull(10)}
                  className="py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  十連抽
                </button>
              </div>
              {remainingPulls === 0 && !infinitePulls && (
                <p className="text-[11px] text-rose-400 text-center font-medium mt-2">
                  今日 10 抽已用完，請靜候午夜重置
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
