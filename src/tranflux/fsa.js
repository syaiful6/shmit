import isPlain, {ownKeys} from '../utils/object';

const VALID_KEYS = ['type', 'payload', 'error', 'meta'];

var isValid = (key) => VALID_KEYS.indexOf(key) > -1

export default function isFSA(action) {
  return (
    isPlain(action) &&
    typeof action.type !== 'undefined' &&
    Object.keys(action).every(isValid)
  );
}

export function isError(action) {
  return action.error === true;
}
