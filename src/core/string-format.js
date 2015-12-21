import memoize from '../utils/functools';

const CAMELCASE1_RE = /(\-|\_|\.|\s)+(.)?/g;
const CAMELCASE2_RE = /(^|\/)([A-Z])/g;

const DECAMELIZE_RE = /([a-z\d])([A-Z])/g;

function _camelize(str) {
  return str.replace(CAMELCASE1_RE, (match, separator, chr) => {
    return chr ? chr.toUpperCase() : '';
  }).replace(CAMELCASE2_RE, (match, separator, chr) => {
    return match.toLowerCase();
  });
}

function _decamelize(str) {
  return str.replace(DECAMELIZE_RE, '$1_$2').toLowerCase();
}

export var camelize = memoize(_camelize);
export var decamelize = memoize(_decamelize);
export default camelize;

function _dasherize(str) {
  return decamelize(str).replace(/[ _]/g, '-');
}

export var dasherize = memoize(_dasherize);
