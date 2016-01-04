import BaseModal from '../../core/components/modal';
import SpinButton from '../../core/components/spin-button';
import inherits, {assign} from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';

export default function SignupModal () {
  BaseModal.apply(this, arguments);
  this.loading = false;
}

inherits(SignupModal, BaseModal);

assign(SignupModal.prototype, {

  init: function () {
    this.__super__.init();
    this.email = m.prop(this.props.email || '');
    this.username = m.prop(this.props.username || '');
    this.password1 = m.prop(this.props.password1 || '');
    this.password2 = m.prop(this.props.password2 || '');
  },

  title: function () {
    return 'Sign up';
  },

  content: function () {
    return [
      <form className="signup-modal">
        <div className="form-group">
          <input className="sh-input username" name="username" value={this.username()}
          disabled={this.loading} onchange={m.withAttr('value', this.username)} placeholder="username"/>
        </div>
        <div className="form-group">
          <input className="sh-input email" name="email" value={this.email()}
          disabled={this.loading} onchange={m.withAttr('value', this.email)} placeholder="email"/>
        </div>
        <div className="form-group">
          <input className="sh-input password1" name="password1" type="password" value={this.password1()}
          disabled={this.loading} onchange={m.withAttr('value', this.password1)} placeholder="password" />
        </div>
        <div className="form-group">
          <input className="sh-input password2" name="password2" type="password" value={this.password2()}
          disabled={this.loading} onchange={m.withAttr('value', this.password2)} placeholder="confirm password" />
        </div>
      </form>
    ];
  },

  footerContent: function () {
    var showLogin = this.props.showLogin;
    return [
      <footer className="modal-footer">
        {SpinButton.component({
          type: 'button',
          className: 'btn btn-blue js-button',
          loading: this.loading,
          buttonText: 'Sign up',
          onclick: this.signup.bind(this)
        })}
        {typeof showLogin === 'function'
        ? <button type="button" className="btn btn-link" onclick={showLogin}>Login</button>
        : ''}
      </footer>
    ];
  },

  signup: function (e) {
    cancelEventPropagation(e);
    e.preventDefault();

    this.loading = true;
    var data = {
      type: 'users',
      attributes: {
        email: this.email(),
        username: this.username(),
        password1: this.password1(),
        password2: this.password2()
      }
    };

    var onSignup = this.props.onSignup;
    onSignup(data);

    setTimeout(() => {
      this.loading = false;
      m.redraw();
    }, 2000);
  }
});
