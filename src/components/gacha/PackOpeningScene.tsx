'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { useAppStore, CARDS_MAP } from '@/lib/store';
import { PulledCard } from '@/types';
import { Card3D } from '@/components/card/Card3D';
import { GachaResultsGrid } from './GachaResultsGrid';
import { FastForward, Eye, ArrowUp, Hand, CheckCircle, Sparkles } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import confetti from 'canvas-confetti';
import { ribbonCannons, DEFAULT_RIBBON_PALETTES } from '@/lib/ribbons';
import { audio } from '@/lib/audio';
import { getCardBackSvg } from '@/lib/art/cardArtGenerator';
import { withBase } from '@/lib/basePath';

type OpeningStage = 'tear_strip' | 'pull_cards' | 'summon_ritual' | 'reveal_cards' | 'results';

export const PackOpeningScene: React.FC = () => {
  const { currentPulledCards, selectedPack, setCurrentView } = useAppStore();

  const [stage, setStage] = useState<OpeningStage>('tear_strip');
  const [tearProgress, setTearProgress] = useState(0); // 0 to 100
  const [isTearing, setIsTearing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0 to 100
  const [isPullingCards, setIsPullingCards] = useState(false);

  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [activeExModal, setActiveExModal] = useState<PulledCard | null>(null);

  // FX: Summon ritual, screen flash, and high rarity banner states
  const [ritualPhase, setRitualPhase] = useState<'charging' | 'erupting'>('charging');
  const [screenFlash, setScreenFlash] = useState<{ color: string } | null>(null);
  const [revealToast, setRevealToast] = useState<{ card: PulledCard; text: string; color: string } | null>(null);

  const featuredCard = CARDS_MAP.get(selectedPack?.featuredCardIds?.[0] || '');
  const cardBackSvg = useMemo(() => getCardBackSvg(), []);

  // Animation Refs for GSAP
  const packRef = useRef<HTMLDivElement>(null);
  const topFoilRef = useRef<HTMLDivElement>(null);
  const cardsStackRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef<number | null>(null);
  const exModalRef = useRef<HTMLDivElement>(null);
  const ritualContainerRef = useRef<HTMLDivElement>(null);
  const ritualSigilRef = useRef<HTMLDivElement>(null);

  // Enter opening mid-scroll from pack list would bury the skip control under sticky nav
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // GSAP 1: Idle Floating Pack Bobbing
  useEffect(() => {
    if (stage !== 'tear_strip' || !packRef.current) return;
    const tween = gsap.to(packRef.current, {
      y: -10,
      rotationZ: 1.2,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [stage]);

  // GSAP 2: Cards Grid Fan-Out Stagger when entering reveal_cards
  useEffect(() => {
    if (stage !== 'reveal_cards' || !cardsGridRef.current) return;
    const cards = cardsGridRef.current.children;
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        {
          y: 80,
          scale: 0.6,
          rotationZ: (i) => (i - Math.floor(cards.length / 2)) * 5,
          opacity: 0,
        },
        {
          y: 0,
          scale: 1,
          rotationZ: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'back.out(1.3)',
        }
      );
    }
  }, [stage]);

  // Highest rarity detection in this pull
  const highestRarity = useMemo(() => {
    const rank: Record<string, number> = { EX: 5, UR: 4, SSR: 3, SR: 2, R: 1, N: 0 };
    let maxR = 'N';
    let maxV = 0;
    (currentPulledCards || []).forEach((c) => {
      const v = rank[c.card.rarity] || 0;
      if (v > maxV) {
        maxV = v;
        maxR = c.card.rarity;
      }
    });
    return maxR;
  }, [currentPulledCards]);

  const ritualTheme = useMemo(() => {
    switch (highestRarity) {
      case 'EX':
        return {
          title: '✦ 深淵裂隙 · 太古神格天象 ✦',
          badge: 'MYTHIC EX RARITY DETECTED',
          desc: '太古深淵震顫，至高維度的神格即將顯現！',
          gradient: 'from-cyan-400 via-fuchsia-500 to-amber-300',
          glow: '#d946ef',
          borderColor: 'border-fuchsia-400',
          bgRadial: 'radial-gradient(circle, rgba(217,70,239,0.35) 0%, rgba(0,242,255,0.2) 40%, transparent 75%)',
          pillarGlow: '0 0 90px #d946ef, 0 0 140px #00f2ff',
          particles: ['#00f2ff', '#d946ef', '#fbbf24', '#ffffff', '#ec4899', '#38bdf8'],
        };
      case 'UR':
        return {
          title: '★ 璀璨極光 · 傳奇共鳴 ★',
          badge: 'ULTRA RARE PRESENCE',
          desc: '群星共鳴，極度稀有的極光傳奇顯現！',
          gradient: 'from-amber-400 via-rose-500 to-purple-600',
          glow: '#f43f5e',
          borderColor: 'border-rose-400',
          bgRadial: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(251,191,36,0.2) 45%, transparent 75%)',
          pillarGlow: '0 0 80px #f43f5e, 0 0 120px #fbbf24',
          particles: ['#fbbf24', '#f43f5e', '#f59e0b', '#ffffff', '#e11d48'],
        };
      case 'SSR':
        return {
          title: '★ 黃金律動 · 輝耀啟示 ★',
          badge: 'SUPER RARE BRILLIANCE',
          desc: '耀眼金光破空而來，輝耀典藏現身！',
          gradient: 'from-amber-300 via-yellow-400 to-amber-500',
          glow: '#fbbf24',
          borderColor: 'border-amber-400',
          bgRadial: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(234,179,8,0.15) 50%, transparent 75%)',
          pillarGlow: '0 0 70px #fbbf24, 0 0 100px #f59e0b',
          particles: ['#fbbf24', '#fef08a', '#eab308', '#ca8a04'],
        };
      case 'SR':
        return {
          title: '◆ 星曜流轉 · 史詩顯現 ◆',
          badge: 'SPECIAL RARE NEBULA',
          desc: '紫曜星雲凝聚，史詩之光綻放！',
          gradient: 'from-purple-500 via-indigo-500 to-cyan-400',
          glow: '#a855f7',
          borderColor: 'border-purple-400',
          bgRadial: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(99,102,241,0.15) 50%, transparent 75%)',
          pillarGlow: '0 0 50px #a855f7, 0 0 80px #6366f1',
          particles: ['#a855f7', '#00f2ff', '#38bdf8', '#c084fc'],
        };
      default:
        return {
          title: '◇ 深淵微光 · 命運探尋 ◇',
          badge: 'ABYSSAL WHISPER',
          desc: '深海洋流湧動，命運之門緩緩敞開...',
          gradient: 'from-cyan-500 via-blue-600 to-slate-800',
          glow: '#06b6d4',
          borderColor: 'border-cyan-500/50',
          bgRadial: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(30,58,138,0.15) 50%, transparent 75%)',
          pillarGlow: '0 0 40px #06b6d4',
          particles: ['#06b6d4', '#38bdf8', '#0284c7'],
        };
    }
  }, [highestRarity]);

  // GSAP 4: Summoning Ritual Charging & Erupt
  const triggerRitualErupt = useCallback(() => {
    setRitualPhase('erupting');
    audio.playSummonBurst?.(highestRarity);

    if (highestRarity === 'EX' || highestRarity === 'UR') {
      audio.playLightning?.();
    }

    if (ritualContainerRef.current) {
      gsap.timeline()
        .to(ritualContainerRef.current, { scale: 1.06, duration: 0.08, ease: 'power4.out' })
        .to(ritualContainerRef.current, { scale: 1, duration: 0.35, ease: 'back.out(1.5)' });
    }

    confetti({
      particleCount: highestRarity === 'EX' ? 220 : highestRarity === 'UR' ? 160 : highestRarity === 'SSR' ? 110 : 70,
      spread: 120,
      origin: { y: 0.5 },
      colors: ritualTheme.particles,
    });

    // Fire dual-cannon celebratory streamers & ribbons (彩帶禮炮)
    ribbonCannons.fire({
      count: highestRarity === 'EX' ? 65 : highestRarity === 'UR' ? 50 : highestRarity === 'SSR' ? 38 : 25,
      origin: 'cannon-both',
      colors:
        highestRarity === 'EX'
          ? DEFAULT_RIBBON_PALETTES.prismatic
          : highestRarity === 'UR' || highestRarity === 'SSR'
          ? DEFAULT_RIBBON_PALETTES.gold
          : DEFAULT_RIBBON_PALETTES.abyss,
    });

    setTimeout(() => {
      setStage('reveal_cards');
    }, 850);
  }, [highestRarity, ritualTheme.particles]);

  useEffect(() => {
    if (stage !== 'summon_ritual') return;
    audio.playSummonCharge?.(highestRarity);

    let lightningTimer: NodeJS.Timeout | null = null;
    if (highestRarity === 'EX' || highestRarity === 'UR') {
      lightningTimer = setInterval(() => {
        audio.playLightning?.();
      }, 550);
    }

    if (ritualSigilRef.current) {
      gsap.fromTo(
        ritualSigilRef.current,
        { scale: 0.4, rotation: 0, opacity: 0 },
        { scale: 1, rotation: 720, opacity: 1, duration: 2.2, ease: 'power2.inOut' }
      );
    }

    const autoErupt = setTimeout(() => {
      triggerRitualErupt();
    }, 2300);

    return () => {
      clearTimeout(autoErupt);
      if (lightningTimer) clearInterval(lightningTimer);
    };
  }, [stage, highestRarity, triggerRitualErupt]);

  // If no cards, go back
  if (!currentPulledCards || currentPulledCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-slate-400 mb-4">沒有正在進行的抽卡結果</p>
        <button
          onClick={() => setCurrentView('packs')}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-sm shadow-lg hover:bg-cyan-500 transition-colors"
        >
          前往卡包商店
        </button>
      </div>
    );
  }

  // ==========================================
  // 1. AUTHENTIC PHYSICAL FOIL TEAR HANDLERS
  // ==========================================
  const handleTearPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setIsTearing(true);
    audio.playHover?.();
  };

  const handleTearPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTearing || !packRef.current) return;
    const rect = packRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setTearProgress(progress);

    // Audio feedback: play crisp foil ripping audio on drag increments
    if (Math.round(progress) % 15 === 0 && progress > 5) {
      audio.playTearPack?.();
    }

    // Pack physically strains and flexes in 3D under finger pull
    const tilt = (progress / 100) * 4.5 - 1.2;
    gsap.to(packRef.current, {
      rotationZ: tilt,
      scale: 1 + (progress / 100) * 0.025,
      duration: 0.05,
      overwrite: 'auto',
    });

    // When dragged past 68%, foil completely tears off!
    if (progress >= 68) {
      finishTear();
    }
  };

  const handleTearPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTearing) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsTearing(false);

    if (tearProgress >= 68) {
      finishTear();
    } else {
      // Elastic snap back to sealed if released halfway
      setTearProgress(0);
      if (packRef.current) {
        gsap.to(packRef.current, {
          rotationZ: 0,
          scale: 1,
          duration: 0.35,
          ease: 'elastic.out(1, 0.65)',
        });
      }
    }
  };

  const finishTear = () => {
    setIsTearing(false);
    setTearProgress(100);
    audio.playTearPack?.();

    // GSAP Foil Physics: top foil strip violently snaps and curls away into the void
    if (topFoilRef.current) {
      gsap.to(topFoilRef.current, {
        y: -170,
        x: 80,
        rotationZ: -38,
        scale: 0.85,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
      });
    }

    if (packRef.current) {
      gsap.timeline()
        .to(packRef.current, { scale: 1.05, rotationZ: 0, duration: 0.12, ease: 'power2.out' })
        .to(packRef.current, { scale: 1, duration: 0.3, ease: 'back.out(1.2)' });
    }

    // Spark confetti burst at the tear line!
    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.38 },
      colors: ['#00f2ff', '#ffffff', '#fbbf24', '#cbd5e1'],
    });

    setTimeout(() => {
      setStage('pull_cards');
    }, 450);
  };

  // ==========================================
  // 2. INTERACTIVE CARD PULL-OUT HANDLERS
  // ==========================================
  const handlePullStart = (clientY: number) => {
    setIsPullingCards(true);
    dragStartYRef.current = clientY;
    audio.playHover?.();
  };

  const handlePullMove = (clientY: number) => {
    if (!isPullingCards || dragStartYRef.current === null) return;
    const deltaY = dragStartYRef.current - clientY; // Upward is positive
    const maxDistance = 180; // Pixels
    const progress = Math.max(0, Math.min(100, (deltaY / maxDistance) * 100));
    setPullProgress(progress);

    if (progress >= 50) {
      finishPullCards();
    }
  };

  const handlePullEnd = () => {
    if (!isPullingCards) return;
    setIsPullingCards(false);
    dragStartYRef.current = null;
    if (pullProgress < 50) {
      setPullProgress(0);
    }
  };

  const finishPullCards = () => {
    setIsPullingCards(false);
    setPullProgress(100);
    dragStartYRef.current = null;
    audio.playCardBurst?.();

    // GSAP cards shooting out of the opened foil pack
    if (cardsStackRef.current) {
      gsap.to(cardsStackRef.current, {
        y: -260,
        scale: 1.25,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
      });
    }

    setRitualPhase('charging');
    setTimeout(() => {
      setStage('summon_ritual');
    }, 450);
  };

  // ==========================================
  // 3. REVEAL & SKIP ACTIONS
  // ==========================================
  const handleRevealCard = (index: number) => {
    if (revealedIndices.has(index)) return;

    const nextRevealed = new Set(revealedIndices);
    nextRevealed.add(index);
    setRevealedIndices(nextRevealed);

    const card = currentPulledCards[index];
    audio.playRarityReveal?.(card.card.rarity);

    // Dynamic screen flash & GSAP screen shake for high rarity
    if (card.card.rarity === 'EX' || card.card.rarity === 'UR' || card.card.rarity === 'SSR') {
      const flashColor =
        card.card.rarity === 'EX'
          ? 'from-cyan-400/40 via-fuchsia-500/35 to-amber-300/25'
          : card.card.rarity === 'UR'
          ? 'from-rose-500/40 via-amber-400/30 to-transparent'
          : 'from-amber-400/35 via-yellow-300/20 to-transparent';

      setScreenFlash({ color: flashColor });
      setTimeout(() => setScreenFlash(null), 450);

      // GSAP Screen Shake
      if (cardsGridRef.current) {
        const shake = card.card.rarity === 'EX' ? 12 : card.card.rarity === 'UR' ? 8 : 5;
        gsap.timeline()
          .to(cardsGridRef.current, { x: shake, y: -shake * 0.6, duration: 0.04 })
          .to(cardsGridRef.current, { x: -shake, y: shake * 0.6, duration: 0.04 })
          .to(cardsGridRef.current, { x: shake * 0.4, y: -shake * 0.3, duration: 0.04 })
          .to(cardsGridRef.current, { x: 0, y: 0, duration: 0.08, ease: 'power2.out' });
      }

      // Show celebration banner toast
      const bannerText =
        card.card.rarity === 'EX'
          ? `✦ EX 至高神格 · ${card.card.name} 降臨！`
          : card.card.rarity === 'UR'
          ? `★ UR 極度珍稀 · ${card.card.name} 顯現！`
          : `★ SSR 輝耀典藏 · ${card.card.name} 獲得！`;

      const bannerColor =
        card.card.rarity === 'EX'
          ? 'border-cyan-400 bg-slate-950/95 text-cyan-200 shadow-[0_0_25px_rgba(0,242,255,0.6)]'
          : card.card.rarity === 'UR'
          ? 'border-rose-400 bg-slate-950/95 text-amber-200 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
          : 'border-amber-400 bg-slate-950/95 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.5)]';

      setRevealToast({ card, text: bannerText, color: bannerColor });
      setTimeout(() => setRevealToast(null), 3000);
    }

    if (card.card.rarity === 'SSR' || card.card.rarity === 'UR') {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: card.card.rarity === 'UR' ? ['#fbbf24', '#f43f5e', '#f59e0b', '#ffffff'] : ['#fbbf24', '#fef08a', '#eab308'],
      });
      ribbonCannons.fire({
        count: card.card.rarity === 'UR' ? 36 : 24,
        origin: 'cannon-both',
        colors: DEFAULT_RIBBON_PALETTES.gold,
      });
    } else if (card.card.rarity === 'EX') {
      confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#00f2ff', '#d946ef', '#fbbf24', '#ffffff', '#ec4899'],
      });
      ribbonCannons.fire({
        count: 55,
        origin: 'cannon-both',
        colors: DEFAULT_RIBBON_PALETTES.prismatic,
      });
      setTimeout(() => {
        setActiveExModal(card);
      }, 700);
    }

    if (nextRevealed.size === currentPulledCards.length) {
      setTimeout(() => {
        setStage('results');
      }, 1400);
    }
  };

  const handleRevealAll = () => {
    audio.playCardBurst?.();
    const all = new Set<number>();
    currentPulledCards.forEach((_, i) => all.add(i));
    setRevealedIndices(all);

    const hasHigh = currentPulledCards.some(
      (c) => c.card.rarity === 'SSR' || c.card.rarity === 'UR' || c.card.rarity === 'EX'
    );
    if (hasHigh) {
      ribbonCannons.fire({
        count: 45,
        origin: 'cannon-both',
        colors: DEFAULT_RIBBON_PALETTES.prismatic,
      });
    }

    const hasEx = currentPulledCards.find((c) => c.card.rarity === 'EX');
    if (hasEx) {
      setActiveExModal(hasEx);
    }

    setTimeout(() => {
      setStage('results');
    }, 1000);
  };

  const handleSkip = () => {
    audio.playClick?.();
    const all = new Set<number>();
    currentPulledCards.forEach((_, i) => all.add(i));
    setRevealedIndices(all);
    setActiveExModal(null);
    setStage('results');
  };

  const handleReplay = () => {
    audio.playClick?.();
    setTearProgress(0);
    setPullProgress(0);
    setRevealedIndices(new Set());
    setActiveExModal(null);
    setRitualPhase('charging');
    setScreenFlash(null);
    setRevealToast(null);
    setStage('tear_strip');
  };

  // Render Final Results
  if (stage === 'results') {
    return (
      <GachaResultsGrid
        cards={currentPulledCards}
        onReplay={handleReplay}
        onContinue={() => setCurrentView('packs')}
      />
    );
  }

  if (!selectedPack) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-sm">找不到卡包資料，請返回重新選擇。</p>
        <button
          onClick={() => setCurrentView('packs')}
          className="px-5 py-2.5 rounded-xl bg-cyan-700 text-white text-xs font-bold"
        >
          返回卡包列表
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 pt-16 sm:pt-14 overflow-hidden select-none"
      onMouseMove={(e) => {
        handlePullMove(e.clientY);
      }}
      onMouseUp={() => {
        handlePullEnd();
      }}
      onTouchMove={(e) => {
        handlePullMove(e.touches[0].clientY);
      }}
      onTouchEnd={() => {
        handlePullEnd();
      }}
    >
      {/* Fixed below sticky navbar (h-16 / h-20) so skip stays reachable on short viewports */}
      <div className="fixed top-16 sm:top-20 inset-x-0 z-40 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 backdrop-blur-md shadow-lg min-w-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="truncate">正在開啟：{selectedPack.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stage === 'reveal_cards' && (
              <button
                onClick={handleRevealAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-xs font-bold transition-all shadow-lg backdrop-blur-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>翻開全部</span>
              </button>
            )}

            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-cyan-500/50 text-xs font-bold transition-all shadow-lg backdrop-blur-md"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>跳過動畫</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: AUTHENTIC PHYSICAL BOOSTER PACK TEARING
          ======================================================== */}
      {stage === 'tear_strip' && (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 select-none">
          {/* Physical Booster Pack Wrapper */}
          <div
            ref={packRef}
            className="relative w-[310px] sm:w-[350px] h-[480px] sm:h-[520px] rounded-2xl flex flex-col justify-between items-center shadow-2xl overflow-hidden touch-none select-none"
            style={{
              background: `linear-gradient(145deg, #070d1e 0%, #030611 50%, #010206 100%)`,
              border: `2px solid ${selectedPack.themeColor}aa`,
              boxShadow: `0 0 50px ${selectedPack.themeColor}33, inset 0 0 40px rgba(0,0,0,0.85)`,
            }}
          >
            {/* Background Featured Card Illustration Foil Layer */}
            {featuredCard?.customImageUrl && (
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBase(featuredCard.customImageUrl)}
                  alt={featuredCard.name}
                  className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
              </div>
            )}

            {/* Top Foil Crimp & Interactive Tear Flap (`topFoilRef`) */}
            <div
              ref={topFoilRef}
              className="relative z-30 w-full flex flex-col cursor-ew-resize select-none"
              onPointerDown={handleTearPointerDown}
              onPointerMove={handleTearPointerMove}
              onPointerUp={handleTearPointerUp}
              onPointerCancel={handleTearPointerUp}
            >
              {/* Top Metallic Ribbed Crimp Seal */}
              <div
                className="w-full h-7 border-b border-white/20 flex items-center justify-between px-3 shadow-md"
                style={{
                  background: `repeating-linear-gradient(90deg, #1e293b, #1e293b 3px, #475569 3px, #475569 6px, #0f172a 6px, #0f172a 9px)`,
                }}
              >
                <span className="text-[8px] font-display font-bold text-slate-300 tracking-widest uppercase">
                  ABYSSAL METALLIC FOIL PACK
                </span>
                <span className="text-[8px] font-hud font-bold text-cyan-300 tracking-wider uppercase">
                  ★ AIRTIGHT SEALED ★
                </span>
              </div>

              {/* The Actual Foil Tear Zone (Direct Drag Area) */}
              <div className="relative w-full h-14 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-transparent flex items-center justify-between px-3 border-b border-cyan-500/30 overflow-hidden">
                {/* Left Physical V-Notch (撕裂缺口) */}
                <div
                  className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-3.5 h-6 bg-slate-950 border-r border-amber-400 z-30"
                  style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
                />

                {/* Laser Perforation Dashed Tear Guide Line */}
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-cyan-400/40 z-10 pointer-events-none" />

                {/* Left Pulsating Notch Indicator */}
                <div className="relative z-20 flex items-center gap-1.5 pl-2 pointer-events-none">
                  <span className="text-[10px] font-black text-amber-300 font-mono tracking-tighter uppercase drop-shadow flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                    撕口 TEAR HERE
                  </span>
                </div>

                <div className="relative z-20 pr-2 pointer-events-none">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 tracking-wider">
                    {tearProgress > 0 ? `已撕開 ${Math.round(tearProgress)}%` : '向右滑動撕開 ►►'}
                  </span>
                </div>

                {/* Dynamic Peeling Torn Foil (Left of tear point) */}
                {tearProgress > 0 && (
                  <>
                    {/* The torn curling top foil flap */}
                    <div
                      className="absolute top-0 left-0 h-full z-25 overflow-hidden transition-all duration-75 origin-top-left pointer-events-none shadow-2xl"
                      style={{
                        width: `${tearProgress}%`,
                        transform: `rotateZ(-${Math.min(12, tearProgress * 0.16)}deg) translateY(-${Math.min(8, tearProgress * 0.12)}px)`,
                        background: `linear-gradient(135deg, #e2e8f0 0%, #94a3b8 40%, #64748b 100%)`,
                        borderBottom: '2px solid #ffffff',
                      }}
                    >
                      {/* Crinkled Foil Sheen Highlight */}
                      <div
                        className="w-full h-full opacity-60"
                        style={{
                          backgroundImage: `radial-gradient(ellipse at 50% 50%, #ffffff 0%, transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 2px, transparent 2px, transparent 4px)`,
                        }}
                      />
                    </div>

                    {/* Revealed interior card edges under the severed foil */}
                    <div
                      className="absolute top-1 left-2 h-10 bg-slate-900 border border-cyan-400/60 rounded-t-lg shadow-inner z-10 pointer-events-none overflow-hidden"
                      style={{ width: `${Math.min(95, tearProgress)}%` }}
                    >
                      <div className="w-full h-full bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 flex items-center px-2">
                        <span className="text-[8px] font-mono text-cyan-300 font-bold tracking-widest uppercase opacity-80">
                          ✦ CARD STACK INSIDE ✦
                        </span>
                      </div>
                    </div>

                    {/* Friction Tear Point Flash Spark */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -ml-2.5 z-40 pointer-events-none"
                      style={{ left: `${tearProgress}%` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_18px_#00f2ff] animate-ping" />
                      <div className="absolute inset-0 w-5 h-5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pack Front Art & Crest */}
            <div className="relative z-10 my-auto text-center flex flex-col items-center pointer-events-none">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-3 border shadow-2xl backdrop-blur-md"
                style={{
                  backgroundColor: `${selectedPack.themeColor}33`,
                  borderColor: selectedPack.themeColor,
                  boxShadow: `0 0 35px ${selectedPack.themeColor}88`,
                }}
              >
                <AbyssalSigil className="w-14 h-14" glow={true} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {selectedPack.name}
              </h3>
              <p className="text-xs text-cyan-300 font-display tracking-widest mt-1 uppercase font-semibold">
                {selectedPack.nameEn}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-sm">
                  內含 {currentPulledCards.length} 張卡牌
                </span>
                {featuredCard && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 font-mono">
                    ★ {featuredCard.name}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Metallic Crimp with Holographic Security Holostamp */}
            <div
              className="relative z-10 w-full h-8 border-t border-white/20 flex items-center justify-between px-3 shadow-md pointer-events-none"
              style={{
                background: `repeating-linear-gradient(90deg, #1e293b, #1e293b 3px, #475569 3px, #475569 6px, #0f172a 6px, #0f172a 9px)`,
              }}
            >
              <span className="text-[8px] font-mono text-slate-400">
                SERIES: {selectedPack.seriesId.toUpperCase()}
              </span>
              <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-tr from-amber-400 via-cyan-300 to-purple-400 border border-white/60 shadow-sm flex items-center justify-center">
                <span className="text-[6px] text-slate-950 font-black">✦</span>
              </div>
            </div>
          </div>

          {/* Natural Gesture Cue */}
          <div className="mt-5 flex items-center gap-2 text-xs font-mono text-cyan-300/90 bg-slate-950/80 px-4 py-2 rounded-full border border-cyan-500/30 shadow-lg">
            <Hand className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>按住頂端金屬撕口向右滑動，親手撕開卡包！</span>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: INTERACTIVE PULL CARDS UPWARD (親自向上抽出卡牌)
          ======================================================== */}
      {stage === 'pull_cards' && (
        <div className="flex flex-col items-center justify-center animate-in fade-in duration-300 select-none">
          <div
            className="relative w-[310px] sm:w-[350px] h-[460px] sm:h-[500px] rounded-b-2xl p-6 flex flex-col justify-end items-center shadow-2xl overflow-visible border-b-2 border-x-2"
            style={{
              background: `linear-gradient(135deg, #070d1e 0%, #030611 100%)`,
              borderColor: selectedPack.themeColor,
              boxShadow: `0 0 50px ${selectedPack.themeColor}44`,
            }}
          >
            {/* Cards peeking out from the opened foil top */}
            <div
              ref={cardsStackRef}
              onMouseDown={(e) => handlePullStart(e.clientY)}
              onTouchStart={(e) => handlePullStart(e.touches[0].clientY)}
              onClick={finishPullCards}
              className="absolute left-1/2 -translate-x-1/2 w-[240px] h-[336px] rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(0,242,255,0.7)] cursor-grab active:cursor-grabbing flex flex-col items-center justify-start pt-3 transition-transform duration-75 overflow-hidden"
              style={{
                top: `calc(-70px - ${pullProgress * 1.6}px)`,
                zIndex: 20,
                background: '#030712',
              }}
            >
              {/* Authentic Card Back SVG Illustration */}
              <div
                className="absolute inset-0 pointer-events-none opacity-90"
                dangerouslySetInnerHTML={{ __html: cardBackSvg }}
              />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-950/90 to-transparent pointer-events-none" />

              {/* Card Foil Top Edge & Glow */}
              <div className="relative z-10 w-full flex items-center justify-center gap-2 mb-1">
                <AbyssalSigil className="w-4 h-4" />
                <span className="text-xs font-black text-amber-200 tracking-wider font-mono drop-shadow">
                  ★ PULL TO DRAW ★
                </span>
                <AbyssalSigil className="w-4 h-4" />
              </div>
              <ArrowUp className="relative z-10 w-7 h-7 text-cyan-300 animate-bounce mt-1 drop-shadow" />
              <span className="relative z-10 text-[11px] font-black text-cyan-200 tracking-widest uppercase drop-shadow">
                向上抽出卡牌
              </span>
            </div>

            {/* Energy Light Rays Bursting from Foil Opening */}
            <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-t from-transparent via-cyan-400/40 to-transparent blur-md pointer-events-none" />

            {/* Pack Front Info */}
            <div className="text-center z-10">
              <h3 className="text-xl font-sans font-extrabold text-white">{selectedPack.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">封口已完全撕開！</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6 flex items-center gap-1.5 animate-pulse">
            <ArrowUp className="w-4 h-4 text-cyan-400" />
            <span>按住卡牌向上抽出，或點擊卡疊直接展開！</span>
          </p>
        </div>
      )}

      {/* ========================================================
          STAGE 2.5: SUMMONING RITUAL CUTSCENE (天象召喚法陣與稀有度光柱)
          ======================================================== */}
      {stage === 'summon_ritual' && (
        <div
          ref={ritualContainerRef}
          onClick={triggerRitualErupt}
          className="relative w-full max-w-4xl min-h-[75vh] flex flex-col items-center justify-center p-6 cursor-pointer select-none overflow-hidden animate-in fade-in duration-500"
        >
          {/* Cosmic Radial Glow Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-85 transition-opacity duration-700"
            style={{ background: ritualTheme.bgRadial }}
          />

          {/* Electric Lightning Flashes (For EX and UR) */}
          {(highestRarity === 'EX' || highestRarity === 'UR') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/3 w-72 h-1 bg-cyan-300/40 blur-xs rotate-45 animate-ping" />
              <div className="absolute bottom-1/3 right-1/4 w-80 h-1 bg-fuchsia-400/40 blur-xs -rotate-30 animate-pulse" />
            </div>
          )}

          {/* Towering Light Pillar (天柱光芒) */}
          <div className="relative flex flex-col items-center justify-center">
            {/* The Vertical Celestial Beam */}
            <div
              className={`absolute -top-96 -bottom-96 w-24 sm:w-36 bg-gradient-to-t ${ritualTheme.gradient} opacity-75 blur-xl transition-all duration-500 ${
                ritualPhase === 'erupting' ? 'w-full opacity-100 scale-150' : 'animate-pulse'
              }`}
            />
            <div
              className={`absolute -top-96 -bottom-96 w-8 sm:w-14 bg-white/90 blur-sm transition-all duration-300 ${
                ritualPhase === 'erupting' ? 'w-64 opacity-100 scale-125' : ''
              }`}
            />

            {/* Sacred Multi-Ring Rotating Summoning Circle (SVG) */}
            <div
              ref={ritualSigilRef}
              className={`relative z-10 w-64 h-64 sm:w-84 sm:h-84 flex items-center justify-center rounded-full p-2 transition-transform duration-300 ${
                ritualPhase === 'erupting' ? 'scale-125' : ''
              }`}
              style={{
                boxShadow: ritualTheme.pillarGlow,
              }}
            >
              {/* Outer Counter-Clockwise Glyphs Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-60 animate-[spin_12s_linear_infinite]"
                style={{ borderColor: ritualTheme.glow }}
              />

              {/* Middle Clockwise Star Ring */}
              <div
                className="absolute inset-4 rounded-full border border-double opacity-70 animate-[spin_8s_linear_infinite_reverse]"
                style={{ borderColor: ritualTheme.glow }}
              />

              {/* Central Core Energy Sphere */}
              <div
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center backdrop-blur-md border shadow-2xl transition-all duration-300 ${
                  ritualPhase === 'erupting' ? 'scale-150 bg-white' : 'scale-100'
                }`}
                style={{
                  backgroundColor: `${ritualTheme.glow}33`,
                  borderColor: ritualTheme.glow,
                }}
              >
                <AbyssalSigil className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse" glow={true} />
              </div>
            </div>

            {/* Ominous Rarity Vision Badge */}
            <div className="relative z-20 mt-8 flex flex-col items-center text-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-hud font-bold tracking-widest uppercase mb-2 shadow-lg backdrop-blur-md ${ritualTheme.borderColor} bg-slate-950/80 text-white`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ color: ritualTheme.glow }} />
                <span>{ritualTheme.badge}</span>
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ color: ritualTheme.glow }} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-wider drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                {ritualTheme.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 drop-shadow">
                {ritualTheme.desc}
              </p>

              {/* Tap to blast hint */}
              <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-cyan-300 shadow-md animate-pulse">
                <span>✦ 點擊任意處注入魔力加速爆發 ✦</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: CARDS SPREAD FACE DOWN ON TABLE (點擊逐張翻牌)
          ======================================================== */}
      {stage === 'reveal_cards' && (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-white tracking-wide">
              點擊卡牌逐張翻開
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              已翻開 {revealedIndices.size} / {currentPulledCards.length} 張 · 邊框微光暗示稀有度 · 3D 自由拖曳翻面
            </p>
          </div>

          {/* Face Down Cards Grid with GSAP Stagger Entrance */}
          <div
            ref={cardsGridRef}
            className={`grid gap-4 sm:gap-6 justify-items-center ${
              currentPulledCards.length === 1
                ? 'grid-cols-1 max-w-[280px] mx-auto'
                : currentPulledCards.length === 5
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
            }`}
          >
            {currentPulledCards.map((pulled, idx) => {
              const isRevealed = revealedIndices.has(idx);

              return (
                <div
                  key={`${pulled.card.id}-${idx}`}
                  className="flex flex-col items-center transition-all duration-300 group relative"
                >
                  {/* Anticipation Glow behind unrevealed high-rarity cards */}
                  {!isRevealed && (
                    <div
                      className={`absolute -inset-1.5 rounded-2xl pointer-events-none transition-all duration-500 ${
                        pulled.card.rarity === 'EX'
                          ? 'shadow-[0_0_35px_rgba(217,70,239,0.85),0_0_18px_rgba(0,242,255,0.9)] border-2 border-cyan-400/80 animate-pulse'
                          : pulled.card.rarity === 'UR'
                          ? 'shadow-[0_0_28px_rgba(244,63,94,0.7),0_0_14px_rgba(251,191,36,0.8)] border border-rose-400/70 animate-pulse'
                          : pulled.card.rarity === 'SSR'
                          ? 'shadow-[0_0_22px_rgba(251,191,36,0.7)] border border-amber-400/60'
                          : pulled.card.rarity === 'SR'
                          ? 'shadow-[0_0_15px_rgba(168,85,247,0.55)] border border-purple-400/40'
                          : ''
                      }`}
                    />
                  )}

                  <Card3D
                    card={pulled.card}
                    variant={pulled.variant}
                    size={currentPulledCards.length === 1 ? 'lg' : 'md'}
                    isFlipped={!isRevealed}
                    onFlip={() => handleRevealCard(idx)}
                    interactive={true}
                  />

                  {!isRevealed ? (
                    <span className="mt-2 text-[11px] font-bold text-cyan-400 tracking-wider animate-pulse flex items-center gap-1.5">
                      <AbyssalSigil className="w-3.5 h-3.5" />
                      <span>[滑動或點擊翻面揭曉]</span>
                    </span>
                  ) : (
                    <span className="mt-2 text-[10px] font-mono text-slate-400">
                      ★ {pulled.card.rarity} · {pulled.variant}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Jump to Results if all revealed */}
          {revealedIndices.size === currentPulledCards.length && (
            <div className="mt-8 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
              <button
                onClick={() => {
                  audio.playClick?.();
                  setStage('results');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm transition-all shadow-[0_0_25px_rgba(0,242,255,0.5)] scale-105 active:scale-100"
              >
                <CheckCircle className="w-4 h-4" />
                <span>查看完整抽卡結算結果</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXCLUSIVE EX RARITY FULLSCREEN ANIMATION MODAL */}
      {activeExModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl"
          onClick={() => setActiveExModal(null)}
        >
          {/* Deep Ocean Vortex Animation Background */}
          <div className="absolute inset-0 bg-radial from-cyan-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />
          <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-purple-900/30 to-transparent blur-3xl animate-pulse" />

          <div
            ref={exModalRef}
            className="relative z-10 flex flex-col items-center max-w-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-hud font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(0,242,255,0.6)] animate-bounce">
              <AbyssalSigil className="w-4 h-4" glow={true} />
              <span>★ EX神格降臨！太古深淵震顫 ★</span>
            </div>

            <div className="my-4 transform scale-110 sm:scale-125">
              <Card3D
                card={activeExModal.card}
                variant={activeExModal.variant}
                size="lg"
                interactive={true}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white mt-4 tracking-wide drop-shadow-[0_0_15px_rgba(0,242,255,0.8)]">
              {activeExModal.card.name}
            </h2>
            <p className="text-sm font-serif text-cyan-200 mt-2 px-4 leading-relaxed">
              {activeExModal.card.flavorText}
            </p>

            <button
              onClick={() => setActiveExModal(null)}
              className="mt-6 px-8 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold tracking-wider transition-colors shadow-lg"
            >
              點擊繼續
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Radial Screen Flash on High-Rarity Reveal */}
      {screenFlash && (
        <div
          className={`fixed inset-0 z-40 pointer-events-none bg-gradient-to-b ${screenFlash.color} animate-out fade-out duration-500`}
        />
      )}

      {/* Celebration High Rarity Reveal Toast */}
      {revealToast && (
        <div
          className={`fixed top-20 z-45 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ${revealToast.color}`}
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-sm font-black tracking-wide font-mono">
            {revealToast.text}
          </span>
        </div>
      )}
    </div>
  );
};
