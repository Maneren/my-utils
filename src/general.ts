/**
 * returns Promise, which resolves to `null`
 * after at least the specified number of miliseconds
 */
export async function sleep (milis: number): Promise<null> {
  return await new Promise(resolve => setTimeout(() => resolve(null), milis));
}

/**
 * returns random float from min to max.
 * if only min is specified, it returns float from 0 to min
 * @param min lower bound (inclusive)
 * @param max upper bound (exclusive)
 */
export function randfloat (min: number): number;
export function randfloat (min: number, max: number): number;
export function randfloat (min: number, max?: number): number;
export function randfloat (min: number, max?: number): number {
  // if max is not specified treat min as max
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (min > max) {
    throw new Error('lower bound must be smaller than upper bound');
  }

  if (min === max) {
    return min;
  }

  return min + Math.random() * (max - min);
}

/**
 * returns random integer from min to max.
 * if only min is specified, it returns integer from 0 to min
 * @param min lower bound (inclusive)
 * @param max upper bound (exclusive)
 */
export function randint (min: number): number;
export function randint (min: number, max: number): number;
export function randint (min: number, max?: number): number;
export function randint (min: number, max?: number): number {
  return Math.floor(randfloat(min, max));
}
