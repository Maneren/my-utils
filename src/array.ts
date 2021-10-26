class A {
  /**
   * swaps elements in the array (mutates original)
   * @param {T[]} array
   * @param {number} a first index
   * @param {number} b second index
   */
  static swap<T>(array: T[], a: number, b: number): void {
    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
  }

  /**
   * shuffles Array
   * @param {T[]} shuffled array to be shuffled
   * @returns {T[]} new shuffled array
   * @template T
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = 0; i < shuffled.length * 2; i++) {
      const a = A.randomIndex(shuffled);
      const b = A.randomIndex(shuffled);
      A.swap(shuffled, a, b);
    }
    return shuffled;
  }

  /**
   * returns last index of an array
   * @param {A} array
   * @returns {Number}
   */
  static lastIndex (array: any[]): number {
    return array.length - 1;
  }

  /**
   * returns last element of an array
   * @param {T[]} array
   * @returns {T}
   * @template T
   */
  static last<T>(array: T[]): T {
    return array[A.lastIndex(array)];
  }

  /**
   * return random index from an array
   * @param {A} array
   * @returns {Number}
   */
  static randomIndex (array: any[]): number {
    return Math.floor(Math.random() * array.length);
  }

  /**
   * creates new array populated with values from function
   * @param {Number} length length of the new array
   * @param {T | (index:number) => T} [callback] value or function which returns value of every element
   * @returns {T[]}
   * @template T
   */
  static generate<T>(length: number, fillValue: T): T[];
  static generate<T>(length: number, callback: (index: number) => T): T[];
  static generate<T>(
    length: number,
    callback: T | ((index: number) => T)
  ): T[] {
    if (length <= 0) throw new Error("length can't be less than 1");

    const array = new Array<T>(length);

    for (let i = 0; i < length; i++) {
      callback instanceof Function
        ? array[i] = callback(i)
        : array[i] = callback;
    }

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
  static rightPad<T, U>(array: T[], length: number, fillValue: U): Array<T | U>;
  static rightPad<T, U>(
    array: T[],
    length: number,
    callback: (index: number) => U
  ): Array<T | U>;
  static rightPad<T, U>(
    array: T[],
    length: number,
    callback: U | ((index: number) => U)
  ): Array<T | U> {
    if (array.length > length) return [...array];

    const delta = length - array.length;

    const padding =
      callback instanceof Function
        ? A.generate<U>(delta, callback)
        : A.generate(delta, callback);

    return [...array, ...padding];
  }
}

export default A;
