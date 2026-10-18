'use client';

import React from 'react';
import { useAppStore, CARDS_MAP } from '@/lib/store';
import { X, History, Calendar } from 'lucide-react';
import { audio } from '@/lib/audio';

export const PullHistoryModal: React.FC = () => {
  const { isHistoryModalOpen, setIsHistoryModalOpen, pullHistory, setInspectedCard } = useAppStore();

  if (!isHistoryModalOpen) return null;

  const handleClose = () => {
    audio.playClick?.();
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                抽卡歷史紀錄
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                紀錄本機的所有歷史抽卡軌跡（共 {pullHistory.length} 筆）
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Records List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 divide-y divide-slate-800/60">
          {pullHistory.map((record) => {
            const dateStr = new Date(record.timestamp).toLocaleString();

            return (
              <div key={record.id} className="pt-4 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{record.packName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono font-semibold">
                      {record.pullCount} 連抽
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </span>
                </div>

                {/* Pulled Cards Badges in this Record */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {record.cards.map((item, idx) => {
                    const card = CARDS_MAP.get(item.cardId);
                    if (!card) return null;

                    const rarityColors: Record<string, string> = {
                      EX: 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.4)]',
                      UR: 'border-rose-400 bg-rose-950/80 text-rose-300',
                      SSR: 'border-amber-400 bg-amber-950/80 text-amber-300',
                      SR: 'border-purple-400 bg-purple-950/80 text-purple-300',
                      R: 'border-blue-500/60 bg-blue-950/60 text-blue-300',
                      N: 'border-slate-700 bg-slate-900 text-slate-400',
                    };

                    return (
                      <button
                        key={`${record.id}-${idx}`}
                        onClick={() => {
                          audio.playClick?.();
                          setInspectedCard({ card, variant: item.variant });
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-transform hover:scale-105 ${
                          rarityColors[card.rarity] || 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <span className="font-black font-mono">[{card.rarity}]</span>
                        <span className="truncate max-w-[110px]">{card.name}</span>
                        {item.variant !== 'Normal' && (
                          <span className="text-[10px] opacity-75 font-serif italic">
                            ({item.variant})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {pullHistory.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <p className="text-base font-semibold">尚無抽卡紀錄</p>
              <p className="text-xs mt-1">快去卡包商店進行今日的免費 10 抽吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
