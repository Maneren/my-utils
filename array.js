import Range from './range';

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
   * @param {T[]} array array to be shuffled
   * @returns {T[]} new shuffled array
   * @template T
   */
  static shuffle (array) {
    for (let i = 0; i < array.length * 2; i++) {
      const a = Array.randomIndex(array);
      const b = Array.randomIndex(array);
      Array.swap(array, a, b);
    }
    return array;
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
   * @param {(index:number) => T} [callbackFn] function which is called for every element (default is undefined)
   * @returns {T[]}
   * @template T
   */
  static generateArr (length, callbackFn = _ => undefined) {
    const { range, mapRng } = Range;
    return mapRng(range(length), callbackFn);
  }

  /**
   * extends all arrays in array to specified length, calling the callback for every new element
   * @param {T[][]} array
   * @param {number} length length to which are the arrays going to be extended
   * @param {(index:number) => U} [callbackFn] function which is called for every new element (default is _ => undefined)
   * @returns {(T|U)[][]}
   * @template T, U
   */
  static toFixedLengthArr (array, length, callbackFn = _ => undefined) {
    return [
      ...array,
      ...Array.generateArr(length - array.length, callbackFn)
    ];
  }
}
export default Array;
