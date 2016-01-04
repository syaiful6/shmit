import {equal as objectsAreEqual} from 'shopie/utils/object';
import addEvent from 'shopie/utils/event';
import signal from '../signal';

const _storage = window.localStorage;
const KEYSTORAGE = 'shopie:auth-storage';

export default function LocalStorage() {
  this._lastData = {};
  this._bindStorageEvent();
}

Object.assign(LocalStorage.prototype, {
  _bindStorageEvent: function() {
    addEvent(window, 'storage', () => {
      let data = this.restore();
      if (!objectsAreEqual(data, this._lastData)) {
        this._lastData = data;
        signal.send('storage:updated', data);
      }
    });
  },

  persist: function(data) {
    data = JSON.stringify(data || {});
    _storage.setItem(KEYSTORAGE, data);
    this._lastData = this.restore();
  },

  restore: function () {
    let data = _storage.getItem(KEYSTORAGE);
    return JSON.parse(data) || {};
  },

  clear: function () {
    _storage.removeItem(KEYSTORAGE);
    this._lastData = {};
  }
});
