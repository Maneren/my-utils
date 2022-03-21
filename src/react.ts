interface RequireContext {
  keys: () => string[]
  (file: string): string
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

interface Styles {
  [index: string]: string
}

type Builder = (classNames: string | string[]) => string;

/**
 * helper function factory for working with CSS modules
 * @param styles imported styles object
 * @returns function that substitues plain CSS classes with their bundled names
 */
export function classListBuilder (styles: Styles): Builder {
  /**
     * function that substitues plain CSS classes with their bundled names
     * @param classNames CSS classes either as a String or Array<String>
     * @returns string with CSS class names from the bundle
     */
  function builder (classNames: string): string;
  function builder (classNames: string[]): string;
  function builder (classNames: string | string[]): string {
    if (!Array.isArray(classNames)) classNames = classNames.split(' ');

    return classNames.map((x) => styles[x] ?? x).join(' ');
  }

  return builder;
}
