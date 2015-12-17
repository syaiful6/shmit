var hasProp = {}.hasOwnProperty;
var assign = Object.assign;

function flatten(array, mutable) {
  var toString = Object.prototype.toString;
  var arrayTypeStr = '[object Array]';

  var result = [];
  var nodes = (mutable && array) || array.slice();
  var node;

  if (!array.length) {
    return result;
  }

  node = nodes.pop();

  do {
    if (toString.call(node) === arrayTypeStr) {
      nodes.push.apply(nodes, node);
    } else {
      result.push(node);
    }
  } while (nodes.length && (node = nodes.pop()) !== undefined);

  result.reverse();
  return result;
}

export default function inherits (child, ...parent) {
  var bases = parent.filter(x => !!x.__bases__).map(x => x.__bases__),
    bases = [].concat(parent, flatten(bases)),
    added = [];

  bases.forEach((resolution) => {
    for (var key in resolution) {
      if (hasProp.call(resolution, key) && added.indexOf(key) === -1) {
        added.push(key);
        child[key] = resolution[key];
      }
    }
  });
  var superProto = assign.apply(null, bases.map(res => res.prototype).reverse());
  child.prototype = Object.create(superProto, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    },
    _super: {
      enumerable: false,
      configurable: false,
      get: function () {
        var proto;
        if (!proto) {
          proto = {};
          for (var name in superProto) {
            if (typeof superProto[name] === 'function' && hasProp.call(superProto, key)) {
              proto[name] = superProto[name].bind(this);
            } else {
              proto[name] = superProto[name];
            }
          }
        }
        return proto;
      },
      set: function () {
        throw new Error('Nope, _super property not writable');
      }
    }
  });

  Object.defineProperty(child, '__bases__', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: bases
  });
}

export function isinstance(obj, type) {
  if (obj.constructor.__bases__) {
    var bases = obj.constructor.__bases__,
    len = bases.length,
    i, current;
    for (i = 0; i < len; i++) {
      current = bases[i];
      if (current === type) {
        return true;
      }
    }
  }
  return obj instanceof type;
}
