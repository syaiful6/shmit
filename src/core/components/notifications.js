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
      containerClass = `sh-notification-content ${this.typeClass(notification.type())}`;
    return (
      <div className="sh-item-notification">
        <div className={containerClass}>{notification.message()}</div>
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
    if (typeMapping[type] !== undefined) {
      classes += `sh-notification-${typeMapping[type]}`;
    }
    return classes;
  };

  return Notification;

})(BaseComponent);

export default (function (Base) {
  function NotificationsComponent() {
    Base.apply(this, arguments);
  }

  inherits(NotificationsComponent, Base);

  NotificationsComponent.prototype.view = function () {
    var notifications = this.props.notifications,
      notif = notifications.notifications();
    return notif.map((notification) => {
      return Notification.component({notification, onclick: this.closeNotification.bind(this, notification)});
    });
  };

  NotificationsComponent.prototype.closeNotification = function (notification, e) {
    cancelEventPropagation(e);
    e.preventDefault();
    var notifications = this.props.notifications;
    notifications.closeNotification(notification);
  };

  return NotificationsComponent;
})(BaseComponent);
