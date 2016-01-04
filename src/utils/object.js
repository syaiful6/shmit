/**
* utility for working with object
*/
var fnToString = (fn) => Function.prototype.toString.call(fn);
const OBJECT_STRING_VALUE = fnToString(Object);

export default function isPlain(obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  let proto = typeof obj.constructor === 'function'
    ? Object.getPrototypeOf(obj) : Object.prototype;

  if (proto === null) {
    return true;
  }

  var constructor = proto.constructor;

  return typeof constructor === 'function'
    && constructor instanceof constructor
    && fnToString(constructor) === OBJECT_STRING_VALUE;
}

export function equal(a, b) {
  function compare(x, y) {
    let property;
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    }

    if (x === y) {
      return true;
    }

    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    for (property in y) {
      if (y.hasOwnProperty(property) !== x.hasOwnProperty(property)) {
        return false;
      } else if (typeof y[property] !== typeof x[property]) {
        return false;
      }
    }

    for (property in x) {
      if (y.hasOwnProperty(property) !== x.hasOwnProperty(property)) {
        return false;
      } else if (typeof y[property] !== typeof x[property]) {
        return false;
      }

      switch (typeof (x[property])) {
        case 'object':
          if (!compare(x[property], y[property])) {
            return false;
          }
          break;
        default:
          if (x[property] !== y[property]) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  return compare(a, b);
}

export function ownKeys(obj) {
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    return Reflect.ownKeys(obj);
  }

  var keys = Object.getOwnPropertyNames(obj);

  if (typeof Object.getOwnPropertySymbols === 'function') {
    keys = keys.concat(Object.getOwnPropertySymbols(obj));
  }

  return keys;
}
