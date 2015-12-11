import Container from './service';
import { DAGMap } from '../utils/collections';
import addEvent from '../utils/event';

export default (function () {
  function Application() {
    this.initializers = [];
    this._booted = false;
  }

  Application.prototype = Object.create(Container.prototype);

  Application.prototype.boot = function () {
    if (this._booted) {
      return Promise.resolve(this);
    }
    return new Promise((resolve) => {
      this._waitDomRead(resolve);
    });
  };

  Application.prototype._waitDomRead = function (resolve) {
    var bootstrapper = () => {
      this.runInitializer();
      resolve(this);
    };
    // already compled
    if (document.readyState === 'complete') {
      bootstrapper();
    } else {
      addEvent(document, 'DOMContentLoaded', bootstrapper);
    }
  };

  Application.prototype.addInitializer = function (initializer) {
    if (typeof initializer !== 'object') {
      throw new Error('initializer must be an object');
    }
    if (typeof initializer.initialize !== 'function') {
      throw new Error('initializer.initialize must be callable');
    }
    if (!initializer.name) {
      throw new Error('initializer.initialize must be defined');
    }
    this.initializers.push(opts);
  };

  Application.prototype.runInitializer = function () {
    this._runInitializer((name, initializer) => {
      if (!!initializer) {
        throw new Error(`No application initializer named ${name}`);
      }
      initializer.initialize(this);
    });
  };

  Application.prototype._runInitializer = function (callback) {
    var initializers = this.initializers,
      graph = new DAGMap(),
      len = initializers.length;
      i, initializer;

    for (i = 0; i < len; i++) {
      initializer = initializers[i];
      graph.addEdges(initializer.name, initializer, initializer.before, initializer.after);
    }

    graph.topsort(function (vertex) {
      callback(vertex.name, vertex.value);
    });
  };
  return Application;
})();
