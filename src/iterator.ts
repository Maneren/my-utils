export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

export function wrapIter<T> (iterator: Iterator<T>): Iter<T> {
  return new Iter({
    [Symbol.iterator]: () => iterator
  });
}

export function empty<T> (): Iter<T> {
  function * generator (): Iterable<T> {}

  return iter(generator());
}

export function once<T> (value: T): Iter<T> {
  function * generator (): Iterable<T> {
    yield value;
  }

  return iter(generator());
}

export function repeat<T> (value: T): Iter<T> {
  function * generator (): Iterable<T> {
    while (true) yield value;
  }

  return iter(generator());
}

export function from<T> (f: () => T): Iter<T> {
  function * generator (): Iterable<T> {
    while (true) yield f();
  }

  return iter(generator());
}

export type Predicate<T> = (value: T) => boolean;
export type Enumerated<T> = [number, T];
export type Zipped<T, U> = [T, U];

export class Iter<T> implements Iterable<T>, Iterator<T, undefined> {
  iterator: Iterator<T, undefined>;

  constructor (data: Iterable<T>) {
    this.iterator = data[Symbol.iterator]();
  }

  next (): IteratorResult<T> {
    return this.iterator.next();
  }

  [Symbol.iterator] (): Iterator<T, undefined> {
    return this.iterator;
  }

  get [Symbol.toStringTag] (): string {
    return 'Iter';
  }

  chain (extension: Iterable<T>): Chain<T> {
    return new Chain(this, extension);
  }

  enumerate (): Enumerate<T> {
    return new Enumerate(this);
  }

  filter (f: Predicate<T>): Filter<T> {
    return new Filter(this, f);
  }

  filterMap<U>(p: Predicate<T>, f: (value: T) => U): FilterMap<T, U> {
    return new FilterMap(this, p, f);
  }

  inspect (f: (value: any) => void): Inspect<T> {
    return new Inspect(this, f);
  }

  map<U>(f: (value: T) => U): Map<T, U> {
    return new Map(this, f);
  }

  peekable (): Peekable<T> {
    return new Peekable(this);
  }

  skip (n: number): Skip<T> {
    return new Skip(this, n);
  }

  skipWhile (f: Predicate<T>): SkipWhile<T> {
    return new SkipWhile(this, f);
  }

  stepBy (n: number): StepBy<T> {
    return new StepBy(this, n);
  }

  take (limit: number): Take<T> {
    return new Take(this, limit);
  }

  takeWhile (f: Predicate<T>): TakeWhile<T> {
    return new TakeWhile(this, f);
  }

  zip<U>(other: Iterable<U>): Zip<T, U> {
    return new Zip(this, other);
  }

  advanceBy (n: number): void {
    for (const _ of range(n)) {
      const { done } = this.next();
      if (done ?? false) break;
    }
  }

  all (f: Predicate<T>): boolean {
    for (const value of this) {
      if (!f(value)) return false;
    }

    return true;
  }

  /**
   * creates new array from the values of the iterator
   */
  collect (): T[] {
    return [...this];
  }

  consume (): void {
    for (const _ of this) {
      // pass
    }
  }

  count (): number {
    return this.fold(count => count + 1, 0);
  }

  fold<U>(f: (total: U, current: T) => U, start: U): U {
    let total = start;

    for (const value of this) {
      total = f(total, value);
    }

    return total;
  }

  forEach (f: (value: T) => void): void {
    for (const el of this) {
      f(el);
    }
  }

  join (separator = ''): string {
    const first = this.iterator.next();

    if (first.done ?? false) {
      return '';
    }

    let result = String(first.value);

    for (const v of this.map(value => String(value))) {
      result += separator;
      result += v;
    }

    return result;
  }

  last (): T | undefined {
    let element;

    for (const current of this) element = current;

    return element;
  }

  nth (n: number): T | undefined {
    return this.skip(n).next().value;
  }

  partition (f: Predicate<T>): [T[], T[]] {
    return this.fold<[T[], T[]]>(
      ([left, right], value) => {
        if (f(value)) {
          left.push(value);
        } else {
          right.push(value);
        }

        return [left, right];
      },
      [[], []]
    );
  }

  some (f: Predicate<T>): boolean {
    for (const value of this) {
      if (f(value)) return true;
    }

    return false;
  }
}

