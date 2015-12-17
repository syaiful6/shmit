var A, B, C, Derrived, _c3_merge, _c3_mro, inherits,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

_c3_merge = function(sequences) {
  var candidate, exhausted, heads, i, j, len, len1, looping, results, s, s1, s2;
  results = [];
  looping = 0;
  while (true) {
    sequences = (function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = sequences.length; i < len; i++) {
        s = sequences[i];
        if (s && s.length > 0) {
          results1.push(s);
        }
      }
      return results1;
    })();
    if (sequences.length === 0) {
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
          console.log('yay found');
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
      throw new Error('Invalid');
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
    looping++;
    if (looping > 20) {
      throw new Error('Invalid structure');
    }
  }
};

_c3_mro = function(cls) {
  var bases, bases_mro, concatenated, explicit, s;
  explicit = [];
  bases = cls.__bases__ != null ? cls.__bases__ : [];
  bases_mro = [];
  if (cls && (cls.__bases__ != null)) {
    bases_mro = (function() {
      var i, len, ref, results1;
      ref = cls.__bases__;
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        if (s != null) {
          results1.push(_c3_mro(s));
        }
      }
      return results1;
    })();
  }
  concatenated = [[cls]].concat(bases_mro, [bases]);
  return _c3_merge(concatenated);
};

inherits = function() {
  var child, mro, parent;
  child = arguments[0], parent = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  Object.defineProperty(child, '__bases__', {
    writable: false,
    configurable: true,
    value: parent
  });
  mro = _c3_mro(child);
  return Object.defineProperty(child, '__mro__', {
    writable: false,
    configurable: true,
    value: mro
  });
};

A = (function() {
  function A() {}

  A.prototype.name = function() {
    return 'in A';
  };

  return A;

})();

B = (function() {
  function B() {}

  B.prototype.name = function() {
    return 'in B';
  };

  return B;

})();

C = (function() {
  function C() {}

  return C;

})();

inherits(C, A);

console.log(C.__bases__);

Derrived = (function() {
  function Derrived() {}

  return Derrived;

})();

inherits(Derrived, C, B);

console.log(Derrived.__bases__);