import type { Character } from '../types/character';
import type { DMSession } from '../types/session';
import type { AppStorage, UserData, UserPreferences } from '../types/storage';
import type { DataService } from './DataService';

const STORAGE_KEY = 'morkborg_app_data';
const STORAGE_VERSION = '1.0.0';

const DEFAULT_STORAGE: AppStorage = {
  user: {
    lastRole: 'player',
    preferences: {
      theme: 'light',
      autoRoll: false,
    },
  },
  characters: [],
  sessions: [],
  version: STORAGE_VERSION,
};

export class LocalStorageService implements DataService {
  private getStorage(): AppStorage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.setStorage(DEFAULT_STORAGE);
        return DEFAULT_STORAGE;
      }
      const parsed = JSON.parse(stored) as AppStorage;

      // Version migration logic can go here in the future
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, using defaults');
        this.setStorage(DEFAULT_STORAGE);
        return DEFAULT_STORAGE;
      }

      return parsed;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return DEFAULT_STORAGE;
    }
  }

  private setStorage(data: AppStorage): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    const storage = this.getStorage();
    return storage.characters;
  }

  async getCharacterById(id: string): Promise<Character | null> {
    const storage = this.getStorage();
    return storage.characters.find(c => c.id === id) || null;
  }

  async createCharacter(character: Character): Promise<Character> {
    const storage = this.getStorage();
    const exists = storage.characters.some(c => c.id === character.id);

    if (exists) {
      throw new Error(`Character with id ${character.id} already exists`);
    }

    storage.characters.push(character);
    this.setStorage(storage);
    return character;
  }

  async updateCharacter(character: Character): Promise<Character> {
    const storage = this.getStorage();
    const index = storage.characters.findIndex(c => c.id === character.id);

    if (index === -1) {
      throw new Error(`Character with id ${character.id} not found`);
    }

    character.updatedAt = new Date().toISOString();
    storage.characters[index] = character;
    this.setStorage(storage);
    return character;
  }

  async deleteCharacter(id: string): Promise<void> {
    const storage = this.getStorage();
    storage.characters = storage.characters.filter(c => c.id !== id);
    this.setStorage(storage);
  }

  // Session operations
  async getAllSessions(): Promise<DMSession[]> {
    const storage = this.getStorage();
    return storage.sessions;
  }

  async getSessionById(id: string): Promise<DMSession | null> {
    const storage = this.getStorage();
    return storage.sessions.find(s => s.id === id) || null;
  }

  async createSession(session: DMSession): Promise<DMSession> {
    const storage = this.getStorage();
    const exists = storage.sessions.some(s => s.id === session.id);

    if (exists) {
      throw new Error(`Session with id ${session.id} already exists`);
    }

    storage.sessions.push(session);
    this.setStorage(storage);
    return session;
  }

  async updateSession(session: DMSession): Promise<DMSession> {
    const storage = this.getStorage();
    const index = storage.sessions.findIndex(s => s.id === session.id);

    if (index === -1) {
      throw new Error(`Session with id ${session.id} not found`);
    }

    session.updatedAt = new Date().toISOString();
    storage.sessions[index] = session;
    this.setStorage(storage);
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    const storage = this.getStorage();
    storage.sessions = storage.sessions.filter(s => s.id !== id);
    this.setStorage(storage);
  }

  // User preferences
  async getUserData(): Promise<UserData> {
    const storage = this.getStorage();
    return storage.user;
  }

  async updateUserData(userData: Partial<UserData>): Promise<UserData> {
    const storage = this.getStorage();
    storage.user = { ...storage.user, ...userData };
    this.setStorage(storage);
    return storage.user;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const storage = this.getStorage();
    storage.user.preferences = { ...storage.user.preferences, ...preferences };
    this.setStorage(storage);
    return storage.user.preferences;
  }
}

// Export a singleton instance
export const localStorageService = new LocalStorageService();
