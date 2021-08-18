export = Range;
declare class Range {
    /**
     * @typedef {Iterable<number>} Range
     */
    /**
     * returns generator, which yields numbers from min to max with defined step
     * if only min is specified, it yields numbers from 0 to min
     * @param {number} start lower bound (inclusive)
     * @param {number} end upper bound (exclusive)
     * @param {number} step
     * @returns {Range}
     */
    static range(start: number, end: number, step: number): Range;
    /**
     * maps values from Range to array via callbackFn
     * @param {Range} range range to map
     * @param {(value:number, index:number) => T} callbackFn function to be called for every value from range
     * @returns {Iterable<T>}
     * @template T
     */
    static mapRange<T>(range: Range, callbackFn: (value: number, index: number) => T): Iterable<T>;
    /**
     * reduces values from Range to one value via callbackFn
     * @param {Range} range range to map
     * @param {(total: T, value:number, index:number) => T} callbackFn function to be called for every value from range
     * @param {T} [total] starting value for total (default = 0)
     * @returns {T}
     * @template T
     */
    static reduceRange<T>(range: Range, callbackFn: (total: T, value: number, index: number) => T, total?: T): T;
    /**
     * reduces values from Range to one array
     * @param {Range} range range to convert
     * @returns {number[]}
     */
    static rangeToArray(range: Range): number[];
}
