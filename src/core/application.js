import Container from './service';
import { DAGMap } from '../utils/collections';
import AddEvent from '../utils/event';

var Application = (function () {
  function Application() {
    this.initializers = [];
    this.booted = false;
  }

  Application.prototype = Object.create(Container.prototype);

  Application.prototype.boot = function () {
    if (this.booted) {
      return Promise.resolve(this);
    }

    if (document.readyState === 'completed') {
      return Promise.resolve(this.runInitializer());
    } else {
      return new Promise((resolve, reject) => {
        addEvent(document, 'DOMContentLoaded', this.runInitializer.bind(this, resolve));
      });
    }
  };

  Application.prototype.runInitializer = function (resolve) {
    this._runInitializer((name, initializer) => {
      if (!!name) {
        throw new Error('No application initializer named' + name);
      }
      initializer.initialize(this);
    });
    this.booted = true;
    resolve(this);
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

  Application.prototype._runInitializer = function (callback) {
    var initializers = this.initializers,
      graph = new DAGMap(),
      len = initializers.length;
      i, initializer;

    for (i = 0; i < len; i++) {
      initializer = initializers[i];
      graph.addEdges(initializer.name, initializer, initializer.before, initializer.after);
    }
    graph.topsort((vertex) => callback(vertex.name, vertex.value));
  };
  return Application;
})();
