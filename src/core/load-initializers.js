export default function (app, prefix) {
  const re_initializer = new RegExp('^' + prefix + '\/(initializers)\/');
  Object.keys(requirejs._eak_seen).map((moduleName) => {
    return {
      moduleName: moduleName,
      matches: re_initializer.exec(moduleName)
    };
  }).filter((dep) => dep.matches && dep.matches.length === 2).forEach((dep) => {
    var moduleName = dep.moduleName;
    var module = require(moduleName, null, null, true);
    if (!module) {
      throw new Error(moduleName + ' must export an initializer.');
    }
    var initializer = module['default'];
    if (!initializer.name) {
      initializer.name = moduleName;
    }

    app.addInitializer(initializer);
  })
};
