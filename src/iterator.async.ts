import { Predicate, Enumerated, iter, Iter, range, Zipped } from './iterator';

export function asyncIter<T> (data: AsyncIterable<T>): AsyncIter<T> {
  return new AsyncIter(data);
}

export function wrapAsyncIter<T> (iterator: AsyncIterator<T>): AsyncIter<T> {
  return new AsyncIter({
    [Symbol.asyncIterator]: () => iterator
  });
}

export function empty<T> (): AsyncIter<T> {
  async function * generator (): AsyncIterable<T> {}

  return asyncIter(generator());
}

export function once<T> (value: T): AsyncIter<T> {
  async function * generator (): AsyncIterable<T> {
    yield Promise.resolve(value);
  }

  return asyncIter(generator());
}

export function repeat<T> (value: T): AsyncIter<T> {
  async function * generator (): AsyncIterable<T> {
    while (true) yield value;
  }

  return asyncIter(generator());
}

export function from<T> (f: () => T): AsyncIter<T> {
  async function * generator (): AsyncIterable<T> {
    while (true) yield f();
  }

  return asyncIter(generator());
}

export class AsyncIter<T> implements AsyncIterable<T>, AsyncIterator<T> {
  iterator: AsyncIterator<T, undefined>;

  constructor (data: AsyncIterable<T>) {
    this.iterator = data[Symbol.asyncIterator]();
  }

  static fromSync<T>(data: Iterable<Promise<T>> | Iterable<T>): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {
      for (const value of data) {
        yield await value;
      }
    }

