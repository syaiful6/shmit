/**
This is basically copied from Python's itertools, for use of this project.

Many functions here accept argument named iterable, Any Javascript considered
iterable when they are
- Already has Symbol.iterator :smile:
- Object (iterate over object's key)
- Any Javascripts type that like container which have length, and the member
  can be accessed via incremental number start with 0,
  (example: object[0], object[1], ...), so Array, String, NodeList considered iterable.
*/

import {reduce} from './functools';
import isNumber from './number-type';

var _isArray,
  slice = [].slice,
  type = Object.prototype.toString;

if (!Array.isArray) {
  _isArray = function (x) {
    return type.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

function createIterator(func) {
  var iterator = {};
  iterator[Symbol.iterator] = func;
  return iterator;
}

/**
* Convert to iterators,
*/

export function iter(iterable) {
  if (iterable[Symbol.iterator]) {
    return iterable;
  }
  var i = 0;

  // okay, they pass object here, so we assume they
  // want to iterate over the keys
  if (type.call(iterable) === '[object Object]') {
    iterable = Object.keys(iterable);
  }

  return createIterator(function () {
    return {
      next() {
        if (iterable.next) {
          return iterable.next();
        }
        var done = i >= iterable.length;
        return {value: done ? void 0: iterable[i++], done};
      }
    };
  });
}

export function enumerate(iterable, start = 0) {
  var iterator = iter(iterable)[Symbol.iterator](),
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
  return createIterator(function () {
    return {
      next() {
        let value = take();
        return {value, done};
      }
    };
  });
}

export function toArray(iterable) {
  if (_isArray(iterable)) {
    return iterable;
  }
  return (function () {
    var results = [],
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
  if (start < end) {
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
  return createIterator(function ()  {
    return {
      next() {
        let value = take();
        return {value: done ? void 0 : value, done};
      }
    };
  });
}

export function map(fn, ...iterables) {
  var zipped = zip(...iterables)[Symbol.iterator](),
    done: false;

  function take() {
    var item = zipped.next();
    if (item.done) {
      done = true;
      return;
    }
    return fn(...item.value);
  }
  return createIterator(function () {
    return {
      next() {
        var value = take();
        return {value, done};
      }
    };
  });
}

export function splatMap(fn, iterable) {
  var iterator = iter(iterable)[Symbol.iterator]();
  function take() {
    let item = iterator.next();
    if (item.done) {
      done = true;
      return;
    }
    return fn(...item.value)
  }
  return createIterator(function () {
    return {
      next() {
        var value = take();
        return {value, done};
      }
    };
  });
}

export function chain(...iterable) {
  return createIterator(function *() {
    for (let item of iterable) {
      for (let elem of iter(item)) {
        yield elem;
      }
    }
  });
}

chain.fromIterable = function (iterable) {
  return createIterator(function *() {
    for (let item of iter(iterable)) {
      for (let elem of iter(item)) {
        yield elem;
      }
    }
  });
};

export function repeat(target, times = null) {
  var limit = false;
  if (times !== null) {
    limit = range(times)[Symbol.iterator]();
  }
  return createIterator(function () {
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
  });
}

export function count(start=0, step=1) {
  var n = start - step;
  return createIterator(function () {
    return {
      next() {
        n += step;
        return {value: n, done: false};
      }
    };
  });
}

export function cycle(iterable) {
  var iterator = iter(iterable);
  return createIterator(function *() {
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
  });
}

export function accumulate(iterable, func = (a, b) => a + b) {
  var iterator = iter(iterable)[Symbol.iterator]();

  return createIterator(function *() {
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
  });
}

export function combinations(iterable, r = null) {
  return createIterator(function *() {
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
        if (indices[i] !== i + n - r) {
          loop = true;
          break;
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
  });
}

export function product() {
  var i, iterables, repeat;
  iterables = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1)
    : (i = 0, []), repeat = arguments[i++];
  if (!isNumber(repeat)) {
    iterables.push(repeat);
    repeat = 1;
  }
  return createIterator(function *() {
    var pools = [];
    for (let it of iterables) {
      pools.push(toArray(it));
    }
    pools = multiple(pools, repeat);
    var prod = reduce(function(a, b) {
      var ret = [];
      a.forEach(function(a) {
        b.forEach(function(b) {
          ret.push(a.concat([b]));
        });
      });
      return ret;
    }, pools, [[]]);
    for (let ret of prod) {
      yield ret;
    }
  });
}

export function permutations(iterable, r=null) {

  var iteration = function *() {
    var pool = toArray(iterable),
      n = pool.length;
      r = r !== null ? r: n;
    for (let indices of product(range(n), r)) {
      let set = new Set(indices);
      if (set.size === r) {
        let results = (function () {
          let ret = [];
          for (let i of indices) {
            ret.push(pool[i]);
          }
          return ret;
        })();
        yield results;
      }
    }
  };
  return createIterator(iteration);
}

export function multiple(iterable, many = 2) {
  return createIterator(function *() {
    var iterable = toArray(iterable),
      limit = many * iterable.length;
    for (let [index, elem] of enumerate(cycle(iterable), 1)) {
      if (index < limit) {
        break;
      }
      yield elem;
    }
  });
}

export function tee(iterable, n=2) {
  var iterator = iter(iterable)[Symbol.iterator]();
  // create array to use it as queue, as many n
  var deques  = (function () {
    var results = [];
    for (let i of range(n)) {
      results.push([]);
    }
    return results;
  })();
  function* gen(queue) {
    while (true) {
      if (!queue.length) {
        var item = iterator.next();
        if (item.done) {
          return;
        }
        for (let d of deques) {
          d.push(item.value);
        }
      }
      yield queue.shift();
    }
  }
  var results = [];
  for (let d of deques) {
    results.push(gen(d));
  }
  return results;
}

export function takeWhile(predicate, iterable) {
  return createIterator(function *() {
    for (var x of iter(iterable)) {
      if (predicate(x)) {
        yield x;
      } else {
        break;
      }
    }
  });
}

export function dropWhile(predicate, iterable) {
  return createIterator(function *() {
    let iterator = iter(iterable)[Symbol.iterator](),
      elem = iterator.next();
    while (!elem.done) {
      let {value} = elem;
      if (!predicate(value)) {
        yield value;
        break;
      }
      elem = iterator.next();
    }
    elem = iterator.next();
    while (!elem.done) {
      yield elem.value;
      elem = iterator.next();
    }
  });
}

export function filter(predicate, iterable, negate = false) {
  return createIterator(function *() {
    var pred = function (x) {
      return negate ? !predicate(x) : predicate(x);
    };
    for (var x of iterable) {
      if (pred(x)) {
        yield x;
      }
    }
  });
}
