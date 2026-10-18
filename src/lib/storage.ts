import { AppSettings, CardVariant, CollectionExportData, CollectionItem, PulledCard, PullRecord, UserState } from '@/types';
import { getTaipeiDateString } from './time';

const DB_NAME = 'AbyssalArchiveDB';
const DB_VERSION = 1;

const STORES = {
  USER_STATE: 'user_state',
  COLLECTION: 'collection',
  PULL_HISTORY: 'pull_history',
  SETTINGS: 'settings',
};

const DEFAULT_STATE: UserState = {
  dailyPullsRemaining: 10,
  lastPullDateTaipei: '',
  srPity: 0,
  urPity: 0,
  exPity: 0,
  totalPulls: 0,
  showcaseCardIds: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  soundVolume: 0.7,
  isMuted: false,
  animationQuality: 'high',
  reducedMotion: false,
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on server'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.USER_STATE)) {
        db.createObjectStore(STORES.USER_STATE);
      }
      if (!db.objectStoreNames.contains(STORES.COLLECTION)) {
        db.createObjectStore(STORES.COLLECTION, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PULL_HISTORY)) {
        const historyStore = db.createObjectStore(STORES.PULL_HISTORY, { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Composite ID for card collection variants
 */
export function getCollectionKey(cardId: string, variant: CardVariant): string {
  return `${cardId}::${variant}`;
}

/**
 * Loads user state, automatically handling Taiwan 00:00 daily reset
 */
export async function loadUserState(): Promise<UserState> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.USER_STATE, 'readonly');
    const store = tx.objectStore(STORES.USER_STATE);
    const req = store.get('main');

    req.onsuccess = async () => {
      const todayTaipei = getTaipeiDateString();
      const state: UserState = req.result ? { ...req.result } : { ...DEFAULT_STATE, lastPullDateTaipei: todayTaipei };

      // Daily 00:00 Taiwan time reset logic
      if (state.lastPullDateTaipei !== todayTaipei) {
        state.dailyPullsRemaining = 10; // Reset to 10, unused does NOT accumulate
        state.lastPullDateTaipei = todayTaipei;
        await saveUserState(state);
      }

      resolve(state);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves user state to IndexedDB
 */
export async function saveUserState(state: UserState): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.USER_STATE, 'readwrite');
    const store = tx.objectStore(STORES.USER_STATE);
    const req = store.put(state, 'main');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Loads entire collection
 */
export async function loadCollection(): Promise<CollectionItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTION, 'readonly');
    const store = tx.objectStore(STORES.COLLECTION);
    const req = store.getAll();

    req.onsuccess = () => {
      const items: CollectionItem[] = (req.result || []).map((row: CollectionItem & { id: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...item } = row;
        return item;
      });
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Records newly pulled cards to collection (accumulating counts and variants)
 */
export async function savePulledCardsToCollection(pulledCards: PulledCard[]): Promise<CollectionItem[]> {
  const db = await openDb();
  const nowIso = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTION, 'readwrite');
    const store = tx.objectStore(STORES.COLLECTION);

    const updatedItems: CollectionItem[] = [];

    // Process each pulled card
    pulledCards.forEach(({ card, variant }) => {
      const key = getCollectionKey(card.id, variant);
      const getReq = store.get(key);

      getReq.onsuccess = () => {
        const existing = getReq.result;
        let item: CollectionItem;

        if (existing) {
          item = {
            cardId: existing.cardId,
            variant: existing.variant,
            count: existing.count + 1,
            firstAcquiredAt: existing.firstAcquiredAt,
            lastAcquiredAt: nowIso,
            isFavorite: existing.isFavorite,
          };
        } else {
          item = {
            cardId: card.id,
            variant,
            count: 1,
            firstAcquiredAt: nowIso,
            lastAcquiredAt: nowIso,
            isFavorite: false,
          };
        }

        store.put({ ...item, id: key });
        updatedItems.push(item);
      };
    });

    tx.oncomplete = async () => {
      const all = await loadCollection();
      resolve(all);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Toggle favorite status of a collected card
 */
export async function toggleCardFavorite(cardId: string, variant: CardVariant): Promise<boolean> {
  const db = await openDb();
  const key = getCollectionKey(cardId, variant);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTION, 'readwrite');
    const store = tx.objectStore(STORES.COLLECTION);
    const getReq = store.get(key);

    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) {
        return resolve(false);
      }
      const newFav = !existing.isFavorite;
      store.put({ ...existing, isFavorite: newFav });
      resolve(newFav);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Saves a pull history record
 */
export async function recordPullHistory(record: PullRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PULL_HISTORY, 'readwrite');
    const store = tx.objectStore(STORES.PULL_HISTORY);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Loads recent pull history (sorted descending)
 */
export async function loadPullHistory(limit = 100): Promise<PullRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PULL_HISTORY, 'readonly');
    const store = tx.objectStore(STORES.PULL_HISTORY);
    const req = store.getAll();

    req.onsuccess = () => {
      const records: PullRecord[] = req.result || [];
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(records.slice(0, limit));
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Loads application settings
 */
export async function loadSettings(): Promise<AppSettings> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const req = store.get('user_settings');
    req.onsuccess = () => resolve(req.result ? { ...DEFAULT_SETTINGS, ...req.result } : DEFAULT_SETTINGS);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves application settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    const req = store.put(settings, 'user_settings');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Exports complete collection, history, user state, and settings as JSON
 */
export async function exportCollectionData(): Promise<CollectionExportData> {
  const userState = await loadUserState();
  const collection = await loadCollection();
  const pullHistory = await loadPullHistory(500);
  const settings = await loadSettings();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    userState,
    collection,
    pullHistory,
    settings,
  };
}

/**
 * Imports and replaces local data from an exported JSON
 */
export async function importCollectionData(jsonContent: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonContent) as CollectionExportData;
    if (!data.version || !data.userState || !Array.isArray(data.collection)) {
      return { success: false, message: '無效的備份檔案格式。缺少必要欄位。' };
    }

    const db = await openDb();

    // Clear existing data and re-populate
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.USER_STATE, STORES.COLLECTION, STORES.PULL_HISTORY, STORES.SETTINGS], 'readwrite');
      
      tx.objectStore(STORES.USER_STATE).clear();
      tx.objectStore(STORES.COLLECTION).clear();
      tx.objectStore(STORES.PULL_HISTORY).clear();
      tx.objectStore(STORES.SETTINGS).clear();

      tx.objectStore(STORES.USER_STATE).put(data.userState, 'main');
      
      data.collection.forEach((item) => {
        const key = getCollectionKey(item.cardId, item.variant);
        tx.objectStore(STORES.COLLECTION).put({ ...item, id: key });
      });

      if (Array.isArray(data.pullHistory)) {
        data.pullHistory.forEach((record) => {
          tx.objectStore(STORES.PULL_HISTORY).put(record);
        });
      }

      if (data.settings) {
        tx.objectStore(STORES.SETTINGS).put(data.settings, 'user_settings');
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    return { success: true, message: `成功還原！已載入 ${data.collection.length} 種卡牌變體紀錄。` };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '未知錯誤';
    return { success: false, message: `匯入失敗：${errorMessage}` };
  }
}

