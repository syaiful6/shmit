import {range} from '../utils/itertools';

export default function Signal(...events) {
  this.receivers = {};
  events.forEach((event) => this.receivers[event] = []);
}

Signal.prototype = {

  liveReceivers: function (event) {
    var receivers = this.receivers;
    if (receivers[event]) {
      return this.receivers[event];
    } else {
      throw new Error(`${event} not available this signal.`);
    }
  },

  send: function (event, ...args) {
    var receivers= this.liveReceivers(event);
    receivers.forEach((receiver) => receiver[0].apply(receiver[1], args));
  },

  connect: function (event, receiver, binding = null) {
    this.liveReceivers(event).push([receiver, binding]);
  },

  disconnect: function (event, receiver, binding = null) {
    var receivers = this.liveReceivers(event),
      index;

    for (index of range(receivers.length)) {
      let [registered, bind] = receivers[index];
      if (bind === binding && registered === receiver) {
        receivers.splice(index, 1);
        break;
      }
    }
  }
};

/**
* decorator for connect to a given signal
*/
export function connect(signal, event) {
  return function (target, key, desc) {
    var callback = desc.value;
    signal.connect(event, callback, target);

    return desc;
  };
}

export function connectOnce(signal, event) {
  return function (target, key, desc) {
    var callback = desc.value;
    var wrapped = function wrapped() {
      callback.apply(target, arguments);
      signal.disconnect(event, wrapped);
    };
    signal.connect(event, wrapped);

    return desc;
  };
}
