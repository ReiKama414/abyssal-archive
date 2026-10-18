'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '@/lib/store';
import { Card3D } from './Card3D';
import { CardDefinition, CardVariant } from '@/types';
import { Heart, X, Layers, ZoomIn, ZoomOut, Lock, ArrowRight } from 'lucide-react';
import { CARD_PACKS } from '@/data/packs';
import { audio } from '@/lib/audio';

interface CardModalContentProps {
  card: CardDefinition;
  initialVariant: CardVariant;
  onClose: () => void;
}

const CardModalContent: React.FC<CardModalContentProps> = ({
  card,
  initialVariant,
  onClose,
}) => {
  const { collection, toggleFavorite } = useAppStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<CardVariant>(initialVariant);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  // Find all variants of this card owned by user
  const ownedVariants = collection.filter((item) => item.cardId === card.id);
  const isOwned = ownedVariants.length > 0;
  const currentItem = ownedVariants.find((item) => item.variant === selectedVariant);
  const isFavorite = currentItem?.isFavorite ?? false;

  // Matching booster pack for this card
  const targetPack = CARD_PACKS.find((p) => p.seriesId === card.series) || CARD_PACKS[0];

  const handleToggleFav = async () => {
    if (!isOwned) return;
    audio.playClick?.();
    await toggleFavorite(card.id, selectedVariant);
  };

  const handleFlip = () => {
    audio.playCardFlip?.();
    setIsFlipped(!isFlipped);
  };

  const handleZoom = (delta: number) => {
    audio.playClick?.();
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.5, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background glow tailored to card palette */}
      <div
        className="absolute -inset-10 opacity-25 blur-3xl pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle, ${card.palette.glow} 0%, ${card.palette.primary} 50%, transparent 80%)`,
        }}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-lg"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Inspection Modal Content */}
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
      >
        {/* Left Side: 3D Interactive Card Showcase */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-[380px] sm:min-h-[460px] bg-slate-950/60 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Card Viewer with Zoom */}
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <Card3D
              card={card}
              variant={isOwned ? selectedVariant : 'Normal'}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              size="lg"
              interactive={true}
              isLocked={!isOwned}
            />
          </div>

          {/* Tactile Gesture Guidance & Minimal Utilities */}
          <div className="mt-5 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-full px-4 py-2 shadow-xl backdrop-blur-md">
            <span className="text-xs text-cyan-300 font-mono flex items-center gap-1.5 px-1">
              <span>✦ 手動拖曳旋轉 / 翻面</span>
            </span>
            <div className="w-[1px] h-4 bg-slate-700" />
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="放大視角"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="縮小視角"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {isOwned && (
              <>
                <div className="w-[1px] h-4 bg-slate-700" />
                <button
                  onClick={handleToggleFav}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                    isFavorite ? 'text-rose-400 bg-rose-950/40' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                  <span>{isFavorite ? '已收藏' : '加最愛'}</span>
                </button>
              </>
            )}
          </div>
          <span className="text-[11px] text-cyan-300/80 mt-2 font-mono tracking-wide">
            提示：手指或滑鼠按住卡牌任意拖曳，即可 3D 自由旋轉與翻面 · 雙擊快速翻轉
          </span>
        </div>

        {/* Right Side: Detailed Card Lore & Variant Selector */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-[85vh]">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-hud font-bold tracking-wider uppercase border"
                  style={{
                    backgroundColor: `${card.palette.primary}40`,
                    borderColor: card.palette.accent,
                    color: card.palette.glow,
                  }}
                >
                  {card.rarity}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  {card.element}
                </span>
                <span className="text-xs text-slate-500 font-mono">#{card.id}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-wide flex items-center gap-2">
                {!isOwned && <Lock className="w-5 h-5 text-amber-400 shrink-0" />}
                <span>{card.name}</span>
              </h2>
              <p className="text-sm text-slate-400 font-display tracking-wide">{card.nameEn}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">戰力評價</span>
              <p className="text-2xl font-black font-mono text-cyan-400">
                {isOwned ? `★ ${card.powerRating}` : '★ ???'}
              </p>
            </div>
          </div>

          {/* Owned Variant Switcher OR Unowned Locked Guidance Banner */}
          <div className="mt-5">
            {isOwned ? (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>持有閃卡變體 ({ownedVariants.length} 款)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ownedVariants.map((v) => (
                    <button
                      key={v.variant}
                      onClick={() => {
                        audio.playClick?.();
                        setSelectedVariant(v.variant);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedVariant === v.variant
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {v.variant} {v.count > 0 ? `(x${v.count})` : ''}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Dedicated Lock & Seal Banner for Unowned Cards */
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-amber-500/50 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">尚未解鎖此卡牌立繪與檔案</h3>
                    <p className="text-[11px] text-slate-400">深淵封印保護中 · 抽取卡包揭曉真容</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  這張卡牌尚未被召喚至您的收藏庫中。前往對應卡包抽取獲得後，將永久解鎖精美全彩插畫、7 款 3D 全息變體 Shader 特效、戰力數值與完整角色背景檔案！
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="text-cyan-400">所屬卡包：</span>
                    <span className="font-bold text-white">{targetPack.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      audio.playClick?.();
                      onClose();
                      useAppStore.getState().setSelectedPack(targetPack);
                      useAppStore.getState().setCurrentView('packs');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center justify-center gap-2 group shrink-0"
                  >
                    <span>前往抽取卡包</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Description & Lore */}
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                卡牌描述
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                {isOwned
                  ? card.description
                  : '【深淵封存卷軸】此卡牌檔案被深海高階術式封印。召喚此卡牌締結契約後，此處將完整解讀其古老起源、能力屬性與世界觀秘密。'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                典藏銘文
              </h4>
              <blockquote className="text-sm font-serif text-cyan-200/90 border-l-2 border-cyan-400/80 pl-3.5 py-1 leading-relaxed">
                {isOwned
                  ? card.flavorText
                  : '深淵沈默無聲，唯有命定召喚之時方可聆聽其低語……'}
              </blockquote>
            </div>
          </div>

          {/* Card Metadata Grid */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-500 block">所屬系列</span>
              <span className="font-semibold text-slate-200 truncate block mt-0.5">
                {card.series}
              </span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-500 block">繪師插畫</span>
              <span className="font-semibold text-slate-200 truncate block mt-0.5">
                {isOwned ? card.artist : '🔒 召喚解鎖後揭曉'}
              </span>
            </div>
            {currentItem && (
              <>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">初次獲得日期</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">
                    {new Date(currentItem.firstAcquiredAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">最近獲得日期</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">
                    {new Date(currentItem.lastAcquiredAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-slate-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardModal: React.FC = () => {
  const { inspectedCard, setInspectedCard } = useAppStore();

  if (!inspectedCard) return null;

  return (
    <CardModalContent
      key={`${inspectedCard.card.id}-${inspectedCard.variant}`}
      card={inspectedCard.card}
      initialVariant={inspectedCard.variant}
      onClose={() => {
        audio.playClick?.();
        setInspectedCard(null);
      }}
    />
  );
};
