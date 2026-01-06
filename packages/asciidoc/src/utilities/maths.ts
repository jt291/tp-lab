import { nanoid } from 'nanoid';

/** Guarantees the returned value is between a minimum and maximum number. */
export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Generates a random integer within a specified range by clamping a normalized value.
 * 
 * @param value - A normalized value (typically between 0 and 1) used as the basis for random generation
 * @param min - The minimum value of the range (inclusive)
 * @param max - The maximum value of the range (inclusive)
 * @returns A random integer between min and max (inclusive)
 * 
 * @example
 * ```typescript
 * // Generate a random number between 1 and 10
 * const random = clampRandom(Math.random(), 1, 10);
 * ```
 */
export function clampRandom(value: number, min: number, max: number) {
  return Math.floor(value * (max - min + 1)) + min;
}

/** Crée un identifiant unique avec un préfixe facultatif. */
export function createId(prefix = '') {
  return prefix + nanoid();
}

/** Génère un nombre entier aléatoire compris entre min et max. */
export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Renvoie une fonction qui génère un nombre pseudo-aléatoire entre 0 et 1 chaque fois qu'elle est appelée. */
export function seededNumberGenerator(seed: number) {
  let currentSeed = seed;
  return () => {
    currentSeed = Math.sin(currentSeed) * 10000;
    currentSeed -= Math.floor(currentSeed);
    return currentSeed;
  };
}
