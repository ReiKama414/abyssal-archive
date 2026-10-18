'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '@/lib/store';
import { ALL_CARDS } from '@/data/cards';
import { CardDefinition, CardVariant, Rarity } from '@/types';
import { Card3D } from '@/components/card/Card3D';
import {
  Search,
  Heart,
  Lock,
  Trophy,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';

export const CollectionCompendium: React.FC = () => {
  const {
    collection,
    setInspectedCard,
    setIsHistoryModalOpen,
    setCurrentView,
  } = useAppStore();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'owned' | 'unowned' | 'favorites'>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rarity_desc' | 'rarity_asc' | 'power_desc' | 'count_desc' | 'id'>('rarity_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 36;
  const cardsGridRef = useRef<HTMLDivElement>(null);

  // GSAP: Staggered animation when cards change
  useEffect(() => {
    if (!cardsGridRef.current) return;
    const cards = cardsGridRef.current.children;
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 25, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.015, ease: 'power2.out' }
      );
    }
  }, [currentPage, selectedSeries, selectedRarity, selectedVariant, statusFilter, searchQuery]);

  // Map owned cards by cardId
  const ownedMap = useMemo(() => {
    const map = new Map<string, { totalCount: number; variants: Map<CardVariant, number>; isFavorite: boolean }>();
    collection.forEach((item) => {
      if (!map.has(item.cardId)) {
        map.set(item.cardId, { totalCount: 0, variants: new Map(), isFavorite: false });
      }
      const entry = map.get(item.cardId)!;
      entry.totalCount += item.count;
      entry.variants.set(item.variant, item.count);
      if (item.isFavorite) entry.isFavorite = true;
    });
    return map;
  }, [collection]);

  // Overall & Series Stats
  const totalCardsInGame = ALL_CARDS.length;
  const uniqueCardsOwned = ALL_CARDS.filter((c) => ownedMap.has(c.id)).length;
  const totalDuplicates = collection.reduce((sum, item) => sum + (item.count > 1 ? item.count - 1 : 0), 0);
  const totalVariantHoldings = collection.length;
  const completionPercentage = ((uniqueCardsOwned / totalCardsInGame) * 100).toFixed(1);

  // Highest rarity owned
  const highestRarityOwned = useMemo(() => {
    const ranks: Record<Rarity, number> = { EX: 6, UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
    let highest: Rarity = 'N';
    for (const card of ALL_CARDS) {
      if (ownedMap.has(card.id) && ranks[card.rarity] > ranks[highest]) {
        highest = card.rarity;
      }
    }
    return highest;
  }, [ownedMap]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter((card) => {
      const isOwned = ownedMap.has(card.id);
      const isFav = ownedMap.get(card.id)?.isFavorite ?? false;

      // Status Filter
      if (statusFilter === 'owned' && !isOwned) return false;
      if (statusFilter === 'unowned' && isOwned) return false;
      if (statusFilter === 'favorites' && !isFav) return false;

      // Series Filter
      if (selectedSeries !== 'all' && card.series !== selectedSeries) return false;

      // Rarity Filter
      if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false;

      // Variant Filter
      if (selectedVariant !== 'all') {
        const entry = ownedMap.get(card.id);
        if (!entry || !entry.variants.has(selectedVariant as CardVariant)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesEn = card.nameEn.toLowerCase().includes(q);
        const matchesId = card.id.toLowerCase().includes(q);
        const matchesTag = card.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesEn && !matchesId && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      const ranks: Record<Rarity, number> = { EX: 6, UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
      if (sortBy === 'rarity_desc') return ranks[b.rarity] - ranks[a.rarity];
      if (sortBy === 'rarity_asc') return ranks[a.rarity] - ranks[b.rarity];
      if (sortBy === 'power_desc') return b.powerRating - a.powerRating;
      if (sortBy === 'count_desc') {
        const countA = ownedMap.get(a.id)?.totalCount ?? 0;
        const countB = ownedMap.get(b.id)?.totalCount ?? 0;
        return countB - countA;
      }
      return a.id.localeCompare(b.id);
    });
  }, [searchQuery, statusFilter, selectedSeries, selectedRarity, selectedVariant, sortBy, ownedMap]);

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCards = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCards.slice(start, start + PAGE_SIZE);
  }, [filteredCards, safePage, PAGE_SIZE]);

  const handleCardClick = (card: CardDefinition) => {
    audio.playClick?.();
    const entry = ownedMap.get(card.id);
    const firstVariant = entry ? (Array.from(entry.variants.keys())[0] || 'Normal') : 'Normal';
    setInspectedCard({ card, variant: firstVariant });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 z-10 relative">

      {/* Top Banner: Collection Overview & Stats */}
      <div className="mb-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-hud tracking-[0.16em] text-cyan-400 uppercase font-semibold">
                ARCHIVE COMPENDIUM // 幻藏圖鑑總覽
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white flex items-center gap-3 tracking-wide">
              <span>圖鑑完成度：</span>
              <span className="text-cyan-300 font-mono tabular-nums font-semibold">{completionPercentage}%</span>
            </h2>
            <div className="w-full sm:w-80 h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">已解鎖卡牌</span>
              <span className="text-lg font-black font-mono text-white mt-0.5 block">
                {uniqueCardsOwned} / {totalCardsInGame}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">持有變體數</span>
              <span className="text-lg font-black font-mono text-cyan-300 mt-0.5 block">
                {totalVariantHoldings} 款
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">累積重複卡</span>
              <span className="text-lg font-black font-mono text-indigo-300 mt-0.5 block">
                +{totalDuplicates} 張
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">最高已持有稀有度</span>
              <span className="text-lg font-black font-mono text-amber-400 mt-0.5 block flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{highestRarityOwned}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: 3D Showcase & History */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => {
              audio.playClick?.();
              setCurrentView('showcase');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all shadow-md"
          >
            <AbyssalSigil className="w-4 h-4" />
            <span>自訂 3D 展示牆 (Showcase)</span>
          </button>

          <button
            onClick={() => {
              audio.playClick?.();
              setIsHistoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-md"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>抽卡歷史紀錄</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        {/* Search, Status Tabs & Gallery View Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: '全部卡牌' },
              { id: 'owned', label: `已獲得 (${uniqueCardsOwned})` },
              { id: 'unowned', label: `未解鎖 (${totalCardsInGame - uniqueCardsOwned})` },
              { id: 'favorites', label: '最愛' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  audio.playClick?.();
                  setStatusFilter(tab.id as typeof statusFilter);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Collection Progress Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono shadow-inner">
              <span className="text-cyan-400 font-bold">圖鑑收集率:</span>
              <span className="text-white font-bold">{completionPercentage}%</span>
              <span className="text-slate-500">({uniqueCardsOwned}/{totalCardsInGame})</span>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋名稱、ID、標籤..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60">
          {/* Series Filter */}
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">所有系列</option>
            <option value="abyssal-jellyfish">深海水母 (ABYSSAL JELLYFISH)</option>
            <option value="nocturne-fantasy">夜想魔女 (NOCTURNE FANTASY)</option>
            <option value="neon-district">霓虹特區 (NEON DISTRICT)</option>
            <option value="phantom-beasts">幻獸靈域 (PHANTOM BEASTS)</option>
            <option value="halloween">萬聖節 (HALLOWEEN)</option>
            <option value="christmas">聖誕節 (CHRISTMAS)</option>
            <option value="new-year">新年 (NEW YEAR)</option>
            <option value="valentines">情人節 (VALENTINES)</option>
            <option value="sakura-festival">櫻花祭 (SAKURA)</option>
            <option value="summer-festival">夏日祭 (SUMMER)</option>
            <option value="mid-autumn">中秋節 (MID-AUTUMN)</option>
            <option value="anniversary">周年慶 (ANNIVERSARY)</option>
            <option value="abyss-eclipse">深淵之蝕 (ECLIPSE)</option>
          </select>

          {/* Rarity Filter */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">所有稀有度</option>
            <option value="EX">EX (0.5%)</option>
            <option value="UR">UR (2.5%)</option>
            <option value="SSR">SSR (6.0%)</option>
            <option value="SR">SR (14.0%)</option>
            <option value="R">R (27.0%)</option>
            <option value="N">N (50.0%)</option>
          </select>

          {/* Variant Filter */}
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">所有閃卡變體</option>
            <option value="Normal">普卡 (Normal)</option>
            <option value="Silver Foil">銀箔 (Silver Foil)</option>
            <option value="Holographic">全息彩虹 (Holographic)</option>
            <option value="Royal Gold">純金箔 (Royal Gold)</option>
            <option value="Living Card">動態卡 (Living Card)</option>
            <option value="Abyss Edition">深淵極致 (Abyss Edition)</option>
            <option value="Prismatic Signature">星芒燙金簽名 (Signature)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="rarity_desc">稀有度：由高到低</option>
            <option value="rarity_asc">稀有度：由低到高</option>
            <option value="power_desc">戰力評分：由高到低</option>
            <option value="count_desc">持有數量：由多到少</option>
            <option value="id">卡牌編號排序</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <p className="text-base font-semibold">沒有符合篩選條件的卡牌</p>
          <p className="text-xs mt-1">請嘗試調整搜尋關鍵字或清除篩選條件</p>
        </div>
      ) : (
        <>
          <div
            ref={cardsGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center"
          >
            {paginatedCards.map((card) => {
              const entry = ownedMap.get(card.id);
              const isOwned = !!entry;
              const firstVariant = entry ? (Array.from(entry.variants.keys())[0] || 'Normal') : 'Normal';

              return (
                <div key={card.id} className="flex flex-col items-center group relative">
                  <Card3D
                    card={card}
                    variant={isOwned ? firstVariant : 'Normal'}
                    size="md"
                    interactive={true}
                    onClick={() => handleCardClick(card)}
                    count={entry?.totalCount}
                    isLocked={!isOwned}
                  />

                  {/* Status Label below card */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {isOwned ? (
                      <>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-mono font-bold shadow-sm">
                          已收藏 {entry.totalCount > 1 ? `x${entry.totalCount}` : ''}
                        </span>
                        {entry.isFavorite && (
                          <span className="flex items-center text-rose-400">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-amber-300/90 font-mono flex items-center gap-1 shadow-sm">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>未獲得 · 點擊查看</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  audio.playClick?.();
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                disabled={safePage <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>上一頁</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                  第 <strong className="text-cyan-400 font-bold">{safePage}</strong> / {totalPages} 頁
                  <span className="text-slate-500 ml-2">(共 {filteredCards.length} 張卡牌)</span>
                </span>
              </div>

              <button
                onClick={() => {
                  audio.playClick?.();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                disabled={safePage >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <span>下一頁</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
