import isFSA from './fsa';

function isThenable(x) {
  return x && typeof x.then === 'function';
}

export default function promiseMiddleware({dispatch}) {
  return next => action => {
    if (!isFSA(action)) {
      return isThenable(action) ? action.then(dispatch) : next(action);
    }

    return isThenable(action.payload)
      ? action.payload.then(
          result => dispatch({...action, payload: result}),
          error => dispatch({...action, payload: error, error: true})
        )
      : next(action);
  };
}

export function funcActionMiddleware({dispatch, getState}) {
  return next => action => {
    if (!isFSA(action)) {
      return typeof action === 'function'
      ? action(dispatch, getState)
      : next(action);
    }

    return action.payload === 'function'
      ? action.payload(dispatch, getState)
      : next(action);
  };
}
