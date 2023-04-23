export const iter = <T>(data: Iterable<T>): Iter<T> =>
  new Iter(data[Symbol.iterator]());

export const wrapIter = <T>(iterator: Iterator<T>): Iter<T> =>
  new Iter(iterator);

export const empty = <T>(): Empty<T> => new Empty();
export const once = <T>(value: T): Once<T> => new Once(value);
export const repeat = <T>(value: T): Repeat<T> => new Repeat(value);
export const from = <T>(f: () => T): From<T> => new From(f);

export type Predicate<T> = (value: T) => boolean;
export type Enumerated<T> = readonly [number, T];
export type Zipped<T, U> = readonly [T, U];

export type Result<T> = IteratorResult<T, undefined>;
export type CheckedResult<T> =
  | { done: true; value: undefined }
  | { done: false; value: T };

export type Option<T> = T | undefined;

export const mapResult = <T, U>(
  { done, value }: Result<T>,
  f: (value: T) => U,
): CheckedResult<U> =>
  done ?? false
    ? { done: true, value: undefined }
    : { done: false, value: f(value) };

export const toResult = <T>(value: Option<T>): CheckedResult<T> =>
  value === undefined
    ? { done: true, value: undefined }
    : { done: false, value };

export const doneResult = <T>(): CheckedResult<T> => ({
  done: true,
  value: undefined,
});

export abstract class BaseIter<T> implements Iterable<T>, Iterator<T> {
  abstract next(): Result<T>;

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  abstract get [Symbol.toStringTag](): string;

  chain = (extension: Iterable<T>): Chain<T> =>
    new Chain(this, extension[Symbol.iterator]());

  enumerate = (): Enumerate<T> => new Enumerate(this);

  filter = (f: Predicate<T>): Filter<T> => new Filter(this, f);

  filterMap = <U>(p: Predicate<T>, f: (value: T) => U): FilterMap<T, U> =>
    new FilterMap(this, p, f);

  flatten = (): Flatten<T> => new Flatten(this);

  flatMap = <U>(f: (value: T) => Iterable<U>): FlatMap<T, U> =>
    new FlatMap(this, f);

  inspect = (f: (value: T) => void): Inspect<T> => new Inspect(this, f);

  map = <U>(f: (value: T) => U): Map<T, U> => new Map(this, f);

  peekable = (): Peekable<T> => new Peekable(this);

  skip = (n: number): Skip<T> => new Skip(this, n);

  skipWhile = (f: Predicate<T>): SkipWhile<T> => new SkipWhile(this, f);

  stepBy = (n: number): StepBy<T> => new StepBy(this, n);

  take = (limit: number): Take<T> => new Take(this, limit);

  takeWhile = (f: Predicate<T>): TakeWhile<T> => new TakeWhile(this, f);

  zip = <U>(other: Iterable<U>): Zip<T, U> =>
    new Zip(this, other[Symbol.iterator]());

  advanceBy = (n: number): boolean =>
    range(n).all((_) => !(this.next().done ?? false));

