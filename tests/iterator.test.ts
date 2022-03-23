import {
  AsyncIter,
  asyncIter,
  empty,
  Iter,
  iter,
  once,
  range,
  repeat
} from '../src/iterator';

function expectNextEquals<T> (iter: Iter<T>, value: T): void {
  expect(iter.next()).toStrictEqual({
    value,
    done: false
  });
}

function expectIsEmpty<T> (iter: Iter<T>): void {
  expect(iter.next()).toStrictEqual({
    value: undefined,
    done: true
  });
}

function expectCollected<T> (iter: Iter<T>, array: T[]): void {
  expect(iter.collect()).toStrictEqual(array);
}

test('iter', () => {
  const data = iter([0, 1, 2]);

  expect(data).toBeInstanceOf(Iter);
});

test('next', () => {
  const data = iter([0, 1, 2]);

  expectNextEquals(data, 0);
  expectNextEquals(data, 1);
  expectNextEquals(data, 2);

  expectIsEmpty(data);
  expectIsEmpty(data);
  expectIsEmpty(data);
});

test('Symbol.toStringTag', () => {
  const data = iter([]);

  expect(String(data)).toBe('[object Iter]');
});

test('map', () => {
  const data = iter([0, 1, 2]);

  expectCollected(
    data.map((x) => x + 1),
    [1, 2, 3]
  );
});

test('take', () => {
  const data = [0, 1, 2, 3, 4, 5];

  expectCollected(iter(data).take(3), [0, 1, 2]);

  expectIsEmpty(iter(data).take(0));
  expectIsEmpty(iter(data).take(-1));
});

test('takeWhile', () => {
  const data = [0, 3, 6, 9, 12, 15];

  expectCollected(
    iter(data).takeWhile((x) => x < 10),
    [0, 3, 6, 9]
  );

  expectIsEmpty(iter(data).takeWhile((x) => x < 0));
});

test('filter', () => {
  const data = iter([0, 1, 2, 3, 4, 5]);

  expectCollected(
    data.filter((x) => x % 2 === 0),
    [0, 2, 4]
  );
});

test('enumerate', () => {
  const data = iter([2, 1, 0]);

  expectCollected(data.enumerate(), [
    [0, 2],
    [1, 1],
    [2, 0]
  ]);
});

test('fold', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const folded = data.fold((total, current) => total + current, 0);

  expect(folded).toBe(12);
});

test('nth', () => {
  const data = [0, 1, 2];

  expect(iter(data).nth(0)).toBe(0);
  expect(iter(data).nth(2)).toBe(2);

  expect(iter(data).nth(3)).toBe(undefined);

  expect(iter(data).nth(-3)).toBe(0);
});

test('advanceBy', () => {
  const data = [0, 1, 2];

  expectNextEquals(iter(data).advanceBy(0), 0);
  expectNextEquals(iter(data).advanceBy(2), 2);

  expectIsEmpty(iter(data).advanceBy(3));

  expectNextEquals(iter(data).advanceBy(-2), 0);
});

test('skip', () => {
  const data = [0, 1, 2, 3];

  expectCollected(iter(data).skip(2), [2, 3]);
  expectCollected(iter(data).skip(0), [0, 1, 2, 3]);
  expectIsEmpty(iter(data).skip(5));
});

test('skipWhile', () => {
  const data = [0, 2, 4, 5, 6, 7];

  expectCollected(
    iter(data).skipWhile((x) => x % 2 === 0),
    [5, 6, 7]
  );

  expectIsEmpty(iter(data).skipWhile((x) => x < 10));
});

test('stepBy', () => {
  const data = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  expectCollected(data.stepBy(3), [0, 3, 6, 9]);
});

test('collect', () => {
  const data = [0, 1, 2];

  expect(iter(data).collect()).toStrictEqual(data);
});

test('chain', () => {
  const data = iter([0, 1]);
  const data2 = iter([2, 3]);

  expectCollected(data.chain(data2), [0, 1, 2, 3]);
});

test('zip', () => {
  const data = [0, 1];

  const data2 = iter([2, 3, 4]);

  expectCollected(iter(data).zip(data2), [
    [0, 2],
    [1, 3]
  ]);

  const data3 = iter([2]);

  expectCollected(iter(data).zip(data3), [[0, 2]]);
});

test('count', () => {
  const data = iter([0, 1, 2, 4, 5]);

  expect(data.count()).toBe(5);
});

test('last', () => {
  const data = iter([0, 1, 2, 4, 5]);

  expect(data.last()).toBe(5);
});

test('join', () => {
  const data = [0, 1, 2];

  expect(iter(data).join()).toBe('012');
  expect(iter(data).join(', ')).toBe('0, 1, 2');

  expect(iter([]).join(', ')).toBe('');
});

test('range', () => {
  expectCollected(range(3), [0, 1, 2]);
  expectCollected(range(3, 6), [3, 4, 5]);
  expectCollected(range(3, 3), []);
  expectCollected(range(0, 5, 2), [0, 2, 4]);
  expectCollected(range(5, 0, -2), [5, 3, 1]);

  expectIsEmpty(range(10, 0));
  expectIsEmpty(range(0, 10, -1));
  expect(() => range(0, 10, 0)).toThrow("step can't be 0");
});

test('repeat', () => {
  const data = repeat(2);

  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
});

test('empty', () => {
  expectIsEmpty(empty());
});

test('once', () => {
  expectCollected(once(0), [0]);
});

test('consume', () => {
  const data = iter([0, 1, 2, 3]);
  const fn = jest.fn();

  data.map(fn).consume();

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('forEach', () => {
  const data = iter([0, 1, 2, 3]);
  const fn = jest.fn();

  data.forEach(fn);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('inspect', () => {
  const data = iter([0, 1, 2, 3]);
  const fn = jest.fn();

  expectCollected(data.inspect(fn), [0, 1, 2, 3]);

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3]]);
});

test('all', () => {
  const data = [0, 1, 2, 3];

  expect(iter(data).all((x) => x < 5)).toBe(true);
  expect(iter(data).all((x) => x > 2)).toBe(false);
});

test('some', () => {
  const data = [0, 1, 2, 3];

  expect(iter(data).some((x) => x < 5)).toBe(true);
  expect(iter(data).some((x) => x > 2)).toBe(true);
  expect(iter(data).some((x) => x < 0)).toBe(false);
});

test('asyncIter', async () => {
  const data = asyncIter([Promise.resolve(0)]);

  expect(data).toBeInstanceOf(AsyncIter);

  expect(await data.next().value).toBe(0);
});

test('toSync', async () => {
  const data = asyncIter(range(5).map(async (x) => x));

  const awaited = await data.toSync();

  expect(awaited).toBeInstanceOf(Iter);
  expectCollected(awaited, [0, 1, 2, 3, 4]);
});

test('Symbol.asyncIterator', async () => {
  const data = asyncIter(range(5).map(async (x) => x));

  const fn = jest.fn();

  for await (const value of data) {
    fn(value);
  }

  expect(fn.mock.calls).toMatchObject([[0], [1], [2], [3], [4]]);
});
