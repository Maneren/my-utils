const { mockRandom, resetMockRandom } = require('jest-mock-random');
const { General: { sleep, randint, randfloat, mapGenerator } } = require('../');

test('sleep', async () => {
  const start = Date.now();
  await sleep(1000);
  const end = Date.now();
  const delta = end - start;
  expect(delta).toBeGreaterThanOrEqual(1000);
  expect(delta).toBeLessThan(1050);
});

test('randfloat', () => {
  mockRandom([0.0, 0.255, 0.5189, 0.7564]);

  expect(randfloat(100)).toBe(0);
  expect(randfloat(100)).toBe(25.5);
  expect(randfloat(10, 20)).toBe(15.189);
  expect(randfloat(-10, 0)).toBe(-2.436);
  expect(() => randfloat()).toThrow('no arguments');
  expect(() => randfloat('1')).toThrow('invalid arguments: "1"');
  expect(() => randfloat(10, 0)).toThrow('lower bound must be smaller than upper bound');

  resetMockRandom();
});

test('randint', () => {
  mockRandom([0, 0.2, 0.51, 0.75]);

  expect(randint(100)).toBe(0);
  expect(randint(100)).toBe(20);
  expect(randint(10, 20)).toBe(15);
  expect(randint(-10, 0)).toBe(-3);
  expect(() => randint()).toThrow('no arguments');
  expect(() => randint('1')).toThrow('invalid arguments: "1"');
  expect(() => randint(10, 0)).toThrow('lower bound must be smaller than upper bound');

  resetMockRandom();
});

test('mapGenerator', () => {
  const testGenerator = function * () {
    for (let i = 5; i <= 10; i += 2) yield i; // yields 5,7,9
  };

  // should yield 6,8,10
  const modifiedGenerator = mapGenerator(testGenerator(), x => x + 1);

  expect(modifiedGenerator.next().value).toBe(6);
  expect(modifiedGenerator.next().value).toBe(8);
  expect(modifiedGenerator.next().value).toBe(10);
  expect(modifiedGenerator.next().done).toBe(true);
});
