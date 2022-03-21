import { ReactUtils } from '../src';

const { importAll, classListBuilder } = ReactUtils;

test('importAll', () => {
  const data = {
    './path/to/file.js': 'console.log("hello")',
    './path/to/another_file.txt': 'text in the file'
  };

  const requireContext = (id: keyof typeof data): string => data[id];
  requireContext.keys = () => Object.keys(data);

  const withoutExtensions = importAll(requireContext, false);
  expect(withoutExtensions).toStrictEqual({
    file: 'console.log("hello")',
    another_file: 'text in the file'
  });

  const withExtensions = importAll(requireContext, true);
  expect(withExtensions).toStrictEqual({
    'file.js': 'console.log("hello")',
    'another_file.txt': 'text in the file'
  });
});

test('classListBuilder', () => {
  const testStyles = {
    container: 'Button_container_123abc',
    dark: 'Colors_dark_456def'
  };

  const classes = classListBuilder(testStyles);

  expect(classes('')).toBe('');
  expect(classes('container dark')).toBe(
    'Button_container_123abc Colors_dark_456def'
  );
  expect(classes(['container', 'dark'])).toBe(
    'Button_container_123abc Colors_dark_456def'
  );
  expect(classes('container light')).toBe('Button_container_123abc light');
});
