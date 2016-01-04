import BaseComponent from '../component';
import LoginModal from '../../auth/components/login-modal';
import SignupModal from '../../auth/components/signup-modal';
import inherits from '../../utils/inherits';

export default function Navigation () {
  BaseComponent.apply(this, arguments);
  this.section = null;
}

inherits(Navigation, BaseComponent);

Navigation.prototype.view = function () {
  var isLoggedin = this.props.session.isAuthenticated;
  return (
    <header className="main-header">
      <nav className="top-bar global-nav">
        <ul className="title-area">
          <li className="name">
            <h1><a href="/" config={m.route}>Memtoko</a></h1>
          </li>
        </ul>
        <section className="top-bar-section">
          <ul className="right">
            <li><a href="/cart/" config={m.route}>Cart</a></li>
            {isLoggedin ? '' : <li><a href="" onclick={this.showModalLogin.bind(this)}>Login</a></li>}
            {isLoggedin ? '' : <li><a href="" onclick={this.showModalSignUp.bind(this)}>Sign Up</a></li>}
          </ul>
        </section>
      </nav>
    </header>
  );
};

Navigation.prototype.showModalLogin = function (e) {
  e.preventDefault();
  var modal = this.props.modal,
    onAuthenticate = this.props.onAuthenticate,
    isLoggedin = this.props.session.isAuthenticated;

  if (isLoggedin) {
    return;
  }
  modal.openModal(new LoginModal({
    onAuthenticate,
    isLoggedin,
    showSignup: this.showModalSignUp.bind(this)
  }));
};


Navigation.prototype.showModalSignUp = function (e) {
  e.preventDefault();
  var modal = this.props.modal,
    onSignup = this.props.onSignup,
    isLoggedin = this.props.isAuthenticated;

  if (isLoggedin) {
    return;
  }

  modal.openModal(new SignupModal({
    onSignup,
    showLogin: this.showModalLogin.bind(this)
  }));
}
