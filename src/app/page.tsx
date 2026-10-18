'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { SiteFooter } from '@/components/common/SiteFooter';
import { HomeLanding } from '@/components/home/HomeLanding';
import { PackSelector } from '@/components/gacha/PackSelector';
import { PackOpeningScene } from '@/components/gacha/PackOpeningScene';
import { CollectionCompendium } from '@/components/collection/CollectionCompendium';
import { ShowcaseWall } from '@/components/collection/ShowcaseWall';
import { CardModal } from '@/components/card/CardModal';
import { RatesModal } from '@/components/common/RatesModal';
import { SettingsModal } from '@/components/common/SettingsModal';
import { PullHistoryModal } from '@/components/collection/PullHistoryModal';
import { DevToolsModal } from '@/components/common/DevToolsModal';
import { AbyssalSigil } from '@/components/common/AbyssalSigil';

export default function Home() {
  const { currentView, initializeApp, isLoading } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Reset window scroll on every view change so sticky nav never hides page CTAs
  useEffect(() => {
    if (isLoading) return;
    window.scrollTo(0, 0);
  }, [currentView, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
          <AbyssalSigil className="w-7 h-7 absolute inset-0 m-auto" glow={true} />
        </div>
        <p className="mt-4 text-xs font-hud tracking-[0.2em] text-slate-400 uppercase">
          INITIALIZING ABYSSAL ARCHIVE...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-clip">
      {/* Top Navigation - Sticky */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-20 md:pb-10">
        {currentView === 'home' && <HomeLanding />}
        {currentView === 'packs' && <PackSelector />}
        {currentView === 'opening' && <PackOpeningScene />}
        {currentView === 'collection' && <CollectionCompendium />}
        {currentView === 'showcase' && <ShowcaseWall />}
      </main>

      {currentView !== 'opening' && <SiteFooter />}

      {/* Global Interactive Modals */}
      <CardModal />
      <RatesModal />
      <SettingsModal />
      <PullHistoryModal />
      <DevToolsModal />
    </div>
  );
}
