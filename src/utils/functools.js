import {chain, toArray} from './itertools';

export default function memoize(func) {
  var stringifyJson = JSON.stringify,
    cache = {};

  var cached = function() {
    var hash = stringifyJson(arguments);
    return (hash in cache) ? cache[hash] : cache[hash] = func.apply(this, arguments);
  };

  cached.__cache = (function() {
    cache.remove || (cache.remove = function() {
      var hash = stringifyJson(arguments);
      return (delete cache[hash]);
    });
    return cache;
  }).call(this);

  return cached;
};

export function memoizeDesc(target, key, desc) {
  var func = desc.value;
  desc.value = memoize(func);
  return desc;
}

export function reduce(fn, iterable, start) {
  var acc = start;
  for (let elem of iterable) {
    acc = fn(acc, elem);
  }
  return acc;
}

/**
* compose functions right to left
*
* compose(f, g, h)(x) -> f(g(h(x)))
*/
export function compose(f, ...fs) {
  var rfs = toArray(chain([f], fs));
  rfs.reverse();

  return (...args) => {
    return reduce(
      (result, fn) => fn(result),
      rfs.slice(1),
      rfs[0](...args)
    );
  };
}

export function identity(x) {
  return x;
}
