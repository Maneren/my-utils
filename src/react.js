class React {
  static importAll (requireContext, preserveExtension = false) {
    const modules = {};
    requireContext.keys().forEach(pathToFile => {
      let basename;

      if (preserveExtension) {
        basename = pathToFile.match(/[^/]*(\.?[^/\s]*(\.\w+))/)[0];
      } else {
        basename = pathToFile.match(/[^/]+?(?=\.\w+$)/)[0];
      }

      modules[basename] = requireContext(pathToFile).default;
    });
    return modules;
  }

  static classListBuilder (styles) {
    return function (classNames) {
      const classesList = Array.isArray(classNames) ? classNames : classNames.split(' ');
      return classesList
        .map(x => styles[x] ? styles[x] : x)
        .join(' ');
    };
  }
}

module.exports = React;
