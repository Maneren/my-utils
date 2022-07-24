import { importAll, classListBuilder } from '../src/react';

describe('importAll', () => {
  const context = (data: { [id: string]: string }): any => {
    const context = (id: string): string => data[id];
    context.keys = () => Object.keys(data);
    return context;
  };

  it('imports a file', () => {
    const data = {
      './file.js': './static/file.abc.js'
    };

    const imported = importAll(context(data));
    const expected = {
      file: './static/file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('imports a file with longer path', () => {
    const data = {
      './path/to/file.js': './static/file.abc.js'
    };

    const imported = importAll(context(data));
    const expected = {
      file: './static/file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('imports a file without an extension', () => {
    const data = {
      './path/to/file': './static/file.abc'
    };

    const imported = importAll(context(data));
    const expected = {
      file: './static/file.abc'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('imports a hidden file', () => {
    const data = {
      './path/to/.file.js': './static/file.abc.js'
    };

    const imported = importAll(context(data));
    const expected = {
      '.file': './static/file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('imports a hidden file without an extension', () => {
    const data = {
      './path/to/.file': './static/file.abc'
    };

    const imported = importAll(context(data));
    const expected = {
      '.file': './static/file.abc'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension', () => {
    const data = {
      './path/to/file.js': './static/file.abc.js'
    };

    const imported = importAll(context(data), true);
    const expected = {
      'file.js': './static/file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension and the path', () => {
    const data = {
      './path/to/file.js': './static/file.abc.js'
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      './path/to/file.js': './static/file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension for hidden file', () => {
    const data = {
      './path/to/.file.js': './static/.file.abc.js'
    };

    const imported = importAll(context(data), true);
    const expected = {
      '.file.js': './static/.file.abc.js'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension for file without an extension', () => {
    const data = {
      './path/to/file': './static/file.abc'
    };

    const imported = importAll(context(data), true);
    const expected = {
      file: './static/file.abc'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension for hidden file without an extension', () => {
    const data = {
      './path/to/.file': './static/.file.abc'
    };

    const imported = importAll(context(data), true);
    const expected = {
      '.file': './static/.file.abc'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('preserves the extension and the path for hidden file without an extension', () => {
    const data = {
      './path/to/.file': './static/.file.abc'
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      './path/to/.file': './static/.file.abc'
    };
    expect(imported).toStrictEqual(expected);
  });

  it('handles weird input', () => {
    const data = {
      '': './static/.file.abc',
      '$$/$$': './static/.file.abc',
      '...js': './static/.file.abc'
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      '': './static/.file.abc',
      '$$/$$': './static/.file.abc',
      '...js': './static/.file.abc'
    };
    expect(imported).toStrictEqual(expected);
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
