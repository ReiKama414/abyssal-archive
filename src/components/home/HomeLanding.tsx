'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '@/lib/store';
import { HeroDeepSea } from './HeroDeepSea';
import { Card3D } from '@/components/card/Card3D';
import { ALL_CARDS } from '@/data/cards';
import { PackageOpen, Trophy, Layers } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';
import { getTimeUntilTaipeiMidnight } from '@/lib/time';
import { withBase } from '@/lib/basePath';

export const HomeLanding: React.FC = () => {
  const { setCurrentView, userState, setInspectedCard, infinitePulls } = useAppStore();
  const [countdown, setCountdown] = useState(getTimeUntilTaipeiMidnight().formatted);

  const heroContentRef = useRef<HTMLDivElement>(null);
  const spotlightContainerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const remainingPulls = infinitePulls ? 999 : (userState?.dailyPullsRemaining ?? 10);
  const pullsExhausted = !infinitePulls && remainingPulls <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilTaipeiMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP: Hero entrance timeline & floating idle motion
  // Use fromTo (not from) so interrupted remounts never leave opacity:0 inline styles.
  useEffect(() => {
    if (!heroContentRef.current) return;

    const revealSelectors = [
      '.hero-badge',
      '.hero-logo',
      '.hero-title',
      '.hero-sub',
      '.hero-cta',
      '.hero-reset',
      '.spotlight-card-item',
    ];

    const ctx = gsap.context(() => {
      gsap.set(revealSelectors.join(', '), { clearProps: 'opacity,transform,visibility' });

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          gsap.set(revealSelectors.join(', '), { opacity: 1, clearProps: 'transform' });
        },
      });

      tl.fromTo(
        '.hero-badge',
        { y: -25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
        .fromTo(
          '.hero-logo',
          { scale: 0.7, y: -20, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' },
          '-=0.3'
        )
        .fromTo(
          '.hero-title',
          { scale: 0.92, y: 30, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
          '-=0.3'
        )
        .fromTo(
          '.hero-sub',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
          '-=0.4'
        )
        .fromTo(
          '.hero-cta',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.2)' },
          '-=0.3'
        )
        .fromTo(
          '.hero-reset',
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
          '-=0.25'
        )
        .fromTo(
          '.spotlight-card-item',
          { y: 50, scale: 0.85, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            stagger: 0.15,
            duration: 0.7,
            ease: 'back.out(1.3)',
          },
          '-=0.2'
        );

      // Subtle float on spotlight cards
      if (card1Ref.current && card2Ref.current && card3Ref.current) {
        gsap.to(card1Ref.current, {
          y: -10,
          rotationZ: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        gsap.to(card2Ref.current, {
          y: -14,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4,
        });
        gsap.to(card3Ref.current, {
          y: -10,
          rotationZ: 8,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        });
      }
    }, heroContentRef);

    return () => {
      ctx.revert();
      // Safety: never leave hero interactive targets invisible after unmount mid-tween
      if (heroContentRef.current) {
        gsap.set(heroContentRef.current.querySelectorAll(revealSelectors.join(', ')), {
          opacity: 1,
          clearProps: 'transform',
        });
      }
    };
  }, []);

  // Top featured spotlight cards
  const spotlightCard1 = ALL_CARDS.find((c) => c.id === 'abyss-15')!;
  const spotlightCard2 = ALL_CARDS.find((c) => c.id === 'nocturne-13')!;
  const spotlightCard3 = ALL_CARDS.find((c) => c.id === 'beast-12')!;

  const handleStartSummon = () => {
    audio.playClick?.();
    setCurrentView('packs');
  };

  const handleOpenCollection = () => {
    audio.playClick?.();
    setCurrentView('collection');
  };

  const handleOpenShowcase = () => {
    audio.playClick?.();
    setCurrentView('showcase');
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      {/* Three.js Swimming Jellyfish & Deep Sea WebGL Background */}
      <HeroDeepSea />

      {/* ComfyUI Generated Sunken Cathedral Panoramic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBase('/header-banner.jpg')}
          alt="Sunken Abyssal Cathedral"
          className="w-full h-full object-cover object-center filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
      </div>

      {/* Main Hero Showcase Center */}
      <div
        ref={heroContentRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12 flex flex-col items-center text-center"
      >
        {/* Subtitle Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-hud font-semibold tracking-[0.18em] uppercase mb-4 shadow-[0_0_20px_rgba(0,242,255,0.25)] backdrop-blur-md">
          <AbyssalSigil className="w-4 h-4" />
          <span>BIOLUMINESCENT CARD GACHA // 深淵幻藏</span>
        </div>

        {/* Official ComfyUI Brand Logo Crest */}
        <div className="hero-logo mb-4 relative group cursor-pointer">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-gradient-to-b from-cyan-400/50 via-blue-600/30 to-purple-600/50 border border-cyan-400/60 shadow-[0_0_35px_rgba(0,242,255,0.4)] backdrop-blur-md transition-all group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(0,242,255,0.7)]">
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBase('/logo.png')}
                alt="Abyssal Archive Official Crest"
                className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Main Title — Noto Serif TC for ritual ZH brand */}
        <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          深 淵 幻 藏
        </h1>
        {/* English subtitle — Cinzel engraved Latin */}
        <p className="hero-sub text-sm sm:text-lg font-display font-semibold tracking-[0.28em] text-cyan-200/90 mt-2 max-w-2xl drop-shadow uppercase">
          ABYSSAL ARCHIVE — DARK FANTASY TRADING CARDS
        </p>

        <p className="hero-sub text-xs sm:text-sm font-sans text-slate-300/85 max-w-xl mt-4 leading-relaxed font-normal">
          漫游於幽光水母與太古遺跡交織的深藍之海。每日免費十抽、3D全息多維卡牌、沉浸式開包體驗。
        </p>

        {/* Call to Action Buttons — exhausted pulls switch primary path away from dead-end summon */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {pullsExhausted ? (
            <>
              <button
                onClick={handleOpenCollection}
                className="hero-cta group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wider shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5"
              >
                <Layers className="w-5 h-5" />
                <span>今日抽數已用完 · 瀏覽圖鑑</span>
              </button>
              <button
                onClick={handleOpenShowcase}
                className="hero-cta px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-bold tracking-wider backdrop-blur-md transition-all shadow-lg flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>前往 3D 展廳</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartSummon}
                className="hero-cta group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wider shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5"
              >
                <PackageOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>
                  立即進入深海召喚 (
                  {infinitePulls ? '∞' : remainingPulls} 抽可用)
                </span>
              </button>

              <button
                onClick={handleOpenCollection}
                className="hero-cta px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-bold tracking-wider backdrop-blur-md transition-all shadow-lg flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>查看我的圖鑑收藏</span>
              </button>
            </>
          )}
        </div>

        {/* Taiwan Reset Notice Banner */}
        <div className="hero-reset mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-full backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${pullsExhausted ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span>每日 00:00 自動重置（距下次重置：</span>
          <span className="font-mono text-cyan-300 font-semibold tabular-nums">{countdown}</span>
          <span>）</span>
        </div>

        {/* 3D Holographic Spotlight Preview Cards with GSAP Bobbing */}
        <div
          ref={spotlightContainerRef}
          className="mt-12 sm:mt-16 w-full flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-5xl"
        >
          <div
            ref={card1Ref}
            className="spotlight-card-item transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer"
            onClick={() => {
              audio.playClick?.();
              setInspectedCard({ card: spotlightCard1, variant: 'Abyss Edition' });
            }}
          >
            <Card3D
              card={spotlightCard1}
              variant="Abyss Edition"
              size="lg"
              interactive={true}
            />
          </div>

          <div
            ref={card2Ref}
            className="spotlight-card-item transform scale-105 hover:scale-110 z-20 transition-transform duration-300 cursor-pointer"
            onClick={() => {
              audio.playClick?.();
              setInspectedCard({ card: spotlightCard2, variant: 'Prismatic Signature' });
            }}
          >
            <Card3D
              card={spotlightCard2}
              variant="Prismatic Signature"
              size="lg"
              interactive={true}
            />
          </div>

          <div
            ref={card3Ref}
            className="spotlight-card-item transform rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer"
            onClick={() => {
              audio.playClick?.();
              setInspectedCard({ card: spotlightCard3, variant: 'Royal Gold' });
            }}
          >
            <Card3D
              card={spotlightCard3}
              variant="Royal Gold"
              size="lg"
              interactive={true}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          提示：滑鼠懸停或手指滑動可即時體驗 GSAP 慣性物理與 3D 視差光學反射
        </p>
      </div>

      {/* Series Preview Footer Strip */}
      <div className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { title: 'ABYSSAL JELLYFISH', sub: '深海水母與海洋神獸 (72款)', color: 'text-cyan-400' },
            { title: 'NOCTURNE FANTASY', sub: '日系動漫與哥德魔女 (72款)', color: 'text-purple-400' },
            { title: 'NEON DISTRICT', sub: '夜晚雨夜與賽博龐克 (72款)', color: 'text-rose-400' },
            { title: 'PHANTOM BEASTS', sub: '靈狐神龍與太古靈獸 (72款)', color: 'text-amber-400' },
          ].map((item, idx) => (
            <div key={idx} className="p-2">
              <span className={`text-xs font-display font-bold tracking-[0.2em] block ${item.color}`}>
                {item.title}
              </span>
              <span className="text-[11px] font-sans text-slate-400 block mt-0.5">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
