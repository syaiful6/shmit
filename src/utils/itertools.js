export default function iter(iterable) {
  if (iterable.next || iterable.done) {
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
        var done = i >= iterable.length;
        return {value: done ? void 0: iterable[i++], done};
      }
    };
  };
  return results;
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
      }
    }
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
    }
    return results;
  }
}

export function zip(...iterables) {
  var iterators = iterables.map((item) => {
    let it = iter(item);
    if (it[Symbol.iterator]) {
      return it[Symbol.iterator]();
    }
    return it;
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
  results[Symbil.iterator] = function ()  {
    return {
      next() {
        let value = take();
        return {value: done ? void 0 : val, done};
      }
    }
  };
  return results;
}
