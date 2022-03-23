export function iter<T> (data: Iterable<T>): Iter<T> {
  return new Iter(data);
}

export function asyncIter<T> (data: AsyncIterable<T>): AsyncIter<T> {
  return new AsyncIter(data);
}

type Predicate<T> = (value: T) => boolean;
type Enumerated<T> = [number, T];
type Zipped<T, U> = [T, U];

export class Iter<T> implements Iterable<T>, Iterator<T, undefined> {
  iterator: Iterator<T, undefined>;

  constructor (data: Iterable<T>) {
    this.iterator = data[Symbol.iterator]();
  }

  static empty<T>(): Iter<T> {
    function * generator (): Iterable<T> {}

    return iter(generator());
  }

  static once<T>(value: T): Iter<T> {
    function * generator (): Iterable<T> {
      yield value;
    }

    return iter(generator());
  }

  static repeat<T>(value: T): Iter<T> {
    function * generator (): Iterable<T> {
      while (true) yield value;
    }

    return iter(generator());
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

  map<U>(f: (value: T) => U): Iter<U> {
    const data = this as Iter<T>;

    function * generator (): Iterable<U> {
      for (const value of data) {
        yield f(value);
      }
    }

    return iter(generator());
  }

  take (limit: number): Iter<T> {
    if (limit <= 0) return Iter.empty();

    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
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
    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
      for (const value of data) {
        if (!f(value)) break;
        yield value;
      }
    }

    return iter(generator());
  }

  filter (f: Predicate<T>): Iter<T> {
    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
      for (const value of data) {
        if (f(value)) yield value;
      }
    }