  all(f: Predicate<T>): boolean {
    for (const value of this) {
      if (!f(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * creates new array from the values of the iterator
   */
  collect = (): T[] => [...this];

  consume = (): void => this.forEach((_) => undefined);

  count = (): number => this.fold((count) => count + 1, 0);

  find(f: Predicate<T>): Option<T> {
    for (const value of this) {
      if (f(value)) {
        return value;
      }
    }

    return undefined;
  }

  fold<U>(f: (acc: U, current: T) => U, start: U): U {
    let acc = start;

    for (const value of this) {
      acc = f(acc, value);
    }

    return acc;
  }

  forEach(f: (value: T) => void): void {
    for (const value of this) {
      f(value);
    }
  }

  join(separator = ""): string {
    const iter = this.map((value) => String(value));

    const { done, value } = iter.next();

    return done
      ? ""
      : iter.fold((result, value) => result + separator + value, value);
  }

  last = (): Option<T> => this.fold<Option<T>>((_, x) => x, undefined);

  nth = (n: number): Option<T> =>
    this.advanceBy(n) ? this.next().value : undefined;

  partition = (f: Predicate<T>): [T[], T[]] => {
    const partitions = [[], []] as [T[], T[]];

    this.forEach((value) => {
      partitions[+!f(value)].push(value);
    });

    return partitions;
  };

  some = (f: Predicate<T>): boolean => {
    for (const value of this) {
      if (f(value)) {
        return true;
      }
    }

    return false;
  };
}

export class Iter<T> extends BaseIter<T> {
  data: Iterator<T>;

  constructor(data: Iterator<T>) {
    super();
    this.data = data;
  }

  next = (): Result<T> => this.data.next();

  get [Symbol.toStringTag](): string {
    return "Iter";
  }
}

class Empty<T> extends BaseIter<T> {
  next = (): CheckedResult<T> => doneResult();

  get [Symbol.toStringTag](): string {
    return "Empty";
  }
}

class Once<T> extends BaseIter<T> {
  item: T;

  done = false;

  constructor(item: T) {
    super();
    this.item = item;
  }

  next(): CheckedResult<T> {
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

class Repeat<T> extends BaseIter<T> {
  item: T;

  constructor(item: T) {
    super();
    this.item = item;
  }

  next = (): CheckedResult<T> => ({ done: false, value: this.item });

  get [Symbol.toStringTag](): string {
    return "Repeat";
  }
}

class From<T> extends BaseIter<T> {
  f: () => T;

  constructor(f: () => T) {
    super();
    this.f = f;
  }

  next = (): CheckedResult<T> => ({ done: false, value: this.f() });

  get [Symbol.toStringTag](): string {
    return "From";
  }
}

class Enumerate<T> extends BaseIter<Enumerated<T>> {
  data: Iterator<T>;

  i = 0;

  constructor(data: Iterator<T>) {
    super();

    this.data = data;
  }

  next = (): CheckedResult<Enumerated<T>> =>
    mapResult(this.data.next(), (value) => [this.i++, value] as Enumerated<T>);

  get [Symbol.toStringTag](): string {
    return "Enumerate";
  }
}

class Chain<T> extends BaseIter<T> {
  a: Iterator<T>;
  b: Iterator<T>;

  constructor(data: Iterator<T>, extension: Iterator<T>) {
    super();

    this.a = data;
    this.b = extension;
  }

  next(): Result<T> {
    const { done, value } = this.a.next();

    if (done ?? false) {
      return this.b.next();
    }

    return { done, value };
  }

  get [Symbol.toStringTag](): string {
    return "Chain";
  }
}

class Filter<T> extends BaseIter<T> {
  data: BaseIter<T>;
  predicate: Predicate<T>;

  constructor(data: BaseIter<T>, f: Predicate<T>) {
    super();

    this.data = data;
    this.predicate = f;
  }

  next = (): CheckedResult<T> => toResult(this.data.find(this.predicate));

  get [Symbol.toStringTag](): string {
    return "Filter";
  }
}

class FilterMap<T, U> extends BaseIter<U> {
  data: BaseIter<T>;
  predicate: Predicate<T>;
  f: (value: T) => U;

  constructor(data: BaseIter<T>, p: Predicate<T>, f: (value: T) => U) {
    super();

    this.data = data;
    this.predicate = p;
    this.f = f;
  }

  next = (): CheckedResult<U> =>
    mapResult(toResult(this.data.find(this.predicate)), this.f);

  get [Symbol.toStringTag](): string {
    return "FilterMap";
  }
}

type Flattened<T> = T extends Iterable<infer F> ? F : never;

class Flatten<T> extends BaseIter<Flattened<T>> {
  data: Iterator<T>;
  current: Iterator<Flattened<T>> = new Empty();

  done = false;

  static readonly toIterator = <U>(
    value: U | Iterable<U>,
  ): Iterator<Flattened<U>> =>
    Flatten.isIterable(value)
      ? (value[Symbol.iterator]() as Iterator<Flattened<U>>)
      : once(value as Flattened<U>);

  private static readonly isIterable = <U>(
    value: U | Iterable<U>,
  ): value is Iterable<U> => Symbol.iterator in (Object(value) as Iterable<U>);

  constructor(data: Iterator<T>) {
    super();

    this.data = data;
  }

  private nextIter(): void {
    const { done, value } = this.data.next();

    if (done ?? false) {
      this.done = true;
    } else {
      this.current = Flatten.toIterator(value);
    }
  }

  next(): CheckedResult<Flattened<T>> {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = this.current.next();

    if (done ?? false) {
      this.nextIter();

      return this.next();
    }

    return { done: false, value };
  }

  get [Symbol.toStringTag](): string {
    return "Flatten";
  }
}

class FlatMap<T, U> extends BaseIter<U> {
  data: Iterator<T>;
  current: Iterator<U> = new Empty();

  f: (value: T) => Iterable<U>;

  done = false;

  constructor(data: Iterator<T>, f: (value: T) => Iterable<U>) {
    super();

    this.data = data;
    this.f = f;
  }

  private nextIter(): void {
    const { done, value } = this.data.next();

    if (done ?? false) {
      this.done = true;
    } else {
      this.current = this.f(value)[Symbol.iterator]();
    }
  }

  next(): CheckedResult<U> {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = this.current.next();

    if (done ?? false) {
      this.nextIter();

      return this.next();
    }

    return { done: false, value };
  }

  get [Symbol.toStringTag](): string {
    return "FlatMap";
  }
}

class Inspect<T> extends BaseIter<T> {
  data: Iterator<T>;
  f: (value: T) => void;

  constructor(data: Iterator<T>, f: (value: T) => void) {
    super();

    this.data = data;
    this.f = f;
  }

  next(): CheckedResult<T> {
    const { done, value } = this.data.next();

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
class Map<T, U> extends BaseIter<U> {
  data: Iterator<T>;
  f: (value: T) => U;

  constructor(data: Iterator<T>, f: (value: T) => U) {
    super();

    this.data = data;
    this.f = f;
  }

  next = (): CheckedResult<U> => mapResult(this.data.next(), this.f);

  get [Symbol.toStringTag](): string {
    return "Map";
  }
}

class Peekable<T> extends BaseIter<T> {
  data: Iterator<T>;
  peeked: Result<T> | undefined;

  constructor(data: Iterator<T>) {
    super();

    this.data = data;
    this.peeked = undefined;
  }

  next(): Result<T> {
    const current = this.peeked ?? this.data.next();

    this.peeked = undefined;

    return current;
  }

  peek(): Result<T> {
    if (this.peeked !== undefined) {
      return this.peeked;
    }

    const peek = this.data.next();
    this.peeked = peek;
    return peek;
  }

  get [Symbol.toStringTag](): string {
    return "Peekable";
  }
}

class Skip<T> extends BaseIter<T> {
  data: BaseIter<T>;
  target: number;

  skipped = false;

  constructor(data: BaseIter<T>, n: number) {
    super();

    this.data = data;
    this.target = n;
  }

  next(): Result<T> {
    if (!this.skipped) {
      this.skipped = true;
      return toResult(this.data.nth(this.target));
    }

    return this.data.next();
  }

  get [Symbol.toStringTag](): string {
    return "Skip";
  }
}

class SkipWhile<T> extends BaseIter<T> {
  data: BaseIter<T>;
  predicate: Predicate<T>;

  skipped = false;

  constructor(data: BaseIter<T>, f: Predicate<T>) {
    super();
    this.data = data;
    this.predicate = f;
  }

  next(): Result<T> {
    if (!this.skipped) {
      this.skipped = true;
      return toResult(this.data.find((x) => !this.predicate(x)));
    }

    return this.data.next();
  }

  get [Symbol.toStringTag](): string {
    return "SkipWhile";
  }
}

class StepBy<T> extends BaseIter<T> {
  data: BaseIter<T>;
  step: number;

  first = true;

  constructor(data: BaseIter<T>, step: number) {
    super();

    this.data = data;
    this.step = step;
  }

  next(): Result<T> {
    if (this.first) {
      this.first = false;
      return this.data.next();
    }

    return toResult(this.data.nth(this.step - 1));
  }

  get [Symbol.toStringTag](): string {
    return "StepBy";
  }
}

class Take<T> extends BaseIter<T> {
  data: Iterator<T>;
  limit: number;

  index = 0;

  constructor(data: Iterator<T>, limit: number) {
    super();

    this.data = data;
    this.limit = limit;
  }

  next = (): Result<T> =>
    this.index++ < this.limit ? this.data.next() : doneResult();

  get [Symbol.toStringTag](): string {
    return "Take";
  }
}

class TakeWhile<T> extends BaseIter<T> {
  data: Iterator<T>;
  predicate: Predicate<T>;

  done = false;

  constructor(data: Iterator<T>, f: Predicate<T>) {
    super();

    this.data = data;
    this.predicate = f;
  }

  next = (): CheckedResult<T> => {
    if (this.done) {
      return doneResult();
    }

    const { done, value } = this.data.next();

    if (!(done ?? false) && this.predicate(value)) {
      return { done: false, value };
    }

    this.done = true;
    return doneResult();
  };

  get [Symbol.toStringTag](): string {
    return "TakeWhile";
  }
}

class Zip<T, U> extends BaseIter<Zipped<T, U>> {
  a: Iterator<T>;
  b: Iterator<U>;

  constructor(data: Iterator<T>, zipped: Iterator<U>) {
    super();

    this.a = data;
    this.b = zipped;
  }

  next(): CheckedResult<Zipped<T, U>> {
    const nextA = this.a.next();
    const nextB = this.b.next();

    if ((nextA.done ?? false) || (nextB.done ?? false)) {
      return doneResult();
    }

    return { done: false, value: [nextA.value, nextB.value] as Zipped<T, U> };
  }

  get [Symbol.toStringTag](): string {
    return "Zip";
  }
}

export function range(end: number): Range;
export function range(start: number, end: number): Range;
export function range(start: number, end: number, step: number): Range;
/**
 * returns generator, which yields numbers from min to max with defined step
 * if only min is specified, it yields numbers from 0 to min
 * @param {number} start lower bound (inclusive)
 * @param {number} end upper bound (exclusive)
 * @param {number} step
 * @returns {Range}
 */
export function range(start: number, end?: number, step?: number): Range {
  return new Range(start, end, step);
}

class Range extends BaseIter<number> {
  start = 0;
  step = 1;
  end: number;

  ascending;

  i: number;

  constructor(start: number, end?: number, step?: number) {
    super();

    if (end === undefined) {
      // if only start is specified, then go from 0 to "start"
      this.end = start;
      this.start = 0;
    } else {
      this.start = start;
      this.end = end;
    }

    this.step = step ?? 1;

    if (this.step === 0) {
      throw new Error("step can't be 0");
    }

    this.i = this.start;

    this.ascending = this.step > 0;
  }

  next(): CheckedResult<number> {
    if (this.ascending ? this.i < this.end : this.i > this.end) {
      const { i, step } = this;
      this.i += step;
      return toResult(i);
    }

    return doneResult();
  }

  get [Symbol.toStringTag](): string {
    return "Range";
  }
}
