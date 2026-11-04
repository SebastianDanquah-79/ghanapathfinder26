type CachedValue<T> = {
  key: string;
  savedAt: number;
  value: T;
};

const DB_NAME = "ghanapathfinder-public-data";
const STORE_NAME = "responses";
const DB_VERSION = 1;
const DATA_SAVER_KEY = "gpf:data-saver";
const DATA_SAVER_MAX_AGE = 12 * 60 * 60 * 1000;

let databasePromise: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return databasePromise;
}

async function readCachedValue<T>(key: string): Promise<CachedValue<T> | null> {
  try {
    const database = await openDatabase();
    if (!database) return null;
    return await new Promise((resolve) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as CachedValue<T> | undefined) ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function writeCachedValue<T>(key: string, value: T): Promise<void> {
  try {
    const database = await openDatabase();
    if (!database) return;
    await new Promise<void>((resolve) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({ key, savedAt: Date.now(), value } satisfies CachedValue<T>);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    });
  } catch {
    // Caching is an enhancement. It must never make an online catalogue request fail.
  }
}

function shouldPreferCachedData(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DATA_SAVER_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Network-first cache for public education reference data only.
 * In Data Saver mode, a recent cached response is used for up to 12 hours.
 * Offline requests always fall back to the most recently saved response.
 * Never use this helper for account, result, application or mentorship data.
 */
export async function withOfflinePublicCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = await readCachedValue<T>(key);
  const online = typeof navigator === "undefined" || navigator.onLine !== false;

  if (!online && cached) return cached.value;
  if (cached && shouldPreferCachedData() && Date.now() - cached.savedAt < DATA_SAVER_MAX_AGE) {
    return cached.value;
  }

  try {
    const fresh = await fetcher();
    await writeCachedValue(key, fresh);
    return fresh;
  } catch (error) {
    if (cached) return cached.value;
    throw error;
  }
}

export function setDataSaverPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DATA_SAVER_KEY, enabled ? "true" : "false");
    navigator.serviceWorker?.controller?.postMessage({ type: "SET_DATA_SAVER", enabled });
  } catch {
    // The preference is optional on browsers with restricted storage.
  }
}

export function getDataSaverPreference(): boolean {
  return shouldPreferCachedData();
}
