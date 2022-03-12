interface RequireContext extends Function {
  keys: () => string[]
}

interface Styles {
  [index: string]: string
}

interface Modules {
  [index: string]: NodeModule
}

export function importAll (
  requireContext: RequireContext,
  preserveExtensions = false
): Modules {
  const modules: Modules = {};

  for (const pathToFile of requireContext.keys()) {
    let basename: string | undefined;

    if (preserveExtensions) {
      basename = pathToFile.match(/[^/]*(\.?[^/\s]*(\.\w+))/)?.[0];
    } else {
      basename = pathToFile.match(/[^/]+?(?=\.\w+$)/)?.[0];
    }

    if (basename === undefined) {
      throw new Error(`Error while parsing file ${pathToFile}`);
    }

    modules[basename] = requireContext(pathToFile).default;
  };

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
