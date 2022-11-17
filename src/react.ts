interface RequireContext {
  keys: () => string[];
  (file: string): string;
}

interface Modules {
  [index: string]: string;
}

/**
 * Return last segment of path
 */
const basename = (path: string): string => path.split("/").pop() as string;

/**
 * Return file name without extension
 */
function withoutExtension(path: string): string {
  const filename = basename(path);

  const splitted = filename.split(".");

  const expectedLength = filename.startsWith(".") ? 2 : 1;

  if (splitted.length > expectedLength) {
    splitted.pop();
  }

  return splitted.join(".");
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
export function importAll(
  requireContext: RequireContext,
  preserveExtensions = false,
  preservePath = false,
): Modules {
  const modules: Modules = {};

  for (const pathToFile of requireContext.keys()) {
    let key = pathToFile;

    if (!preservePath) {
      key = basename(key);
    }

    if (!preserveExtensions) {
      key = withoutExtension(key);
    }

    modules[key] = requireContext(pathToFile);
  }

  return modules;
}

interface Styles {
  [index: string]: string;
}

/**
 * helper function factory for working with CSS modules
 * @param styles imported styles object
 * @returns function that substitues plain CSS classes with their bundled names
 */
export const classListBuilder =
  (styles: Styles) =>
  /**
   * function that substitues plain CSS classes with their bundled names
   * @param classNames CSS classes either as `string[]` or `string`, which will be splitted on spaces
   * @returns string with CSS class names from the bundle
   */
  (classNames: string | string[]): string =>
    (Array.isArray(classNames) ? classNames : classNames.split(" "))
      .map((x) => styles[x] ?? x)
      .join(" ");
