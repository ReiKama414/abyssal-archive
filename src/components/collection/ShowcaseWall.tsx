'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, CARDS_MAP } from '@/lib/store';
import { Card3D } from '@/components/card/Card3D';
import { CardVariant } from '@/types';
import { Trophy, ArrowLeft, Check, Plus, Lock, Sparkles, Store } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';

export const ShowcaseWall: React.FC = () => {
  const { userState, collection, updateShowcase, setCurrentView, setInspectedCard } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);

  // Set of all unique card IDs the player actually owns
  const ownedCardIds = useMemo(() => Array.from(new Set(collection.map((c) => c.cardId))), [collection]);
  const ownedSet = useMemo(() => new Set(ownedCardIds), [ownedCardIds]);

  // STRICT OWNERSHIP RULE: Only cards that the user ACTUALLY owns in their collection can ever be showcased!
  const validShowcaseIds = useMemo(() => {
    return (userState?.showcaseCardIds || []).filter((id) => ownedSet.has(id));
  }, [userState?.showcaseCardIds, ownedSet]);

  const [selectedIds, setSelectedIds] = useState<string[]>(validShowcaseIds);

  // Automatically sanitize any stale unowned IDs in persistent storage
  useEffect(() => {
    if (userState?.showcaseCardIds && userState.showcaseCardIds.length > 0) {
      const sanitized = userState.showcaseCardIds.filter((id) => ownedSet.has(id));
      if (sanitized.length !== userState.showcaseCardIds.length) {
        updateShowcase(sanitized);
      }
    }
  }, [userState?.showcaseCardIds, ownedSet, updateShowcase]);

  const handleSave = async () => {
    audio.playClick?.();
    await updateShowcase(selectedIds);
    setIsEditing(false);
  };

  const toggleSelectCard = (id: string) => {
    audio.playClick?.();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        // Shift out first, push new
        setSelectedIds([...selectedIds.slice(1), id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  // Find highest owned variant for a given card
  const getCardDisplayVariant = (cardId: string): CardVariant => {
    const items = collection.filter((c) => c.cardId === cardId);
    if (items.length === 0) return 'Normal';
    // Priority order of variants
    const priority: CardVariant[] = [
      'Prismatic Signature',
      'Abyss Edition',
      'Living Card',
      'Royal Gold',
      'Holographic',
      'Silver Foil',
      'Normal',
    ];
    for (const v of priority) {
      if (items.some((i) => i.variant === v)) return v;
    }
    return items[0].variant;
  };

  const hasAnyCards = ownedCardIds.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 z-10 relative select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <button
            onClick={() => {
              audio.playClick?.();
              setCurrentView('collection');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回圖鑑</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white flex items-center gap-3 tracking-wide">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>自訂 3D 典藏展廳</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            挑選你親自解鎖獲得的 5 張珍稀卡牌，在深海神殿展台上專屬陳列
          </p>
        </div>

        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedIds(validShowcaseIds);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>儲存展示牆 ({selectedIds.length}/5)</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!hasAnyCards) {
                  audio.playClick?.();
                  setCurrentView('packs');
                  return;
                }
                audio.playClick?.();
                setSelectedIds(validShowcaseIds);
                setIsEditing(true);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-lg ${
                hasAnyCards
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400'
              }`}
            >
              {hasAnyCards ? (
                <>
                  <AbyssalSigil className="w-4 h-4" />
                  <span>編輯展示卡牌 ({validShowcaseIds.length}/5)</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>前往卡包商店抽卡</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode: Selection Grid */}
      {isEditing ? (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 mb-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                選擇你要陳列的卡牌（已選：{selectedIds.length} / 5）
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                僅能挑選你已獲得的卡牌，點擊卡牌即可加入或移除展位
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-rose-400 underline transition-colors"
              >
                全部清空
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {ownedCardIds.map((cardId) => {
              const card = CARDS_MAP.get(cardId);
              if (!card) return null;
              const isSelected = selectedIds.includes(card.id);
              const variant = getCardDisplayVariant(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => toggleSelectCard(card.id)}
                  className={`relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.4)] scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                      ✓
                    </div>
                  )}
                  <div className="w-[120px] h-[168px] my-1">
                    <Card3D card={card} variant={variant} size="sm" interactive={false} isLocked={false} />
                  </div>
                  <span className="text-xs font-bold text-white mt-1 truncate max-w-[120px]">
                    {card.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    [{card.rarity}] ★{card.powerRating}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : !hasAnyCards ? (
        /* Empty State: User hasn't unlocked any cards yet */
        <div className="py-20 px-6 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 text-cyan-400 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
            <Lock className="w-9 h-9 text-cyan-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-white">3D 展廳尚未解鎖任何卡牌</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
            3D 展廳為專屬個人收藏展示空間。只有在卡包中實際抽中的卡牌才能在此陳列展示，目前圖鑑尚無任何收藏。
          </p>
          <button
            onClick={() => {
              audio.playClick?.();
              setCurrentView('packs');
            }}
            className="mt-6 flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all scale-105 active:scale-100"
          >
            <Sparkles className="w-4 h-4" />
            <span>前往卡包商店 · 抽取首包卡牌</span>
          </button>
        </div>
      ) : (
        /* Showcase Presentation Stage: 5 Designated Pedestals */
        <div className="relative py-12 px-4 rounded-3xl bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950/90 border border-slate-800/80 shadow-2xl flex flex-wrap items-center justify-center gap-6 sm:gap-10 overflow-hidden">
          {/* Subtle Ambient Spotlight Beams */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

          {/* 5 Spotlight Pedestals */}
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const cardId = validShowcaseIds[slotIdx];
            const card = cardId ? CARDS_MAP.get(cardId) : null;
            const variant = card ? getCardDisplayVariant(card.id) : 'Normal';

            if (card) {
              return (
                <div
                  key={card.id}
                  className="flex flex-col items-center animate-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${slotIdx * 80}ms` }}
                >
                  {/* Pedestal Top Spotlight Badge */}
                  <div className="mb-2 px-3 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold shadow-md">
                    SPOTLIGHT #{slotIdx + 1}
                  </div>

                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <Card3D
                      card={card}
                      variant={variant}
                      size="lg"
                      interactive={true}
                      isLocked={false}
                      onClick={() => {
                        audio.playClick?.();
                        setInspectedCard({ card, variant });
                      }}
                    />
                  </div>

                  {/* Pedestal Base Glow */}
                  <div
                    className="w-40 h-3 rounded-full blur-[1px] mt-2 shadow-lg"
                    style={{
                      background: `radial-gradient(ellipse at center, ${card.palette.glow}66 0%, transparent 80%)`,
                    }}
                  />
                  <h4 className="text-sm font-bold text-white mt-1">{card.name}</h4>
                  <p className="text-[10px] text-cyan-300/80 font-mono">
                    ★ {card.rarity} · {variant}
                  </p>
                </div>
              );
            }

            {/* Empty Stand Placeholder for unassigned slots */}
            return (
              <div
                key={`empty-slot-${slotIdx}`}
                onClick={() => {
                  audio.playClick?.();
                  setSelectedIds(validShowcaseIds);
                  setIsEditing(true);
                }}
                className="flex flex-col items-center group cursor-pointer animate-in fade-in duration-500"
                style={{ animationDelay: `${slotIdx * 80}ms` }}
              >
                <div className="mb-2 px-3 py-0.5 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-500 font-mono font-bold">
                  STAND #{slotIdx + 1}
                </div>

                {/* Empty Stand Frame matching standard card size */}
                <div className="w-[260px] h-[364px] rounded-2xl border-2 border-dashed border-slate-700/70 group-hover:border-cyan-400/80 bg-slate-950/40 group-hover:bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:scale-105 shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-slate-900/90 border border-slate-700 group-hover:border-cyan-400 flex items-center justify-center mb-3 text-slate-500 group-hover:text-cyan-300 transition-colors shadow-lg">
                    <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-200 transition-colors">
                    空展台 #{slotIdx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400/80 font-mono mt-1 transition-colors">
                    點擊選入已獲得卡牌
                  </span>
                </div>

                <div className="w-36 h-2 bg-gradient-to-r from-transparent via-slate-800 to-transparent rounded-full mt-3" />
                <span className="text-xs text-slate-600 font-mono mt-1">待陳列</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
