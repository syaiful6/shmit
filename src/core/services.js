import {isArray} from '../utils/collections';

var Service = (function () {
  var uuid = 0;
  var _defaults = ['require', 'exports', 'services'];
  var FAILED = false;
  var LOADED = true;

  function Service(name, deps, callback) {
    this.id = uuid++;
    this.name = name;
    this.deps = !deps.length && callback.length ? _defaults : deps;
    this.callback = callback;
    this.services = {
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
        return this.services.exports;
      } else {
        let results = this.callback.apply(this, reifiedDeps);
        if (!(this.hasExportsAsDep && result === undefined)) {
          this.services.exports = result;
        }
        this._finalized = true;
        return this.services.exports;
      }
    },

    unsee: function () {
      this._finalized = false;
      this.services = {exports: {}};
      this._state = undefined;
    },

    reify: function () {
      var deps = this.deps,
        length = deps.length,
        reified = new Array(length),
        dep, i;

      for (i = 0; i < length; i++) {
        dep = deps[i];
        if (dep === 'exports') {
          this.hasExportsAsDep = true;
          reified[i] = this.module.exports;
        } else if (dep === 'require') {
          reified[i] = this._makeRequire();
        } else if (dep === 'services') {
          reified[i] = this.services;
        } else {
          reified[i] = findService(resolve(dep, this.name), this.name).services.exports;
        }
      }
      return reified;
    },

    _makeRequire: function () {
      var name = this.name;
      return this._require || (this._require = function(dep) {
        return require(resolve(dep, name));
      });
    },

    build: function () {
      if (this._state === FAILED) {
        return;
      }
      this._state = FAILED;
      this.exports(this.reify());
      this._state = LOADED;
    },

    toString: function() {
      return `<service: ${this.name}>`;
    }
  };

  return Service;
})();

var serviceRegistry = {};

export default function service(name, deps, callback) {
  if (arguments.length < 2) {
    throw new Error('an unsupported service definition');
  }
  if (!isArray(deps)) {
    callback = deps;
    deps     =  [];
  }
  serviceRegistry[name] = new Service(name, deps, callback);
}

function Alias(name) {
  this.name = name;
}

service.alias = (path) => new Alias(path)

function missingService(name, referrer) {
  throw new Error('Could not find service `' + name + '` imported from `' + referrer + '`');
}

export function require(name) {
  return findService(name, '(require)').services.exports;
}

function findService(name, referrer) {
  var mod = serviceRegistry[name];

  while (mod && mod.callback instanceof Alias) {
    name = mod.callback.name;
    mod = serviceRegistry[name];
  }

  if (!mod) {
    missingService(name, referrer);
  }

  mod.build();
  return mod;
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

export var entries = serviceRegistry;

export function unsee(moduleName) {
  return findService(moduleName).unsee();
}

export function clear() {
  entries = serviceRegistry = {};
}
