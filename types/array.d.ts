export = Array;
declare class Array {
    /**
     * swaps elements in the array (mutates original)
     * @param {Array} array
     * @param {number} a first index
     * @param {number} b second index
     */
    static swap(array: Array, a: number, b: number): void;
    /**
     * creates deepcopy of array.
     * works only for primitive values in nested arrays
     * @param {T} array
     * @returns {T} deep copy of array
     * @template T
     */
    static deepCopy<T>(array: T): T;
    /**
     * shuffles Array
     * @param {T[]} shuffled array to be shuffled
     * @returns {T[]} new shuffled array
     * @template T
     */
    static shuffle<T>(array: any): T[];
    /**
     * returns last index of an array
     * @param {Array} array
     * @returns {Number}
     */
    static lastI(array: Array): number;
    /**
     * returns last element of an array
     * @param {T[]} array
     * @returns {T}
     * @template T
     */
    static last<T>(array: T[]): T;
    /**
     * return random index from an array
     * @param {Array} array
     * @returns {Number}
     */
    static randomIndex(array: Array): number;
    /**
     * creates new array populated with values from function
     * @param {Number} length length of the new array
     * @param {T | (index:number) => T} [callbackFn] value or function which returns value of every element
     * @returns {T[]}
     * @template T
     */
    static generateArr<T>(length: number, callbackFn?: T | ((index: number) => T)): T[];
    /**
     * return new array extended to specified length (but not shortened if longer)
     * @param {T[]} array
     * @param {number} length final length of the array
     * @param {(U | (index:number) => U)} [callback] value or function which returns value of every new element
     * @returns {(T | U)[]} new array
     * @template T, U
     */
    static rightPadArray<T, U>(array: T[], length: number, callback?: U | ((index: number) => U)): (T | U)[];
}
