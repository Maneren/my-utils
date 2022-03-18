import { empty, Iter, iter, once, range, repeat } from '../src/iterator';

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

  expect(mapped.next().value).toBe(1);
  expect(mapped.next().value).toBe(2);
  expect(mapped.next().value).toBe(3);
  expect(mapped.next().done).toBe(true);
});

test('take', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const taken = iter(data).take(3);

  expect(taken.next().value).toBe(0);
  expect(taken.next().value).toBe(1);
  expect(taken.next().value).toBe(2);
  expect(taken.next().done).toBe(true);

  const taken2 = iter(data).take(0);

  expect(taken2.next().done).toBe(true);

  expect(() => iter(data).take(-1)).toThrow(
    'Expected positive integer but found -1'
  );
});

test('takeWhile', () => {
  const data = iter([0, 3, 6, 9, 12]);

  const taken = data.takeWhile((x: number) => x < 10);

  expect(taken.next().value).toBe(0);
  expect(taken.next().value).toBe(3);
  expect(taken.next().value).toBe(6);
  expect(taken.next().value).toBe(9);
  expect(taken.next().done).toBe(true);
});

test('filter', () => {
  const data = iter([0, 1, 2]);

  const filtered = data.filter((x: number) => x % 2 === 0);

  expect(filtered.next().value).toBe(0);
  expect(filtered.next().value).toBe(2);
  expect(filtered.next().done).toBe(true);
});

test('enumerate', () => {
  const data = iter([2, 1, 0]);

  const enumerated = data.enumerate();

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

  const third = iter(data).nth(2);
  expect(third).toBe(2);

  const fourth = iter(data).nth(3);
  expect(fourth).toBe(undefined);
});

test('skip', () => {
  const data = iter([0, 1, 2, 3, 4, 5]);

  expect(data.next().value).toBe(0);
  expect(data.next().value).toBe(1);

  const skipped = data.skip(2);

  expect(skipped.next().value).toBe(4);
  expect(skipped.next().value).toBe(5);
  expect(skipped.next().done).toBe(true);
});

test('skipWhile', () => {
  const data = iter([0, 2, 4, 5, 7]);

  const skipped = data.skipWhile((x: number) => x % 2 === 0);

  expect(skipped.next().value).toBe(5);
  expect(skipped.next().value).toBe(7);
  expect(skipped.next().done).toBe(true);
});

test('stepBy', () => {
  const data = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const step = data.stepBy(3);

  expect(step.next().value).toBe(0);
  expect(step.next().value).toBe(3);
  expect(step.next().value).toBe(6);
  expect(step.next().value).toBe(9);
  expect(step.next().done).toBe(true);
});

test('collect', () => {
  const data = iter([0, 1, 2]);

  const collected = data.collect();

  expect(collected).toBeInstanceOf(Array);

  expect(collected).toStrictEqual([0, 1, 2]);
});

test('chain', () => {
  const data = iter([0, 1]);
  const data2 = iter([2, 3]);

  const chained = data.chain(data2);

  expect(chained.next().value).toBe(0);
  expect(chained.next().value).toBe(1);
  expect(chained.next().value).toBe(2);
  expect(chained.next().value).toBe(3);
  expect(chained.next().done).toBe(true);
});

test('zip', () => {
  const data = iter([0, 1]);
  const data2 = iter([2, 3]);

  const chained = data.zip(data2);

  expect(chained.next().value).toStrictEqual({ a: 0, b: 2 });
  expect(chained.next().value).toStrictEqual({ a: 1, b: 3 });
  expect(chained.next().done).toBe(true);
});

test('count', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const count = data.count();

  expect(count).toBe(5);
});

test('last', () => {
  const data = iter([0, 1, 2, 4, 5]);

  const count = data.last();

  expect(count).toBe(5);
});

test('join', () => {
  const data = [0, 1, 2];

  const joined = iter(data).join(', ');
  expect(joined).toStrictEqual('0, 1, 2');

  const joined2 = iter(data).join();
  expect(joined2).toStrictEqual('012');
});

test('range', () => {
  const testRange1 = range(3);
  expect(testRange1.next().value).toBe(0);
  expect(testRange1.next().value).toBe(1);
  expect(testRange1.next().value).toBe(2);
  expect(testRange1.next().done).toBe(true);

  const testRange2 = range(3, 6);
  expect(testRange2.next().value).toBe(3);
  expect(testRange2.next().value).toBe(4);
  expect(testRange2.next().value).toBe(5);
  expect(testRange2.next().done).toBe(true);

  const testRange3 = range(0, 5, 2);
  expect(testRange3.next().value).toBe(0);
  expect(testRange3.next().value).toBe(2);
  expect(testRange3.next().value).toBe(4);
  expect(testRange3.next().done).toBe(true);

  const testRange4 = range(5, 0, -2);
  expect(testRange4.next().value).toBe(5);
  expect(testRange4.next().value).toBe(3);
  expect(testRange4.next().value).toBe(1);
  expect(testRange4.next().done).toBe(true);

  expect(range(10, 0).next()).toStrictEqual({ done: true, value: undefined });
  expect(range(0, 10, -1).next()).toStrictEqual({
    done: true,
    value: undefined
  });
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
  const iter = empty();
  expect(iter.next().done).toBe(true);
});

test('once', () => {
  const iter = once(0);
  expect(iter.next().value).toBe(0);
  expect(iter.next().done).toBe(true);
});
