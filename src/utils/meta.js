var hasProp = {}.hasOwnProperty;

function (mro) {
  return mro.map((res) => res.prototype)
}

function extend (child, ...parent) {
  var parentmro = parent.map(m => m.__mro__).filter(x => x != null),
    mro = [].concat(parent, parentmro);
  var proto = {};
  mro.forEach((resolution) => {
    for (var key in resolution) {
      if (hasProp.call(resolution, key) && !(key in child)) {
        child[key] = resolution[key];
      }
    }
  });
  function ctor() {};
  ctor.prototype = Object.assign.apply(null, mro.map(res => res.prototype).reverse());
  Object.defineProperty(ctor.prototype, '__mro__', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: mro
  });
  child.prototype = new ctor();
  return child;
}
