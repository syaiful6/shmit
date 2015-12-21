import {Notifications} from '../core/notifications';
import NotificationComponent from '../core/components/notifications';
export default {
  name: 'application-notifications:main',
  initialize(app) {
    m.startComputation();
    var notifications = new Notifications();
    m.mount(document.getElementById('sh-notifications'), NotificationComponent.component({
      notifications
    }));
    app.register('notifications', notifications);
    m.endComputation();
  }
};
