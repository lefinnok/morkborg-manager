import { rollDice, rollD6, rollD8, rollD2 } from './dice';
import type { Abilities } from '../types';
import { contentService } from '../services';

export function generateName(): string {
  const tables = contentService.getTables();
  const row = rollD6() - 1;
  const col = rollD8() - 1;
  return tables.names[row][col];
}

export function generateTraits(): string[] {
  const tables = contentService.getTables();
  const traits = tables.terribleTraits;

  const trait1 = rollDice(20) - 1;
  let trait2 = rollDice(20) - 1;
  while (trait2 === trait1) {
    trait2 = rollDice(20) - 1;
  }
  return [traits[trait1], traits[trait2]];
}

export function generateBody(): string {
  const tables = contentService.getTables();
  return tables.brokenBodies[rollDice(20) - 1];
}

export function generateHabit(): string {
  const tables = contentService.getTables();
  return tables.badHabits[rollDice(20) - 1];
}

// Parse dice notation and roll
function parseDiceNotation(notation: string): number {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) {
    // Just a number
    if (notation.includes('*')) {
      const parts = notation.split('*');
      return parseInt(parts[0]) * parseInt(parts[1]);
    }
    return parseInt(notation) || 0;
  }

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  return rollDice(sides, count, modifier);
}

// Generate abilities based on class definition
export function generateAbilitiesFromClass(classId: string): Abilities {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  return {
    strength: parseDiceNotation(classDef.abilityRolls.strength),
    agility: parseDiceNotation(classDef.abilityRolls.agility),
    presence: parseDiceNotation(classDef.abilityRolls.presence),
    toughness: parseDiceNotation(classDef.abilityRolls.toughness),
  };
}

// Generate HP
export function generateHPFromClass(classId: string, toughness: number): number {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  const hitDieValue = parseDiceNotation(classDef.hitDie);
  return toughness + hitDieValue;
}

// Generate Omens
export function generateOmensFromClass(classId: string): number {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  return parseDiceNotation(classDef.startingOmens);
}

// Generate starting silver
export function generateSilverFromClass(classId: string): number {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  return parseDiceNotation(classDef.startingSilver);
}

// Legacy functions for backward compatibility
export function generateAbilities(characterClass: string): Abilities {
  return generateAbilitiesFromClass(characterClass);
}

export function generateHP(characterClass: string, toughness: number): number {
  return generateHPFromClass(characterClass, toughness);
}

export function generateOmens(): number {
  return rollD2();
}

export function generateSilver(): number {
  return rollDice(6, 2) * 10;
}
