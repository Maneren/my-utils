import {
  swap,
  last,
  lastIndex,
  generate,
  shuffle,
  randomIndex,
  rightPad
} from '../src/array';
import { mockRandom, resetMockRandom } from 'jest-mock-random';

test('swap', () => {
  const array = [1, 2, 3];
  swap(array, 1, 2);
  expect(array).toStrictEqual([1, 3, 2]);
});

test('lastIndex', () => {
  const array = [5, 1, 8];
  expect(lastIndex(array)).toBe(2);
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

test('generate', () => {
  const testArray1 = generate(5, (x: number) => x * 2);
  expect(testArray1).toStrictEqual([0, 2, 4, 6, 8]);

  const testArray2 = generate(5, 0);
  expect(testArray2).toStrictEqual([0, 0, 0, 0, 0]);

  expect(() => generate(-1, 10)).toThrow("length can't be less than 1");
  expect(() => generate(0, 10)).toThrow("length can't be less than 1");
});

test('rightPad', () => {
  const array = generate(3, (x: number) => x);
  const padded = rightPad(array, 5, (x: number) => x);
  expect(padded).toStrictEqual([0, 1, 2, 0, 1]);

  const array2 = generate(5, (x: number) => x);
  const padded2 = rightPad(array2, 5, (x: number) => x);
  expect(padded2).toStrictEqual([0, 1, 2, 3, 4]);

  const array3 = generate(5, (x: number) => x);
  const padded3 = rightPad(array3, 3, (x: number) => x);
  expect(padded3).toStrictEqual([0, 1, 2, 3, 4]);

  const array4 = generate(3, (x: number) => x);
  const padded4 = rightPad(array4, 5, null);
  expect(padded4).toStrictEqual([0, 1, 2, null, null]);
});
