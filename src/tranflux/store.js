import isPlain from '../utils/object';
import {compose} from '../utils/functools';

export var ActionTypes = {
  INIT: '@@transflux/INIT'
}

export default function store(reducer, initial) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var current = reducer,
    state = initial,
    listeners = [],
    isDispatching = false;

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.push(listener);
    var isSubscribed = true;

    return function unsubsribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;
      var index = listener.indexOf(listener);
      listeners.splice(index, 1);
    }
  }

  function dispatch(action) {
    if (!isPlain(action)) {
      throw new Error('Action must be plain object');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Action may not have an undefined `type` property');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }

    try {
      isDispatching = true;
      state = current(state, action);
    } finally {
      isDispatching = false;
    }

    listeners.slice().forEach(listener => listener())

    return action;
  }

  function replaceReducer(next) {
    current = next;
    dispatch({ type: ActionTypes.INIT });
  }

  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}

export function stackedStore(...middlewares) {
  return (next) => (reducer, initial) => {
    var store = next(reducer, initial),
      dispatch = store.dispatch,
      chain = [],
      API = {
        getState: store.getState,
        dispatch: (action) => dispatch(action)
      };

    chain = middlewares.map(middleware => middleware(API));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    }
  };
}
