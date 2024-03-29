import { Iter, Result } from "../src/iterator";
import {
  AsyncBaseIter,
  asyncIter,
  AsyncIter,
  empty,
  from,
  mapAwaitResult,
  once,
  repeat,
  wrapAsyncIter,
} from "../src/iterator.async";
const { fromSync } = AsyncIter;

async function expectNextEquals<T>(
  iter: AsyncBaseIter<T>,
  value: T,
): Promise<void> {
  expect(await iter.next()).toStrictEqual({
    value,
    done: false,
  });
}

async function expectIsEmpty<T>(iter: AsyncBaseIter<T>): Promise<void> {
  expect(await iter.next()).toStrictEqual({
    value: undefined,
    done: true,
  });
}

async function expectCollected<T>(
  iter: AsyncBaseIter<T>,
  array: T[],
): Promise<void> {
  expect(await iter.collect()).toStrictEqual(array);
}

test("asyncIter", async () => {
  const data = asyncIter((async function* () {})());

  expect(data).toBeInstanceOf(AsyncIter);
});

test("wrapAsyncIter", () => {
  let i = 0;
  const data = wrapAsyncIter({
    next: async () => ({
      value: i++,
    }),
  });

  expect(data).toBeInstanceOf(AsyncIter);
});

test("mapAwaitResult", async () => {
  const result: Result<number> = {
    done: true,
    value: undefined,
  };

  expect(
    await mapAwaitResult(result as Result<number>, (x) => x * 2),
  ).toStrictEqual({
    done: true,
    value: undefined,
  });

  const result2: Result<number> = {
    done: false,
    value: 2,
  };

  expect(await mapAwaitResult(result2, (x) => x * 2)).toStrictEqual({
    done: false,
    value: 4,
  });

  const result3: Result<number> = {
    value: 2,
  };

  expect(await mapAwaitResult(result3, (x) => x * 2)).toStrictEqual({
    done: false,
    value: 4,
  });

  const result4: Result<number> = {
    done: false,
    value: 2,
  };

  expect(await mapAwaitResult(result4, async (x) => x * 2)).toStrictEqual({
    done: false,
    value: 4,
  });
});

test("fromSync", async () => {
  const data = fromSync([0, 1, 2]);

  expect(data).toBeInstanceOf(AsyncIter);

  await expectCollected(data, [0, 1, 2]);

  const data2 = fromSync([
    Promise.resolve(0),
    Promise.resolve(1),
    Promise.resolve(2),
  ]);

  expect(data2).toBeInstanceOf(AsyncIter);

  await expectCollected(data2, [0, 1, 2]);
});

test("next", async () => {
  const data = fromSync([0, 1, 2]);

  await expectNextEquals(data, 0);
  await expectNextEquals(data, 1);
  await expectNextEquals(data, 2);

  await expectIsEmpty(data);
  await expectIsEmpty(data);
  await expectIsEmpty(data);
});

test("Symbol.toStringTag", async () => {
  const data = fromSync([]);

  expect(String(data)).toBe("[object AsyncIter]");
});

test("repeat", async () => {
  const data = repeat(2);

  expect(String(data)).toBe("[object Repeat]");

  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
});

test("empty", async () => {
  await expectIsEmpty(empty());
  expect(String(empty())).toBe("[object Empty]");
});

test("once", async () => {
  const data = once(0);
  expect(String(data)).toBe("[object Once]");
  await expectCollected(data, [0]);
});

test("from", async () => {
  let x = 0;
  const data = from(async () => x++);

  expect(String(data)).toBe("[object From]");

  await expectNextEquals(data, 0);
  await expectNextEquals(data, 1);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 3);
  await expectNextEquals(data, 4);
});

test("await", async () => {
  const data = fromSync([0, 1, 2]);

  const awaited = data.map(async (x) => x).await();

  await expectCollected(awaited, [0, 1, 2]);

  expect(String(awaited)).toBe("[object Await]");
});

test("chain", async () => {
  const data = fromSync([0, 1]);
  const data2 = fromSync([2, 3]);

  const chained = data.chain(data2);

  await expectCollected(chained, [0, 1, 2, 3]);

  expect(String(chained)).toBe("[object Chain]");
});

test("chunks", async () => {
  const data = fromSync([0, 1, 2, 3, 4]);

  const chunks = data.chunks(2);

  await expectCollected(chunks, [[0, 1], [2, 3], [4]]);

  expect(String(chunks)).toBe("[object Chunks]");
});

