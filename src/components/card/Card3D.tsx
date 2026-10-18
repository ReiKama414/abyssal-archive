'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { CardDefinition, CardVariant } from '@/types';
import { CardArtView } from './CardArtView';
import { getCardBackSvg } from '@/lib/art/cardArtGenerator';
import { useAppStore } from '@/lib/store';
import { audio } from '@/lib/audio';
import { Lock } from 'lucide-react';

interface Card3DProps {
  card: CardDefinition;
  variant?: CardVariant;
  isFlipped?: boolean;
  onFlip?: () => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showBackOnly?: boolean;
  count?: number;
  isLocked?: boolean;
}

// Collector set code lookup helper
const getCardCollectorCode = (card: CardDefinition) => {
  const seriesMap: Record<string, { code: string; total: number }> = {
    'abyssal-jellyfish': { code: 'ABY', total: 72 },
    'nocturne-fantasy': { code: 'NOC', total: 72 },
    'neon-district': { code: 'NEO', total: 72 },
    'phantom-beasts': { code: 'BST', total: 72 },
    'halloween': { code: 'HLW', total: 14 },
    'christmas': { code: 'XMS', total: 14 },
    'new-year': { code: 'NYR', total: 14 },
    'valentines': { code: 'VAL', total: 14 },
    'sakura-festival': { code: 'SKR', total: 14 },
    'summer-festival': { code: 'SUM', total: 14 },
    'mid-autumn': { code: 'AUT', total: 14 },
    'anniversary': { code: 'ANV', total: 14 },
    'abyss-eclipse': { code: 'ECL', total: 14 },
  };

  const meta = seriesMap[card.series] || { code: 'ARC', total: 72 };
  const parts = card.id.split('-');
  const numPart = parts[parts.length - 1] || '01';
  const num = parseInt(numPart, 10) || 1;
  return `${meta.code}-${String(num).padStart(3, '0')}/${String(meta.total).padStart(3, '0')}`;
};

