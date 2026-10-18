'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Wrench,
  Infinity as InfinityIcon,
  RotateCcw,
  Trash2,
  Zap,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';

interface ComfyProgress {
  total: number;
  aiCompleted: number;
  remaining: number;
  currentCard: { id: string; name: string; nameEn: string; series: string; rarity: string } | null;
  percent: string;
  status: string;
}

export const DevToolsModal: React.FC = () => {
  const {
    infinitePulls,
    toggleInfinitePulls,
    clearAllData,
    devResetDaily,
    unlockAllCards,
    setCustomPity,
    userState,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [comfyProgress, setComfyProgress] = useState<ComfyProgress | null>(null);

  // Poll generation progress
  React.useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/cards/GENERATION_PROGRESS.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setComfyProgress(data);
        }
      } catch {}
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 2500);
    return () => clearInterval(interval);
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClear = async () => {
    if (confirm('確定要清空所有本機資料嗎？包含所有已抽到的卡牌、變體與歷史紀錄將全部歸零！')) {
      audio.playClick?.();
      await clearAllData();
      notify('已清空所有本機收藏與歷史資料！');
    }
  };

  const handleResetTen = async () => {
    audio.playClick?.();
    await devResetDaily();
    notify('今日抽數已恢復為 10 抽！');
  };

  const handleUnlockAll = async () => {
    audio.playClick?.();
    await unlockAllCards();
    notify('全圖鑑 414 張卡牌已全數解鎖至收藏庫！');
  };

  const handleSetPity = async (type: 'SR' | 'UR' | 'EX') => {
    audio.playClick?.();
    if (type === 'SR') {
      await setCustomPity({ srPity: 9 });
      notify('SR 保底已設為 9/10，下一次抽卡必出 SR 或以上！');
    } else if (type === 'UR') {
      await setCustomPity({ urPity: 49 });
      notify('UR 保底已設為 49/50，下一次抽卡必出 UR 或 EX！');
    } else if (type === 'EX') {
      await setCustomPity({ exPity: 199 });
      notify('EX 保底已設為 199/200，下一次抽卡必出 EX 至高神格！');
    }
  };

  // Production builds must not expose cheat / wipe controls in the main UI chrome
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Floating Pill on bottom-right — development only */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => {
            audio.playClick?.();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl backdrop-blur-xl text-xs font-bold transition-all ${
            infinitePulls
              ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEV 工具</span>
          {comfyProgress && comfyProgress.status === 'running' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-black animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>GPU 繪製中 {comfyProgress.aiCompleted}/{comfyProgress.total}</span>
            </span>
          )}
          {infinitePulls && (
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-black">
              無限抽 ON
            </span>
          )}
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-32 sm:bottom-16 right-4 sm:right-6 z-50 w-80 sm:w-96 p-5 rounded-3xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-2xl text-xs text-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white font-mono">DEV CONTROL PANEL</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live ComfyUI Generation Monitor */}
          {comfyProgress && (
            <div className="mt-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      comfyProgress.status === 'running' ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span>
                    {comfyProgress.status === 'running' ? 'ComfyUI GPU 批次生成中' : '全圖鑑 AI 插畫已全數完成'}
                  </span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {comfyProgress.aiCompleted} / {comfyProgress.total} ({comfyProgress.percent})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-700/60 my-1.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${(comfyProgress.aiCompleted / comfyProgress.total) * 100}%` }}
                />
              </div>
              {comfyProgress.currentCard && comfyProgress.status === 'running' && (
                <span className="text-[10px] text-slate-300 block truncate mt-0.5">
                  正在繪製：<strong className="text-cyan-200">{comfyProgress.currentCard.name}</strong> (
                  {comfyProgress.currentCard.nameEn})
                </span>
              )}
            </div>
          )}

          {notification && (
            <div className="mt-3 p-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{notification}</span>
            </div>
          )}

          <div className="mt-4 space-y-3.5">
            {/* Infinite Pulls Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <InfinityIcon className="w-4 h-4 text-amber-400" />
                  <span>無限抽卡模式</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  剩餘抽數永不歸零，可無限連續開包
                </span>
              </div>
              <button
                onClick={toggleInfinitePulls}
                className={`px-3 py-1.5 rounded-xl border font-bold transition-all ${
                  infinitePulls
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {infinitePulls ? '已開啟' : '關閉中'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleResetTen}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 font-bold text-left flex flex-col transition-all"
              >
                <span className="text-cyan-300 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>恢復 10 抽</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">重設今日免費次數</span>
              </button>

              <button
                onClick={handleUnlockAll}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 font-bold text-left flex flex-col transition-all"
              >
                <span className="text-purple-300 flex items-center gap-1.5">
                  <AbyssalSigil className="w-3.5 h-3.5" />
                  <span>一鍵全卡解鎖</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">解鎖全部414張圖鑑</span>
              </button>
            </div>

            {/* Pity Presets */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-slate-300 block mb-1.5">
                保底觸發測試（下 1 抽必出）：
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSetPity('SR')}
                  className="py-1.5 px-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-[11px]"
                >
                  SR 保底 (9/10)
                </button>
                <button
                  onClick={() => handleSetPity('UR')}
                  className="py-1.5 px-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/50 font-bold text-[11px]"
                >
                  UR 保底 (49/50)
                </button>
                <button
                  onClick={() => handleSetPity('EX')}
                  className="py-1.5 px-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-400 font-bold text-[11px] shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                >
                  EX 保底 (199/200)
                </button>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 font-mono">
                當前保底：SR {userState?.srPity ?? 0}/10 | UR {userState?.urPity ?? 0}/50 | EX {userState?.exPity ?? 0}/200
              </div>
            </div>

            {/* Clear All Data */}
            <button
              onClick={handleClear}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/60 font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空所有收藏與抽卡資料 (重置初始狀態)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
