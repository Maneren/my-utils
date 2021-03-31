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
}
export default React;
