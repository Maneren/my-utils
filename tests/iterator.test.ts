import { empty, Iter, iter, once, range, repeat } from '../src/iterator';

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

  expect(data.next()).toStrictEqual({
    value: 0,
    done: false
  });
  expect(data.next()).toStrictEqual({
    value: 1,
    done: false
  });
  expect(data.next()).toStrictEqual({
    value: 2,
    done: false
  });
  expect(data.next()).toStrictEqual({
    value: undefined,
    done: true
  });
  expect(data.next()).toStrictEqual({
    value: undefined,
    done: true
  });
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
    { index: 0, value: 2 },
    { index: 1, value: 1 },
    { index: 2, value: 0 }
  ]);
});

test('fold', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const folded = data.fold((total, current) => total + current, 0);

  expect(folded).toBe(12);
});

test('nth', () => {
  const data = [0, 1, 2];

  expect(iter(data).nth(2)).toBe(2);

  expect(iter(data).nth(3)).toBe(undefined);

  expect(iter(data).nth(-3)).toBe(iter(data).nth(0));
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
  const data = iter([0, 1, 2]);

  const collected = data.collect();

  expect(collected).toStrictEqual([0, 1, 2]);
});

test('chain', () => {
  const data = iter([0, 1]);
  const data2 = iter([2, 3]);

  expectCollected(data.chain(data2), [0, 1, 2, 3]);
});

test('zip', () => {
  const data = [0, 1];
  const data2 = iter([2, 3]);

  expectCollected(iter(data).zip(data2), [
    { a: 0, b: 2 },
    { a: 1, b: 3 }
  ]);

  const data3 = iter([2]);

  expectCollected(iter(data).zip(data3), [{ a: 0, b: 2 }]);
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
  expectCollected(range(0, 5, 2), [0, 2, 4]);
  expectCollected(range(5, 0, -2), [5, 3, 1]);

  expectIsEmpty(range(10, 0));
  expectIsEmpty(range(0, 10, -1));
  expect(() => range(0, 10, 0)).toThrow("step can't be 0");
});

test('repeat', () => {
  const data = repeat(2);

  expect(data.next()).toStrictEqual({
    value: 2,
    done: false
  });
  expect(data.next()).toStrictEqual({
    value: 2,
    done: false
  });
  expect(data.next()).toStrictEqual({
    value: 2,
    done: false
  });
});

test('empty', () => {
  expectIsEmpty(empty());
});

test('once', () => {
  expectCollected(once(0), [0]);
});

test('forEach', () => {
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
