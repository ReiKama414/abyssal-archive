'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { X, ShieldCheck, Award } from 'lucide-react';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';
import { audio } from '@/lib/audio';

export const RatesModal: React.FC = () => {
  const { isRatesModalOpen, setIsRatesModalOpen } = useAppStore();

  if (!isRatesModalOpen) return null;

  const handleClose = () => {
    audio.playClick?.();
    setIsRatesModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-sans font-extrabold text-white tracking-wide">
                抽卡機率與保底機制公開說明
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                深淵幻藏 (ABYSSAL ARCHIVE) 100% 透明無暗改機率規範
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300">
          {/* Base Rarity Probabilities */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AbyssalSigil className="w-4 h-4" />
              <span>基礎稀有度出率表 (Base Rates)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { r: 'EX', rate: '0.50%', desc: '太古原初神格 (全螢幕專屬深海動畫)', color: 'border-cyan-400 bg-cyan-950/60 text-cyan-300' },
                { r: 'UR', rate: '2.50%', desc: '始源與世界創世者', color: 'border-rose-400 bg-rose-950/60 text-rose-300' },
                { r: 'SSR', rate: '6.00%', desc: '天女、神鯨、支配者與天狐', color: 'border-amber-400 bg-amber-950/60 text-amber-300' },
                { r: 'SR', rate: '14.00%', desc: '燈塔水母、神官、武姬與白狐', color: 'border-purple-400 bg-purple-950/60 text-purple-300' },
                { r: 'R', rate: '27.00%', desc: '琉璃羽水母、刺客、劍客', color: 'border-blue-500/60 bg-blue-950/60 text-blue-300' },
                { r: 'N', rate: '50.00%', desc: '幽光幼體、銀刺魚、見習僕從', color: 'border-slate-700 bg-slate-950 text-slate-400' },
              ].map((item) => (
                <div key={item.r} className={`p-3 rounded-2xl border ${item.color}`}>
                  <div className="flex items-center justify-between font-black font-mono text-base">
                    <span>{item.r}</span>
                    <span>{item.rate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee / Pity Rules */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>保底累積規則與優先順序演算法</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">每 10 抽保底 SR 以上：</strong>若連續 9 次未抽出 SR 或以上卡牌，第 10 次抽取必定為 SR、SSR、UR 或 EX。
              </li>
              <li>
                <strong className="text-white">每 50 抽保底 UR 以上：</strong>若連續 49 次未抽出 UR 或 EX 卡牌，第 50 次抽取必定為 UR 或 EX。
              </li>
              <li>
                <strong className="text-white">每 200 抽保底 EX：</strong>若連續 199 次未抽出 EX 卡牌，第 200 次抽取必定為至高神格 EX。
              </li>
              <li>
                <strong className="text-cyan-300">保底跨日永久保存：</strong>所有保底計數存儲於本機 IndexedDB，跨日或更換卡包均完整繼承，永不清空。
              </li>
              <li>
                <strong className="text-amber-300">多重保底衝突優先順序：</strong>當多種保底同時觸發時，依照最高稀有度嚴格判定：<br />
                <span className="font-mono text-cyan-300 font-bold ml-4">
                  EX 保底 (200抽) &gt; UR 保底 (50抽) &gt; SR 保底 (10抽)
                </span>
              </li>
            </ul>
          </div>

          {/* Card Pack Size Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>十三大卡包卡池規格一覽（全圖鑑 414 款）</span>
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold">414 CARDS TOTAL</span>
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-2">
                  <span>四大永久常駐卡包 (每包 72 款 · 共 288 款)</span>
                  <span className="font-mono text-cyan-200">4 × 72 = 288 款</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-medium">深海水母與海洋神獸</span>
                    <span className="font-mono text-cyan-300 font-bold">72 款卡牌</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-medium">夜想幻想曲·哥德魔女</span>
                    <span className="font-mono text-purple-300 font-bold">72 款卡牌</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-medium">霓虹特區·量子矩陣</span>
                    <span className="font-mono text-pink-300 font-bold">72 款卡牌</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-medium">幻獸靈域·太古九天</span>
                    <span className="font-mono text-amber-300 font-bold">72 款卡牌</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-2">
                  <span>九大節慶限定卡包 (每包 14 款 · 共 126 款)</span>
                  <span className="font-mono text-purple-200">9 × 14 = 126 款</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { name: '萬聖節', en: '南瓜魅影', count: 14 },
                    { name: '聖誕節', en: '極光星輝', count: 14 },
                    { name: '新年', en: '歲旦破曉', count: 14 },
                    { name: '情人節', en: '甜心誓約', count: 14 },
                    { name: '櫻花祭', en: '春櫻漫舞', count: 14 },
                    { name: '夏日祭', en: '盛夏夜祭', count: 14 },
                    { name: '中秋節', en: '廣寒月華', count: 14 },
                    { name: '周年慶', en: '周年慶典', count: 14 },
                    { name: '深淵之蝕', en: '深淵之蝕', count: 14 },
                  ].map((fest) => (
                    <div key={fest.name} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-300 truncate">{fest.name}</span>
                      <span className="font-mono text-amber-300 font-bold text-[10px] ml-1">{fest.count}款</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Variant Rates */}
          <div>
            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AbyssalSigil className="w-4 h-4" />
              <span>獨立卡牌閃卡變體出率 (Variant Rates)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Normal 普卡', rate: '82.0%' },
                { name: 'Silver Foil 銀箔', rate: '8.0%' },
                { name: 'Holographic 全息彩虹', rate: '5.0%' },
                { name: 'Royal Gold 純金箔', rate: '2.5%' },
                { name: 'Living Card 局部動態卡', rate: '1.5%' },
                { name: 'Abyss Edition 深淵極致版', rate: '0.8%' },
                { name: 'Prismatic Signature 星芒燙金簽名', rate: '0.2%' },
              ].map((v) => (
                <div key={v.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{v.name}</span>
                  <span className="font-mono font-bold text-amber-300">{v.rate}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              註：卡牌變體為每張卡片抽取後的獨立機率判定。同一張卡牌的不同變體視為獨立的收藏紀錄。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
