import objectAreEqual from 'shopie/utils/object-are-equal';
import addEvent, { customEvent } from 'shopie/utils/event';

const _storage = window.localStorage;
const KEYSTORAGE = 'shopie:auth-storage';

export default function LocalStorage() {
  this._lastData = {};
  this._bindStorageEvent();
}

LocalStorage.prototype = {
  _bindStorageEvent: function() {
    addEvent(window, 'storage', () => {
      let data = this.restore();
      if (!objectAreEqual(data, this._lastData)) {
        this._lastData = data;
        var event = customEvent('session:updated', {data});
        window.dispatchEvent(event);
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
}
