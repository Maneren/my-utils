import * as General from './general';

type R = Generator<number>;
/**
 * returns generator, which yields numbers from min to max with defined step
 * if only min is specified, it yields numbers from 0 to min
 * @param {number} start lower bound (inclusive)
 * @param {number} end upper bound (exclusive)
 * @param {number} step
 * @returns {R}
 */
export function range (start: number): R;
export function range (start: number, end: number): R;
export function range (start: number, end: number, step: number): R;
export function * range (start: number, end?: number, step?: number): R {
  if (end === undefined) {
    // if only start is specified, then go from 0 to "start"
    end = start;
    start = 0;
  }
  if (step === undefined) step = 1;

  if (step < 0) {
    if (start < end) {
      throw new Error(
        'when step is lower than 0, start must be larger than end'
      );
    }

    for (let i = start; i > end; i += step) yield i;
  } else {
    if (start > end) throw new Error('start must be smaller than end');

    for (let i = start; i < end; i += step) yield i;
  }
}

/**
 * maps values from Range to array via callbackFn
 * @param {R<T>} range range to map
 * @param {(value:number) => T} callbackFn function to be called for every value from range
 * @returns {Generator<T>}
 * @template T
 */
export function * mapRange<T> (
  range: R,
  callbackFn: (value: number) => T
): Generator<T> {
  const { mapGenerator } = General;
  for (const value of mapGenerator(range, callbackFn)) yield value;
}

/**
 * reduces values from Range to one value via callbackFn
 * @param {R<T>} range range to map
 * @param {(total: T, value:number, index:number) => T} callbackFn function to be called for every value from range
 * @param {T} [total] starting value for total (default = 0)
 * @returns {T}
 * @template T
 */
export function reduceRange<T> (
  range: R,
  callbackFn: (total: T, value: number, index: number) => T,
  total: T
): T {
  const { reduceGenerator } = General;
  return reduceGenerator(range, callbackFn, total);
}

/**
 * reduces values from Range to one array
 * @param {R} range range to convert
 * @returns {number[]}
 */
export function rangeToArray (range: R): number[] {
  return General.generatorToArray(range);
}
