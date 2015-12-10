import Container from './service';
import { DAGMap } from '../utils/collections';

var Application = (function () {
  function Application() {
    this.initializers = [];
  }

  Application.prototype = Object.create(Container.prototype);

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
  }

  Application.prototype._runInitializer = function (opts) {
    var initializers = this.initializers,
      graph = new DAGMap(),
      len = initializers.length;
      i, initializer;

    for (i = 0; i < len; i++) {
      initializer = initializers[i];
    }

  }
  return Application;
})();
