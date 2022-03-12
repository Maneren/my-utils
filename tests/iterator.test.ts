import {
  Enumerate,
  Filter,
  Iter,
  iter,
  MapIter,
  repeat,
  Take,
  TakeWhile
} from '../src/iterator';

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

  const mapped = data.map((x: number) => x + 1);

  expect(mapped).toBeInstanceOf(MapIter);

  expect(mapped.next().value).toBe(1);
  expect(mapped.next().value).toBe(2);
  expect(mapped.next().value).toBe(3);
  expect(mapped.next().done).toBe(true);
});

test('take', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const taken = data.take(3);

  expect(taken).toBeInstanceOf(Take);

  expect(taken.next().value).toBe(0);
  expect(taken.next().value).toBe(1);
  expect(taken.next().value).toBe(2);
  expect(taken.next().done).toBe(true);

  const data2 = iter([0, 1, 2, 4, 5]);

  const taken2 = data2.take(0);

  expect(taken2).toBeInstanceOf(Take);

  expect(taken2.next().done).toBe(true);

  const data3 = iter([0, 1, 2, 4, 5]);

  expect(() => data3.take(-1)).toThrow('Expected positive integer but found -1');
});

test('takeWhile', () => {
  const data = iter([0, 3, 6, 9, 12]);

  const taken = data.takeWhile((x: number) => x < 10);

  expect(taken).toBeInstanceOf(TakeWhile);

  expect(taken.next().value).toBe(0);
  expect(taken.next().value).toBe(3);
  expect(taken.next().value).toBe(6);
  expect(taken.next().value).toBe(9);
  expect(taken.next().done).toBe(true);
});

test('filter', () => {
  const data = iter([0, 1, 2]);

  const filtered = data.filter((x: number) => x % 2 === 0);

  expect(filtered).toBeInstanceOf(Filter);

  expect(filtered.next().value).toBe(0);
  expect(filtered.next().value).toBe(2);
  expect(filtered.next().done).toBe(true);
});

test('enumerate', () => {
  const data = iter([2, 1, 0]);

  const enumerated = data.enumerate();

  expect(enumerated).toBeInstanceOf(Enumerate);

  expect(enumerated.next().value).toStrictEqual({ index: 0, value: 2 });
  expect(enumerated.next().value).toStrictEqual({ index: 1, value: 1 });
  expect(enumerated.next().value).toStrictEqual({ index: 2, value: 0 });
  expect(enumerated.next().done).toBe(true);
});

test('fold', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const folded = data.fold(
    (total: number, current: number) => total + current,
    0
  );

  expect(folded).toBe(12);
});

test('nth', () => {
  const data = iter([0, 1, 2]);

  const third = data.nth(2);
  expect(third).toBe(2);

  const data2 = iter([0, 1, 2]);

  const fourth = data2.nth(3);
  expect(fourth).toBe(undefined);
});

test('skip', () => {
  const data = iter([0, 1, 2, 3, 4, 5]);

  expect(data.next().value).toBe(0);
  expect(data.next().value).toBe(1);

  const skipped = data.skip(2);

  expect(skipped).toBeInstanceOf(Iter);

  expect(skipped.next().value).toBe(4);
  expect(skipped.next().value).toBe(5);
  expect(skipped.next().done).toBe(true);
});

test('collect', () => {
  const data = iter([0, 1, 2]);

  const collected = data.collect();

  expect(collected).toBeInstanceOf(Array);

  expect(collected).toStrictEqual([0, 1, 2]);
});

test('repeat', () => {
  const data = repeat(2);

  expect(data).toBeInstanceOf(Iter);

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