    return asyncIter(generator());
  }

  async next (): Promise<IteratorResult<T>> {
    return await this.iterator.next();
  }

  async * [Symbol.asyncIterator] (): AsyncIterator<T, undefined> {
    while (true) {
      const { done, value } = await this.iterator.next();
      if (done ?? false) break;
      yield value;
    }

    return undefined;
  }

  get [Symbol.toStringTag] (): string {
    return 'AsyncIter';
  }

  await (): Await<T> {
    return new Await(this);
  }

  chain (extension: AsyncIterable<T>): Chain<T> {
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

  mapAwait<U>(f: (value: T) => Promise<U>): MapAwait<T, U> {
    return new MapAwait(this, f);
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

  zip<U>(other: AsyncIterable<U>): Zip<T, U> {
    return new Zip(this, other);
  }

  async all (f: Predicate<T>): Promise<boolean> {
    for await (const value of this) {
      if (!f(value)) return false;
    }

    return true;
  }

  async advanceBy (n: number): Promise<void> {
    for (const _ of range(n)) {
      const { done } = await this.next();
      if (done ?? false) break;
    }
  }

  /**
   * creates new array from the values of the iterator
   */
  async collect (): Promise<T[]> {
    const results = [];

    for await (const el of this) {
      results.push(el);
    }

    return results;
  }

  async consume (): Promise<void> {
    for await (const _ of this) {
      // pass
    }
  }

  async count (): Promise<number> {
    return await this.fold(count => count + 1, 0);
  }

  async find (f: Predicate<T>): Promise<T | undefined> {
    while (true) {
      const { done, value } = await this.next();

      if (done ?? false) return undefined;

      if (f(value)) return value;
    }
  }

  async fold<U>(f: (total: U, current: T) => U, start: U): Promise<U> {
    let total = start;

    for await (const value of this) {
      total = f(total, value);
    }

    return total;
  }

  async forEach (f: (value: T) => void): Promise<void> {
    for await (const el of this) {
      f(el);
    }
  }

  async join (separator = ''): Promise<string> {
    const { done, value } = await this.iterator.next();

    if (done ?? false) {
      return '';
    }

    let result = String(value);

    for await (const v of this.map(value => String(value))) {
      result += separator;
      result += v;
    }

    return result;
  }

  async last (): Promise<T | undefined> {
    let element;

    for await (const current of this) element = current;

    return element;
  }

  async nth (n: number): Promise<T | undefined> {
    return (await this.skip(n).next()).value;
  }

  async partition (f: Predicate<T>): Promise<[T[], T[]]> {
    return await this.fold<[T[], T[]]>(
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

  async toSync (): Promise<Iter<T>> {
    return iter(await this.collect());
  }

  async some (f: Predicate<T>): Promise<boolean> {
    for await (const value of this) {
      if (f(value)) return true;
    }

    return false;
  }
}

class Await<T> extends AsyncIter<Awaited<T>> {
  constructor (data: AsyncIterable<T>) {
    async function * generator (): AsyncIterable<Awaited<T>> {
      for await (const value of data) yield await value;
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Await';
  }
}

class Chain<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, extension: AsyncIterable<T>) {
    async function * generator (): AsyncIterable<T> {
      for await (const value of data) yield value;

      for await (const value of extension) yield value;
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Chain';
  }
}

class Filter<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, f: Predicate<T>) {
    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
        if (f(value)) yield value;
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Filter';
  }
}

class FilterMap<T, U> extends AsyncIter<U> {
  constructor (data: AsyncIter<T>, p: Predicate<T>, f: (value: T) => U) {
    async function * generator (): AsyncIterable<U> {
      for await (const value of data) {
        if (p(value)) yield f(value);
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'FilterMap';
  }
}

class Enumerate<T> extends AsyncIter<Enumerated<T>> {
  constructor (data: AsyncIter<T>) {
    async function * generator (): AsyncIterable<Enumerated<T>> {
      let index = 0;

      for await (const value of data) {
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

class Inspect<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, f: (value: T) => void) {
    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
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

class Map<T, U> extends AsyncIter<U> {
  constructor (data: AsyncIter<T>, f: (value: T) => U) {
    async function * generator (): AsyncIterable<U> {
      for await (const value of data) yield f(value);
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'Map';
  }
}

class MapAwait<T, U> extends AsyncIter<U> {
  constructor (data: AsyncIter<T>, f: (value: T) => Promise<U>) {
    async function * generator (): AsyncIterable<U> {
      for await (const value of data) yield await f(value);
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'MapAwait';
  }
}

type Peek<T> = IteratorResult<T> | undefined;

class Peekable<T> extends AsyncIter<T> {
  _helper: { peek: Peek<T> };

  constructor (data: AsyncIter<T>) {
    // has to be wrapped in object to keep the reference
    // both in the generator function and in the class
    // otherwise it would get passed as a value and desync
    const helper = { peek: undefined as Peek<T> };

    async function * generator (): AsyncIterable<T> {
      while (true) {
        let current: IteratorResult<T>;

        if (helper.peek !== undefined) {
          current = helper.peek;
          helper.peek = undefined;
        } else {
          current = await data.next();
        }

        const { done, value } = current;

        if (done ?? false) break;

        yield value;
      }
    }

    super(generator());

    this._helper = helper;
  }

  async peek (): Promise<IteratorResult<T>> {
    if (this._helper.peek !== undefined) return this._helper.peek;

    const peek = await this.iterator.next();
    this._helper.peek = peek;
    return peek;
  }

  get [Symbol.toStringTag] (): string {
    return 'Peekable';
  }
}

class Skip<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, n: number) {
    let count = 0;

    async function * generator (): AsyncIterable<T> {
      while (true) {
        const { done, value } = await data.next();
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

class SkipWhile<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, f: Predicate<T>) {
    let skip = true;

    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
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

class StepBy<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, step: number) {
    async function * generator (): AsyncIterable<T> {
      while (true) {
        const { done, value } = await data.next();
        if (done ?? false) break;

        yield value;

        await data.advanceBy(step - 1);
      }
    }

    super(generator());
  }

  get [Symbol.toStringTag] (): string {
    return 'StepBy';
  }
}

class Take<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, limit: number) {
    if (limit <= 0) return empty();

    async function * generator (): AsyncIterable<T> {
      let count = 0;

      for await (const value of data) {
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

class TakeWhile<T> extends AsyncIter<T> {
  constructor (data: AsyncIter<T>, f: Predicate<T>) {
    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
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

class Zip<T, U> extends AsyncIter<Zipped<T, U>> {
  constructor (data: AsyncIter<T>, zipped: AsyncIterable<U>) {
    const data2 = zipped[Symbol.asyncIterator]();

    async function * generator (): AsyncIterable<Zipped<T, U>> {
      while (true) {
        const next1 = await data.next();
        const next2 = await data2.next();

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
