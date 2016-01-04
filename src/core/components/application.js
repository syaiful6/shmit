import BaseComponent from '../component';

import inherits, {assign} from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';

import Modal from './app-modal';
import Navigation from './navigation';
import Notifications from './notifications';

import {closeNotification as closeNotif} from '../store/notifications';
import {saveRecord} from '../store/records';
import {sessionAuthenticate} from '../../auth/store/session';

export default (function (Component) {
  function Application() {
    Component.apply(this, arguments);
  }

  inherits(Application, Component);

  assign(Application.prototype, {
    view: function () {
      var state = this.props.store.getState(),
        modal = this.props.modal,
        notifications = state.notifications,
        session = state.session;

      return m('div', {className: "sh-application"}, [
        Navigation.component({
          session,
          modal,
          onAuthenticate: this.authenticate.bind(this),
          onSignup: this.signUp.bind(this)
        }),
        m('div', {id: "sh-main", className: "sh-main"}),
        Notifications.component({
          notifications,
          onclose: this.closeNotification.bind(this)
        }),
        modal.showing
        ? Modal.component({
            modal: modal.modal,
            onclose: this.closeModal.bind(this)
          })
        : ''
      ]);
    },

    closeModal: function (e) {
      var modal = this.props.modal;
      if (!modal.showing) {
        return;
      }
      cancelEventPropagation(e);
      modal.closeModal();
    },

    closeNotification: function (index) {
      var store = this.props.store;
      return store.dispatch(closeNotif(index));
    },

    authenticate: function (...args) {
      var store = this.props.store;
      return store.dispatch(sessionAuthenticate(...args));
    },

    signUp: function (data) {
      var store = this.props.store,
        payload = Object.assign({}, data);

      if (typeof data.type === 'undefined') {
        payload.type = 'users';
      }
      return store.dispatch(saveRecord(payload));
    },

    config: function (isInitialized, context) {
      if (isInitialized) {
        return;
      }
      context.retain = true;
    }
  });

  return Application;
})(BaseComponent);
