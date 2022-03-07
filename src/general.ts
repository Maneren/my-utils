/**
 * returns Promise, which resolves to null after specified number of miliseconds
 * may not work properly with times below 10 ms
 * @param {number} milis
 * @returns {Promise<null>}
 */
export async function sleep (milis: number): Promise<null> {
  return await new Promise((resolve) => setTimeout(() => resolve(null), milis));
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
  return max === undefined
    ? Math.floor(randfloat(min))
    : Math.floor(randfloat(min, max));
}

/**
 * maps values from Generator using callbackFn
 * @param {Generator<T>} generator generator to map
 * @param {(value:T) => U} callbackFn function to be called for every value from range
 * @returns {Generator<U>}
 * @template T, U
 */
export function * mapGenerator<T, U> (
  generator: Generator<T>,
  callbackFn: (value: T) => U
): Generator<U> {
  for (const value of generator) yield callbackFn(value);
}

/**
 * reduces values from Generator to one value via callbackFn
 * @param {Generator<U>} generator generator to reduce
 * @param {(total: T, value:U, index:number) => T} callbackFn function to be called for every value from range
 * @param {T} [total] starting value for total (default = 0)
 * @returns {T}
 * @template T, U
 */
export function reduceGenerator<T, U> (
  generator: Generator<U>,
  callbackFn: (total: T, value: U, index: number) => T,
  total: T
): T {
  let i = 0;
  for (const el of generator) {
    total = callbackFn(total, el, i);
    i++;
  }
  return total;
}

/**
 * reduces values from Generator to one array
 * @param {Generator<T>} generator generator to convert
 * @returns {T[]}
 * @template T
 */
export function generatorToArray<T> (generator: Generator<T>): T[] {
  const array: T[] = [];
  for (const el of generator) {
    array.push(el);
  }
  return array;
}
