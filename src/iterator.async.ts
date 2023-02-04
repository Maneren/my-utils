import {
  Enumerated,
  iter,
  Iter,
  range,
  Zipped,
  Option,
  Result,
  CheckedResult,
  mapResult,
  toResult,
} from "./iterator";

export const asyncIter = <T>(data: AsyncIterable<T>): AsyncIter<T> =>
  new AsyncIter(data[Symbol.asyncIterator]());

export const wrapAsyncIter = <T>(iterator: AsyncIterator<T>): AsyncIter<T> =>
  new AsyncIter(iterator);

type AsyncPredicate<T> = (value: T) => boolean | Promise<boolean>;

export const empty = <T>(): Empty<T> => new Empty();
export const once = <T>(value: T): Once<T> => new Once(value);
export const repeat = <T>(value: T): Repeat<T> => new Repeat(value);
export const from = <T>(f: () => T): From<T> => new From(f);

export const mapAwaitResult = async <T, U>(
  { done, value }: Result<T>,
  f: (value: T) => U,
): Promise<CheckedResult<Awaited<U>>> =>
  done ?? false
    ? { done: true, value: undefined }
    : { done: false, value: await f(value) };

export const doneResult = <T>(): CheckedResult<T> => ({
  done: true,
  value: undefined,
});

export abstract class AsyncBaseIter<T>
  implements AsyncIterable<T>, AsyncIterator<T>
{
  abstract next(): Promise<Result<T>>;

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  abstract get [Symbol.toStringTag](): string;

  await = (): Await<T> => new Await(this);

  chain = (extension: AsyncIterable<T>): Chain<T> =>
    new Chain(this, extension[Symbol.asyncIterator]());

  enumerate = (): Enumerate<T> => new Enumerate(this);

  filter = (f: AsyncPredicate<T>): Filter<T> => new Filter(this, f);

  filterMap = <U>(p: AsyncPredicate<T>, f: (value: T) => U): FilterMap<T, U> =>
    new FilterMap(this, p, f);

  flatten = (): Flatten<T> => new Flatten(this);

  flatMap = <U>(f: (value: Flattened<T>) => U): FlatMap<T, U> =>
    new FlatMap(this, f);

  inspect = (f: (value: T) => void): Inspect<T> => new Inspect(this, f);

  map = <U>(f: (value: T) => U): Map<T, U> => new Map(this, f);

  mapAwait = <U>(f: (value: T) => Promise<U>): MapAwait<T, U> =>
    new MapAwait(this, f);

  peekable = (): Peekable<T> => new Peekable(this);

  skip = (n: number): Skip<T> => new Skip(this, n);

  skipWhile = (f: AsyncPredicate<T>): SkipWhile<T> => new SkipWhile(this, f);

  stepBy = (n: number): StepBy<T> => new StepBy(this, n);

  take = (limit: number): Take<T> => new Take(this, limit);

  takeWhile = (f: AsyncPredicate<T>): TakeWhile<T> => new TakeWhile(this, f);

  zip = <U>(other: AsyncIterable<U>): Zip<T, U> =>
    new Zip(this, other[Symbol.asyncIterator]());

  advanceBy = async (n: number): Promise<boolean> =>
    await asyncRange(n).all(async (_) => !((await this.next()).done ?? false));

  async all(f: AsyncPredicate<T>): Promise<boolean> {
    for await (const value of this) {
      if (!(await f(value))) {
        return false;
      }
    }

    return true;
  }

  /**
   * creates new array from the values of the AsyncIterator
   */
  collect = async (): Promise<T[]> => {
    let output = [];
    for await (let x of this) {
      output.push(x);
    }
    return output;
  };

  consume = async (): Promise<void> => await this.forEach((_) => {});

  count = async (): Promise<number> => await this.fold((count) => count + 1, 0);

  async find(f: AsyncPredicate<T>): Promise<Option<T>> {
    for await (const value of this) {
      if (await f(value)) {
        return value;
      }
    }

    return undefined;
  }

  async fold<U>(
    f: (acc: U, current: T) => U | Promise<U>,
    start: U,
  ): Promise<U> {
    let acc = start;

    for await (const value of this) {
      acc = await f(acc, value);
    }

    return acc;
  }

  async forEach(f: (value: T) => void | Promise<void>): Promise<void> {
    for await (const value of this) {
      await f(value);
    }
  }

  async join(separator = ""): Promise<string> {
    const iter = this.map((value) => String(value));

    const { done, value } = await iter.next();

    return done
      ? ""
      : await iter.fold((result, value) => result + separator + value, value);
  }

  last = async (): Promise<Option<T>> =>
    await this.fold<Option<T>>((_, x) => x, undefined);

  nth = async (n: number): Promise<Option<T>> =>
    (await this.advanceBy(n)) ? (await this.next()).value : undefined;

  partition = async (f: AsyncPredicate<T>): Promise<[T[], T[]]> => {
    const partitions = [[], []] as [T[], T[]];

    await this.forEach(async (value) => {
      partitions[+!(await f(value))].push(value);
    });

    return partitions;
  };

  some = async (f: AsyncPredicate<T>): Promise<boolean> => {
    for await (const value of this) {
      if (await f(value)) {
        return true;
      }
    }

    return false;
  };

  toSync = async (): Promise<Iter<T>> => iter(await this.collect());
}

