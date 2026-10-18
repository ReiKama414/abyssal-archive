'use client';

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Download,
  Upload,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { audio } from '@/lib/audio';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    exportData,
    importData,
    devResetDaily,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isSettingsModalOpen) return null;

  const handleClose = () => {
    audio.playClick?.();
    setIsSettingsModalOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importData(text);
      setImportStatus(res);
      audio.playClick?.();
    } catch {
      setImportStatus({ success: false, message: '讀取備份檔案失敗' });
    }
  };

  const handleDevReset = async () => {
    audio.playClick?.();
    await devResetDaily();
    alert('已成功模擬隔日重置！今日抽卡次數已恢復為 10 抽。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                系統設定與資料備份
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                自訂音效、圖形效能分級及本機 IndexedDB 收藏匯出匯入
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Audio Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>音效與環境音樂</span>
            </h4>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-medium">主音量調整</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-300">靜音模式</span>
                <button
                  onClick={() => updateSettings({ isMuted: !settings.isMuted })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    settings.isMuted
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {settings.isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>已靜音</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>正常播放</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Graphics Quality & Performance Tiering */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>圖形效能與 GPU 分級</span>
            </h4>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <span className="text-slate-200 font-medium block mb-2">畫面品質等級</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'high', label: '極致 (High)', desc: '完整 WebGL、光影、動態水母' },
                    { id: 'medium', label: '流暢 (Medium)', desc: '平衡效能與粒子數量' },
                    { id: 'low', label: '節能 (Low)', desc: '手機首選、最低耗電' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => updateSettings({ animationQuality: tier.id as typeof settings.animationQuality })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        settings.animationQuality === tier.id
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs block">{tier.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{tier.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-200 font-medium block">降低動態效果 (Reduced Motion)</span>
                  <span className="text-[11px] text-slate-500">停用 3D 視差與激烈光影特效</span>
                </div>
                <button
                  onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.reducedMotion
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.reducedMotion ? '已開啟' : '已關閉'}
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore (JSON Export / Import) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>收藏資料備份與還原 (JSON)</span>
            </h4>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                本遊戲為純前端離線架構，所有卡牌、變體、抽卡歷史及保底皆儲存於瀏覽器本機 IndexedDB。建議定期匯出備份以防瀏覽器快取被清除。
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={exportData}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>匯出備份檔案 (JSON)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>匯入還原備份</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-500/60 text-rose-300'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dev Test Helper & Infinite Pulls */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              開發者與測試工具 (DEV TOOLS)
            </h4>

            {/* Infinite pulls switch */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  無限抽卡模式 (Infinite Pulls)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  開啟後抽數永不歸零，可無限測試各卡包抽卡
                </span>
              </div>
              <button
                onClick={useAppStore.getState().toggleInfinitePulls}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  useAppStore.getState().infinitePulls
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {useAppStore.getState().infinitePulls ? '已開啟 ∞' : '已關閉'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  恢復今日 10 抽 (模擬隔日重置)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  將今日剩餘抽數恢復至 10 抽，保留所有已存保底與卡片
                </span>
              </div>
              <button
                onClick={handleDevReset}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all whitespace-nowrap"
              >
                恢復 10 抽
              </button>
            </div>

            {/* Clear All Data */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-300 block">
                  清空所有收藏與歷史紀錄 (Wipe Clean)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  將 IndexedDB 徹底清空還原至初次進入遊戲狀態
                </span>
              </div>
              <button
                onClick={async () => {
                  if (confirm('確定要清空所有本機資料嗎？所有卡牌將全部歸零！')) {
                    await useAppStore.getState().clearAllData();
                    alert('已清空所有本機資料！');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600/60 text-xs font-bold transition-all whitespace-nowrap"
              >
                清空所有資料
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
