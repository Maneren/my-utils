import { Iter, iter, MapIter /* , Take, Filter */ } from '../src/iterator';

test('iter', () => {
  const data = iter([0, 1, 2]);

  expect(data).toBeInstanceOf(Iter);
});

test('Iter.map', () => {
  const data = iter([0, 1, 2]);

  const mapped = data.map((x: number) => x + 1);

  expect(mapped).toBeInstanceOf(MapIter);

  expect(mapped.next().value).toBe(1);
  expect(mapped.next().value).toBe(2);
  expect(mapped.next().value).toBe(3);
  expect(mapped.next().done).toBe(true);
});
/*
test('reduceGenerator', () => {
  const testGenerator = function * (): Generator<number> {
    for (let i = 0; i <= 5; i += 1) yield i;
  };

  const sum = reduceGenerator(
    testGenerator(),
    (total: number, value: number) => total + value,
    0
  );

  expect(sum).toBe(15);
});

test('generatorToArray', () => {
  const testGenerator = function * (): Generator<number> {
    for (let i = 0; i <= 5; i += 1) yield i;
  };

  const array = generatorToArray(testGenerator());

  expect(array).toStrictEqual([0, 1, 2, 3, 4, 5]);
});
 */
