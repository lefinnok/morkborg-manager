// CharacterClass is now just a string to support custom classes from JSON
export type CharacterClass = string;

export interface Abilities {
  agility: number;
  presence: number;
  strength: number;
  toughness: number;
}

export interface HpOmens {
  currentHP: number;
  maxHP: number;
  currentOmens: number;
  maxOmens: number;
  currentPowers: number;
  maxPowers: number;
}

export interface CurrentState {
  tempHP: number;
  tempAgility: number;
  tempPresence: number;
  tempStrength: number;
  tempToughness: number;
  isDead: boolean;
  lastRestored: string; // ISO timestamp
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  quantity: number;
  silver: number;
}

export interface Armor {
  name: string;
  tier: number;
  damageReduction: string;
  drModifier?: number;
  agilityModifier?: number;
}

export interface Weapon {
  name: string;
  damage: string;
  type: 'melee' | 'ranged';
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  abilities: Abilities;
  hpOmens: HpOmens;
  currentState: CurrentState;
  silver: number;
  infected: boolean;
  ammo: number;
  notes: string;
  selectedAbilities: string[]; // Array of ability names selected from class specialAbilities
  equipment: Equipment[];
  armor: Armor | null;
  weapon: Weapon | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