class Enumerate<T> extends Iter<Enumerated<T>> {
  constructor (data: Iter<T>) {
    function * generator (): Iterable<Enumerated<T>> {
      let index = 0;

      for (const value of data) {
        yield [index, value];
        index++;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Enumerate';
  }
}

class Chain<T> extends Iter<T> {
  constructor (data: Iter<T>, extension: Iterable<T>) {
    function * generator (): Iterable<T> {
      for (const value of data) yield value;

      for (const value of extension) yield value;
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Chain';
  }
}

class Filter<T> extends Iter<T> {
  constructor (data: Iter<T>, f: Predicate<T>) {
    function * generator (): Iterable<T> {
      for (const value of data) {
        if (f(value)) yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Filter';
  }
}

class FilterMap<T, U> extends Iter<U> {
  constructor (data: Iter<T>, p: Predicate<T>, f: (value: T) => U) {
    function * generator (): Iterable<U> {
      for (const value of data) {
        if (p(value)) yield f(value);
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'FilterMap';
  }
}

class Inspect<T> extends Iter<T> {
  constructor (data: Iter<T>, f: (value: T) => void) {
    function * generator (): Iterable<T> {
      for (const value of data) {
        f(value);
        yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Inspect';
  }
}

class Map<T, U> extends Iter<U> {
  constructor (data: Iter<T>, f: (value: T) => U) {
    function * generator (): Iterable<U> {
      for (const value of data) yield f(value);
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Map';
  }
}

type Peek<T> = IteratorResult<T> | undefined;

class Peekable<T> extends Iter<T> {
  _helper: { peek: Peek<T> };

  constructor (data: Iter<T>) {
    // has to be wrapped in object to keep the reference
    // both in the generator function and in the class
    // otherwise it would get passed as a value and desync
    const helper = { peek: undefined as Peek<T> };

    function * generator (): Iterable<T> {
      while (true) {
        let current: IteratorResult<T>;

        if (helper.peek !== undefined) {
          current = helper.peek;
          helper.peek = undefined;
        } else {
          current = data.next();
        }

        const { done, value } = current;

        if (done ?? false) break;

        yield value;
      }
    }

    super(generator());

    this._helper = helper;
  }

  peek (): IteratorResult<T> {
    if (this._helper.peek !== undefined) return this._helper.peek;

    const peek = this.iterator.next();
    this._helper.peek = peek;
    return peek;
  }

  get [Symbol.toStringTag] (): string {
    return 'Peekable';
  }
}

class Skip<T> extends Iter<T> {
  constructor (data: Iter<T>, n: number) {
    let count = 0;

    function * generator (): Iterable<T> {
      while (true) {
        const { done, value } = data.next();
        if (done ?? false) break;

        if (count < n) {
          count++;
          continue;
        }

        yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Skip';
  }
}

class SkipWhile<T> extends Iter<T> {
  constructor (data: Iter<T>, f: Predicate<T>) {
    let skip = true;

    function * generator (): Iterable<T> {
      for (const value of data) {
        if (skip && f(value)) {
          continue;
        }

        skip = false;
        yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'SkipWhile';
  }
}

class StepBy<T> extends Iter<T> {
  constructor (data: Iter<T>, step: number) {
    function * generator (): Iterable<T> {
      while (true) {
        const { done, value } = data.next();
        if (done ?? false) break;

        yield value;

        data.advanceBy(step - 1);
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'StepBy';
  }
}

class Take<T> extends Iter<T> {
  constructor (data: Iter<T>, limit: number) {
    if (limit <= 0) return empty();

    function * generator (): Iterable<T> {
      let count = 0;

      for (const value of data) {
        yield value;
        count++;
        if (count >= limit) break;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Take';
  }
}

class TakeWhile<T> extends Iter<T> {
  constructor (data: Iter<T>, f: Predicate<T>) {
    function * generator (): Iterable<T> {
      for (const value of data) {
        if (!f(value)) break;
        yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'TakeWhile';
  }
}

class Zip<T, U> extends Iter<Zipped<T, U>> {
  constructor (data: Iter<T>, zipped: Iterable<U>) {
    const data2 = zipped[Symbol.iterator]();

    function * generator (): Iterable<Zipped<T, U>> {
      while (true) {
        const next1 = data.next();
        const next2 = data2.next();

        if (next1.done ?? false) break;
        if (next2.done ?? false) break;

        yield [next1.value, next2.value];
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Zip';
  }
}

type RangeIter = Iter<number>;
/**
 * returns generator, which yields numbers from min to max with defined step
 * if only min is specified, it yields numbers from 0 to min
 * @param {number} start lower bound (inclusive)
 * @param {number} end upper bound (exclusive)
 * @param {number} step
 * @returns {RangeIter}
 */
export function range (end: number): RangeIter;
export function range (start: number, end: number): RangeIter;
export function range (start: number, end: number, step: number): RangeIter;
export function range (start: number, end?: number, step?: number): RangeIter {
  if (end === undefined) {
    // if only start is specified, then go from 0 to "start"
    end = start;
    start = 0;
  }

  step = step ?? 1;

  if (step === 0) throw new Error("step can't be 0");

  function * generator (
    start: number,
    end: number,
    step: number
  ): Iterable<number> {
    for (let i = start; step > 0 ? i < end : i > end; i += step) yield i;
  }

  return iter(generator(start, end, step));
}
