import signal from './signal';

export default class Session {

  constructor(authenticator, storage) {
    this.store = storage;
    this.authenticator = authenticator;
    this.isAuthenticated = false;
    this._state = {authenticated: {}};
    this._connected = false;
    this._connectToStorage();
  }

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
  }

  invalidate() {
    let authenticator = this.authenticator;
    return new Promise((resolve, reject) => {
      authenticator.invalidate(this._state.authenticated).then(() => {
        this._clearState(true);
        signal.disconnect('authenticator:updated', this._changeState, this);
        signal.disconnect('authenticator:invalidated', this._clearState, this);
        this._connected = false;
        resolve()
      }, (error) => {
        reject(error);
      });
    });
  }

  restore() {
    let authenticator = this.authenticator;
    return new Promise((resolve, reject) => {
      let restoredContent   = this.store.restore();
      authenticator.restore(restoredContent).then((content) => {
        this._state = restoredContent;
        this._changeState(content);
      }, (err) => {
        this._state = restoredContent;
        this._clearState();
        reject(err);
      });
    });
  }

  _changeState(content) {
    this._state.authenticated = content;
    this.isAuthenticated = true;
    this.store.persist(this._state);
    if (!this._connected) {
      this._connectToAuthenticatorEvent();
    }
  }

  _clearState() {
    this.isAuthenticated = false;
    this._state.authenticated = {};
    this.store.persist(this._state);
  }

  _storageUpdate(content) {
    this._state = content;
  }

  _connectToAuthenticatorEvent() {
    signal.connect('authenticator:updated', this._changeState, this);
    signal.connect('authenticator:invalidated', this._clearState, this);
  }

  _connectToStorage() {
    signal.connect('storage:updated', this.restore, this);
  }
}
