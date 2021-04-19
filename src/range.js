class Range {
  /**
   * @typedef {Generator<number,void,null>} Range
   */

  /**
   * returns generator, which yields numbers from min to max with defined step
   * if only min is specified, it yields numbers from 0 to min
   * @param {number} min lower bound (inclusive)
   * @param {number} [max] upper bound (exclusive)
   * @param {number} [step]
   * @returns {Range}
   */
  static * range (min, max, step) {
    if (max === undefined) for (let i = 0; i < min; i++) yield i; // if only min specified, then min is used as max
    else if (step === undefined) for (let i = min; i < max; i++) yield i;
    else for (let i = min; i < max; i += step) yield i;
  }

  /**
   * maps values from Range to values via callbackFn
   * @param {Range} range range to map
   * @param {(value:number, index:number) => T} callbackFn function to be called for every value from range
   * @returns {T[]}
   * @template T
   */
  static mapRng (range, callbackFn) {
    const result = [];
    let i = 0;
    while (true) {
      const next = range.next();
      if (next.done) return result;
      result.push(callbackFn(next.value, i));
      i++;
    }
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
export default Range;
