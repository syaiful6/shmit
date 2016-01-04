import store, {stackedStore} from '../tranflux/store';
import combine from '../tranflux/reducers';
import promiseMiddleware, {funcActionMiddleware} from '../tranflux/middlewares';

import notifications from '../core/store/notifications';
import records from '../core/store/records';

import Authenticator from '../auth/authenticators/oauth';
import Storage from '../auth/store/local-storage';
import session, {configure as configureSession, sessionRestore} from '../auth/store/session';

import {requestPrefilter} from '../utils/request';
import {equal as objectsAreEqual} from '../utils/object';

var currentState;
function redrawOnStateChanged(getState) {
  var nextState = getState();
  if (!objectsAreEqual(nextState, currentState)) {
    m.redraw(true);
    currentState = nextState;
  }
}

export default {
  name: 'storage:main',
  after: 'application-configs:main',
  before: 'routes:definition',
  initialize(app) {
    m.startComputation();
    try {
      var configs = app.lookup('configs'),
        finalReducers = combine({session, notifications, records}),
        createStore = stackedStore(promiseMiddleware, funcActionMiddleware)(store),
        appState = createStore(finalReducers),
        authenticator = new Authenticator(configs.clientId, configs.clientSecret),
        authStorage = new Storage();

      configureSession(authenticator, authStorage, appState);
      appState.subscribe(redrawOnStateChanged.bind(null, appState.getState));
      app.register('store', appState);

      requestPrefilter((options) => {
        let data = appState.getState().session;
        authenticator.authorize(data.authenticated, function (headerName, headerValue) {
          let headerObject = {};

          headerObject[headerName] = headerValue;
          options.headers = Object.assign(options.headers || {}, headerObject);
        });
      });

      appState.dispatch(sessionRestore());
    } finally {
      m.endComputation();
    }
  }
};
