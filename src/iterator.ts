export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

type Predicate<T> = (value: T) => boolean;

export class Iter<T> implements Iterable<T> {
  data: Iterable<T>;

  constructor (data: Iterable<T>) {
    this.data = data;
  }

  next (): IteratorResult<T> {
    return this[Symbol.iterator]().next();
  }

  * [Symbol.iterator] (): Iterator<T, null> {
    for (const value of this.data) {
      yield value;
    }

    return null;
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

  fold<U>(f: (total: U, current: T) => U, start: U): U {
    let total = start;

    for (const value of this) {
      total = f(total, value);
    }

    return total;
  }

  nth (n: number): T | null {
    let i = 0;

    for (const value of this) {
      if (i === n) return value;
      i++;
    }

    return null;
  }

  skip (n: number): Iter<T> {
    let i = 0;

    for (const _ of this) {
      if (i >= n) break;
      i++;
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

  static repeat<T>(value: T): Iter<T> {
    const generator = function * (): Iterable<T> {
      while (true) yield value;
    };

    return iter(generator());
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
        if (count <= limit) break;
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
