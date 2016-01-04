import defineAction, {handleActions} from '../../tranflux/actions';
import signal from '../signal';

// public interface
const SESSION_AUTHENTICATE = 'SESSION_AUTHENTICATE';
const SESSION_INVALIDATE = 'SESSION_INVALIDATE';
const SESSION_RESTORE = 'SESSION_RESTORE';

// private interface
const SESSION_CLEAR = 'SESSION_CLEAR';
const SESSION_UPDATED = 'SESSION_UPDATED';

var authenticator,
  storage,
  store,
  connectedToAuthenticator = false;

var defaultState = {
  authenticated: {},
  isAuthenticated: false
};

function _clearState() {
  storage.persist(defaultState);
  return defaultState;
}

export function configure(authenticatorInstance, storageInstance, appStore) {
  authenticator = authenticatorInstance;
  storage = storageInstance;
  store = appStore;
  signal.connect('storage:updated', _sessionRestore);
}

function assertConfigurated() {
  if (!authenticator || !storage) {
    throw new Error(
      'session not configured yet, please call configure before app run.'
    );
  }
}

export var sessionAuthenticate = defineAction(SESSION_AUTHENTICATE, function () {
  assertConfigurated();
  var args = arguments;
  return authenticator.authenticate.apply(authenticator, args);
});

export var sessionInvalidate = defineAction(SESSION_INVALIDATE, function () {
  assertConfigurated();
  var state = storage.restore();
  return authenticator.invalidate(state.authenticated);
});

export var sessionRestore = defineAction(SESSION_RESTORE, function () {
  assertConfigurated();
  var state = storage.restore();
  return authenticator.restore(state.authenticated);
});

var sessionUpdated = defineAction(SESSION_UPDATED),
  sessionClear = defineAction(SESSION_CLEAR),
  reducers = {};

reducers[SESSION_AUTHENTICATE] = {
  next: function (state, action) {
    if (!connectedToAuthenticator) {
      signal.connect('authenticator:updated', _sessionUpdated);
      signal.connect('authenticator:invalidated', _sessionClear);
      connectedToAuthenticator = true;
    }
    var newState = {
      ...state,
      authenticated: action.payload,
      isAuthenticated: true
    };
    storage.persist(newState);
    return newState;
  },
  'throw': _clearState
};

reducers[SESSION_INVALIDATE] = {
  next: function () {
    if (connectedToAuthenticator) {
      signal.disconnect('authenticator:updated', _sessionUpdated);
      signal.disconnect('authenticator:invalidated', _sessionClear);
      connectedToAuthenticator = false;
    }
    return _clearState();
  },
  'throw': _clearState
};

reducers[SESSION_RESTORE] = {
  next: function (state, action) {
    var newState = {
      ...state,
      authenticated: action.payload,
      isAuthenticated: true
    };
    storage.persist(newState);
    return newState;
  },
  'throw': _clearState
};

reducers[SESSION_UPDATED] = reducers[SESSION_RESTORE];
reducers[SESSION_CLEAR] = reducers[SESSION_INVALIDATE];

function _sessionClear() {
  store.dispatch(sessionClear());
}

function _sessionUpdated(data) {
  store.dispatch(sessionUpdated(data));
}

function _sessionRestore(data) {
  store.dispatch(sessionRestore(data));
}

export default handleActions(reducers, defaultState);