    return iter(generator());
  }

  enumerate (): Iter<Enumerated<T>> {
    const data = this as Iter<T>;

    function * generator (): Iterable<Enumerated<T>> {
      let index = 0;

      for (const value of data) {
        yield [index, value];
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
    this.advanceBy(n);

    return this.next().value;
  }

  advanceBy (n: number): Iter<T> {
    for (const _ of range(n)) {
      const { done } = this.next();
      if (done ?? false) break;
    }

    return this;
  }

  skip (n: number): Iter<T> {
    let count = 0;

    while (true) {
      const { done, value } = this.next();
      if (done ?? false) break;

      if (count >= n) {
        return Iter.once(value).chain(this);
      }
      count++;
    }

    return Iter.empty();
  }

  skipWhile (f: Predicate<T>): Iter<T> {
    while (true) {
      const { done, value } = this.next();
      if (done ?? false) break;

      if (!f(value)) {
        return Iter.once(value).chain(this);
      }
    }

    return Iter.empty();
  }

  stepBy (n: number): Iter<T> {
    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
      while (true) {
        const { done, value } = data.next();
        if (done ?? false) break;

        yield value;

        data.advanceBy(n - 1);
      }
    }

    return iter(generator());
  }

  chain (extension: Iterable<T>): Iter<T> {
    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
      for (const value of data) yield value;

      for (const value of extension) yield value;
    }

    return iter(generator());
  }

  zip<U>(other: Iterable<U>): Iter<Zipped<T, U>> {
    const data = this as Iter<T>;
    const data2 = iter(other);

    function * generator (): Iterable<Zipped<T, U>> {
      while (true) {
        const next1 = data.next();
        const next2 = data2.next();

        if (next1.done ?? false) break;
        if (next2.done ?? false) break;

        yield [next1.value, next2.value];
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

  consume (): void {
    for (const _ of this) {
      // pass
    }
  }

  forEach (f: (value: T) => void): void {
    for (const el of this) {
      f(el);
    }
  }

  /**
   * creates new array from the values of the iterator
   */
  collect (): T[] {
    return [...this];
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

  all (f: Predicate<T>): boolean {
    for (const value of this) {
      if (!f(value)) return false;
    }

    return true;
  }

  some (f: Predicate<T>): boolean {
    for (const value of this) {
      if (f(value)) return true;
    }

    return false;
  }

  inspect (f: (value: any) => void): Iter<T> {
    const data = this as Iter<T>;

    function * generator (): Iterable<T> {
      for (const value of data) {
        f(value);
        yield value;
      }
    }

    return iter(generator());
  }
}

export class AsyncIter<T> implements AsyncIterator<T>, AsyncIterable<T> {
  iterator: AsyncIterator<T, undefined>;

  constructor (data: AsyncIterable<T>) {
    this.iterator = data[Symbol.asyncIterator]();
  }

  static asyncEmpty<T>(): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {}

    return asyncIter(generator());
  }

  static asyncOnce<T>(value: T): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {
      yield Promise.resolve(value);
    }

    return asyncIter(generator());
  }

  static fromSync<T>(data: Iterable<T> | Iterable<Promise<T>>): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {
      for (const value of data) {
        if (value instanceof Promise) yield await value;
        else yield value;
      }
    }

    return asyncIter(generator());
  }

  async next (): Promise<IteratorResult<T>> {
    return await this.iterator.next();
  }

  async * [Symbol.asyncIterator] (): AsyncGenerator<T, undefined> {
    let current;

    do {
      current = await this.iterator.next();

      if (current.value === undefined) break;

      yield current.value;
    } while (!(current.done ?? false));

    return undefined;
  }

  get [Symbol.toStringTag] (): string {
    return 'AsyncIter';
  }

  async toSync (): Promise<Iter<T>> {
    return iter(await this.collect());
  }

  map<U>(f: (value: T) => U): AsyncIter<U> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<U> {
      for await (const value of data) {
        yield f(value);
      }
    }

    return asyncIter(generator());
  }

  take (limit: number): AsyncIter<T> {
    if (limit <= 0) return AsyncIter.asyncEmpty();

    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      let count = 0;

      for await (const value of data) {
        yield value;
        count++;
        if (count >= limit) break;
      }
    }

    return asyncIter(generator());
  }

  takeWhile (f: Predicate<T>): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
        if (!f(value)) break;
        yield value;
      }
    }

    return asyncIter(generator());
  }

  filter (f: Predicate<T>): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
        if (f(value)) yield value;
      }
    }

    return asyncIter(generator());
  }

  enumerate (): AsyncIter<Enumerated<T>> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<Enumerated<T>> {
      let index = 0;

      for await (const value of data) {
        yield [index, value];
        index++;
      }
    }

    return asyncIter(generator());
  }

  async fold<U>(f: (total: U, current: T) => U, start: U): Promise<U> {
    let total = start;

    for await (const value of this) {
      total = f(total, value);
    }

    return total;
  }

  async nth (n: number): Promise<T | undefined> {
    if (n < 0) n = 0;

    await this.advanceBy(n);

    return (await this.next()).value;
  }

  async advanceBy (n: number): Promise<AsyncIter<T>> {
    for (const _ of range(n)) {
      const { done } = await this.next();
      if (done ?? false) break;
    }

    return this;
  }

  skip (n: number): AsyncIter<T> {
    if (n <= 0) return this;

    let count = 0;

    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      while (true) {
        const { done, value } = await data.next();
        if (done ?? false) break;

        if (count >= n) {
          yield value;
        }
        count++;
      }
    }

    return asyncIter(generator());
  }

  skipWhile (f: Predicate<T>): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      let flag = false;
      while (true) {
        const { done, value } = await data.next();
        if (done ?? false) break;

        if (flag || !f(value)) flag = true;
        else continue;
        yield value;
      }
    }

    return asyncIter(generator());
  }

  stepBy (n: number): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      while (true) {
        const { done, value } = await data.next();
        if (done ?? false) break;

        yield value;

        await data.advanceBy(n - 1);
      }
    }

    return asyncIter(generator());
  }

  chain (extension: AsyncIterable<T>): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      yield * data;

      yield * extension;
    }

    return asyncIter(generator());
  }

  zip<U>(other: AsyncIterable<U>): AsyncIter<[T, U]> {
    const data = this as AsyncIter<T>;
    const data2 = asyncIter(other);

    async function * generator (): AsyncIterable<[T, U]> {
      while (true) {
        const next1 = await data.next();
        const next2 = await data2.next();

        if (next1.done ?? false) break;
        if (next2.done ?? false) break;

        yield [await next1.value, await next2.value];
      }
    }

    return asyncIter(generator());
  }

  async count (): Promise<number> {
    return await this.fold((count) => count + 1, 0);
  }

  async last (): Promise<T | undefined> {
    let element;

    for await (const current of this) element = current;

    return element;
  }

  async consume (): Promise<void> {
    for await (const _ of this) {
      // pass
    }
  }

  async forEach (f: (value: T) => void): Promise<void> {
    for await (const el of this) {
      f(el);
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

  async join (separator = ''): Promise<string> {
    const iter = this.map((value) => String(value));

    const { done, value } = await iter.next();

    if (done ?? false) {
      return '';
    }

    let result = value;

    for await (const v of iter) {
      result += separator;
      result += v;
    }

    return result;
  }

  async all (f: Predicate<T>): Promise<boolean> {
    for await (const value of this) {
      if (!f(value)) return false;
    }

    return true;
  }

  async some (f: Predicate<T>): Promise<boolean> {
    for await (const value of this) {
      if (f(value)) return true;
    }

    return false;
  }

  inspect (f: (value: any) => void): AsyncIter<T> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<T> {
      for await (const value of data) {
        f(value);
        yield value;
      }
    }

    return asyncIter(generator());
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
  if (start === end) return Iter.empty();

  if (step < 0) {
    if (start < end) return Iter.empty();
  } else {
    if (start > end) return Iter.empty();
  }

  function * generator (
    start: number,
    end: number,
    step: number
  ): Iterable<number> {
    const done = (i: number): boolean => (step < 0 ? i > end : i < end);

    for (let i = start; done(i); i += step) yield i;
  }

  return iter(generator(start, end, step));
}
