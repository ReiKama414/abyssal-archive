import { create } from 'zustand';
import { AppSettings, CardDefinition, CardPack, CardVariant, CollectionItem, PulledCard, PullRecord, UserState } from '@/types';
import { CARD_PACKS } from '@/data/packs';
import { ALL_CARDS } from '@/data/cards';
import { executeBatchPull } from './gacha';
import {
  clearAllStorageData,
  devResetDailyPulls,
  exportCollectionData,
  getCollectionKey,
  importCollectionData,
  loadCollection,
  loadPullHistory,
  loadSettings,
  loadUserState,
  recordPullHistory,
  savePulledCardsToCollection,
  saveSettings,
  saveUserState,
  toggleCardFavorite,
  unlockAllCardsInStorage,
} from './storage';
import { audio } from './audio';

export type AppView = 'home' | 'packs' | 'opening' | 'collection' | 'showcase';

interface AppStore {
  // Navigation & UI View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Selected Pack & Gacha
  selectedPack: CardPack;
  setSelectedPack: (pack: CardPack) => void;
  isPulling: boolean;
  currentPulledCards: PulledCard[];
  setCurrentPulledCards: (cards: PulledCard[]) => void;

  // Modals
  inspectedCard: { card: CardDefinition; variant: CardVariant } | null;
  setInspectedCard: (item: { card: CardDefinition; variant: CardVariant } | null) => void;
  isRatesModalOpen: boolean;
  setIsRatesModalOpen: (open: boolean) => void;
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Core Data
  userState: UserState | null;
  collection: CollectionItem[];
  pullHistory: PullRecord[];
  settings: AppSettings;
  isLoading: boolean;

  // Dev & Infinite Pulls
  infinitePulls: boolean;
  toggleInfinitePulls: () => void;
  clearAllData: () => Promise<void>;
  unlockAllCards: () => Promise<void>;
  setCustomPity: (pity: { srPity?: number; urPity?: number; exPity?: number }) => Promise<void>;

  // Initializer
  initializeApp: () => void;

  // Pull Actions
  performPull: (count: 1 | 5 | 10) => Promise<boolean>;

  // Collection Actions
  toggleFavorite: (cardId: string, variant: CardVariant) => Promise<void>;
  updateShowcase: (cardIds: string[]) => Promise<void>;

  // Settings Actions
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;

  // Backup Actions
  exportData: () => Promise<void>;
  importData: (json: string) => Promise<{ success: boolean; message: string }>;
  devResetDaily: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: 'home',
  setCurrentView: (view) => {
    audio.playClick?.();
    set({ currentView: view });
  },

  selectedPack: CARD_PACKS[0],
  setSelectedPack: (pack) => set({ selectedPack: pack }),

  isPulling: false,
  currentPulledCards: [],
  setCurrentPulledCards: (cards) => set({ currentPulledCards: cards }),

  inspectedCard: null,
  setInspectedCard: (item) => {
    if (item) audio.playHover?.();
    set({ inspectedCard: item });
  },

  isRatesModalOpen: false,
  setIsRatesModalOpen: (open) => {
    audio.playClick?.();
    set({ isRatesModalOpen: open });
  },

  isHistoryModalOpen: false,
  setIsHistoryModalOpen: (open) => {
    audio.playClick?.();
    set({ isHistoryModalOpen: open });
  },

  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (open) => {
    audio.playClick?.();
    set({ isSettingsModalOpen: open });
  },

  userState: null,
  collection: [],
  pullHistory: [],
  settings: {
    soundVolume: 0.7,
    isMuted: false,
    animationQuality: 'high',
    reducedMotion: false,
  },
  isLoading: true,

  // Dev Tools
  infinitePulls: false,
  toggleInfinitePulls: () => {
    audio.playClick?.();
    set((state) => {
      const nextInfinite = !state.infinitePulls;
      if (nextInfinite && state.userState) {
        return {
          infinitePulls: nextInfinite,
          userState: { ...state.userState, dailyPullsRemaining: 999 },
        };
      }
      return { infinitePulls: nextInfinite };
    });
  },

  clearAllData: async () => {
    audio.playClick?.();
    const freshState = await clearAllStorageData();
    set({
      userState: freshState,
      collection: [],
      pullHistory: [],
      currentPulledCards: [],
    });
  },

