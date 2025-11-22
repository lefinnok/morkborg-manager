/**
 * Check if localStorage is available and accessible
 * iOS Safari blocks localStorage in private mode and with certain privacy settings
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * In-memory storage fallback for when localStorage is unavailable
 */
class InMemoryStorage implements Storage {
  private storage: Map<string, string> = new Map();

  get length(): number {
    return this.storage.size;
  }

  clear(): void {
    this.storage.clear();
  }

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.storage.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }
}

let storageInstance: Storage | null = null;

/**
 * Get safe storage instance - localStorage if available, in-memory fallback otherwise
 */
export function getSafeStorage(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  if (isLocalStorageAvailable()) {
    storageInstance = localStorage;
  } else {
    console.warn('localStorage not available, using in-memory storage (data will not persist)');
    storageInstance = new InMemoryStorage();
  }

  return storageInstance;
}