export const Card3D: React.FC<Card3DProps> = ({
  card,
  variant = 'Normal',
  isFlipped = false,
  onFlip,
  interactive = true,
  size = 'md',
  onClick,
  showBackOnly = false,
  count,
  isLocked = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentFlipped = isFlipped !== undefined ? isFlipped : internalFlipped;
  const targetFlipAngle = currentFlipped || showBackOnly ? 180 : 0;
  const settings = useAppStore((s) => s.settings);

  // Size configurations maintaining standard 2.5 : 3.5 trading card ratio
  const sizeClasses = {
    sm: 'w-[140px] h-[196px] text-xs',
    md: 'w-[200px] h-[280px] text-sm',
    lg: 'w-[260px] h-[364px] text-base',
    xl: 'w-[320px] h-[448px] text-lg',
  }[size];

  // GSAP 3D Flip Animation when flip state changes
  useEffect(() => {
    if (!cardRef.current) return;
    const targetY = currentFlipped || showBackOnly ? 180 : 0;
    
    if (settings.reducedMotion) {
      gsap.set(cardRef.current, { rotateY: targetY });
      return;
    }

    gsap.timeline({ overwrite: 'auto' })
      .to(cardRef.current, {
        scale: 1.08,
        duration: 0.2,
        ease: 'power2.out',
      })
      .to(cardRef.current, {
        rotateY: targetY,
        scale: 1,
        duration: 0.45,
        ease: 'back.out(1.15)',
      });
  }, [currentFlipped, showBackOnly, settings.reducedMotion]);

  // Drag and physical 3D gesture states
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const startAngleYRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityXRef = useRef(0);

  // Pointer Down: grab card & begin 3D tracking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    startAngleYRef.current = currentFlipped || showBackOnly ? 180 : 0;
    hasDraggedRef.current = false;
    lastXRef.current = e.clientX;
    lastTimeRef.current = e.timeStamp;
    velocityXRef.current = 0;
    setIsHovered(true);
    if (!gyroActive) {
      requestGyro();
    }
    audio.playHover?.();
  };

  // Pointer Move: 3D drag rotation + hover parallax tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current || settings.reducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update dynamic gloss light reflection coordinates
    if (glossRef.current) {
      const glossX = (x / rect.width) * 100;
      const glossY = (y / rect.height) * 100;
      glossRef.current.style.setProperty('--gloss-x', `${glossX}%`);
      glossRef.current.style.setProperty('--gloss-y', `${glossY}%`);
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      const deltaY = e.clientY - dragStartYRef.current;

      if (Math.hypot(deltaX, deltaY) > 5) {
        hasDraggedRef.current = true;
      }

      const now = e.timeStamp;
      const dt = Math.max(1, now - lastTimeRef.current);
      velocityXRef.current = (e.clientX - lastXRef.current) / dt;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;

      // Realtime full 3D rotation tracking finger/mouse
      const currentY = startAngleYRef.current + deltaX * 0.75;
      const currentX = Math.max(-35, Math.min(35, -deltaY * 0.35));

      gsap.to(cardRef.current, {
        rotateY: currentY,
        rotateX: currentX,
        scale: 1.06,
        duration: 0.08,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    } else {
      // Subtle idle hover parallax tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxTilt = 15;
      const rX = -((y - centerY) / centerY) * maxTilt;
      const rY = ((x - centerX) / centerX) * maxTilt;

      gsap.to(cardRef.current, {
        rotateX: rX,
        rotateY: targetFlipAngle + rY,
        scale: 1.03,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  // Pointer Up: calculate momentum, snap or flip to nearest face
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasDragging = isDraggingRef.current;
    const didDrag = hasDraggedRef.current;
    isDraggingRef.current = false;

    if (wasDragging && didDrag) {
      const deltaX = e.clientX - dragStartXRef.current;
      const vX = velocityXRef.current;
      let targetY = targetFlipAngle;

      if (startAngleYRef.current === 0) {
        // Front face: dragging sideways flips to back
        if (deltaX > 45 || deltaX < -45 || Math.abs(vX) > 0.3) {
          targetY = 180;
          if (onFlip) onFlip();
          else setInternalFlipped(true);
          audio.playCardFlip?.();
        } else {
          targetY = 0;
        }
      } else {
        // Back face: dragging sideways flips to front
        if (deltaX > 45 || deltaX < -45 || Math.abs(vX) > 0.3) {
          targetY = 0;
          if (onFlip) onFlip();
          else setInternalFlipped(false);
          audio.playCardFlip?.();
        } else {
          targetY = 180;
        }
      }

      gsap.to(cardRef.current, {
        rotateY: targetY,
        rotateX: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.2)',
        overwrite: 'auto',
      });
      return;
    }

    // Single click / tap without drag
    if (onClick) {
      onClick();
    } else if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
      audio.playCardFlip?.();
    }
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotateY: targetFlipAngle,
        rotateX: 0,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleDoubleClick = () => {
    if (!interactive || !cardRef.current) return;
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
      audio.playCardFlip?.();
    }
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
    audio.playHover?.();
  };

  const handleMouseLeave = () => {
    if (!interactive || !cardRef.current || isDraggingRef.current) return;
    setIsHovered(false);
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: targetFlipAngle,
      scale: 1,
      duration: 0.65,
      ease: 'elastic.out(1, 0.65)',
      overwrite: 'auto',
    });
  };

  // Gyroscope / DeviceOrientation handler for mobile tilt
  useEffect(() => {
    if (!interactive || !gyroActive || settings.reducedMotion || !cardRef.current) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null || !cardRef.current || isDraggingRef.current) return;
      const rY = Math.max(-20, Math.min(20, e.gamma * 0.7));
      const rX = Math.max(-20, Math.min(20, (e.beta - 45) * 0.5));

      gsap.to(cardRef.current, {
        rotateX: rX,
        rotateY: targetFlipAngle + rY,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactive, gyroActive, settings.reducedMotion, targetFlipAngle]);

  const requestGyro = async () => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      const DeviceOrientationEventAny = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEventAny.requestPermission();
          if (perm === 'granted') setGyroActive(true);
        } catch {}
      } else {
        setGyroActive(true);
      }
    }
  };

  const cardBackSvg = useMemo(() => getCardBackSvg(), []);
  const serialCode = useMemo(() => getCardCollectorCode(card), [card]);

  // Rarity Colors & Badges
  const rarityConfig = {
    N: { label: 'N', bg: 'bg-zinc-800 text-zinc-300 border-zinc-600', glow: 'shadow-zinc-700/20', symbol: '◆' },
    R: { label: 'R', bg: 'bg-cyan-950 text-cyan-300 border-cyan-500', glow: 'shadow-cyan-500/30', symbol: '◆' },
    SR: { label: 'SR', bg: 'bg-purple-950 text-purple-300 border-purple-500', glow: 'shadow-purple-500/40', symbol: '◆◆' },
    SSR: { label: 'SSR', bg: 'bg-amber-950 text-amber-300 border-amber-400', glow: 'shadow-amber-400/50', symbol: '★ SSR' },
    UR: { label: 'UR', bg: 'bg-rose-950 text-rose-300 border-rose-400', glow: 'shadow-rose-500/60', symbol: '★ UR' },
    EX: { label: 'EX', bg: 'bg-gradient-to-r from-cyan-900 via-purple-900 to-rose-900 text-white border-cyan-300', glow: 'shadow-cyan-400/80 animate-pulse', symbol: '✦ EX' },
  }[card.rarity];

  // Foil variant overlay styles
  const isHolo = variant === 'Holographic' || variant === 'Prismatic Signature';
  const isGold = variant === 'Royal Gold';
  const isSilver = variant === 'Silver Foil';
  const isLiving = variant === 'Living Card';
  const isAbyss = variant === 'Abyss Edition';
  const isPrismatic = variant === 'Prismatic Signature';

  return (
    <div
      className={`relative inline-block select-none ${
        interactive ? 'cursor-grab active:cursor-grabbing touch-none' : ''
      } ${sizeClasses}`}
      style={{ perspective: '1400px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="w-full h-full relative rounded-2xl"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${targetFlipAngle}deg)`,
          boxShadow: isHovered
            ? `0 24px 48px -12px ${card.palette.glow}45, 0 0 24px ${card.palette.accent}35`
            : '0 10px 25px -5px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* =========================================
            CARD FRONT (正面：真實實體卡牌邊框與精密製版)
            ========================================= */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden border-2 bg-slate-950 backface-hidden p-1.5 flex flex-col justify-between ${
            isGold
              ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
              : isAbyss
              ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.6)] animate-pulse'
              : isPrismatic
              ? 'border-purple-300 shadow-[0_0_22px_rgba(216,180,254,0.7)]'
              : 'border-slate-800'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
            background: 'linear-gradient(145deg, #070d1e 0%, #030611 100%)',
          }}
        >
          {/* Inner Metallic Foil Bevel Hairline */}
          <div
            className={`w-full h-full rounded-xl flex flex-col justify-between p-1.5 border relative overflow-hidden ${
              isGold
                ? 'border-amber-400/60'
                : isSilver
                ? 'border-slate-300/60'
                : isAbyss
                ? 'border-cyan-400/60'
                : 'border-cyan-500/25'
            }`}
          >
            {/* 1. TOP CARD HEADER BAR: Name, Element & Rarity */}
            <div
              className="relative z-30 w-full flex items-center justify-between px-2 py-1 bg-slate-950/85 rounded-lg border border-slate-800/80 backdrop-blur-md shadow-sm"
              style={{ transform: 'translateZ(25px)' }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-hud font-bold tracking-wider uppercase border shadow-sm ${rarityConfig.bg}`}
                >
                  {rarityConfig.label}
                </span>
                <span className="font-sans font-bold text-white text-[11px] truncate tracking-wide drop-shadow-sm flex items-center gap-1">
                  {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                  {card.name}
                </span>
              </div>

              {/* Power Orb Badge */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {isLocked ? (
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-700/80 px-1.5 py-0.2 rounded-md shadow-inner">
                    ★ ???
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded-md shadow-inner">
                    ★ {card.powerRating}
                  </span>
                )}
              </div>
            </div>

            {/* 2. CENTER ARTWORK WINDOW (framed with inner shadow and foil sheen) */}
            <div
              className="relative flex-1 my-1 rounded-lg overflow-hidden border border-slate-800/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] bg-slate-950"
              style={{ transform: 'translateZ(15px)' }}
            >
              {isLocked ? (
                /* Pure Mysterious Locked Abyssal Seal: ZERO leaked artwork */
                <div className="w-full h-full relative flex flex-col items-center justify-center p-3 select-none overflow-hidden bg-gradient-to-b from-[#080e1e] via-[#030611] to-[#010206]">
                  {/* Deep Ambient Arcane Radial Lighting */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${card.palette.glow} 0%, transparent 75%)`,
                    }}
                  />

                  {/* Concentric Arcane Containment Rings */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2">
                    <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_25s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-cyan-400/20 rotate-45" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-950/90 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.35)]">
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.7)]" />
                    </div>
                  </div>

                  {/* Locked Seal Text */}
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-cyan-200 drop-shadow">
                    ✦ 尚未解鎖 ✦
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-hud tracking-wider mt-0.5 uppercase">
                    抽取卡包揭曉立繪
                  </span>
                </div>
              ) : (
                <>
                  <CardArtView card={card} isLiving={isLiving} />

                  {/* Foil Shaders Overlay */}
                  {variant !== 'Normal' && (
                    <div
                      ref={glossRef}
                      className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                      style={{
                        opacity: isHovered ? 0.85 : 0.45,
                        background: isHolo || isPrismatic
                          ? `linear-gradient(var(--gloss-angle, 135deg), 
                              transparent 20%, 
                              rgba(255, 0, 128, 0.35) 35%, 
                              rgba(0, 242, 255, 0.45) 50%, 
                              rgba(255, 230, 0, 0.4) 65%, 
                              rgba(138, 43, 226, 0.35) 80%, 
                              transparent 95%)`
                          : isGold
                          ? `radial-gradient(circle at var(--gloss-x, 50%) var(--gloss-y, 50%), rgba(254, 240, 138, 0.6) 0%, rgba(217, 119, 6, 0.3) 50%, transparent 80%)`
                          : isSilver
                          ? `radial-gradient(circle at var(--gloss-x, 50%) var(--gloss-y, 50%), rgba(255, 255, 255, 0.6) 0%, rgba(148, 163, 184, 0.25) 50%, transparent 80%)`
                          : isAbyss
                          ? `radial-gradient(circle at var(--gloss-x, 50%) var(--gloss-y, 50%), rgba(0, 242, 255, 0.6) 0%, rgba(30, 27, 75, 0.4) 60%, transparent 90%)`
                          : 'none',
                        mixBlendMode: isHolo || isPrismatic ? 'color-dodge' : 'screen',
                      }}
                    />
                  )}

                  {/* Dynamic Specular Reflection */}
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background: `radial-gradient(circle at var(--gloss-x, 50%) var(--gloss-y, 50%), rgba(255, 255, 255, ${
                        isHovered ? 0.35 : 0.12
                      }) 0%, transparent 60%)`,
                      mixBlendMode: 'overlay',
                    }}
                  />

                  {/* Variant Tag overlay in top right */}
                  {variant !== 'Normal' && (
                    <div className="absolute top-1.5 right-1.5 z-30 px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[8px] text-amber-200 font-bold tracking-tight shadow-md backdrop-blur-sm">
                      {variant}
                    </div>
                  )}

                  {/* Prismatic Signature Foil Stamp */}
                  {isPrismatic && (
                    <div
                      className="absolute bottom-2 right-2 z-30 pointer-events-none"
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      <div className="font-display text-amber-300 text-[9px] font-bold tracking-widest border border-amber-300/80 px-1.5 py-0.5 rounded rotate-[-10deg] bg-amber-950/70 backdrop-blur-sm shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                        ★ ARCHIVE SIGNATURE ★
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3. BOTTOM TCG RULES & COLLECTOR FOOTER */}
            <div
              className="relative z-30 w-full bg-slate-950/90 rounded-lg p-1.5 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between"
              style={{ transform: 'translateZ(25px)' }}
            >
              {/* English Name & Element Tag */}
              <div className="flex items-center justify-between gap-1 leading-none mb-1">
                <span className="text-[9px] text-slate-300 font-display tracking-wider truncate">
                  {card.nameEn}
                </span>
                <span className="text-[8px] font-hud font-bold text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-500/30 uppercase">
                  {card.element}
                </span>
              </div>

              {/* Micro Collector Code, Artist Credit & Holographic Security Stamp */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-1 text-[7px] font-mono text-slate-400 leading-none">
                {/* Collector Serial Code e.g. [ABY-015/072] */}
                <span className="font-bold text-cyan-300/90">
                  [{serialCode}]
                </span>

                {/* Micro Artist Credit */}
                <span className="text-slate-500 truncate max-w-[80px]">
                  {isLocked
                    ? 'Illus. 🔒 封印中'
                    : `Illus. ${card.artist?.split('//')?.[1]?.trim() || card.artist?.trim() || 'Studio Abyss'}`}
                </span>

                {/* Holographic Security Holostamp (like authentic Pokemon/Yu-Gi-Oh cards) */}
                <div
                  className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-amber-400 via-cyan-300 to-purple-400 border border-white/60 shadow-[0_0_4px_rgba(255,255,255,0.8)] flex items-center justify-center shrink-0"
                  title={isLocked ? '深淵鎖定封印' : 'Official Holographic Security Stamp'}
                >
                  <span className="text-[5px] text-slate-950 font-black">{isLocked ? '🔒' : '✦'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Count Badge (if owned > 1) */}
          {count && count > 1 && (
            <div
              className="absolute top-2.5 right-2.5 z-40 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-400 shadow-lg"
              style={{ transform: 'translateZ(35px)' }}
            >
              x{count}
            </div>
          )}
        </div>

        {/* =========================================
            CARD BACK (背面：深海水母皇家圖章)
            ========================================= */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
          }}
        >
          <div
            className="w-full h-full pointer-events-none"
            dangerouslySetInnerHTML={{ __html: cardBackSvg }}
          />

          {/* Moving sheen on the back when hovering */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--gloss-x, 50%) var(--gloss-y, 50%), rgba(0, 242, 255, 0.25) 0%, transparent 60%)`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>
    </div>
  );
};
