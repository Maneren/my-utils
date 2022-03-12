export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

export function repeat<T> (value: T): Iter<T> {
  const generator = function * (): Iterable<T> {
    while (true) yield value;
  };

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
  };

  return iter(generator());
}

type Predicate<T> = (value: T) => boolean;

export class Iter<T> implements Iterable<T> {
  iterator: Iterator<T, undefined>;

  constructor (data: Iterable<T>) {
    function * generator (): Iterator<T, undefined> {
      for (const value of data) {
        yield value;
      }

      return undefined; // to satisfy type checker
    };

    this.iterator = generator();
  }

  next (): IteratorResult<T> {
    return this.iterator.next();
  }

  [Symbol.iterator] (): Iterator<T, undefined> {
    return this.iterator;
  }

  map<U>(f: (value: T) => U): MapIter<T, U> {
    return new MapIter(this, f);
  }

  take (n: number): Take<T> {
    return new Take(this, n);
  }

  takeWhile (f: Predicate<T>): Take<T> {
    return new TakeWhile(this, f);
  }

  filter (f: Predicate<T>): Filter<T> {
    return new Filter(this, f);
  }

  enumerate (): Enumerate<T> {
    return new Enumerate(this);
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

    this.skip(n - 1);

    return this.next().value;
  }

  skip (n: number): Iter<T> {
    for (const _ in range(n)) {
      this.next();
    }

    return this;
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

export class MapIter<T, U> extends Iter<U> {
  constructor (data: Iterable<T>, f: (value: T) => U) {
    function * generator (): Iterable<U> {
      for (const value of data) {
        yield f(value);
      }
    };

    super(generator());
  }
}

interface Enumerated<T> {
  index: number
  value: T
}

export class Enumerate<T> extends Iter<Enumerated<T>> {
  constructor (data: Iterable<T>) {
    function * generator (): Iterable<Enumerated<T>> {
      let index = 0;

      for (const value of data) {
        yield { index, value };
        index++;
      }
    };

    super(generator());
  }
}

export class Take<T> extends Iter<T> {
  constructor (data: Iterable<T>, limit: number) {
    if (limit < 0 || limit % 1 !== 0) {
      throw new Error(`Expected positive integer but found ${limit}`);
    }

    function * generator (): Iterable<T> {
      if (limit <= 0) return;

      let count = 0;

      for (const value of data) {
        yield value;
        count++;
        if (count >= limit) break;
      }
    };

    super(generator());
  }
}

export class TakeWhile<T> extends Iter<T> {
  constructor (data: Iterable<T>, f: (value: T) => boolean) {
    function * generator (): Iterable<T> {
      for (const value of data) {
        if (!f(value)) break;
        yield value;
      }
    };

    super(generator());
  }
}

export class Filter<T> extends Iter<T> {
  constructor (data: Iterable<T>, f: (value: T) => boolean) {
    function * generator (): Iterable<T> {
      for (const value of data) {
        if (f(value)) yield value;
      }
    };

    super(generator());
  }
}
