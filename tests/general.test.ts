import { General } from '../src';
import { mockRandom, resetMockRandom } from 'jest-mock-random';

const { sleep, randint, randfloat } = General;

afterEach(() => {
  jest.useRealTimers();
  resetMockRandom();
});

test('sleep', async () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setTimeout');

  const result = sleep(500);

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);

  jest.runAllTimers();

  expect(await result).toBe(null);
});

test('randfloat', () => {
  mockRandom([0.0, 0.255, 0.5189, 0.7564]);

  expect(randfloat(100)).toBe(0);
  expect(randfloat(100)).toBe(25.5);
  expect(randfloat(10, 20)).toBe(15.189);
  expect(randint(10, 10)).toBe(10);
  expect(randfloat(-10, 0)).toBe(-2.436);
  expect(() => randfloat(10, 0)).toThrow(
    'lower bound must be smaller than upper bound'
  );
});

test('randint', () => {
  mockRandom([0.0, 0.255, 0.5189, 0.7564]);

  expect(randint(100)).toBe(0);
  expect(randint(100)).toBe(25);
  expect(randint(10, 20)).toBe(15);
  expect(randint(10, 10)).toBe(10);
  expect(randint(-10, 0)).toBe(-3);
  expect(() => randint(10, 0)).toThrow(
    'lower bound must be smaller than upper bound'
  );
});
