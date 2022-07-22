import { Iter } from '../src/iterator';
import { asyncIter, AsyncIter } from '../src/iterator.async';
const { fromSync } = AsyncIter;

async function expectNextEquals<T> (
  iter: AsyncIter<T>,
  value: T
): Promise<void> {
  expect(await iter.next()).toStrictEqual({
    value,
    done: false
  });
}

async function expectIsEmpty<T> (iter: AsyncIter<T>): Promise<void> {
  expect(await iter.next()).toStrictEqual({
    value: undefined,
    done: true
  });
}

async function expectCollected<T> (
  iter: AsyncIter<T>,
  array: T[]
): Promise<void> {
  expect(await iter.collect()).toStrictEqual(array);
}

test('asyncIter', async () => {
  const data = asyncIter((async function * () {})());

  expect(data).toBeInstanceOf(AsyncIter);
});

test('fromSync', async () => {
  const data = fromSync([0, 1, 2]);

  expect(data).toBeInstanceOf(AsyncIter);

  const data2 = fromSync([
    Promise.resolve(0),
    Promise.resolve(1),
    Promise.resolve(2)
  ]);

  expect(data2).toBeInstanceOf(AsyncIter);

  await expectCollected(data2, [0, 1, 2]);
});

test('toSync', async () => {
  const data = fromSync([0, 1, 2]);

  expect(data).toBeInstanceOf(AsyncIter);

  const sync = await data.toSync();

  expect(sync).toBeInstanceOf(Iter);

  expect(sync.collect()).toStrictEqual([0, 1, 2]);
});

test('next', async () => {
  const data = fromSync([0, 1, 2]);

  await expectNextEquals(data, 0);
  await expectNextEquals(data, 1);
  await expectNextEquals(data, 2);

  await expectIsEmpty(data);
  await expectIsEmpty(data);
  await expectIsEmpty(data);
});

test('Symbol.toStringTag', async () => {
  const data = fromSync([]);

  expect(String(data)).toBe('[object AsyncIter]');
});

test('map', async () => {
  const data = fromSync([0, 1, 2]);

  await expectCollected(
    data.map((x) => x + 1),
    [1, 2, 3]
  );
});

test('mapAwait', async () => {
  const data = fromSync([0, 1, 2]);

  await expectCollected(
    data.mapAwait(async (x) => x + 1),
    [1, 2, 3]
  );
});

test('await', async () => {
  const data = fromSync([0, 1, 2]);

  await expectCollected(
    data.map(async (x) => x).await(),
    [0, 1, 2]
  );
});

test('take', async () => {
  const data = [0, 1, 2, 3, 4, 5];

  await expectCollected(fromSync(data).take(3), [0, 1, 2]);

  await expectIsEmpty(fromSync(data).take(0));
  await expectIsEmpty(fromSync(data).take(-1));
});

test('takeWhile', async () => {
  const data = [0, 3, 6, 9, 12, 15];

  await expectCollected(
    fromSync(data).takeWhile((x) => x < 10),
    [0, 3, 6, 9]
  );

  await expectIsEmpty(fromSync(data).takeWhile((x) => x < 0));
});

test('filter', async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5]);

  await expectCollected(
    data.filter((x) => x % 2 === 0),
    [0, 2, 4]
  );
});

test('enumerate', async () => {
  const data = fromSync([2, 1, 0]);

  await expectCollected(data.enumerate(), [
    [0, 2],
    [1, 1],
    [2, 0]
  ]);
});

test('fold', async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  const folded = await data.fold((total, current) => total + current, 0);

  expect(folded).toBe(12);
});

test('partition', async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5]);

  const [even, odd] = await data.partition(x => x % 2 === 0);

  expect(even).toStrictEqual([0, 2, 4]);
  expect(odd).toStrictEqual([1, 3, 5]);
});

test('nth', async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).nth(0)).toBe(0);
  expect(await fromSync(data).nth(2)).toBe(2);

  expect(await fromSync(data).nth(3)).toBe(undefined);

  expect(await fromSync(data).nth(-3)).toBe(0);
});

test('advanceBy', async () => {
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
  const spy = jest.spyOn(iter, 'next');
  await iter.advanceBy(10);
  expect(spy).toHaveBeenCalledTimes(4);
  await expectIsEmpty(iter);
});

test('skip', async () => {
  const data = [0, 1, 2, 3];

  await expectCollected(await fromSync(data).skip(2), [2, 3]);
  await expectCollected(await fromSync(data).skip(0), [0, 1, 2, 3]);
  await expectIsEmpty(await fromSync(data).skip(5));
});

