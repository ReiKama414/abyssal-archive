'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { gsap } from 'gsap';
import {
  Compass,
  Layers,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  HelpCircle,
  Clock,
  PackageOpen,
} from 'lucide-react';
import { audio } from '@/lib/audio';

export const Navbar: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const {
    currentView,
    setCurrentView,
    userState,
    settings,
    updateSettings,
    setIsSettingsModalOpen,
    setIsRatesModalOpen,
  } = useAppStore();

  // GSAP Smooth Header Entrance
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  const handleToggleSound = () => {
    const nextMuted = !settings.isMuted;
    updateSettings({ isMuted: nextMuted });
    if (!nextMuted) {
      audio.startAmbient?.();
    } else {
      audio.stopAmbient?.();
    }
  };

  const navItems = [
    { id: 'home', label: '深海首頁', icon: Compass },
    { id: 'packs', label: '卡包召喚', icon: PackageOpen },
    { id: 'collection', label: '我的圖鑑', icon: Layers },
    { id: 'showcase', label: '3D展廳', icon: Trophy },
  ] as const;

  const isOpening = currentView === 'opening';

  const isNavActive = (id: (typeof navItems)[number]['id']) => {
    if (isOpening) return id === 'packs';
    return currentView === id;
  };

  const handleNavClick = (id: (typeof navItems)[number]['id']) => {
    if (isOpening) return; // keep immersion; use 跳過 / 完成 to leave
    setCurrentView(id);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-cyan-500/25 bg-slate-950/90 backdrop-blur-2xl transition-all shadow-[0_4px_30px_rgba(0,0,0,0.7)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with ComfyUI Generated Emblem */}
        <div
          onClick={() => {
            if (!isOpening) setCurrentView('home');
          }}
          className={`flex items-center gap-3 group select-none ${isOpening ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,255,0.35)] group-hover:shadow-[0_0_25px_rgba(0,242,255,0.7)] group-hover:scale-105 transition-all bg-slate-950 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Abyssal Archive Emblem"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm sm:text-base tracking-[0.22em] text-white group-hover:text-cyan-300 transition-colors uppercase">
              ABYSSAL ARCHIVE
            </span>
            <span className="font-serif text-[10px] tracking-[0.35em] text-slate-400 font-bold -mt-0.5">
              深 淵 幻 藏
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800/90 rounded-full px-2 py-1.5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                disabled={isOpening && item.id !== 'packs'}
                title={isOpening && item.id !== 'packs' ? '開包進行中，請先完成或跳過動畫' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-bold tracking-wide transition-all select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : isOpening
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{isOpening && item.id === 'packs' ? '開包中' : item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Daily Pull Counter & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Daily Pull Badge */}
          <div
            onClick={() => setCurrentView('packs')}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 transition-colors text-xs"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">今日免費：</span>
            <span className={`font-mono font-semibold tabular-nums ${useAppStore.getState().infinitePulls ? 'text-amber-300' : 'text-cyan-300'}`}>
              {useAppStore.getState().infinitePulls ? '∞ 無限' : `${userState?.dailyPullsRemaining ?? 10} 抽`}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
              settings.isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
            }`}
            title={settings.isMuted ? '開啟聲音' : '靜音'}
          >
            {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Rates Info */}
          <button
            onClick={() => setIsRatesModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="機率與保底規範"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Settings / Backup */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="系統設定與資料備份"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 border-t border-slate-800 backdrop-blur-xl px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              disabled={isOpening && item.id !== 'packs'}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-cyan-300' : isOpening ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isOpening && item.id === 'packs' ? '開包中' : item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
