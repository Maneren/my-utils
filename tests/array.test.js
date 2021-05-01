const { Array: { swap, last, lastI, generateArr, shuffle, randomIndex, toFixedLengthArr } } = require('../');
const { mockRandom, resetMockRandom } = require('jest-mock-random');

test('swap', () => {
  const array = [1, 2, 3];
  swap(array, 1, 2);
  expect(array).toStrictEqual([1, 3, 2]);
});

test('lastI', () => {
  const array = [5, 1, 8];
  expect(lastI(array)).toBe(2);
});

test('last', () => {
  const array = [10, 15, 8];
  expect(last(array)).toBe(8);
});

test('randomIndex', () => {
  mockRandom([0, 0.2, 0.51, 0.75, 0.999]);

  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const randomIndexes = [
    randomIndex(testArray),
    randomIndex(testArray),
    randomIndex(testArray),
    randomIndex(testArray),
    randomIndex(testArray)
  ];

  expect(randomIndexes).toStrictEqual([0, 2, 5, 7, 9]);

  resetMockRandom();
});

test('shuffle', () => {
  mockRandom([0.76, 0.2, 0.6, 0.01, 0.45, 0.08, 0.53, 0.2, 0.3, 0.19]);

  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = shuffle(testArray);

  // original shouldn't be modified
  expect(testArray).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  expect(shuffled).toStrictEqual([4, 1, 5, 3, 6, 7, 0, 2, 8, 9]);

  resetMockRandom();
});

test('generateArr', () => {
  const testArray1 = generateArr(5, x => x * 2);
  expect(testArray1).toStrictEqual([0, 2, 4, 6, 8]);

  const testArray2 = generateArr(5, 0);
  expect(testArray2).toStrictEqual([0, 0, 0, 0, 0]);
});

test('toFixedLengthArr', () => {
  const array = generateArr(3, x => x);
  const padded = toFixedLengthArr(array, 5, x => x);
  expect(padded).toStrictEqual([0, 1, 2, 0, 1]);
});
