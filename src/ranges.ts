import { iter, Iter } from './iterator';

type R = Iter<number>;
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
export function range (start: number, end?: number, step?: number): R {
  if (end === undefined) {
    // if only start is specified, then go from 0 to "start"
    end = start;
    start = 0;
  }
  if (step === undefined) step = 1;

  const generator = function * (): Iterable<number> {
    if (step! < 0) {
      if (start < end!) {
        throw new Error(
          'when step is lower than 0, start must be larger than end'
        );
      }

      for (let i = start; i > end!; i += step!) yield i;
    } else {
      if (start > end!) throw new Error('start must be smaller than end');

      for (let i = start; i < end!; i += step!) yield i;
    }
  };

  return iter(generator());
}