test("chunksExact", async () => {
  const data = fromSync([0, 1, 2, 3, 4]);

  const chunks = data.chunksExact(2);

  expect(chunks.remainder).toStrictEqual([]);

  await expectCollected(chunks, [
    [0, 1],
    [2, 3],
  ]);

  expect(chunks.remainder).toStrictEqual([4]);

  const data2 = fromSync([0, 1, 2, 3, 4, 5]);

  const chunks2 = data2.chunksExact(2);

  expect(chunks2.remainder).toStrictEqual([]);

  await expectCollected(chunks2, [
    [0, 1],
    [2, 3],
    [4, 5],
  ]);

  expect(chunks2.remainder).toStrictEqual([]);

  expect(String(chunks)).toBe("[object ChunksExact]");
});

test("enumerate", async () => {
  const data = fromSync([2, 1, 0]);

  const enumerated = data.enumerate();

  await expectCollected(enumerated, [
    [0, 2],
    [1, 1],
    [2, 0],
  ]);

  expect(String(enumerated)).toBe("[object Enumerate]");
});

test("filter", async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5]);

  const filtered = data.filter((x) => x % 2 === 0);

  await expectCollected(filtered, [0, 2, 4]);

  expect(String(filtered)).toBe("[object Filter]");
});

test("filterMap", async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5]);

  const filtered = data.filterMap(
    (x) => x % 2 === 0,
    (x) => x * 2,
  );

  await expectCollected(filtered, [0, 4, 8]);

  expect(String(filtered)).toBe("[object FilterMap]");
});

test("flatten", async () => {
  const data = fromSync([0, [1, 2, [3, 4]], 5]);

  const flattened = data.flatten();

  await expectCollected(flattened, [0, 1, 2, [3, 4], 5]);

  expect(String(flattened)).toBe("[object Flatten]");

  const data2 = fromSync([0, fromSync([1, 2, [3, 4]]), 5]);

  const flattened2 = data2.flatten();

  await expectCollected(flattened2, [0, 1, 2, [3, 4], 5]);
});

test("flatMap", async () => {
  const data = ["alpha", "beta"];

  const f = (s: string) => s.split("");
  const flatMapped = fromSync(data).flatMap(f);
  const expected = fromSync(data).map(f).flatten();

  await expectCollected(flatMapped, await expected.collect());

  expect(String(flatMapped)).toBe("[object FlatMap]");
});

test("inspect", async () => {
  const data = fromSync([0, 1, 2, 3]);
  const fn = jest.fn();

  const inspected = data.inspect(fn);

  await expectCollected(inspected, [0, 1, 2, 3]);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);

  expect(String(inspected)).toBe("[object Inspect]");
});

test("map", async () => {
  const data = fromSync([0, 1, 2]);

  const mapped = data.map((x) => x + 1);

  await expectCollected(mapped, [1, 2, 3]);

  expect(String(mapped)).toBe("[object Map]");
});

test("mapAwait", async () => {
  const data = fromSync([0, 1, 2]);

  const mapped = data.mapAwait(async (x) => x + 1);

  await expectCollected(mapped, [1, 2, 3]);

  expect(String(mapped)).toBe("[object MapAwait]");
});

test("peek", async () => {
  const data = fromSync([0, 1, 2]).peekable();

  expect(await data.peek()).toStrictEqual({ value: 0, done: false });
  // second peek has to return the same thing
  expect(await data.peek()).toStrictEqual({ value: 0, done: false });
  await expectNextEquals(data, 0);
  expect(await data.peek()).toStrictEqual({ value: 1, done: false });
  await expectNextEquals(data, 1);
  await expectNextEquals(data, 2);

  expect(await data.peek()).toStrictEqual({ value: undefined, done: true });
  await expectIsEmpty(data);

  expect(String(data)).toBe("[object Peekable]");
});

test("skip", async () => {
  const data = [0, 1, 2, 3];

  const skipped = fromSync(data).skip(5);

  await expectCollected(fromSync(data).skip(2), [2, 3]);
  await expectCollected(fromSync(data).skip(0), [0, 1, 2, 3]);
  await expectIsEmpty(skipped);

  // check short-circuiting
  const iterator = fromSync(data);
  const spy = jest.spyOn(iterator, "next");
  await iterator.skip(10).consume();
  expect(spy).toHaveBeenCalledTimes(5);

  expect(String(skipped)).toBe("[object Skip]");
});

