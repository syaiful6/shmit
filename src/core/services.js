import {isArray} from '../utils/collections';

function missingService(name, referrer) {
  throw new Error('Could not find service `' + name + '` imported from `' + referrer + '`');
}

function resolve(child, name) {
  if (child.charAt(0) !== '.') { return child; }

  var parts = child.split('/');
  var nameParts = name.split('/');
  var parentBase = nameParts.slice(0, -1);

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];

    if (part === '..') {
      if (parentBase.length === 0) {
        throw new Error('Cannot access parent module of root');
      }
      parentBase.pop();
    } else if (part === '.') {
      continue;
    } else { parentBase.push(part); }
  }

  return parentBase.join('/');
}

var Service = (function () {
  var uuid = 0;
  var _defaults = ['require', 'exports', 'module'];
  var FAILED = false;
  var LOADED = true;

  function Service(name, deps, callback) {
    this.id = uuid++;
    this.name = name;
    this.deps = !deps.length && callback.length ? _defaults : deps;
    this.callback = callback;
    this.module = {
      exports: {}
    };
    this._state = undefined;
    this._require = undefined;
    this._finalized = false;
    this.hasExportsAsDep = false;
  }

  Service.prototype = {
    exports: function (reifiedDeps) {
      if (this._finalized) {
        return this.module.exports;
      } else {
        let results = this.callback.apply(this, reifiedDeps);
        if (!(this.hasExportsAsDep && results === undefined)) {
          this.module.exports = results;
        }
        this._finalized = true;
        return this.module.exports;
      }
    },

    unsee: function () {
      this._finalized = false;
      this.module = {exports: {}};
      this._state = undefined;
    },

    build: function (reifieds) {
      if (this._state === FAILED) {
        return;
      }
      this._state = FAILED;
      this.exports(reifieds);
      this._state = LOADED;
    },

    reified: function () {
      var deps = module.deps,
      length = deps.length,
      reified = new Array(length),
      dep, i;
      var _requireCallback = (dep) => this.require(resolve(dep, module.name))
      for (i = 0; i < length; i++) {
        dep = deps[i];
        if (dep === 'exports') {
          module.hasExportsAsDep = true;
          reified[i] = module.module.exports;
        } else if (dep === 'require') {
          reified[i] = _requireCallback;
        } else if (dep === 'module') {
          reified[i] = module.module;
        } else {
          reified[i] = this.findService(resolve(dep, module.name), module.name).module.exports;
        }
      }
      return reified;
    },

    toString: function() {
      return `<service: ${this.name}>`;
    }
  };

  return Service;
})();

function Alias(name) {
  this.name = name;
}

export default function Container() {
  this.registry = Object.create(null);
}

Container.prototype.register = function (name, deps, callback) {
  if (arguments.length < 2) {
    throw new Error('an unsupported service definition');
  }
  if (!isArray(deps)) {
    callback = deps;
    deps     =  [];
  }
  this.registry[name] = new Service(name, deps, callback);
};

Container.prototype.alias = (path) => new Alias(path)

Container.prototype.require = function (name) {
  return this.findService(name, '(require)').module.exports;
};

Container.prototype.findService = function (name, referrer) {
  var mod = this.registry[name];

  while (mod && mod.callback instanceof Alias) {
    name = mod.callback.name;
    mod = this.registry[name];
  }

  if (!mod) {
    missingService(name, referrer);
  }

  mod.build(this._buildParams(mod));
  return mod;
};

Container.prototype._buildParams = function (module) {
  var deps = module.deps,
    length = deps.length,
    reified = new Array(length),
    dep, i;
  var _requireCallback = (dep) => this.require(resolve(dep, module.name))
  for (i = 0; i < length; i++) {
    dep = deps[i];
    if (dep === 'exports') {
      module.hasExportsAsDep = true;
      reified[i] = module.module.exports;
    } else if (dep === 'require') {
      reified[i] = _requireCallback;
    } else if (dep === 'module') {
      reified[i] = module.module;
    } else {
      reified[i] = this.findService(resolve(dep, module.name), module.name).module.exports;
    }
  }
  return reified;
};

Container.prototype.unsee = function (moduleName) {
  return findService(moduleName).unsee();
};

Container.prototype.clear = function clear() {
  this.registry = Object.create(null);
};
