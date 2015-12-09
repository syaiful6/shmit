export function merge(original, updates) {
  if (!updates || typeof updates !== 'object') {
    return original;
  }

  var props = Object.keys(updates);
  var prop;
  var length = props.length;

  for (var i = 0; i < length; i++) {
    prop = props[i];
    original[prop] = updates[prop];
  }

  return original;
}

export default merge;

var _isArray;

if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

export var isArray = _isArray;
