export default function Evented() {
  this.receivers = {};
}

Evented.prototype = Object.create({

  liveReceivers: function (event) {
    this.receivers = this.receivers || {};
    this.receivers[event] = this.receivers[event] || [];
    return this.receivers[event];
  },

  send: function (event, ...args) {
    var receivers= this.liveReceivers(event);
    receivers.forEach((receiver) => receiver.apply(this, args));
  },

  connect: function (event, receiver) {
    this.liveReceivers(event).push(receiver);
  },

  disconnect: function (event, handler) {
    var receivers = this.liveReceivers(event),
      index = receivers.indexOf(receiver);
    if (index !== -1) {
      receivers.splice(index, 1);
      return true;
    }
    return false;
  }
});

export function connect(evented, event) {
  return function (callback) {
    evented.connect(callback, event);
  };
}

export function connectOnce(evented, event) {
  return function (callback) {
    var wrapped = function () {
      callback.apply(this, arguments);
      evented.disconnect(event, callback);
    };
    evented.connect(wrapped, event);
  };
}
