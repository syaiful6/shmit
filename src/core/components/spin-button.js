import BaseComponent from '../component';
import inherits from '../../utils/inherits';

export default (function (Component) {
  function SpinButton() {
    Component.apply(this, arguments);
  }

  inherits(SpinButton, Component);

  SpinButton.prototype.view = function () {
    var attrs = Object.assign({}, this.props);
    delete attrs.children;

    attrs.className = attrs.className || '';
    attrs.type = attrs.type || 'button';
    const loading = attrs.loading;
    delete attrs.loading;

    if (attrs.disabled || loading) {
      attrs.className += ' disabled' + (loading ? ' loading' : '');
      delete attrs.onclick;
    }

    return <button {...attrs}>{this.getButtonContent()}</button>;
  };

  SpinButton.prototype.getButtonContent = function () {
    var loadings = {
      className: 'spinner'
    };
    return [
      this.props.loading ? <span {...loadings}></span> : this.props.buttonText
    ];
  };

  return SpinButton;

})(BaseComponent);
