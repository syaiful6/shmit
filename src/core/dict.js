var hasOwn = {}.hasOwnProperty;
var type = {}.toString;
const OBJECT = "[object Object]";
function splitSegments (key) {
  return key.split('.');
}

export default function Dict (options = {}) {
  this.__dict__ = options || {};
}

Dict.prototype.has = function (key) {
  if (hasOwn.call(this.__dict__, key)) {
    return true;
  }
  var segments = splitSegments(key),
    dict = this.__dict__,
    length, i, segment;
  for (i = 0, length = segments.length; i < length; i++) {
    segment = segments[i];
    if (type.call(dict) !== OBJECT || !hasOwn.call(dict, segment)) {
      return defaults ? defaults : false;
    }
    dict = dict[segment];
  }
  return true;
};

Dict.prototype.get = function (key, defaults) {
  if (key == null) {
    return this.__dict__; //give em all
  }
  var dict = this.__dict__;

  if (hasOwn.call(this.__dict__, key)) {
    return dict[key];
  }
  var segments = splitSegments(key), length, i, segment;
  for (i = 0, length = segments.length; i < length; i++) {
    segment = segments[i];
    if (type.call(dict) !==  OBJECT || !hasOwn.call(dict, segment)) {
      return defaults ? defaults : false;
    }
    dict = dict[segment];
  }
  return dict;
};

Dict.prototype.set = function (key, value = null) {
  if (type.call(key) === OBJECT) {
    Object.keys(key).forEach((item) => {
      this.set(item, key[item]);
    });
  } else {
    var keys = splitSegments(key),
      dict = this.__dict__;
    while (keys.length > 1) {
      key = keys.shift();
      if (!hasOwn.call(dict, key) || type.call(dict[key]) !== OBJECT) {
        dict[key] = {};
      }
      dict = dict[key];
    }
    dict[keys.shift()] = value;
  }
};

Dict.prototype.remove = function (key) {
  this.set(key, null);
}

Dict.prototype.keys = function () {
  var dict = this.__dict__;
  return Object.keys(dict).filter((item) => dict[item] != null);
}

Dict.prototype.values = function () {
  var dict = this.__dict__,
    results = [];
  this.keys().forEach((key) => {
    results.push(dict[key]);
  });
  return results;
}

Dict.prototype.entries = function () {
  var dict = this.__dict__,
    results = [];
  this.keys().forEach((key) => {
    results.push([key, dict[key]]);
  });
  return results;
}
