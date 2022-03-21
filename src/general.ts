/**
 * returns Promise, which resolves to null after specified number of miliseconds
 * may not work properly with times below 10 ms
 * @param {number} milis
 * @returns {Promise<null>}
 */
export async function sleep (milis: number): Promise<null> {
  return await new Promise((resolve) =>
    setTimeout(() => resolve(null), milis)
  );
}

/**
 * returns random float from min to max.
 * if only min is specified, it returns float from 0 to min
 * @param {number} min lower bound (inclusive)
 * @param {number} [max] upper bound (exclusive)
 * @returns {number}
 */
export function randfloat (min: number): number;
export function randfloat (min: number, max: number): number;
export function randfloat (min: number, max?: number): number {
  // if max is not specified treat min as max
  if (max === undefined) {
    max = min;
    min = 0;
  }
  if (min > max) {
    throw new Error('lower bound must be smaller than upper bound');
  }

  return min + Math.random() * (max - min);
}

/**
 * returns random integer from min to max.
 * if only min is specified, it returns integer from 0 to min
 * @param {number} min lower bound (inclusive)
 * @param {number} [max] upper bound (exclusive)
 * @returns {number}
 */
export function randint (min: number): number;
export function randint (min: number, max: number): number;
export function randint (min: number, max?: number): number {
  return Math.floor(max === undefined ? randfloat(min) : randfloat(min, max));
}