export class AsyncIter<T> extends AsyncBaseIter<T> {
  data: AsyncIterator<T>;

  static fromSync<T>(data: Iterable<Promise<T>> | Iterable<T>): AsyncIter<T> {
    async function* generator(): AsyncIterable<T> {
      for (const value of data) {
        yield await value;
      }
    }

    return new AsyncIter(generator()[Symbol.asyncIterator]());
  }

  constructor(data: AsyncIterator<T>) {
    super();
    this.data = data;
  }

  next = async (): Promise<Result<T>> => await this.data.next();

  get [Symbol.toStringTag](): string {
    return "AsyncIter";
  }
}

class Empty<T> extends AsyncBaseIter<T> {
  next = async (): Promise<CheckedResult<T>> => doneResult();

  get [Symbol.toStringTag](): string {
    return "Empty";
  }
}

class Once<T> extends AsyncBaseIter<T> {
  item: T;

  done = false;

  constructor(item: T) {
    super();
    this.item = item;
  }

  async next(): Promise<CheckedResult<T>> {
    if (this.done) {
      return doneResult();
    }

    this.done = true;

    return { done: false, value: this.item };
  }

  get [Symbol.toStringTag](): string {
    return "Once";
  }
}

class Repeat<T> extends AsyncBaseIter<T> {
  item: T;

  constructor(item: T) {
    super();
    this.item = item;
  }

  next = async (): Promise<CheckedResult<T>> => ({
    done: false,
    value: this.item,
  });

  get [Symbol.toStringTag](): string {
    return "Repeat";
  }
}

class From<T> extends AsyncBaseIter<T> {
  f: () => T;

  constructor(f: () => T) {
    super();
    this.f = f;
  }

  next = async (): Promise<CheckedResult<T>> => ({
    done: false,
    value: this.f(),
  });

  get [Symbol.toStringTag](): string {
    return "From";
  }
}

class Await<T> extends AsyncBaseIter<Awaited<T>> {
  data: AsyncIterator<T>;

  constructor(data: AsyncIterator<T>) {
    super();

    this.data = data;
  }

  next = async (): Promise<CheckedResult<Awaited<T>>> =>
    await mapAwaitResult(await this.data.next(), (value) => value);

  get [Symbol.toStringTag](): string {
    return "Await";
  }
}

class Enumerate<T> extends AsyncBaseIter<Enumerated<T>> {
  data: AsyncIterator<T>;

  i = 0;

  constructor(data: AsyncIterator<T>) {
    super();

    this.data = data;
  }

  next = async (): Promise<CheckedResult<Enumerated<T>>> =>
    mapResult(
      await this.data.next(),
      (value) => [this.i++, value] as Enumerated<T>,
    );

  get [Symbol.toStringTag](): string {
    return "Enumerate";
  }
}

class Chain<T> extends AsyncBaseIter<T> {
  a: AsyncIterator<T>;
  b: AsyncIterator<T>;

  constructor(data: AsyncIterator<T>, extension: AsyncIterator<T>) {
    super();

    this.a = data;
    this.b = extension;
  }

  async next(): Promise<Result<T>> {
    const { done, value } = await this.a.next();

    if (done ?? false) {
      return await this.b.next();
    }

    return { done, value };
  }

  get [Symbol.toStringTag](): string {
    return "Chain";
  }
}

class Filter<T> extends AsyncBaseIter<T> {
  data: AsyncBaseIter<T>;
  predicate: AsyncPredicate<T>;

  constructor(data: AsyncBaseIter<T>, f: AsyncPredicate<T>) {
    super();

    this.data = data;
    this.predicate = f;
  }

  next = async (): Promise<CheckedResult<T>> =>
    toResult(await this.data.find(this.predicate));

  get [Symbol.toStringTag](): string {
    return "Filter";
  }
}

