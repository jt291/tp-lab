/**
 * Utility functions for handling mathematical operations.
 * 
 * @module
 * @category Utilities
 */

import { nanoid } from 'nanoid'; // Unique ID generator

/** 
 * Guarantees the returned value is between a minimum and maximum number. 
 * @param value - The number to clamp
 * @param min - The minimum allowable value
 * @param max - The maximum allowable value
 * @returns The clamped value
 * 
 * @example
 * ```ts
 * const clamped = clamp(15, 1, 10);
 * // Returns: 10
 * ```
 * @example
 * ```ts
 * const clamped = clamp(-5, 0, 100);
 * // Returns: 0
 * ```
 * @example
 * ```ts
 * const clamped = clamp(50, 0, 100);
 * // Returns: 50
 * ```
 */
export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Generates a random integer within the specified range (inclusive).
 * 
 * @param value - A random value between 0 and 1 (typically from Math.random())
 * @param min - The minimum value of the range (inclusive)
 * @param max - The maximum value of the range (inclusive)
 * @returns A random integer between min and max (inclusive)
 * 
 * @example
 * ```ts
 * const random = clampRandom(Math.random(), 1, 10);
 * // Returns a random integer between 1 and 10
 * ```
 */
export function clampRandom(value: number, min: number, max: number) {
  return Math.floor(value * (max - min + 1)) + min;
}

/** 
 * Creates a unique identifier with an optional prefix. 
 * 
 * @param prefix - An optional prefix for the ID
 * @returns A unique identifier string
 * 
 * @example
 * ```ts
 * const id = createId('item-');
 * // Returns: 'item-<unique-id>'
 * ```
 * @example
 * ```ts
 * const id = createId();
 * // Returns: '<unique-id>'
 * ```
 */
export function createId(prefix = '') {
  return prefix + nanoid();
}

/** 
 * Generates a random integer between min and max.
 * 
 * @param min - The minimum integer value (inclusive)
 * @param max - The maximum integer value (inclusive)
 * @returns A random integer between min and max
 * 
 * @example
 * ```ts
 * const randomInt = randomInteger(1, 10);
 * // Returns a random integer between 1 and 10
 * ```
 */
export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 
 * Returns a function that generates a pseudo-random number between 0 and 1 each time it is called. 
 * 
 * @param seed - The initial seed value
 * @returns A function that generates pseudo-random numbers between 0 and 1
 * 
 * @example
 * ```ts
 * const randomGen = seededNumberGenerator(123);
 * const num1 = randomGen(); // e.g., 0.4567
 * const num2 = randomGen(); // e.g., 0.8910
 * ```
 */
export function seededNumberGenerator(seed: number) {
  let currentSeed = seed;
  return () => {
    currentSeed = Math.sin(currentSeed) * 10000;
    currentSeed -= Math.floor(currentSeed);
    return currentSeed;
  };
}
