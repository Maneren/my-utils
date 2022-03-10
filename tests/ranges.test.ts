import { Ranges } from '../src';

const { range } = Ranges;

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

  expect(() => range(10, 0).next()).toThrow('start must be smaller than end');
  expect(() => range(0, 10, -1).next()).toThrow(
    'when step is lower than 0, start must be larger than end'
  );
});
