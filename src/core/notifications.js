export function Notification (message, options) {
  options = options || {};
  this.message = m.prop(message);
  this.status = options.status ? m.prop(options.status) : m.prop('notification');
  this.type = m.prop(options.type);
  this.delayed = m.prop(options.delayed);
}



export default function Notifications() {
  this.messages = [];
}

Notifications.prototype = {
  notifications: function () {
    return this.messages.filter((message) => {
      message.status() === 'notification' && !message.delayed();
    });
  },

  alerts: function () {
    return this.messages.filter((message) => {
      message.status() === 'alert' && !message.delayed();
    });
  },

  displayDelayed: function () {
    m.startComputation();
    this.messages.filter((message) => message.delayed()).map((message) => {
      message.delayed(false);
    });
    m.endComputation();
  },

  add: function (notification) {
    m.startComputation();
    this.messages.push(notification);
    m.endComputation();
  },

  closeNotification: function (notification) {
    var messages = this.messages,
      index = messages.indexOf(notification);
    m.startComputation();
    messages.splice(index, 1);
    m.endComputation();
  },

  closeAll: function() {
    m.startComputation();
    this.messages = [];
    m.endComputation();
  }
};
