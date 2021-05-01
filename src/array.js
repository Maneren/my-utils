const Range = require('./range');

class Array {
  /**
   * swaps elements in the array (mutates original)
   * @param {Array} array
   * @param {number} a first index
   * @param {number} b second index
   */
  static swap (array, a, b) {
    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
  }

  /**
   * creates deepcopy of array.
   * works only for primitive values in nested arrays
   * @param {T} array
   * @returns {T} deep copy of array
   * @template T
   */
  static deepCopy (array) {
    return array.map(el => (el instanceof Array) ? Array.deepCopy(el) : el);
  }

  /**
   * shuffles Array
   * @param {T[]} shuffled array to be shuffled
   * @returns {T[]} new shuffled array
   * @template T
   */
  static shuffle (array) {
    const shuffled = [...array];
    for (let i = 0; i < shuffled.length * 2; i++) {
      const a = Array.randomIndex(shuffled);
      const b = Array.randomIndex(shuffled);
      Array.swap(shuffled, a, b);
    }
    return shuffled;
  }

  /**
   * returns last index of an array
   * @param {Array} array
   * @returns {Number}
   */
  static lastI (array) {
    return array.length - 1;
  }

  /**
   * returns last element of an array
   * @param {T[]} array
   * @returns {T}
   * @template T
   */
  static last (array) {
    return array[Array.lastI(array)];
  }

  /**
   * return random index from an array
   * @param {Array} array
   * @returns {Number}
   */
  static randomIndex (array) {
    return Math.floor(Math.random() * array.length);
  }

  /**
   * creates new array populated with values from function
   * @param {Number} length length of the new array
   * @param {T | (index:number) => T} [callbackFn] value or function which returns value of every element
   * @returns {T[]}
   * @template T
   */
  static generateArr (length, callbackFn = undefined) {
    const { range, mapRng } = Range;

    if (!(callbackFn instanceof Function)) {
      return mapRng(range(length), () => callbackFn);
    }

    return mapRng(range(length), callbackFn);
  }

  /**
   * return new array extended to specified length (but not shortened if longer)
   * @param {T[]} array
   * @param {number} length final length of the array
   * @param {(U | (index:number) => U)} [callback] value or function which returns value of every new element
   * @returns {(T | U)[]} new array
   * @template T, U
   */
  static rightPadArray (array, length, callback) {
    if (array.length > length) return [...array];
    return [
      ...array,
      ...Array.generateArr(length - array.length, callback)
    ];
  }
}

module.exports = Array;
