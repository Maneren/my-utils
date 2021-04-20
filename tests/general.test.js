const { mockRandom, resetMockRandom } = require('jest-mock-random');
const { General: { randint, randfloat, mapGenerator } } = require('../');

test('randfloat', () => {
  mockRandom([0.0, 0.255, 0.5189, 0.7564]);

  expect(randfloat(100)).toBe(0);
  expect(randfloat(100)).toBe(25.5);
  expect(randfloat(10, 20)).toBe(15.189);
  expect(randfloat(-10, 0)).toBe(-2.436);
  expect(() => randfloat()).toThrow('no arguments');
  expect(() => randfloat('1')).toThrow('invalid arguments: "1"');
  expect(() => randfloat(10, 0)).toThrow('lowerbound must be smaller than upper bound');

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
  expect(() => randint(10, 0)).toThrow('lowerbound must be smaller than upper bound');

  resetMockRandom();
});

test('mapGenerator', () => {
  const testGenerator = function * () {
    for (let i = 5; i <= 10; i += 2) yield i;
  };

  const modifiedGenerator = mapGenerator(testGenerator(), x => x + 1);

  expect(modifiedGenerator.next().value).toBe(6);
  expect(modifiedGenerator.next().value).toBe(8);
  expect(modifiedGenerator.next().value).toBe(10);
  expect(modifiedGenerator.next().done).toBe(true);
});
