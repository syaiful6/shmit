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
