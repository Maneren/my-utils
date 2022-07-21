import { Predicate, Enumerated, iter, Iter, range, Zipped } from './iterator';

export function asyncIter<T> (data: AsyncIterable<T>): AsyncIter<T> {
  return new AsyncIter(data);
}

export class AsyncIter<T> implements AsyncIterator<T>, AsyncIterable<T> {
  iterator: AsyncIterator<T, undefined>;

  constructor (data: AsyncIterable<T>) {
    this.iterator = data[Symbol.asyncIterator]();
  }

  static empty<T>(): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {}

    return asyncIter(generator());
  }

  static once<T>(value: T): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {
      yield Promise.resolve(value);
    }

    return asyncIter(generator());
  }

  static repeat<T>(value: T): AsyncIter<T> {
    async function * generator (): AsyncIterable<T> {
      while (true) yield value;
    }

    return asyncIter(generator());
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

  async * [Symbol.asyncIterator] (): AsyncGenerator<T, undefined> {
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

  async toSync (): Promise<Iter<T>> {
    return iter(await this.collect());
  }

  map<U>(f: (value: T) => U): AsyncIter<U> {
    const data = this as AsyncIter<T>;

    async function * generator (): AsyncIterable<U> {
      for await (const value of data) yield f(value);
    }

    return asyncIter(generator());
  }

  take (limit: number): AsyncIter<T> {
    if (limit <= 0) return AsyncIter.empty();

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

  async partition (f: Predicate<T>): Promise<[T[], T[]]> {
    const left: T[] = [];
    const right: T[] = [];

    return await this.fold(([left, right], value) => {
      if (f(value)) {
        left.push(value);
      } else {
        right.push(value);
      }

      return [left, right];
    }, [left, right]);
  }

  async nth (n: number): Promise<T | undefined> {
    return (await this.skip(n).next()).value;
  }

  async advanceBy (n: number): Promise<void> {
    for (const _ of range(n)) {
      const { done } = await this.next();
      if (done ?? false) break;
    }
  }

  skip (n: number): AsyncIter<T> {
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

  zip<U>(other: AsyncIterable<U>): AsyncIter<Zipped<T, U>> {
    const data = this as AsyncIter<T>;
    const data2 = asyncIter(other);

    async function * generator (): AsyncIterable<Zipped<T, U>> {
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
    const { done, value } = await this.iterator.next();

    if (done ?? false) {
      return '';
    }

    let result = String(value);

    for await (const v of this.map((value) => String(value))) {
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
