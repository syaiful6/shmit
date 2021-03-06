var indexOf = [].indexOf,
  hasProp = {}.hasOwnProperty,
  isArray = Array.isArray || function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };

// variant of Object.assign but this will copy the descriptor
export function assign(target, ...sources) {
  sources.forEach(source => {
    Object.defineProperties(target, Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {}));
  });
  return target;
}

export function c3_merge(resolutions) {
  var sequences, candidate, exhausted, heads, i, j, len, len1, results, s, s1, s2;
  results = [];
  sequences = resolutions.slice(); // copy this array
  while (true) {
    // purge empty array each iteration
    sequences = (function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = sequences.length; i < len; i++) {
        s = sequences[i];
        if (s && s.length) {
          results1.push(s);
        }
      }
      return results1;
    })();
    if (!sequences.length) {
      return results;
    }
    for (i = 0, len = sequences.length; i < len; i++) {
      s1 = sequences[i];
      candidate = s1[0];
      exhausted = false;
      for (j = 0, len1 = sequences.length; j < len1; j++) {
        s2 = sequences[j];
        heads = s2.slice(1);
        if (indexOf.call(heads, candidate) >= 0) {
          candidate = null;
          exhausted = true;
          break;
        }
      }
      if (!exhausted) {
        break;
      }
    }
    if (candidate == null) {
      throw new Error('Invalid resolution for sequences' + resolutions.join(', '));
    }
    results.push(candidate);
    sequences = sequences.map(function(x) {
      var id;
      if (x[0] && x[0] === candidate) {
        id = x.indexOf(candidate);
        x.splice(id, 1);
      }
      return x;
    });
  }
}

export function c3_mro(cls) {
  var bases, bases_mro, concatenated, explicit, s;
  explicit = [];
  bases = cls.__bases__ != null ? cls.__bases__.slice() : [];
  bases_mro = [];
  if (cls && (cls.__bases__ != null)) {
    bases_mro = (function() {
      var i, len, ref, results1;
      ref = cls.__bases__.slice();
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        if (s != null) {
          results1.push(c3_mro(s));
        }
      }
      return results1;
    })();
  }
  concatenated = [].concat([[cls]], [bases], bases_mro);
  return c3_merge(concatenated);
};

export default function inherits (child, ...parent) {
  var exclude = ['__mro__', '__bases__'], mro, proto, superProto;
  child.__bases__ = parent;
  child.__mro__ = c3_mro(child);

  // copy the mro and assign to child prototype
  superProto = child.__mro__.slice().map(res => assign.call(null, {}, res.prototype));
  superProto = assign.apply(null, superProto.reverse());
  function C3() {
    let first = mro[1];
    first.apply(this, arguments);
  }

  assign(C3.prototype, superProto);

  mro = child.__mro__.slice(1); // exclude the child for static assigment
  // Well, this copy all static method to the child
  mro.forEach((resolution) => {
    for (var key in resolution) {
      if (hasProp.call(resolution, key) && exclude.indexOf(key) === -1) {
        exclude.push(key);
        C3[key] = resolution[key];
      }
    }
  });

  child.prototype = Object.create(C3.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    },
    '__super__': {
      enumerable: false,
      configurable: false,
      get: function () {
        if (!proto) {
          proto = {};
          let superProto = C3.prototype;
          for (let name in superProto) {
            if (typeof superProto[name] === 'function' && hasProp.call(superProto, name)) {
              proto[name] = superProto[name].bind(this);
            } else {
              proto[name] = superProto[name];
            }
          }
          proto.constructor = C3.bind(this);
        }
        return proto;
      },
      set: function () {
        throw new Error('Nope, _super property not writable');
      }
    }
  });

  Object.setPrototypeOf
  ? Object.setPrototypeOf(child, C3)
  : child.__proto__ = C3;
};

export function isinstance(obj, type) {
  if (obj.constructor.__mro__) {
    var mro = obj.constructor.__mro__,
    len = mro.length,
    i, current;
    for (i = 0; i < len; i++) {
      current = mro[i];
      if (current === type) {
        return true;
      }
    }
  }
  return obj instanceof type;
}
