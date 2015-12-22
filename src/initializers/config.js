var repositories = {};

function mapType(val) {
  var e;
  if (val === '') {
    return null;
  } else if (val === 'true') {
    return true;
  } else if (val === 'false') {
    return false;
  } else if (!isNaN(val)) {
    return +val;
  } else if (val.indexOf('{') === 0) {
    try {
      return JSON.parse(val);
    } catch (_error) {
      e = _error;
      return val;
    }
  } else {
    return val;
  }
}

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
        name = config.getAttribute('name');
        value = config.getAttribute('content');
        propertyName = name.substring(4);
        repositories[propertyName] = mapType(value);
      }
    }
    app.register('configs', repositories);
  }
};
