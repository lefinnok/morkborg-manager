// Game content type definitions for data-driven system

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface ClassDefinition {
  id: string;
  name: string;
  description: string;
  abilityRolls: {
    strength: string;
    agility: string;
    presence: string;
    toughness: string;
  };
  hitDie: string;
  startingOmens: string;
  startingSilver: string;
  specialAbilities: SpecialAbility[]; // 6 abilities to roll/choose from
  passiveAbilities?: SpecialAbility[]; // Always-on abilities for the class
  limitations?: string[];
}

export interface WeaponDefinition {
  id: string;
  name: string;
  type: 'melee' | 'ranged';
  damage: string;
  description: string;
}

export interface ArmorDefinition {
  id: string;
  name: string;
  tier: number;
  damageReduction: string;
  drModifier?: number; // For tier 2 and 3 armor
  agilityModifier?: number; // For tier 2 and 3 armor
  description: string;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  weight: number;
  silver: number;
}

export interface EquipmentContent {
  weapons: WeaponDefinition[];
  armor: ArmorDefinition[];
  items: ItemDefinition[];
}

export interface PowerDefinition {
  id: string;
  name: string;
  type: 'sacred' | 'unclean';
  description: string;
  cost: string;
}

export interface RandomTables {
  names: string[][];
  terribleTraits: string[];
  brokenBodies: string[];
  badHabits: string[];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  hp: string;
  morale: number;
  armor: string;
  attack: string;
  special: string;
}

export interface GameContent {
  classes: ClassDefinition[];
  equipment: EquipmentContent;
  powers: PowerDefinition[];
  tables: RandomTables;
  enemies: EnemyDefinition[];
  version: string;
  custom: boolean;
}

export interface ContentMetadata {
  version: string;
  name: string;
  author?: string;
  description?: string;
}
