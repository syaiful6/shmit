import {ownKeys} from '../utils/object';
import {isError} from './fsa';
import {identity} from '../utils/functools';

function reduce(...reducers) {
  return (previous, current) => reducers.reduce((p, r) => r(p, current), previous)
};

export default function defineAction(type, actionCreator, metaCreator) {
  let finalCreator = typeof actionCreator === 'function'
    ? actionCreator
    : identity;

  return (...args) => {
    let action = {
      type,
      payload: finalCreator(...args)
    };

    if (args.length === 1 && args[0] instanceof Error) {
      action.error = true;
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(...args);
    }

    return action;
  }
}

export function handleAction(type, reducers) {
  return (state, action) => {
    if (action.type !== type) return state;

    let handlerKey = isError(action) ? 'throw' : 'next';

    if (typeof reducers === 'function') {
      reducers.next = reducers.throw = reducers;
    }

    let reducer = reducers[handlerKey];

    return typeof reducer === 'function' ? reducer(state, action) : state;
  }
}

export function handleActions(handlers, defaultState) {
  let reducers = ownKeys(handlers).map(type => {
    return handleAction(type, handlers[type]);
  });

  return typeof defaultState !== 'undefined'
    ? (state = defaultState, action) => reduce(...reducers)(state, action)
    : reduce(...reducers);
}