test("skipWhile", async () => {
  const data = [0, 2, 4, 5, 6, 7];

  const skipped = fromSync(data).skipWhile((x) => x % 2 === 0);

  await expectCollected(skipped, [5, 6, 7]);

  await expectIsEmpty(fromSync(data).skipWhile((x) => x < 10));

  expect(String(skipped)).toBe("[object SkipWhile]");
});

test("stepBy", async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const stepped = data.stepBy(3);

  await expectCollected(stepped, [0, 3, 6, 9]);

  expect(String(stepped)).toBe("[object StepBy]");
});

test("take", async () => {
  const data = [0, 1, 2, 3, 4, 5];

  const taken = fromSync(data).take(3);

  await expectCollected(taken, [0, 1, 2]);

  await expectIsEmpty(fromSync(data).take(0));
  await expectIsEmpty(fromSync(data).take(-1));

  expect(String(taken)).toBe("[object Take]");
});

test("takeWhile", async () => {
  const data = [0, 3, 6, 9, 12, 15];

  const iterator = fromSync(data);

  const taken = iterator.takeWhile((x) => x < 10);
  await expectCollected(taken, [0, 3, 6, 9]);

  const spy = jest.spyOn(iterator, "next");
  await expectIsEmpty(taken);
  expect(spy).toHaveBeenCalledTimes(0);

  await expectIsEmpty(taken);

  await expectIsEmpty(fromSync(data).takeWhile((x) => x < 0));

  expect(String(taken)).toBe("[object TakeWhile]");
});

test("zip", async () => {
  const data = [0, 1];

  const data2 = fromSync([2, 3, 4]);

  const zipped = fromSync(data).zip(data2);

  await expectCollected(zipped, [
    [0, 2],
    [1, 3],
  ]);

  const data3 = fromSync([2]);

  await expectCollected(fromSync(data).zip(data3), [[0, 2]]);

  expect(String(zipped)).toBe("[object Zip]");
});

test("advanceBy", async () => {
  const data = [0, 1, 2];
  let iter;

  iter = fromSync(data);
  await iter.advanceBy(0);
  await expectNextEquals(iter, 0);

  iter = fromSync(data);
  await iter.advanceBy(2);
  await expectNextEquals(iter, 2);

  iter = fromSync(data);
  await iter.advanceBy(3);
  await expectIsEmpty(iter);

  iter = fromSync(data);
  await iter.advanceBy(-2);
  await expectNextEquals(iter, 0);

  // check short-circuiting
  iter = fromSync(data);
  const spy = jest.spyOn(iter, "next");
  await iter.advanceBy(10);
  expect(spy).toHaveBeenCalledTimes(4);
  await expectIsEmpty(iter);
});

test("all", async () => {
  const data = [0, 1, 2, 3];

  expect(await fromSync(data).all((x) => x < 5)).toBe(true);
  expect(await fromSync(data).all((x) => x > 2)).toBe(false);
});

test("collect", async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).collect()).toStrictEqual(data);
});

test("consume", async () => {
  const fn = jest.fn((x) => x);
  const data = fromSync([0, 1, 2, 3]).map(fn);

  await data.consume();

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test("count", async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  expect(await data.count()).toBe(5);
});

test("find", async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  const found = await data.find((x) => x > 2 && x % 2 === 0);

  expect(found).toBe(4);

  const found2 = await data.find((x) => x % 2 === 0);

  expect(found2).toBe(undefined);
});

test("fold", async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  const folded = await data.fold((total, current) => total + current, 0);

  expect(folded).toBe(12);
});

test("forEach", async () => {
  const data = fromSync([0, 1, 2, 3]);
  const fn = jest.fn();

  await data.forEach(fn);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test("join", async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).join()).toBe("012");
  expect(await fromSync(data).join(", ")).toBe("0, 1, 2");

  expect(await fromSync([]).join(", ")).toBe("");
});

test("last", async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  expect(await data.last()).toBe(5);
});

test("nth", async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).nth(0)).toBe(0);
  expect(await fromSync(data).nth(2)).toBe(2);

  expect(await fromSync(data).nth(3)).toBe(undefined);

  expect(await fromSync(data).nth(-3)).toBe(0);
});

test("partition", async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5]);

  const [even, odd] = await data.partition((x) => x % 2 === 0);

  expect(even).toStrictEqual([0, 2, 4]);
  expect(odd).toStrictEqual([1, 3, 5]);
});

