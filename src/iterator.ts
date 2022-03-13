export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

export function repeat<T> (value: T): Iter<T> {
  function * generator (): Iterable<T> {
    while (true) yield value;
  }

  return iter(generator());
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

type R = Iter<number>;
/**
 * returns generator, which yields numbers from min to max with defined step
 * if only min is specified, it yields numbers from 0 to min
 * @param {number} start lower bound (inclusive)
 * @param {number} end upper bound (exclusive)
 * @param {number} step
 * @returns {R}
 */
export function range (end: number): R;
export function range (start: number, end: number): R;
export function range (start: number, end: number, step: number): R;
export function range (start: number, end?: number, step?: number): R {
  function * generator (): Iterable<number> {
    if (end === undefined) {
      // if only start is specified, then go from 0 to "start"
      end = start;
      start = 0;
    }

    if (step === undefined) step = 1;

    if (step < 0) {
      if (start < end) {
        throw new Error(
          'when step is lower than 0, start must be larger than end'
        );
      }

      for (let i = start; i > end; i += step) yield i;
    } else {
      if (start > end) throw new Error('start must be smaller than end');

      for (let i = start; i < end; i += step) yield i;
    }
  }

  return iter(generator());
}

type Predicate<T> = (value: T) => boolean;
interface Enumerated<T> {
  index: number
  value: T
}

export class Iter<T> implements Iterable<T> {
  iterator: Iterator<T, undefined>;

  constructor (data: Iterable<T>) {
    function * generator (): Iterator<T, undefined> {
      for (const value of data) {
        yield value;
      }

      return undefined; // to satisfy type checker
    }

    this.iterator = generator();
  }

  next (): IteratorResult<T> {
    return this.iterator.next();
  }

  [Symbol.iterator] (): Iterator<T, undefined> {
    return this.iterator;
  }

  map<U>(f: (value: T) => U): Iter<U> {
    const data = iter(this);

    function * generator (): Iterable<U> {
      for (const value of data) {
        yield f(value);
      }
    }

    return iter(generator());
  }

  take (limit: number): Iter<T> {
    if (limit < 0 || limit % 1 !== 0) {
      throw new Error(`Expected positive integer but found ${limit}`);
    }

    const data = iter(this);

    function * generator (): Iterable<T> {
      if (limit <= 0) return;

      let count = 0;

      for (const value of data) {
        yield value;
        count++;
        if (count >= limit) break;
      }
    }

    return iter(generator());
  }

  takeWhile (f: Predicate<T>): Iter<T> {
    const data = iter(this);

    function * generator (): Iterable<T> {
      for (const value of data) {
        if (!f(value)) break;
        yield value;
      }
    }

    return iter(generator());
  }

  filter (f: Predicate<T>): Iter<T> {
    const data = iter(this);

    function * generator (): Iterable<T> {
      for (const value of data) {
        if (f(value)) yield value;
      }
    }

    return iter(generator());
  }

  enumerate (): Iter<Enumerated<T>> {
    const data = iter(this);

    function * generator (): Iterable<Enumerated<T>> {
      let index = 0;

      for (const value of data) {
        yield { index, value };
        index++;
      }
    }

    return iter(generator());
  }

  fold<U>(f: (total: U, current: T) => U, start: U): U {
    let total = start;

    for (const value of this) {
      total = f(total, value);
    }

    return total;
  }

  nth (n: number): T | undefined {
    if (n <= 0) return this.next().value;

    this.advanceBy(n);

    return this.next().value;
  }

  advanceBy (n: number): Iter<T> {
    for (const _ of range(n)) {
      this.next();
    }

    return this;
  }

  skip (n: number): Iter<T> {
    if (n <= 0) return this;

    let element;
    let count = 0;

    while (true) {
      const current = this.next();
      if (current.done ?? false) return empty();

      element = current.value;

      if (count >= n) break;
      count++;
    }

    if (element === undefined) return empty();

    return once(element).chain(this);
  }

  skipWhile (f: Predicate<T>): Iter<T> {
    let element;

    while (true) {
      const current = this.next();
      if (current.done ?? false) return empty();

      element = current.value;

      if (!f(element)) break;
    }

    if (element === undefined) return empty();

    return once(element).chain(this);
  }

  stepBy (n: number): Iter<T> {
    const data = iter(this);

    function * generator (): Iterable<T> {
      const iterator = iter(data);

      while (true) {
        const current = iterator.next();
        if (current.done ?? false) break;

        yield current.value;

        iterator.advanceBy(n - 1);
      }
    }

    return iter(generator());
  }

  chain (extension: Iterable<T>): Iter<T> {
    const data = iter(this);

    function * generator (): Iterable<T> {
      for (const value of data) yield value;

      for (const value of extension) yield value;
    }

    return iter(generator());
  }

  zip<U>(other: Iterable<U>): Iter<{ a: T, b: U }> {
    const data = iter(this);
    const data2 = iter(other);

    function * generator (): Iterable<{ a: T, b: U }> {
      while (true) {
        const next1 = data.next();
        const next2 = data2.next();

        if (next1.done ?? false) break;
        if (next2.done ?? false) break;

        yield { a: next1.value, b: next2.value };
      }
    }

    return iter(generator());
  }

  count (): number {
    return this.fold((count) => count + 1, 0);
  }

  last (): T | undefined {
    let element;

    for (const current of this) element = current;

    return element;
  }

  /**
   * creates array from the values of the iterator
   * @returns {T[]} array of the values from the iterator
   */
  collect (): T[] {
    const array = [];

    for (const el of this) {
      array.push(el);
    }

    return array;
  }

  join (separator = ''): string {
    const iter = this.map((value) => String(value));

    const first = iter.next();

    if (first.done ?? false) {
      return '';
    }

    let result = first.value;

    for (const v of iter) {
      result += separator;
      result += v;
    }

    return result;
  }
}
