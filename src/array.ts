import { range } from './iterator';

/**
 * swaps elements in the array in place
 * @param array
 * @param a first index
 * @param b second index
 */
export function swap<T> (array: T[], a: number, b: number): void {
  const temp = array[a];
  array[a] = array[b];
  array[b] = temp;
}

/**
 * shuffles Array
 * @param array array to be shuffled
 * @returns new shuffled array
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
 */
export function lastIndex (array: any[]): number {
  return array.length - 1;
}

/**
 * returns last element of an array
 */
export function last<T> (array: T[]): T {
  return array[lastIndex(array)];
}

/**
 * return random index from an array
 */
export function randomIndex (array: any[]): number {
  return Math.floor(Math.random() * array.length);
}

/**
 * creates new array populated with values from function
 * @param length length of the new array
 * @param callback value or function which returns value of every element
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
 * @param array
 * @param length final length of the array
 * @param callback value or function which returns value of every new element
 * @returns new array
 */
export function rightPad<T> (array: T[], length: number, fillValue: T): T[];
export function rightPad<T> (
  array: T[],
  length: number,
  callback: (index: number) => T
): T[];
export function rightPad<T> (
  array: T[],
  length: number,
  callback: T | ((index: number) => T)
): T[] {
  if (array.length >= length) return [...array];

  const delta = length - array.length;

  const padding =
    callback instanceof Function
      ? generate<T>(delta, callback)
      : generate(delta, callback);

  return [...array, ...padding];
}
