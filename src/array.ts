import { range } from './iterator';

/**
 * swaps elements in the array (mutates original)
 * @param {T[]} array
 * @param {number} a first index
 * @param {number} b second index
 */
export function swap<T> (array: T[], a: number, b: number): void {
  const temp = array[a];
  array[a] = array[b];
  array[b] = temp;
}

/**
 * shuffles Array
 * @param {T[]} array array to be shuffled
 * @returns {T[]} new shuffled array
 * @template T
 */
export function shuffle<T> (array: T[]): T[] {
  const shuffled = [...array];
  for (const _ of range(shuffled.length * 2)) {
    const a = randomIndex(shuffled);
    const b = randomIndex(shuffled);
    swap(shuffled, a, b);
  }
  return shuffled;
}

/**
 * returns last index of an array
 * @param {A} array
 * @returns {Number}
 */
export function lastIndex (array: any[]): number {
  return array.length - 1;
}

/**
 * returns last element of an array
 * @param {T[]} array
 * @returns {T}
 * @template T
 */
export function last<T> (array: T[]): T {
  return array[lastIndex(array)];
}

/**
 * return random index from an array
 * @param {A} array
 * @returns {Number}
 */
export function randomIndex (array: any[]): number {
  return Math.floor(Math.random() * array.length);
}

/**
 * creates new array populated with values from function
 * @param {Number} length length of the new array
 * @param {T | (index:number) => T} [callback] value or function which returns value of every element
 * @returns {T[]}
 * @template T
 */
export function generate<T> (length: number, fillValue: T): T[];
export function generate<T> (
  length: number,
  callback: (index: number) => T
): T[];
export function generate<T> (
  length: number,
  callback: T | ((index: number) => T)
): T[] {
  if (length <= 0) throw new Error("length can't be less than 1");

  const isFunction = callback instanceof Function;

  const array = range(length)
    .map((i) => (isFunction ? callback(i) : callback))
    .collect();

  return array;
}

/**
 * return new array extended to specified length (but not shortened if longer)
 * @param {T[]} array
 * @param {number} length final length of the array
 * @param {(U | (index:number) => U)} [callback] value or function which returns value of every new element
 * @returns {(T | U)[]} new array
 * @template T, U
 */
export function rightPad<T, U> (
  array: T[],
  length: number,
  fillValue: U
): Array<T | U>;
export function rightPad<T, U> (
  array: T[],
  length: number,
  callback: (index: number) => U
): Array<T | U>;
export function rightPad<T, U> (
  array: T[],
  length: number,
  callback: U | ((index: number) => U)
): Array<T | U> {
  if (array.length > length) return [...array];

  const delta = length - array.length;

  const padding =
    callback instanceof Function
      ? generate<U>(delta, callback)
      : generate(delta, callback);

  return [...array, ...padding];
}
