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
  return [
    <form className="login-modal">
      <div className="form-group">
        <input className="sh-input email" name="email" value={this.email()}
        disabled={this.loading} onchange={m.withAttr('value', this.email)} />
      </div>
      <div className="form-group">
        <input className="sh-input" name="password" type="password" value={this.password()}
        disabled={this.loading} onchange={m.withAttr('value', this.password)} />
      </div>
    </form>
  ];
};

LoginModal.prototype.footerContent = function () {
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
};


LoginModal.prototype.login = function (e) {
  cancelEventPropagation(e);
  e.preventDefault();

  this.loading = true;
  const email = this.email();
  const password = this.password();

  let session = this.props.session;

  session.authenticate(email, password).then((content) => {
    this.loading = false;
  }, (err) => {
    this.loading = false;
  });
};