class FilterMap<T, U> extends AsyncBaseIter<U> {
  data: AsyncBaseIter<T>;
  predicate: AsyncPredicate<T>;
  f: (value: T) => U;

  constructor(
    data: AsyncBaseIter<T>,
    p: AsyncPredicate<T>,
    f: (value: T) => U,
  ) {
    super();

    this.data = data;
    this.predicate = p;
    this.f = f;
  }

  next = async (): Promise<CheckedResult<U>> =>
    mapResult(toResult(await this.data.find(this.predicate)), this.f);

  get [Symbol.toStringTag](): string {
    return "FilterMap";
  }
}

type Flattened<T> = T extends Iterable<infer F>
  ? F
  : T extends AsyncIterable<infer F>
  ? F
  : never;

class Flatten<T> extends AsyncBaseIter<Flattened<T>> {
  data: AsyncIterator<T>;
  current: AsyncIterator<Flattened<T>> = new Empty();

  done = false;

  static readonly toIterator = <U>(
    value: U | Iterable<U> | AsyncIterable<U>,
  ): AsyncIterator<Flattened<U>> => {
    if (Flatten.isIterable(value)) {
      return AsyncIter.fromSync(value) as AsyncIterator<Flattened<U>>;
    } else if (Flatten.isAsyncIterable(value)) {
      return value[Symbol.asyncIterator]() as AsyncIterator<Flattened<U>>;
    } else {
      return once(value as Flattened<U>);
    }
  };

  private static readonly isAsyncIterable = <U>(
    value: U | AsyncIterable<U>,
  ): value is AsyncIterable<U> =>
    Symbol.asyncIterator in (Object(value) as AsyncIterable<U>);

  private static readonly isIterable = <U>(
    value: U | Iterable<U>,
  ): value is Iterable<U> => Symbol.iterator in (Object(value) as Iterable<U>);

  constructor(data: AsyncIterator<T>) {
    super();

    this.data = data;
  }

  private async nextIter(): Promise<void> {
    const { done, value } = await this.data.next();

    if (done ?? false) {
      this.done = true;
    } else {
      this.current = Flatten.toIterator(value);
    }
  }

  async next(): Promise<CheckedResult<Flattened<T>>> {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = await this.current.next();

    if (done ?? false) {
      await this.nextIter();

      return await this.next();
    }

    return { done: false, value };
  }

  get [Symbol.toStringTag](): string {
    return "Flatten";
  }
}

class FlatMap<T, U> extends AsyncBaseIter<U> {
  data: AsyncIterator<T>;
  current: AsyncIterator<Flattened<T>> = new Empty();

  f: (value: Flattened<T>) => U;

  done = false;

  constructor(data: AsyncIterator<T>, f: (value: Flattened<T>) => U) {
    super();

    this.data = data;
    this.f = f;
  }

  private async nextIter(): Promise<void> {
    const { done, value } = await this.data.next();

    if (done ?? false) {
      this.done = true;
    } else {
      this.current = Flatten.toIterator(value);
    }
  }

  async next(): Promise<CheckedResult<U>> {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = await this.current.next();

    if (done ?? false) {
      await this.nextIter();

      return this.next();
    }

    return { done: false, value: this.f(value) };
  }

  get [Symbol.toStringTag](): string {
    return "FlatMap";
  }
}

class Inspect<T> extends AsyncBaseIter<T> {
  data: AsyncIterator<T>;
  f: (value: T) => void;

  constructor(data: AsyncIterator<T>, f: (value: T) => void) {
    super();

    this.data = data;
    this.f = f;
  }

  async next(): Promise<CheckedResult<T>> {
    const { done, value } = await this.data.next();

    if (done ?? false) {
      return { done: true, value: undefined };
    } else {
      this.f(value);
      return { done: false, value };
    }
  }

  get [Symbol.toStringTag](): string {
    return "Inspect";
  }
}

// rome-ignore lint: builtin Map is quite uncommon
class Map<T, U> extends AsyncBaseIter<U> {
  data: AsyncIterator<T>;
  f: (value: T) => U;

  constructor(data: AsyncIterator<T>, f: (value: T) => U) {
    super();

    this.data = data;
    this.f = f;
  }

  next = async (): Promise<CheckedResult<U>> =>
    mapResult(await this.data.next(), this.f);

  get [Symbol.toStringTag](): string {
    return "Map";
  }
}

class MapAwait<T, U> extends AsyncBaseIter<U> {
  data: AsyncIterator<T>;
  f: (value: T) => Promise<U>;

  constructor(data: AsyncIterator<T>, f: (value: T) => Promise<U>) {
    super();

    this.data = data;
    this.f = f;
  }

