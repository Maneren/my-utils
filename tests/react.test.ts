import React from '../src/react';
const { importAll, classListBuilder } = React;

test('importAll', () => {
  const data = {
    './path/to/file.js': {
      default: 'console.log("hello")'
    },
    './path/to/another_file.txt': {
      default: 'text in the file'
    }
  };

  const testRequireContext = (id: keyof typeof data): { default: string } => data[id];
  testRequireContext.keys = () => {
    return Object.keys(data);
  };

  const modulesWithoutExtensions = importAll(testRequireContext, false);
  const expectedModulesWithoutExtensions = {
    file: 'console.log("hello")',
    another_file: 'text in the file'
  };
  expect(modulesWithoutExtensions).toStrictEqual(
    expectedModulesWithoutExtensions
  );

  const modulesWithExtensions = importAll(testRequireContext, true);
  const expectedModulesWithExtensions = {
    'file.js': 'console.log("hello")',
    'another_file.txt': 'text in the file'
  };
  expect(modulesWithExtensions).toStrictEqual(expectedModulesWithExtensions);
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
