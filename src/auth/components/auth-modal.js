import BaseComponent from '../../core/components/modal';
import SpinButton from '../../core/components/spin-button';
import inherits from '../../utils/inherits';

var Validator = {
  properties: [],
  passed: false,

  check(model, property) {
    this.passed = true;
    if (prop && this[prop]) {
      this[prop](model);
    } else {
      let properties = this.properties;
      properties.forEach((property) => {
        if (this[property]) {
          this[property](model);
        }
      });
    }
    return this.passed;
  },

  invalidate() {
    this.passed = false;
  }
};

function AuthModal () {
  BaseComponent.call(this);
  this.loggingIn = m.prop(false);
  this.submitting = m.prop(false);
  this.errors = m.prop([]);
  this.hasValidated = m.prop([]);
  this.authProperties = m.prop(['email', 'passwords'])
}

inherits(AuthModal, BaseComponent);

AuthModal.prototype.title = function () {
  return 'Login';
};

AuthModal.prototype.content = function () {

  return (
    <form id="login" className="sh-signin" method="post" novalidate="novalidate">
      <div class="form-group"
    </form>
  );
};
