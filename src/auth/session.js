import signal from './signal';
import computation from '../core/decorators';

export default function Session (authenticator, storage) {
  this.store = storage;
  this.authenticator = authenticator;
  this.isAuthenticated = false;
  this._state = {authenticated: {}};
  this._connected = false;
  this._connectToStorage();
}

Session.prototype = {

  authenticate() {
    let authenticator = this.authenticator,
      args = arguments;
    return new Promise((resolve, reject) => {
      authenticator.authenticate.apply(authenticator, args).then((content) => {
        this._changeState(content);
        resolve();
      }, (error) => {
        this._clearState();
        reject(error);
      });
    });
  },

  invalidate() {
    let authenticator = this.authenticator;
    return new Promise((resolve, reject) => {
      authenticator.invalidate(this._state.authenticated).then(() => {
        this._clearState(true);
        signal.disconnect('authenticator:updated', this._changeState, this);
        signal.disconnect('authenticator:invalidated', this._authInvalidate, this);
        this._connected = false;
        resolve()
      }, (error) => {
        reject(error);
      });
    });
  },

  restore() {
    let authenticator = this.authenticator;
    return new Promise((resolve, reject) => {
      let restoredContent   = this.store.restore();
      authenticator.restore(restoredContent.authenticated).then((content) => {
        this._state = restoredContent;
        this._changeState(content);
      }, (err) => {
        this._state = restoredContent;
        this._clearState();
        reject(err);
      });
    });
  },

  @computation
  _changeState(content, trigger) {
    trigger = !!trigger && !this.isAuthenticated;
    this._state.authenticated = content;
    this.isAuthenticated = true;
    this.store.persist(this._state);
    if (!this._connected) {
      this._connectToAuthenticatorEvent();
    }
    if (trigger) {
      signal.send('authenticated');
    }
  },

  @computation
  _clearState(trigger) {
    trigger = !!trigger && this.isAuthenticated;
    this.isAuthenticated = false;
    this._state.authenticated = {};
    this.store.persist(this._state);
    if (trigger) {
      signal.send('invalidated');
    }
  },

  _authInvalidate() {
    this._clearState(true);
  },

  _connectToAuthenticatorEvent() {
    signal.connect('authenticator:updated', this._changeState, this);
    signal.connect('authenticator:invalidated', this._authInvalidate, this);
    this._connected = true;
  },

  _connectToStorage() {
    signal.connect('storage:updated', this.restore, this);
  }
};
