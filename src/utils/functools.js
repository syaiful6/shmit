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

export function spawn(generatorFunc) {
  function continuer(verb, arg) {
    var result;
    try {
      result = generator[verb](arg);
    } catch (err) {
      return Promise.reject(err);
    }
    if (result.done) {
      return result.value;
    } else {
      return Promise.resolve(result.value).then(onFulfilled, onRejected);
    }
  }
  var generator = generatorFunc();
  var onFulfilled = continuer.bind(continuer, "next");
  var onRejected = continuer.bind(continuer, "throw");
  return onFulfilled();
}
