class General {
  /**
   * returns Promise, which resolves to null after specified number of miliseconds
   * may not work properly with times below 10 ms
   * @param {number} milis
   * @returns {Promise<null>}
   */
  static sleep (milis) {
    return new Promise(resolve => setTimeout(() => resolve(null), milis));
  }

  /**
   * returns random integer from min to max.
   * if only min is specified, it returns integer from 0 to min
   * @param {number} min lower bound (inclusive)
   * @param {number} [max] upper bound (exclusive)
   * @returns {number}
   */
  static randint (min, max) {
    if (max === undefined) return Math.round(Math.random() * min); // if max is not specified treat min as max
    else return Math.ceil(min + (Math.random() * (max - min)));
  }

  /**
   * returns random float from min to max.
   * if only min is specified, it returns float from 0 to min
   * @param {number} min lower bound (inclusive)
   * @param {number} [max] upper bound (exclusive)
   * @returns {number}
   */
  static randfloat (min, max) {
    if (max === undefined) return Math.random() * min; // if max is not specified treat min as max
    else return min + (Math.random() * (max - min));
  }

  /**
   * maps values from Generator using callbackFn
   * @param {Generator<any, any, U>} generator generator to map
   * @param {(value:U) => T} callbackFn function to be called for every value from range
   * @returns {T[]}
   * @template T, U
   */
  static * mapGenerator (generator, callbackFn) {
    while (true) {
      const next = generator.next();
      if (next.done) return;
      yield callbackFn(next.value);
    }
  }
}
export default General;
