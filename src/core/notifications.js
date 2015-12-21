import computation from './decorators';
/**
* the notification model
*/
export default function Notification (message, options) {
  options = options || {};
  this.message = m.prop(message);
  this.status = options.status ? m.prop(options.status) : m.prop('notification');
  this.type = m.prop(options.type);
  this.delayed = m.prop(options.delayed);
}

/**
* Notification service, this basically list of notification instance. But this notifications
* instance will be injected to Notifications Component, so if you add new notification here
* it will be displayed.
*
* this instance avalable in aplication service named 'notifications'. So you can get it via
* app.lookup('notifications'), then you can use it to display your message to user.
*/
export function Notifications() {
  this.messages = [];
}

Notifications.prototype = {

  notifications() {
    return this.messages.filter((message) => {
      return message.status() === 'notification' && !message.delayed();
    });
  },

  alerts() {
    return this.messages.filter((message) => {
      return message.status() === 'alert' && !message.delayed();
    });
  },

  @computation
  displayDelayed() {
    this.messages.filter((message) => message.delayed()).forEach((message) => {
      message.delayed(false);
    });
  },

  @computation
  add(notification) {
    this.messages.push(notification);
  },

  @computation
  closeNotification(notification) {
    var messages = this.messages,
      index = messages.indexOf(notification);
    messages.splice(index, 1);
  },

  @computation
  closeAll() {
    this.messages = [];
  }
};