/**
 * Dev reset helper for testing daily reset without waiting for midnight
 */
export async function devResetDailyPulls(): Promise<UserState> {
  const currentState = await loadUserState();
  const nextState: UserState = {
    ...currentState,
    dailyPullsRemaining: 10,
    lastPullDateTaipei: getTaipeiDateString(),
  };
  await saveUserState(nextState);
  return nextState;
}

/**
 * Dev tool: Wipe all collection, history, and state clean
 */
export async function clearAllStorageData(): Promise<UserState> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORES.USER_STATE, STORES.COLLECTION, STORES.PULL_HISTORY], 'readwrite');
    tx.objectStore(STORES.USER_STATE).clear();
    tx.objectStore(STORES.COLLECTION).clear();
    tx.objectStore(STORES.PULL_HISTORY).clear();
    const freshState: UserState = {
      ...DEFAULT_STATE,
      lastPullDateTaipei: getTaipeiDateString(),
    };
    tx.objectStore(STORES.USER_STATE).put(freshState, 'main');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return loadUserState();
}

/**
 * Dev tool: Unlock all cards in collection with variants
 */
export async function unlockAllCardsInStorage(allCards: { id: string }[]): Promise<CollectionItem[]> {
  const db = await openDb();
  const now = new Date().toISOString();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTION, 'readwrite');
    const store = tx.objectStore(STORES.COLLECTION);
    allCards.forEach((card) => {
      const variants: CardVariant[] = ['Normal', 'Holographic', 'Living Card'];
      variants.forEach((v) => {
        const key = getCollectionKey(card.id, v);
        const item: CollectionItem = {
          cardId: card.id,
          variant: v,
          count: 1,
          firstAcquiredAt: now,
          lastAcquiredAt: now,
          isFavorite: false,
        };
        store.put({ ...item, id: key });
      });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return loadCollection();
}

