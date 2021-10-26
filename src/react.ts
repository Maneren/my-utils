interface RequireContext extends Function {
  keys: () => string[]
}

interface Styles { [index: string]: string }

class React {
  static importAll (requireContext: RequireContext, preserveExtension = false): {[index: string]: NodeModule} {
    const modules: any = {};
    requireContext.keys().forEach((pathToFile) => {
      let basename: any;

      if (preserveExtension) {
        basename = pathToFile.match(/[^/]*(\.?[^/\s]*(\.\w+))/)?.[0];
      } else {
        basename = pathToFile.match(/[^/]+?(?=\.\w+$)/)?.[0];
      }

      if (basename === undefined) {
        throw new Error(`Error while parsing file ${pathToFile}`);
      }

      modules[basename] = requireContext(pathToFile).default;
    });
    return modules;
  }

  static classListBuilder (styles: Styles) {
    return (classNames: string | string[]) => {
      const classesList = Array.isArray(classNames)
        ? classNames
        : classNames.split(' ');
      return classesList
        .map((x) => (styles[x] !== undefined ? styles[x] : x))
        .join(' ');
    };
  }
}

export default React;
