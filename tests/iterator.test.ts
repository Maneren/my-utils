import { Iter, iter, range } from '../src/iterator';

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

test('partition', () => {
  const data = iter([0, 1, 2, 3, 4, 5]);

  const [even, odd] = data.partition(x => x % 2 === 0);

  expect(even).toStrictEqual([0, 2, 4]);
  expect(odd).toStrictEqual([1, 3, 5]);
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

  let iterator;

  iterator = iter(data);
  iterator.advanceBy(0);
  expectNextEquals(iterator, 0);

  iterator = iter(data);
  iterator.advanceBy(2);
  expectNextEquals(iterator, 2);

  iterator = iter(data);
  iterator.advanceBy(3);
  expectIsEmpty(iterator);

  iterator = iter(data);
  iterator.advanceBy(-2);
  expectNextEquals(iterator, 0);

  // check short-circuiting
  iterator = iter(data);
  const spy = jest.spyOn(iterator, 'next');
  iterator.advanceBy(10);
  expect(spy).toHaveBeenCalledTimes(4);
  expectIsEmpty(iterator);
});

test('skip', () => {
  const data = [0, 1, 2, 3];

  expectCollected(iter(data).skip(2), [2, 3]);
  expectCollected(iter(data).skip(0), [0, 1, 2, 3]);
  expectIsEmpty(iter(data).skip(5));

  // check short-circuiting
  const iterator = iter(data);
  const spy = jest.spyOn(iterator, 'next');
  iterator.skip(10).consume();
  expect(spy).toHaveBeenCalledTimes(5);
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

  expect(iter([]).join()).toBe('');
});

test('range', () => {
  expectCollected(range(3), [0, 1, 2]);
  expectCollected(range(3, 6), [3, 4, 5]);
  expectCollected(range(3, 3), []);
  expectCollected(range(0, 5, 2), [0, 2, 4]);
  expectCollected(range(5, 0, -1), [5, 4, 3, 2, 1]);

  expectIsEmpty(range(10, 0));
  expectIsEmpty(range(0, 10, -1));
  expect(() => range(0, 10, 0)).toThrow("step can't be 0");
});

test('repeat', () => {
  const data = Iter.repeat(2);

  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
  expectNextEquals(data, 2);
});

test('empty', () => {
  expectIsEmpty(Iter.empty());
});

test('once', () => {
  expectCollected(Iter.once(0), [0]);
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

test('incomplete iterator protocol', () => {
  function incompleteGenerator (n: number): Iterable<number> {
    let i = 0;
    return {
      [Symbol.iterator]: (): Iterator<number> => ({
        next: function (): IteratorResult<number> {
          if (i >= n) return { done: true, value: undefined };
          return {
            value: i++
          };
        }
      })
    };
  }

  let iterator;

  iterator = iter(incompleteGenerator(4));
  expectCollected(iterator, [0, 1, 2, 3]);

  iterator = iter(incompleteGenerator(4));
  iterator.advanceBy(2);
  expectCollected(iterator, [2, 3]);

  iterator = iter(incompleteGenerator(4)).skip(2);
  expectCollected(iterator, [2, 3]);

  iterator = iter(incompleteGenerator(4)).skipWhile((x) => x < 2);
  expectCollected(iterator, [2, 3]);

  iterator = iter(incompleteGenerator(5)).stepBy(2);
  expectCollected(iterator, [0, 2, 4]);

  iterator = iter(incompleteGenerator(3));
  const iterator2 = incompleteGenerator(2);
  expectCollected(iterator.zip(iterator2), [
    [0, 0],
    [1, 1]
  ]);

  iterator = iter(incompleteGenerator(1));
  expect(iterator.join()).toBe('0');
});

test('laziness', async () => {
  const data = iter([0, 1, 2, 3]);

  const fn = jest.fn(x => x);

  const mapped = data.map(fn).take(2);

  expect(fn.mock.calls).toMatchObject([]);

  expectCollected(mapped, [0, 1]);

  expect(fn.mock.calls).toMatchObject([[0], [1]]);
});
