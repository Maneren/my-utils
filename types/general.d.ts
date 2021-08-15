export = General;
declare class General {
    /**
     * returns Promise, which resolves to null after specified number of miliseconds
     * may not work properly with times below 10 ms
     * @param {number} milis
     * @returns {Promise<null>}
     */
    static sleep(milis: number): Promise<null>;
    /**
     * returns random float from min to max.
     * if only min is specified, it returns float from 0 to min
     * @param {number} min lower bound (inclusive)
     * @param {number} [max] upper bound (exclusive)
     * @returns {number}
     */
    static randfloat(min: number, max?: number): number;
    /**
     * returns random integer from min to max.
     * if only min is specified, it returns integer from 0 to min
     * @param {number} min lower bound (inclusive)
     * @param {number} [max] upper bound (exclusive)
     * @returns {number}
     */
    static randint(min: number, max?: number): number;
    /**
     * maps values from Generator using callbackFn
     * @param {Iterable<T>} generator generator to map
     * @param {(value:T) => U} callbackFn function to be called for every value from range
     * @returns {Iterable<U>}
     * @template T, U
     */
    static mapGenerator<T, U>(generator: Iterable<T>, callbackFn: (value: T) => U): Iterable<U>;
    /**
     * reduces values from Generator to one value via callbackFn
     * @param {Iterable<U>} generator generator to reduce
     * @param {(total: T, value:U, index:number) => T} callbackFn function to be called for every value from range
     * @param {T} [total] starting value for total (default = 0)
     * @returns {T}
     * @template T, U
     */
    static reduceGenerator<T, U>(generator: Iterable<U>, callbackFn: (total: T, value: U, index: number) => T, total?: T): T;
    /**
     * reduces values from Generator to one array
     * @param {Iterable<T>} generator generator to convert
     * @returns {T[]}
     * @template T
     */
    static generatorToArray<T>(generator: Iterable<T>): T[];
}
