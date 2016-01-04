import {ActionTypes} from './store';

function pick(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    if (fn(obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

function map(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result
  }, {});
}

function undefinedStateErrorMessage(key, action) {
  var actionType = action && action.type,
    actionName = actionType && `"${actionType.toString()}"`;

  return (
    `Reducer "${key}" returned undefined handling ${actionName}` +
    `To ignore an action, you must return the previous state.`
  );
}

export default function combine(reducers) {
  var finalReducers = pick(reducers, (val) => typeof val === 'function'),
    sanityErr;
  try {
    Object.keys(finalReducers).forEach(key => {
      let reducer = finalReducers[key];
      let initial = reducer(undefined, {type: ActionTypes.INIT });

      if (typeof initial === 'undefined') {
        throw new Error(
          `Reducer "${key}" returned undefined during initialization.` +
          `if the state passed to the reducer is undefined, you must explicity` +
          `return initial state and initial state can not ne undefined.`
        )
      }
    });
  } catch (e) {
    sanityErr = e;
  }

  return function combination(state = {}, action) {
    if (sanityErr) {
      throw sanityErr;
    }

    var hashChanged = false;
    var finalState = map(finalReducers, (reducer, key) => {
      let previousStateForKey = state[key];
      let nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        let errorMessage = undefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      hashChanged = hashChanged || nextStateForKey !== previousStateForKey;

      return nextStateForKey;
    });
    return hashChanged ? finalState : state;
  }
}
