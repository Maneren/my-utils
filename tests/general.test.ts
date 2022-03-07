import {
  sleep,
  randint,
  randfloat,
  mapGenerator,
  reduceGenerator,
  generatorToArray
} from '../src/general';
import { mockRandom, resetMockRandom } from 'jest-mock-random';

afterEach(() => {
  jest.useRealTimers();
});

test('sleep', () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setTimeout');

  void sleep(500);

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
});

test('randfloat', () => {
  mockRandom([0.0, 0.255, 0.5189, 0.7564]);

  expect(randfloat(100)).toBe(0);
  expect(randfloat(100)).toBe(25.5);
  expect(randfloat(10, 20)).toBe(15.189);
  expect(randfloat(-10, 0)).toBe(-2.436);
  expect(() => randfloat(10, 0)).toThrow(
    'lower bound must be smaller than upper bound'
  );

  resetMockRandom();
});

test('randint', () => {
  mockRandom([0, 0.2, 0.51, 0.75]);

  expect(randint(100)).toBe(0);
  expect(randint(100)).toBe(20);
  expect(randint(10, 20)).toBe(15);
  expect(randint(-10, 0)).toBe(-3);
  expect(() => randint(10, 0)).toThrow(
    'lower bound must be smaller than upper bound'
  );

  resetMockRandom();
});

test('mapGenerator', () => {
  const testGenerator = function * (): Generator<number> {
    for (let i = 5; i <= 10; i += 2) yield i; // yields 5,7,9
  };

  // should yield 6,8,10
  const modifiedGenerator = mapGenerator(testGenerator(), (x: number) => x + 1);

  expect(modifiedGenerator.next().value).toBe(6);
  expect(modifiedGenerator.next().value).toBe(8);
  expect(modifiedGenerator.next().value).toBe(10);
  expect(modifiedGenerator.next().done).toBe(true);
});

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
