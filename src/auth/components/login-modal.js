import BaseModal from '../../core/components/modal';
import SpinButton from '../../core/components/spin-button';
import inherits from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';
/**
* Todo: add validation before submit
*/
export default function LoginModal() {
  BaseModal.apply(this, arguments);

  this.email = m.prop(this.props.email || '');
  this.password = m.prop(this.props.password || '');
  this.loading = false;
  this.errors = {};
}

inherits(LoginModal, BaseModal);

LoginModal.prototype.title = function () {
  return 'Login';
};

LoginModal.prototype.content = function () {
  var isLoggedin = this.props.isLoggedin;
  return isLoggedin
    ? [
      <div className="warning">
        <p>Welcome, you are already logged-in</p>
      </div>
    ]
    : [
      <form className="login-modal">
        <div className="form-group">
          <input className="sh-input email" name="email" value={this.email()}
          disabled={this.loading} onchange={m.withAttr('value', this.email)} placeholder="email or username"/>
        </div>
        <div className="form-group">
          <input className="sh-input" name="password" type="password" value={this.password()}
          disabled={this.loading} onchange={m.withAttr('value', this.password)} placeholder="you super secret password" />
        </div>
      </form>
    ];
};

LoginModal.prototype.footerContent = function () {
  var isLoggedin = this.props.isLoggedin;
  if (!isLoggedin) {
    return [
      <footer className="modal-footer">
        {SpinButton.component({
          type: 'button',
          className: 'btn btn-blue js-button',
          loading: this.loading,
          buttonText: 'Login',
          onclick: this.login.bind(this)
        })}
      </footer>
    ];
  } else {
    return this.__super__.footerContent();
  }
};


LoginModal.prototype.login = function (e) {
  cancelEventPropagation(e);
  e.preventDefault();

  this.loading = true;
  const email = this.email();
  const password = this.password();

  let onAuthenticated = this.props.onAuthenticated;

  onAuthenticated(email, password);
  // we will wait a bit, if session updated it will redraw and this modal will close,
  // if anything wrong, just redraw again
  setTimeout(() => {
    this.loading = false;
    m.redraw();
  }, 2000);
};
