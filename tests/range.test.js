const { range, mapRng, reduceRng } = require('../src/range');

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
});

test('mapRng', () => {
  const array = mapRng(range(5), x => x * 2);
  expect(array).toStrictEqual([0, 2, 4, 6, 8]);
});

test('reduceRng', () => {
  const sum = reduceRng(range(5), (total, value) => total + value, 0);

  expect(sum).toBe(10);
});
