function iter(iterable) {
  if (iterable.next || iterable.done) {
    return iterable;
  }
  var i = 0;
  return {
    [Symbol.iterator]: function() {
      return {
        next() {
          var done = i >= iterable.length;
          return {value: done ? null: iterable[i++], done};
        }
      };
    }
  };
}

function range(start, end, step) {
  if (end == null) {
    end = start;
    start = 0;
  }
  if (start === end) {
    return {
      [Symbol.iterator]: function () {
        return {
          next() {
            return {done: true};
          }
        };
      }
    };
  } else if (start < end) {
    if (step == null) {
      step = 1;
    }
    if (step <= 0) {
      throw new Error(`${start} is < ${end}, so step must be positive`);
    }
    var i = start - step;
    return {
      [Symbol.iterator]: function () {
        return {
          next() {
            i += step;
            var done = i >= end;
            return {value: done ? null : i, done};
          }
        };
      }
    };
  } else {
    if (step == null) {
      step = -1;
    }
    if (step >= 0) {
      throw new Error(`${start} is > ${end}, so step must be negative`);
    }
    var i = start - step;
    return {
      [Symbol.iterator]: function () {
        return {
          next() {
            i += step;
            var done = i <= end;
            return {value: done ? null : i, done};
          }
        };
      }
    };
  }
}

function zip(...iterables) {
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
  return {
    [Symbol.iterator]: function() {
      return {
        next()  {
          let val = take();
          return {value: done ? null: val, done};
        }
      };
    }
  };
}
