import type { Character } from '../types/character';
import type { DMSession } from '../types/session';
import type { UserData, UserPreferences } from '../types/storage';

export interface DataService {
  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacterById(id: string): Promise<Character | null>;
  createCharacter(character: Character): Promise<Character>;
  updateCharacter(character: Character): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;

  // Session operations
  getAllSessions(): Promise<DMSession[]>;
  getSessionById(id: string): Promise<DMSession | null>;
  createSession(session: DMSession): Promise<DMSession>;
  updateSession(session: DMSession): Promise<DMSession>;
  deleteSession(id: string): Promise<void>;

  // User preferences
  getUserData(): Promise<UserData>;
  updateUserData(userData: Partial<UserData>): Promise<UserData>;
  updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences>;
}
