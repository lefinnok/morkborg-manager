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

export interface DMSession {
  id: string;
  name: string;
  notes: string;
  calendarState: CalendarState;
  characters: SessionCharacter[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
