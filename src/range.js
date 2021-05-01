class Range {
  /**
   * @typedef {Generator<T = number,void,null>} Range
   */

  /**
   * returns generator, which yields numbers from min to max with defined step
   * if only min is specified, it yields numbers from 0 to min
   * @param {number} start lower bound (inclusive)
   * @param {number} end upper bound (exclusive)
   * @param {number} step
   * @returns {Range}
   */
  static * range (start, end, step) {
    if (
      start === undefined &&
      end === undefined &&
      step === undefined
    ) throw new Error('no arguments');

    if (end === undefined) {
      // if only start is specified, then go from 0 to "start"
      end = start;
      start = 0;
    }
    if (step === undefined) step = 1;
    if (
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      typeof step !== 'number'
    ) throw new TypeError(`invalid arguments: "${[...arguments].join(',')}"`);

    if (step < 0) {
      if (start < end) throw new Error('when step is lower than 0, start must be larger than end');

      for (let i = start; i > end; i += step) yield i;
    } else {
      if (start > end) throw new Error('start must be smaller than end');

      for (let i = start; i < end; i += step) yield i;
    }
  }

  /**
   * maps values from Range to array via callbackFn
   * @param {Range} range range to map
   * @param {(value:number, index:number) => T} callbackFn function to be called for every value from range
   * @returns {T[]}
   * @template T
   */
  static mapRng (range, callbackFn) {
    const { mapGenerator } = require('./general');
    const result = [];
    for (const value of mapGenerator(range, callbackFn)) result.push(value);
    return result;
  }

  /**
   * reduces values from Range to one value via callbackFn
   * @param {Range} range range to map
   * @param {(total: T, value:number, index:number) => (T|U)} callbackFn function to be called for every value from range
   * @param {U} [total] starting value for total (default = 0)
   * @returns {(T|U)}
   * @template T, U
   */
  static reduceRng (range, callbackFn, total = 0) {
    let i = 0;
    for (const el of range) {
      total = callbackFn(total, el, i);
      i++;
    }
    return total;
  }
}

module.exports = Range;