test('skipWhile', async () => {
  const data = [0, 2, 4, 5, 6, 7];

  await expectCollected(
    fromSync(data).skipWhile((x) => x % 2 === 0),
    [5, 6, 7]
  );

  await expectIsEmpty(fromSync(data).skipWhile((x) => x < 10));
});

test('stepBy', async () => {
  const data = fromSync([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  await expectCollected(data.stepBy(3), [0, 3, 6, 9]);
});

test('collect', async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).collect()).toStrictEqual(data);
});

test('chain', async () => {
  const data = fromSync([0, 1]);
  const data2 = fromSync([2, 3]);

  await expectCollected(data.chain(data2), [0, 1, 2, 3]);
});

test('zip', async () => {
  const data = [0, 1];

  const data2 = fromSync([2, 3, 4]);

  await expectCollected(await fromSync(data).zip(data2), [
    [0, 2],
    [1, 3]
  ]);

  const data3 = fromSync([2]);

  await expectCollected(await fromSync(data).zip(data3), [[0, 2]]);
});

test('count', async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  expect(await data.count()).toBe(5);
});

test('last', async () => {
  const data = fromSync([0, 1, 2, 4, 5]);

  expect(await data.last()).toBe(5);
});

test('join', async () => {
  const data = [0, 1, 2];

  expect(await fromSync(data).join()).toBe('012');
  expect(await fromSync(data).join(', ')).toBe('0, 1, 2');

  expect(await fromSync([]).join(', ')).toBe('');
});

test('repeat', async () => {
  const data = AsyncIter.repeat(2);

  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
  await expectNextEquals(data, 2);
});

test('empty', async () => {
  await expectIsEmpty(AsyncIter.empty());
});

test('once', async () => {
  await expectCollected(AsyncIter.once(0), [0]);
});

test('consume', async () => {
  const fn = jest.fn((x) => x);
  const data = fromSync([0, 1, 2, 3]).map(fn);

  await data.consume();

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('forEach', async () => {
  const data = fromSync([0, 1, 2, 3]);
  const fn = jest.fn();

  await data.forEach(fn);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('inspect', async () => {
  const data = fromSync([0, 1, 2, 3]);
  const fn = jest.fn();

  await expectCollected(data.inspect(fn), [0, 1, 2, 3]);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('all', async () => {
  const data = [0, 1, 2, 3];

  expect(await fromSync(data).all((x) => x < 5)).toBe(true);
  expect(await fromSync(data).all((x) => x > 2)).toBe(false);
});

test('some', async () => {
  const data = [0, 1, 2, 3];

  expect(await fromSync(data).some((x) => x < 5)).toBe(true);
  expect(await fromSync(data).some((x) => x > 2)).toBe(true);
  expect(await fromSync(data).some((x) => x < 0)).toBe(false);
});

test('incomplete iterator protocol', async () => {
  function incompleteGenerator (n: number): AsyncIterable<number> {
    let i = 0;
    return {
      [Symbol.asyncIterator]: (): AsyncIterator<number> => ({
        next: async function (): Promise<IteratorResult<number>> {
          if (i >= n) return { done: true, value: undefined };
          return {
            value: i++
          };
        }
      })
    };
  }

  let iterator;

  iterator = asyncIter(incompleteGenerator(4));
  await expectCollected(iterator, [0, 1, 2, 3]);

  iterator = asyncIter(incompleteGenerator(4));
  await iterator.advanceBy(2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(4)).skip(2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(4)).skipWhile((x) => x < 2);
  await expectCollected(iterator, [2, 3]);

  iterator = asyncIter(incompleteGenerator(5)).stepBy(2);
  await expectCollected(iterator, [0, 2, 4]);

  iterator = asyncIter(incompleteGenerator(3));
  const iterator2 = incompleteGenerator(3);
  await expectCollected(iterator.zip(iterator2), [
    [0, 0],
    [1, 1],
    [2, 2]
  ]);

  iterator = asyncIter(incompleteGenerator(1));
  expect(await iterator.join()).toBe('0');

  iterator = asyncIter(incompleteGenerator(3));
  const arr = [];
  for await (const value of iterator) arr.push(value);
  expect(arr).toStrictEqual([0, 1, 2]);
});

test('laziness', async () => {
  const data = fromSync([0, 1, 2, 3]);

  const fn = jest.fn(x => x);

  const mapped = data.map(fn).take(2);

  expect(fn.mock.calls).toMatchObject([]);

  await expectCollected(mapped, [0, 1]);

  expect(fn.mock.calls).toMatchObject([[0], [1]]);
});