test("some", async () => {
  const data = [0, 1, 2, 3];

  expect(await fromSync(data).some((x) => x < 5)).toBe(true);
  expect(await fromSync(data).some((x) => x > 2)).toBe(true);
  expect(await fromSync(data).some((x) => x < 0)).toBe(false);
});

test("toSync", async () => {
  const data = fromSync([0, 1, 2]);

  expect(data).toBeInstanceOf(AsyncIter);

  const sync = await data.toSync();

  expect(sync).toBeInstanceOf(Iter);

  expect(sync.collect()).toStrictEqual([0, 1, 2]);
});

test("incomplete iterator protocol", async () => {
  function incompleteGenerator(n: number): AsyncIterable<number> {
    let i = 0;
    return {
      [Symbol.asyncIterator]: () => ({
        next: async () =>
          i >= n ? { done: true, value: undefined } : { value: i++ },
      }),
    };
  }

  function generatorOfIcompleteGenerators(
    n: number,
  ): AsyncIterable<AsyncIterable<number>> {
    let i = 0;
    return {
      [Symbol.asyncIterator]: () => ({
        next: async () =>
          i >= n
            ? { done: true, value: undefined }
            : { value: incompleteGenerator(++i) },
      }),
    };
  }

  let iterator;

  iterator = asyncIter(incompleteGenerator(4));
  await expectCollected(iterator, [0, 1, 2, 3]);

  iterator = asyncIter(incompleteGenerator(4));
  await iterator.advanceBy(2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(2)).chain(incompleteGenerator(2));
  await expectCollected(iterator, [0, 1, 0, 1]);

  iterator = asyncIter(incompleteGenerator(5)).chunks(2);
  await expectCollected(iterator, [[0, 1], [2, 3], [4]]);

  iterator = asyncIter(incompleteGenerator(5)).chunksExact(2);
  await expectCollected(iterator, [
    [0, 1],
    [2, 3],
  ]);
  expect(iterator.remainder).toStrictEqual([4]);

  iterator = once(incompleteGenerator(5)).flatten();
  await expectCollected(iterator, [0, 1, 2, 3, 4]);

  iterator = asyncIter(generatorOfIcompleteGenerators(3)).flatten();
  await expectCollected(iterator, [0, 0, 1, 0, 1, 2]);

  iterator = asyncIter(incompleteGenerator(3)).flatMap((g) =>
    incompleteGenerator(g + 1),
  );
  await expectCollected(iterator, [0, 0, 1, 0, 1, 2]);

  const fn = jest.fn();
  iterator = asyncIter(incompleteGenerator(4)).inspect(fn);
  await expectCollected(iterator, [0, 1, 2, 3]);
  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);

  iterator = asyncIter(incompleteGenerator(4)).mapAwait(
    (x) => new Promise((res) => res(x * 2)),
  );
  await expectCollected(iterator, [0, 2, 4, 6]);

  iterator = asyncIter(incompleteGenerator(4)).peekable();
  await expectCollected(iterator, [0, 1, 2, 3]);

  iterator = asyncIter(incompleteGenerator(4)).skip(2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(4)).skipWhile((x) => x < 2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(5)).stepBy(2);
  await expectCollected(iterator, [0, 2, 4]);

  iterator = asyncIter(incompleteGenerator(4)).takeWhile(
    (x) => x < 6 || x === undefined,
  );
  await expectCollected(iterator, [0, 1, 2, 3]);

  iterator = asyncIter(incompleteGenerator(3));
  const iterator2 = incompleteGenerator(3);
  await expectCollected(iterator.zip(iterator2), [
    [0, 0],
    [1, 1],
    [2, 2],
  ]);

  iterator = asyncIter(incompleteGenerator(1));
  expect(await iterator.join()).toBe("0");

  iterator = asyncIter(incompleteGenerator(3));
  const arr = [];
  for await (const value of iterator) {
    arr.push(value);
  }
  expect(arr).toStrictEqual([0, 1, 2]);

  iterator = asyncIter(incompleteGenerator(4));
  expect(await iterator.find((x) => x > 2)).toBe(3);
});

test("laziness", async () => {
  const data = fromSync([0, 1, 2, 3]);

  const fn = jest.fn((x) => x);

  const mapped = data.map(fn).take(2);

  expect(fn.mock.calls).toMatchObject([]);

  await expectCollected(mapped, [0, 1]);

  expect(fn.mock.calls).toMatchObject([[0], [1]]);
});
