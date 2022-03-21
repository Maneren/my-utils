interface RequireContext {
  keys: () => string[]
  (file: string): string
}

interface Styles {
  [index: string]: string
}

interface Modules {
  [index: string]: string
}

/**
 * imports all files from `require.context` and returns mapping to resulting bundle files
 * @param requireContext `require.context` call
 * @param preserveExtensions if the original file extensions should be preserved
 * @returns object mapping old filenames to bundled filepaths, eg. `{ "file": "./static/file.abcvzjh.jpg" }`
 */
export function importAll (
  requireContext: RequireContext,
  preserveExtensions = false
): Modules {
  const modules: Modules = {};

  const filenameRegex = preserveExtensions
    ? /[^/]*(\.?[^/\s]*(\.\w+))/
    : /[^/]+?(?=\.\w+$)/;

  for (const pathToFile of requireContext.keys()) {
    const basename = pathToFile.match(filenameRegex)?.[0];

    if (basename === undefined) {
      throw new Error(`Error while parsing file ${pathToFile}`);
    }

    modules[basename] = requireContext(pathToFile);
  }

  return modules;
}

type Builder = (classNames: string | string[]) => string;

export function classListBuilder (styles: Styles): Builder {
  function builder (classNames: string): string;
  function builder (classNames: string[]): string;

  function builder (classNames: string | string[]): string {
    if (!Array.isArray(classNames)) classNames = classNames.split(' ');

    const result = classNames.map((x) => styles[x] ?? x).join(' ');

    return result;
  }

  return builder;
}
