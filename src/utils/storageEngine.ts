import { AppState } from '../types';

export const isProd = import.meta.env.PROD;
export const APP_ENV = isProd ? 'production' : 'development';

export const DB_NAME = isProd ? 'mealcraft_prod_db' : 'mealcraft_dev_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_store';
const CURRENT_STATE_KEY = 'mealcraft_current_state';
const BACKUP_STATE_KEY = 'mealcraft_backup_snapshot';
export const LOCAL_STORAGE_KEY = isProd ? 'mealcraft_prod_state_v1' : 'mealcraft_dev_state_v1';
export const LOCAL_STORAGE_BACKUP_KEY = isProd ? 'mealcraft_prod_state_backup_v1' : 'mealcraft_dev_state_backup_v1';

/**
 * Open or create IndexedDB connection (virtually unlimited browser storage)
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Save data to IndexedDB
 */
export async function saveToIndexedDB(key: string, data: any): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(data, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to write to IndexedDB'));
    });
  } catch (err) {
    console.warn('[StorageEngine] IndexedDB save warning:', err);
  }
}

/**
 * Load data from IndexedDB
 */
export async function loadFromIndexedDB(key: string): Promise<any> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('Failed to read from IndexedDB'));
    });
  } catch (err) {
    console.warn('[StorageEngine] IndexedDB read warning:', err);
    return null;
  }
}

/**
 * Safely save state to localStorage without crashing on 5MB QuotaExceededError
 */
export function safeSaveToLocalStorage(state: AppState): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    // Also save rolling backup
    try {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, serialized);
    } catch {
      // Ignore backup quota warnings
    }
    return true;
  } catch (e: any) {
    // If quota exceeded (e.g. from large uploaded PDFs/images), save a lightweight version to localStorage
    // while IndexedDB retains the full heavy fileData attachments!
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
      console.warn('[StorageEngine] LocalStorage quota reached. Saving lightweight state cache. Full documents secured in IndexedDB.');
      try {
        const lightweightState = {
          ...state,
          bloodReports: (state.bloodReports || []).map(r => ({
            ...r,
            fileData: '',
            hasAttachment: Boolean(r.fileData && r.fileData.length > 0),
          }))
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweightState));
        return true;
      } catch (innerErr) {
        console.error('[StorageEngine] Failed to save lightweight state to localStorage:', innerErr);
      }
    } else {
      console.error('[StorageEngine] Error saving state to localStorage:', e);
    }
    return false;
  }
}

/**
 * Seamlessly check legacy IndexedDB (mealcraft_offline_db) for backward compatibility
 */
async function loadFromLegacyIndexedDB(): Promise<AppState | null> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) return null;
    return new Promise((resolve) => {
      const req = window.indexedDB.open('mealcraft_offline_db', 1);
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('app_state_store')) {
          db.close();
          return resolve(null);
        }
        const tx = db.transaction('app_state_store', 'readonly');
        const store = tx.objectStore('app_state_store');
        const getReq = store.get(CURRENT_STATE_KEY);
        getReq.onsuccess = () => {
          db.close();
          resolve((getReq.result as AppState) || null);
        };
        getReq.onerror = () => {
          db.close();
          resolve(null);
        };
      };
    });
  } catch {
    return null;
  }
}

/**
 * Synchronous read from localStorage on app boot for 0ms initial render.
 * Supports environment-specific key with automatic legacy fallback.
 */
export function loadInitialStateSync(): Partial<AppState> | null {
  try {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY) ||
      localStorage.getItem('mealcraft_app_state_v1') ||
      localStorage.getItem('mealcraft_app_state_backup_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('[StorageEngine] Error loading initial state from localStorage:', e);
  }
  return null;
}

/**
 * Persist state to both IndexedDB and safe LocalStorage
 */
export async function persistAppState(state: AppState): Promise<void> {
  // 1. Synchronously update localStorage
  safeSaveToLocalStorage(state);

  // 2. Asynchronously save full complete state to IndexedDB
  await saveToIndexedDB(CURRENT_STATE_KEY, state);

  // 3. Keep a rolling snapshot in IndexedDB
  try {
    await saveToIndexedDB(BACKUP_STATE_KEY, state);
  } catch {
    // Ignore backup failure
  }
}

/**
 * Asynchronously retrieve full state from IndexedDB (with complete files).
 * If new database is empty, automatically checks legacy database for seamless migration.
 */
export async function loadFullPersistedState(): Promise<AppState | null> {
  try {
    const fromDB = await loadFromIndexedDB(CURRENT_STATE_KEY);
    if (fromDB && typeof fromDB === 'object') {
      return fromDB as AppState;
    }
    const fromBackup = await loadFromIndexedDB(BACKUP_STATE_KEY);
    if (fromBackup && typeof fromBackup === 'object') {
      return fromBackup as AppState;
    }

    // Seamless migration: Check legacy IndexedDB
    const fromLegacy = await loadFromLegacyIndexedDB();
    if (fromLegacy && typeof fromLegacy === 'object') {
      console.info(`[StorageEngine] Seamlessly migrated previous data into ${DB_NAME}`);
      await saveToIndexedDB(CURRENT_STATE_KEY, fromLegacy);
      safeSaveToLocalStorage(fromLegacy);
      return fromLegacy as AppState;
    }
  } catch (e) {
    console.warn('[StorageEngine] Error reading full persisted state from IndexedDB:', e);
  }
  return null;
}
