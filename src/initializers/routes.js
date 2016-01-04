import Application from '../core/components/application';
import Modal from '../core/services/modal';

export default {
  name: 'routes:definition',
  after: 'application-configs:main',
  initialize(app) {
    m.startComputation();
    try {
      var store = app.lookup('store');

      var modal = new Modal();
      app.register('modal', modal);

      m.mount(
        document.getElementById('sh-shop-application'),
        Application.component({modal, store})
      );
    } finally {
      m.endComputation();
    }
  }
};
