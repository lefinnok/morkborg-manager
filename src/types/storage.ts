import type { Character } from './character';
import type { DMSession } from './session';

export type UserRole = 'player' | 'dm';

export interface UserPreferences {
  theme: 'light' | 'dark';
  autoRoll: boolean;
}

export interface UserData {
  lastRole: UserRole;
  preferences: UserPreferences;
}

export interface AppStorage {
  user: UserData;
  characters: Character[];
  sessions: DMSession[];
  version: string;
}
