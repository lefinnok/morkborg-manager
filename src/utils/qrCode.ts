import LZString from 'lz-string';
import type { Character } from '../types';

const QR_PREFIX = 'MB:';

export function compressCharacter(character: Character): string {
  const json = JSON.stringify(character);
  const compressed = LZString.compressToBase64(json);
  return QR_PREFIX + compressed;
}

export function decompressCharacter(data: string): Character | null {
  try {
    if (!data.startsWith(QR_PREFIX)) {
      throw new Error('Invalid QR code format');
    }

    const compressed = data.slice(QR_PREFIX.length);
    const json = LZString.decompressFromBase64(compressed);

    if (!json) {
      throw new Error('Failed to decompress data');
    }

    const character = JSON.parse(json) as Character;

    // Basic validation
    if (!character.id || !character.name || !character.class) {
      throw new Error('Invalid character data');
    }

    return character;
  } catch (error) {
    console.error('Error decompressing character:', error);
    return null;
  }
}
