var _isArray;

if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

export default function iter(iterable) {
  if (iterable[Symbol.iterator]) {
    return iterable;
  }
  var i = 0,
    results ={};
  if (iterable.toString() === '[object Object]') {
    iterable = Object.keys(iterable);
  }
  results[Symbol.iterator] = function () {
    return {
      next() {
        if (iterable.next) {
          return iterable.next();
        }
        var done = i >= iterable.length;
        return {value: done ? void 0: iterable[i++], done};
      }
    };
  };
  return results;
}

export function enumerate(iterable, start = 0) {
  var iterator = iter(iterable)[Symbol.iterator](),
    results = {},
    done = false,
    n = start;
  function take() {
    let item = iterator.next();
    if (item.done) {
      done = true;
      return;
    }
    let results = [n, item.value];
    n++;
    return results;
  }
  results[Symbol.iterator] = function () {
    return {
      next() {
        let value = take();
        return {value, done};
      }
    };
  };
  return results;
}

export function toArray(iterable) {
  if (isArray(iterable)) {
    return iterable;
  }
  return (function () {
    var results,
      iterator = iter(iterable),
      item;
    for (item of iterator) {
      results.push(item);
    }
    return results;
  })();
}

export function range(start, end, step) {
  if (end == null) {
    end = start;
    start = 0;
  }
  if (start === end) {
    let results = {};
    results[Symbol.iterator] = function () {
      return {
        next() {
          return {done: true};
        }
      };
    };
    return results;
  } else if (start < end) {
    if (step == null) {
      step = 1;
    }
    if (step <= 0) {
      throw new Error(`${start} is < ${end}, so step must be positive`);
    }
    var i = start - step;

    let results = {};
    results[Symbol.iterator] = function () {
      return {
          next() {
            i += step;
            var done = i >= end;
            return {value: done ? null : i, done};
          }
      };
    };
    return results;
  } else {
    if (step == null) {
      step = -1;
    }
    if (step >= 0) {
      throw new Error(`${start} is > ${end}, so step must be negative`);
    }
    var i = start - step;
    let results = {};
    results[Symbol.iterator] = function () {
      return {
        next() {
          i += step;
          var done = i <= end;
          return {value: done ? null : i, done};
        }
      };
    };
    return results;
  }
}

export function zip(...iterables) {
  var iterators = iterables.map((item) => {
    if (item[Symbol.iterator]) {
      return item[Symbol.iterator]();
    }
    let it = iter(item);
    return it[Symbol.iterator]();
  }),
    done = false,
    take = function () {
      var results = [], i, len;
      for (i = 0, len = iterators.length; i < len; i++) {
        let item = iterators[i].next();
        if (item.done) {
          done = true;
          break;
        } else {
          results.push(item.value);
        }
      }
      return results;
    };

  let results = {};
  results[Symbol.iterator] = function ()  {
    return {
      next() {
        let value = take();
        return {value: done ? void 0 : value, done};
      }
    };
  };
  return results;
}

export function map(fn, ...iterables) {
  var zipped = zip(...iterables)[Symbol.iterator](),
    results = {},
    done: false;

  function take() {
    var item = zipped.next();
    if (item.done) {
      done = true;
      return;
    }
    return fn(...item.value);
  }
  results[Symbol.iterator] = function () {
    return {
      next() {
        var value = take();
        return {value, done};
      }
    };
  };
  return results;
}

export function splatMap(fn, iterable) {
  var iterator = iter(iterable)[Symbol.iterator](),
    results = {};
  function take() {
    let item = iterator.next();
    if (item.done) {
      done = true;
      return;
    }
    return fn(...item.value)
  }
  results[Symbol.iterator] = function () {
    return {
      next() {
        var value = take();
        return {value, done};
      }
    };
  };
  return results;
}

export function chain(...iterable) {
  var results = {};
  results[Symbol.iterator] = function *() {
    for (let item of iterable) {
      for (let elem of iter(item)) {
        yield elem;
      }
    }
  };
  return results;
}

chain.fromIterable = function (iterable) {
  var results = {};
  results[Symbol.iterator] = function *() {
    for (let item of iter(iterable)) {
      for (let elem of iter(item)) {
        yield elem;
      }
    }
  };
  return results;
};

export function repeat(target, times = null) {
  var results = {},
    limit = false;
  if (times !== null) {
    limit = range(times)[Symbol.iterator]();
  }
  results[Symbol.iterator] = function () {
    return {
      next() {
        var value = target;
        if (!limit) {
          return {value, done: false};
        } else {
          let {done} = limit.next();
          return {value, done};
        }
      }
    };
  };
  return results;
}

export function count(start=0, step=1) {
  var results = {},
    n = start - step;
  results[Symbol.iterator] = function () {
    return {
      next() {
        n += step;
        return {value: n, done: false};
      }
    };
  };
  return results;
}

export function cycle(iterable) {
  var iterator = iter(iterable),
    results = {};
  results[Symbol.iterator] = function *() {
    var saved = [],
      elem;
    for (elem of iterator) {
      yield elem;
      saved.push(elem);
    }
    while(saved.length > 0) {
      for (elem of saved) {
        yield elem;
      }
    }
  };
  return results;
}

export function accumulate(iterable, func = (a, b) => a + b) {
  var iterator = iter(iterable)[Symbol.iterator](),
    results = {};

  results[Symbol.iterator] = function *() {
    var item = iterator.next();
    if (item.done) {
      return;
    }
    var total = item.value;
    yield total;
    while (true) {
      item = iterator.next();
      if (item.done) {
        break;
      }
      total = func(total, item.value);
      yield total;
    }
  };
  return results;
}

export function combinations(iterable, r = null) {
  var results = {};
  results[Symbol.iterator] = function *() {
    var pool = toArray(iterable),
      n = pool.length;
    r = r !== null ? r : n;
    if (r > n) {
      return;
    }
    var indices = toArray(range(r)),
      res = [];
    for (var i of indices) {
      res.push(pool[i]);
    }
    yield res;
    while (true) {
      let loop, exhausted, i, j;
      loop = exhausted = false;
      for (i of toArray(range(r)).reverse()) {
        if (indices[i] != i + n - r) {
          loop = true;
        }
      }
      if (loop === exhausted) {
        return;
      }
      indices[i] += 1;
      for (j of range(i + 1, r)) {
        indices[j] = indices[j-1] + 1;
      }
      res = [];
      for (i of indices) {
        res.push(pool[i]);
      }
      yield res;
    }
  };
  return results;
}