  unlockAllCards: async () => {
    audio.playClick?.();
    const fullCollection = await unlockAllCardsInStorage(ALL_CARDS);
    set({ collection: fullCollection });
  },

  setCustomPity: async (pity) => {
    audio.playClick?.();
    const { userState } = get();
    if (!userState) return;
    const nextState: UserState = {
      ...userState,
      srPity: pity.srPity ?? userState.srPity,
      urPity: pity.urPity ?? userState.urPity,
      exPity: pity.exPity ?? userState.exPity,
    };
    await saveUserState(nextState);
    set({ userState: nextState });
  },

  initializeApp: async () => {
    try {
      const [userState, collection, pullHistory, settings] = await Promise.all([
        loadUserState(),
        loadCollection(),
        loadPullHistory(),
        loadSettings(),
      ]);

      if (typeof window !== 'undefined') {
        audio.setVolume?.(settings.soundVolume);
        audio.setMuted?.(settings.isMuted);
      }

      set({
        userState,
        collection,
        pullHistory,
        settings,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to initialize app state:', err);
      set({ isLoading: false });
    }
  },

  performPull: async (count: 1 | 5 | 10) => {
    const { userState, selectedPack, collection, infinitePulls } = get();
    if (!userState) return false;

    // Check daily limit unless infinitePulls is enabled
    if (!infinitePulls && userState.dailyPullsRemaining < count) {
      return false;
    }

    set({ isPulling: true });

    try {
      const ownedCardIds = new Set(collection.map((c) => c.cardId));
      const { pulledCards, nextState } = executeBatchPull(
        selectedPack,
        count,
        userState,
        ownedCardIds
      );

      const stateToPersist: UserState = infinitePulls
        ? { ...nextState, dailyPullsRemaining: 999 }
        : nextState;

      // Instantly persist state and collection to IndexedDB so no cards are lost even if skipped/refreshed
      await saveUserState(stateToPersist);
      const updatedCollection = await savePulledCardsToCollection(pulledCards);

      const pullRecord: PullRecord = {
        id: `pull-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        packId: selectedPack.id,
        packName: selectedPack.name,
        pullCount: count,
        cards: pulledCards.map((p) => ({ cardId: p.card.id, variant: p.variant })),
      };
      await recordPullHistory(pullRecord);

      const updatedHistory = await loadPullHistory();

      set({
        userState: stateToPersist,
        collection: updatedCollection,
        pullHistory: updatedHistory,
        currentPulledCards: pulledCards,
        currentView: 'opening',
        isPulling: false,
      });

      return true;
    } catch (err) {
      console.error('Error during gacha pull execution:', err);
      set({ isPulling: false });
      return false;
    }
  },

  toggleFavorite: async (cardId: string, variant: CardVariant) => {
    const newFav = await toggleCardFavorite(cardId, variant);
    const key = getCollectionKey(cardId, variant);

    set((state) => ({
      collection: state.collection.map((item) =>
        getCollectionKey(item.cardId, item.variant) === key ? { ...item, isFavorite: newFav } : item
      ),
    }));
  },

  updateShowcase: async (cardIds: string[]) => {
    const { userState } = get();
    if (!userState) return;

    const nextState: UserState = {
      ...userState,
      showcaseCardIds: cardIds.slice(0, 5),
    };
    await saveUserState(nextState);
    set({ userState: nextState });
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const nextSettings = { ...get().settings, ...partial };
    await saveSettings(nextSettings);

    if (partial.soundVolume !== undefined) audio.setVolume?.(partial.soundVolume);
    if (partial.isMuted !== undefined) audio.setMuted?.(partial.isMuted);

    set({ settings: nextSettings });
  },

  exportData: async () => {
    const data = await exportCollectionData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abyssal-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData: async (json: string) => {
    const res = await importCollectionData(json);
    if (res.success) {
      await get().initializeApp();
    }
    return res;
  },

  devResetDaily: async () => {
    const nextState = await devResetDailyPulls();
    set({ userState: nextState });
  },
}));

// Quick lookup helper for card definitions
export const CARDS_MAP = new Map<string, CardDefinition>(ALL_CARDS.map((c) => [c.id, c]));
