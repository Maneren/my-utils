import path from 'path-browserify';

interface RequireContext {
  keys: () => string[]
  (file: string): string
}

interface Modules {
  [index: string]: string
}

/**
 * **compatible only with webpack**
 *
 * imports all files from `require.context` and returns mapping to resulting bundle files
 * @param requireContext `require.context(directory: string, useSubdirectories: boolean, regExp: RegExp, mode: string)`
 * @param preserveExtensions if the original file extensions should be preserved
 * @param preservePath if the original file paths should be preserved, othereise only the filename is used
 * @returns object mapping project files to bundled files, eg. `{ "../assets/file": "./static/file.abcvzjh.jpg" }`
 */
export function importAll (
  requireContext: RequireContext,
  preserveExtensions = false,
  preservePath = false
): Modules {
  const modules: Modules = {};

  for (const pathToFile of requireContext.keys()) {
    let key = pathToFile;

    if (!preservePath) {
      key = path.basename(key);
    }

    if (!preserveExtensions) {
      const extension = path.extname(pathToFile);
      key = key.replace(new RegExp(`${extension}$`), '');
    }

    modules[key] = requireContext(pathToFile);
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
