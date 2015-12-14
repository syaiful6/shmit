import { DAGMap } from '../utils/collections';
import addEvent from '../utils/event';

/**
* this is likely just a way for us to manage app state.
*
*/
export default (function () {
  function Application() {
    this.initializers = [];
    this._booted = false;
    this.services = {};
  }

  /**
  * boot the application, if it already booted, then we will simply resolve
  * an instance of this class. If not we will immediately return promise which
  * will eventually resolved after DOMContentLoaded event.
  *
  */
  Application.prototype.boot = function () {
    if (this._booted) {
      return Promise.resolve(this);
    }
    return Promise.resolve(this._waitDomReady());
  };

  /**
  * wait dom ready for boot our app
  */
  Application.prototype._waitDomReady = function () {
    return new Promise((resolve, reject) => {
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
    });
  };

  /**
  * here we just call all initializer registered, this is where we can manage
  * the default state of our app.
  */
  Application.prototype.runInitializer = function () {
    this._runInitializer((name, initializer) => {
      if (!!name) {
        throw new Error('No application initializer named' + name);
      }
      initializer.initialize(this);
    });
    this._booted = true;
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
    this.initializers.push(initializer);
  };

  Application.prototype._runInitializer = function (callback) {
    var initializers = this.initializers,
      graph = new DAGMap(),
      len = initializers.length,
      i, initializer;

    for (i = 0; i < len; i++) {
      initializer = initializers[i];
      graph.addEdges(initializer.name, initializer, initializer.before, initializer.after);
    }

    graph.topsort((vertex) => callback(vertex.name, vertex.value));

  };
  return Application;
})();