  next = async (): Promise<CheckedResult<U>> => {
    const { done, value } = await this.data.next();

    return done ?? false
      ? { done: true, value: undefined }
      : { done: false, value: await this.f(value) };
  };

  get [Symbol.toStringTag](): string {
    return "MapAwait";
  }
}

class Peekable<T> extends AsyncBaseIter<T> {
  data: AsyncIterator<T>;
  peeked: Result<T> | undefined;

  constructor(data: AsyncIterator<T>) {
    super();

    this.data = data;
    this.peeked = undefined;
  }

  async next(): Promise<Result<T>> {
    const current = this.peeked ?? (await this.data.next());

    this.peeked = undefined;

    return current;
  }

  async peek(): Promise<Result<T>> {
    if (this.peeked !== undefined) {
      return this.peeked;
    }

    const peek = await this.data.next();
    this.peeked = peek;
    return peek;
  }

  get [Symbol.toStringTag](): string {
    return "Peekable";
  }
}

class Skip<T> extends AsyncBaseIter<T> {
  data: AsyncBaseIter<T>;
  target: number;

  skipped = false;

  constructor(data: AsyncBaseIter<T>, n: number) {
    super();

    this.data = data;
    this.target = n;
  }

  async next(): Promise<Result<T>> {
    if (!this.skipped) {
      this.skipped = true;
      return toResult(await this.data.nth(this.target));
    }

    return await this.data.next();
  }

  get [Symbol.toStringTag](): string {
    return "Skip";
  }
}

class SkipWhile<T> extends AsyncBaseIter<T> {
  data: AsyncBaseIter<T>;
  predicate: AsyncPredicate<T>;

  skipped = false;

  constructor(data: AsyncBaseIter<T>, f: AsyncPredicate<T>) {
    super();
    this.data = data;
    this.predicate = f;
  }

  async next(): Promise<Result<T>> {
    if (!this.skipped) {
      this.skipped = true;
      return toResult(
        await this.data.find(async (x) => !(await this.predicate(x))),
      );
    }

    return await this.data.next();
  }

  get [Symbol.toStringTag](): string {
    return "SkipWhile";
  }
}

class StepBy<T> extends AsyncBaseIter<T> {
  data: AsyncBaseIter<T>;
  step: number;

  first = true;

  constructor(data: AsyncBaseIter<T>, step: number) {
    super();

    this.data = data;
    this.step = step;
  }

  async next(): Promise<Result<T>> {
    if (this.first) {
      this.first = false;
      return await this.data.next();
    }

    return toResult(await this.data.nth(this.step - 1));
  }

  get [Symbol.toStringTag](): string {
    return "StepBy";
  }
}

class Take<T> extends AsyncBaseIter<T> {
  data: AsyncIterator<T>;
  limit: number;

  index = 0;

  constructor(data: AsyncIterator<T>, limit: number) {
    super();

    this.data = data;
    this.limit = limit;
  }

  next = async (): Promise<Result<T>> =>
    this.index++ < this.limit ? await this.data.next() : doneResult();

  get [Symbol.toStringTag](): string {
    return "Take";
  }
}

class TakeWhile<T> extends AsyncBaseIter<T> {
  data: AsyncIterator<T>;
  predicate: AsyncPredicate<T>;

  done = false;

  constructor(data: AsyncIterator<T>, f: AsyncPredicate<T>) {
    super();

    this.data = data;
    this.predicate = f;
  }

  next = async (): Promise<CheckedResult<T>> => {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = await this.data.next();

    if (!(done ?? false) && (await this.predicate(value))) {
      return { done: false, value };
    }

    this.done = true;
    return doneResult();
  };

  get [Symbol.toStringTag](): string {
    return "TakeWhile";
  }
}

class Zip<T, U> extends AsyncBaseIter<Zipped<T, U>> {
  a: AsyncIterator<T>;
  b: AsyncIterator<U>;

  constructor(data: AsyncIterator<T>, zipped: AsyncIterator<U>) {
    super();

    this.a = data;
    this.b = zipped;
  }

  async next(): Promise<CheckedResult<Zipped<T, U>>> {
    const nextA = await this.a.next();
    const nextB = await this.b.next();

    if ((nextA.done ?? false) || (nextB.done ?? false)) {
      return doneResult();
    }

    return { done: false, value: [nextA.value, nextB.value] as Zipped<T, U> };
  }

  get [Symbol.toStringTag](): string {
    return "Zip";
  }
}

const asyncRange = (n: number): AsyncIter<number> =>
  AsyncIter.fromSync(range(n));
