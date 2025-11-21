export type CalendarDie = 'd100' | 'd20' | 'd10' | 'd6' | 'd2';

export interface CalendarState {
  miseriesOccurred: number[]; // Array of misery indices that have occurred
  currentDie: CalendarDie;
  miseriesCount: number;
}

export interface SessionCharacter {
  characterId: string;
  initiative: number;
  statusNotes: string;
}

// Enemy Statblock - reusable template for enemy types
export interface EnemyStatblock {
  id: string;
  name: string;
  hp: string; // e.g., "d8", "2d6+2"
  morale: number;
  armor: string; // e.g., "-d2", "none"
  attack: string; // e.g., "d6" or "2d4"
  special: string; // Special abilities/notes
  createdAt: string;
}

// Enemy Instance - specific enemy in combat
export interface EnemyInstance {
  id: string;
  statblockId: string; // References EnemyStatblock
  name: string; // Can customize name (e.g., "Goblin 1")
  currentHP: number;
  maxHP: number;
  initiative: number;
  statusNotes: string;
}

export interface DMSession {
  id: string;
  name: string;
  notes: string;
  calendarState: CalendarState;
  characters: SessionCharacter[];
  enemyStatblocks: EnemyStatblock[]; // Reusable enemy templates
  enemies: EnemyInstance[]; // Active enemies in session
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
