export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

export function repeat<T> (value: T): Iter<T> {
  const generator = function * (): Iterable<T> {
    while (true) yield value;
  };

  return iter(generator());
}

type Predicate<T> = (value: T) => boolean;

export class Iter<T> implements Iterable<T> {
  iterator: Iterator<T, undefined>;

  constructor (data: Iterable<T>) {
    const generator = function * (): Iterator<T, undefined> {
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
    let i = 0;

    for (const value of this) {
      if (i === n) return value;
      i++;
    }

    return undefined;
  }

  skip (n: number): Iter<T> {
    for (let i = 0; i < n; i++) {
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
    const generator = function * (): Iterable<U> {
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
    const generator = function * (): Iterable<Enumerated<T>> {
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

    const generator = function * (): Iterable<T> {
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
    const generator = function * (): Iterable<T> {
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
    const generator = function * (): Iterable<T> {
      for (const value of data) {
        if (f(value)) yield value;
      }
    };

    super(generator());
  }
}
