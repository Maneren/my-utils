import { iter, Iter, MapIter, Take, Filter } from '../src/iterator';

test('Iter.map', () => {
  const data = iter([0, 1, 2]);

  const mapped = data.map((x: number) => x + 1);

  const iterator = mapped[Symbol.iterator]();

  expect(iterator.next().value).toBe(1);
  expect(iterator.next().value).toBe(2);
  expect(iterator.next().value).toBe(3);
  expect(iterator.next().done).toBe(true);
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
