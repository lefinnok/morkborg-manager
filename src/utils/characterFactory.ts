import { v4 as uuidv4 } from 'uuid';
import type { Character, CharacterClass } from '../types';
import { generateAbilities, generateHP, generateOmens, generateSilver } from './generators';
import { abilityScoreToModifier } from './dice';

export function createEmptyCharacter(characterClass: CharacterClass, name: string): Character {
  const abilities = generateAbilities(characterClass);
  const maxHP = generateHP(characterClass, abilityScoreToModifier(abilities.toughness));
  const maxOmens = generateOmens();
  const silver = generateSilver();

  return {
    id: uuidv4(),
    name,
    class: characterClass,
    abilities,
    hpOmens: {
      currentHP: maxHP,
      maxHP,
      currentOmens: maxOmens,
      maxOmens,
      currentPowers: 0,
      maxPowers: 0,
    },
    currentState: {
      tempHP: 0,
      tempAgility: 0,
      tempPresence: 0,
      tempStrength: 0,
      tempToughness: 0,
      isDead: false,
      lastRestored: new Date().toISOString(),
    },
    silver,
    infected: false,
    ammo: 0,
    notes: '',
    selectedAbilities: [],
    equipment: [],
    armor: null,
    weapon: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
