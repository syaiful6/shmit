import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';

var Notification = (function (Base) {
  function Notification () {
    Base.apply(this, arguments);
  }

  inherits(Notification, Base);

  Notification.prototype.view = function () {
    var notification = this.props.notification,
      onclick = this.props.onclick,
      containerClass = `sh-notification sh-notification-passive ${this.typeClass(notification.type)}`;
    return (
      <div className={containerClass}>
        <div className="sh-notification-content">{notification.message}</div>
        <button className="sh-notification-close icon-x" onclick={onclick}><span className="hidden">Close</span></button>
      </div>
    );
  };

  Notification.prototype.typeClass = function (type) {
    let classes = '';
    let typeMapping = {
      success: 'green',
      error: 'red',
      warn: 'yellow'
    };
    if (typeof typeMapping[type] !== 'undefined') {
      classes += `sh-notification-${typeMapping[type]}`;
    }
    return classes;
  };

  return Notification;

})(BaseComponent);

export default (function (Base) {
  function Notifications() {
    Base.apply(this, arguments);
  }

  inherits(Notifications, Base);

  Notifications.prototype.view = function () {
    var notifications = this.props.notifications,
      notif = notifications.filter((n) => !n.delayed);
    return (
      <div className="sh-notifications">
        {notif.map((notification, index) => {
          return Notification.component({
            notification,
            onclick: this.closeNotification.bind(this, index)
          });
        })}
      </div>
    );
  };

  Notifications.prototype.closeNotification = function (index, e) {
    cancelEventPropagation(e);
    e.preventDefault();
    var onclose = this.props.onclose;
    onclose(index);
  };

  return Notifications;
})(BaseComponent);
