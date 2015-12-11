var repositories = {};

export default {
  name: 'application-configs:main',
  initialize(app) {
    var metaConfigs = document.querySelectorAll('meta[name^="env-"]');
    if (metaConfigs) {
      var len = metaConfigs.length,
        i, config, name, value, propertyName;
      // walk over this node list
      for (i = 0; i < len; i++) {
        config = metaConfigs[i];
        key = config.name;
        value = config.value;
        propertyName = key.substring(4);
        repositories[propertyName] = mapType(value);
      }
    }
    // okay
    app.register('configs:main', ['exports'], function (exports) {
      exports.repositories = repositories;
    });
  }
};
