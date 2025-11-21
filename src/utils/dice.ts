export interface DiceRollResult {
  rolls: number[];
  sides: number;
  count: number;
  modifier: number;
  subtotal: number;
  total: number;
  notation: string;
}

export function rollDice(sides: number, count: number = 1, modifier: number = 0): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total + modifier;
}

export function rollDiceDetailed(sides: number, count: number = 1, modifier: number = 0): DiceRollResult {
  const rolls: number[] = [];
  let subtotal = 0;
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    subtotal += roll;
  }
  const total = subtotal + modifier;
  const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
  const notation = `${count}d${sides}${modStr}`;

  return {
    rolls,
    sides,
    count,
    modifier,
    subtotal,
    total,
    notation,
  };
}

export function roll3d6(modifier: number = 0): number {
  return rollDice(6, 3, modifier);
}

export function rollD2(): number {
  return rollDice(2, 1);
}

export function rollD6(): number {
  return rollDice(6, 1);
}

export function rollD8(): number {
  return rollDice(8, 1);
}

export function rollD10(): number {
  return rollDice(10, 1);
}

export function rollD20(): number {
  return rollDice(20, 1);
}

export function abilityScoreToModifier(score: number): number {
  if (score <= 4) return -3;
  if (score <= 6) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 14) return +1;
  if (score <= 16) return +2;
  if (score <= 18) return +3;
  if (score <= 20) return +4;
  if (score <= 22) return +5;
  return +6;
}

export function formatModifier(modifier: number): string {
  if (modifier >= 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}
