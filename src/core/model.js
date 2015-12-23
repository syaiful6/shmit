import request from '../utils/request';

let isArray = Array.isArray || function (x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

function None() {};

function makeRoute (root, args) {
  let slashAtStart = /^\//,
    slashAtEnd = /\/$/,
    route = root.replace(slashAtEnd, ''),
    parts = Array.prototype.slice.call(args, 0),
    part, _i, _len;
  for (_i = 0, _len = parts.length; _i < _len; _i++) {
    part = parts[_i];
    if (part) {
      route = [route, part.replace(slashAtStart, '').replace(slashAtEnd, '')].join('/');
    }
  }
  return route += '/';
}

export function Store(models = {}, apiRoot = null) {
  this._records = {};
  this._models = models; // dict which mapping string to actual model class
  this.apiRoot = apiRoot || '/o/api/v1/'
};

Store.prototype = {
  createRecord: function (type, data = {}) {
    data.type = data.type || type;
    let model = this.modelFor(type);
    return new model(data, this);
  },

  pushPayload: function (payload) {
    var records = Object.assign({}, payload),
      results;
    if (isArray(records.data)) {
      results = records.data.map(this.pushObject.bind(this));
    } else {
      results = this.pushObject(records.data);
    }
    results.payload = payload;

    return results;
  },

  pushObject: function (data) {
    if (!this._models[data.type]) {
      return null;
    }
    let type = this._records[data.type] = this._records[data.type] || {};

    if (type[data.id]) {
      type[data.id].pushData(data);
    } else {
      type[data.id] = this.createRecord(data.type, data);
    }

    type[data.id].exists = true;

    return type[data.id];
  },

  find: function (type, ids, options) {
    var url = makeRoute(this.apiRoot, [type]);
    if (isArray(ids)) {
      url += '?' + ids.map((id) => `ids[]=${id}`).join('&');
    } else {
      url = makeRoute(url, [ids.toString()]);
    }
    options = Object.assign({
      method: 'GET',
      headers: {
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json"
      }
    }, options);
    return request(url, options).then(JSON.parse).then(this.pushPayload.bind(this));
  },

  removeRecord: function (model) {
    delete this._records[model.data.type][model.id()];
  },

  peekRecord: function (type, id) {
    return this._records[type] && this._records[type][id];
  },

  peekRecords: function (type) {
    let records = this._records[type];

    return records ? Object.keys(records).map(id => records[id]) : [];
  },

  modelFor: function (type) {
    var model = this._models[type];
    if (typeof model !== 'function')  {
      throw new Error('No such model for type ' + type);
    }
    return model;
  }
};

export default (function () {
  function Model (data = {}, store = null) {
    this.data = data;
    this.store = store;

    this.exists = false;
    this.freshness = new Date();
  }

  Model.getIdentifier = function (model) {
    return {
      type: model.data.type,
      id: model.data.id
    };
  };

  Model.prototype = {
    id: function () {
      return this.data.id;
    },

    attributes: function (attribute) {
      return this.data.attributes[attribute];
    },

    pushData: function (data) {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object') {
          this.data[key] = this.data[key] || {};
          Object.keys(data[key]).forEach((innerKey) => {
            if (typeof data[key][innerKey].toJSON === 'function') {
              data[key][innerKey] = {data: Model.getIdentifier(data[key][innerKey])};
            }
            this.data[key][innerKey] = data[key][innerKey];
          });
        } else {
          this.data[key] = data[key];
        }
      });

      this.freshness = new Date();
    },

    pushAttribute: function (attribute) {
      this.pushData({attributes});
    },

    toJSON: function () {
      return JSON.stringify(this.data);
    },

    save: function (options = {}) {
      let data = this.data;

      options = Object.assign({
        method: this.exists ? 'PATCH' : 'POST',
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json"
        }
      }, options);
      let url = makeRoute(this.store.apiRoot, [this.data.type]);
      if (this.exists) {
        url += `/${this.data.id}`;
      }
      return request(url, options).then(JSON.parse).then((payload) => {
        this.store._records[payload.data.type] = this.store._records[payload.data.type] || {};
        this.store._records[payload.data.type][payload.data.id] = this;
        return this.store.pushPayload(payload);
      });
    }
  };

  return Model;
})();

export var attr = function (name, transform) {
  return {
    enumerable: true,
    configurable: true,
    get: function () {
      const value = this.data.attributes && this.data.attributes[name];
      return transform ? transform.deserialize(value) : value;
    },
    set: function(value) {
      if (this.data.attributes && this.data.attributes[name]) {
        this.data.attributes[name] = transform ? transform.serialize(value) : value;
      }
    }
  };
};

export var hasMany = function (name) {
  return {
    enumerable: true,
    configurable: true,
    get: function () {
      if (this.data.relationships) {
        const relationship = this.data.relationships[name];
        if (relationship) {
          return relationship.data.map(data => this.store.peekRecord(data.type, data.id));
        }
      }
    },
    set: function (value) {
      if (this.data.relationship) {
        this.data.relationship[name] = (function (relation) {
          if (!isArray(relation)) {
            throw new Error('You are trying to set hasMany relationship, but the value isn\'t an array.');
          }
          return relation.map(function (data) {
            if (data.toJSON) {
              return {
                data: Model.getIdentifier(data)
              };
            } else {
              return data;
            }
          });
        })(value);
      }
    }
  };
};

export var hasOne = function (name) {
  return {
    enumerable: true,
    configurable: true,
    get: function () {
      if (this.data.relationship) {
        const relationship = this.data.relationships[name];

        if (relationship) {
          return this.store.peekRecord(relationship.data.type, relationship.data.id);
        }
      }
    },
    set: function (value) {
      if (this.data.relationship) {
        this.data.relationships[name] = (function (relation) {
          if (relation.toJSON) {
            return {
              data: Model.getIdentifier(relation)
            };
          } else {
            return relation;
          }
        })(value);
      }
    }
  };
};
