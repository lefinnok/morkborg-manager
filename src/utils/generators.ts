import { rollDice, rollD6, rollD8, rollD2, rollDiceDetailed, type DiceRollResult } from './dice';
import type { Abilities } from '../types';
import { contentService } from '../services';

export interface GeneratorResult {
  value: number;
  rolls: DiceRollResult[];
  formula: string;
  description: string;
}

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
  // Handle multiplication (e.g., "2d6*10")
  if (notation.includes('*')) {
    const parts = notation.split('*');
    const diceResult = parseDiceNotation(parts[0].trim());
    const multiplier = parseInt(parts[1].trim());
    return diceResult * multiplier;
  }

  // Match dice notation: "3d6+2", "d8", "1d10", etc.
  const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/);
  if (!match) {
    // Just a number
    return parseInt(notation) || 0;
  }

  const count = match[1] ? parseInt(match[1]) : 1; // Default to 1 if no count (e.g., "d8")
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  return rollDice(sides, count, modifier);
}

// Parse dice notation and return detailed results
function parseDiceNotationDetailed(notation: string, description: string = ''): GeneratorResult {
  const rolls: DiceRollResult[] = [];

  // Handle multiplication (e.g., "2d6*10")
  if (notation.includes('*')) {
    const parts = notation.split('*');
    const match = parts[0].trim().match(/(\d*)d(\d+)([+-]\d+)?/);
    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1;
      const sides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;
      const rollResult = rollDiceDetailed(sides, count, modifier);
      rolls.push(rollResult);

      const multiplier = parseInt(parts[1].trim());
      const value = rollResult.total * multiplier;

      return {
        value,
        rolls,
        formula: `${notation} = (${rollResult.total}) × ${multiplier}`,
        description,
      };
    }
  }

  // Match dice notation: "3d6+2", "d8", "1d10", etc.
  const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/);
  if (!match) {
    // Just a number
    const value = parseInt(notation) || 0;
    return {
      value,
      rolls: [],
      formula: notation,
      description,
    };
  }

  const count = match[1] ? parseInt(match[1]) : 1;
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  const rollResult = rollDiceDetailed(sides, count, modifier);
  rolls.push(rollResult);

  return {
    value: rollResult.total,
    rolls,
    formula: notation,
    description,
  };
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

// Detailed generator functions
export function generateAbilityDetailed(classId: string, abilityName: keyof Abilities): GeneratorResult {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  const formula = classDef.abilityRolls[abilityName];
  return parseDiceNotationDetailed(formula, `${abilityName.charAt(0).toUpperCase() + abilityName.slice(1)}`);
}

export function generateHPDetailed(classId: string, toughnessModifier: number): GeneratorResult {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  const hitDieResult = parseDiceNotationDetailed(classDef.hitDie, 'Hit Die');
  const value = hitDieResult.value + toughnessModifier;

  return {
    value,
    rolls: hitDieResult.rolls,
    formula: `${classDef.hitDie} + Toughness (${toughnessModifier >= 0 ? '+' : ''}${toughnessModifier})`,
    description: 'Hit Points',
  };
}

export function generateOmensDetailed(classId: string): GeneratorResult {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  return parseDiceNotationDetailed(classDef.startingOmens, 'Omens');
}

export function generateSilverDetailed(classId: string): GeneratorResult {
  const classDef = contentService.getClass(classId);
  if (!classDef) {
    throw new Error(`Class ${classId} not found`);
  }

  return parseDiceNotationDetailed(classDef.startingSilver, 'Silver');
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
