import Navigation from '../core/components/navigation';
import AppModal from '../core/components/app-modal';

export default {
  name: 'routes:definition',
  after: 'application-configs:main',
  initialize(app) {
    m.startComputation();
    var modal = m.mount(document.getElementById('sh-modal'), AppModal.component())
    m.mount(document.getElementById('main-header-top'), Navigation.component({modal}));
    app.register('modal', modal);
    m.endComputation();
  }
};
