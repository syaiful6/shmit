
export default (function () {
  function Component (props = {}, children = null) {
    if (children) {
      this.constructor.initProps(props);
    }
    this.props = props;
    this.element = null;
    this.init();
  }

  Component.prototype.init = function () {};

  /**
  * Mithril teardown this component, do some clean up here if needed
  */
  Component.prototype.onunload = function () {};

  Component.prototype.config = function () {};

  Component.prototype.view = function () {
    throw new Error('Component#view must be implemented in ' + this.toString());
  };

  Component.prototype.render = function () {
    let vdom = this.view();
    vdom.attrs = vdom.attrs || {};
    let originalConfig = vdom.attrs.config;

    vdom.attrs.config = (...args) => {
      this.element = args[0];
      this.config.apply(this, args.slice(1));
      if (originalConfig) {
        originalConfig.apply(this, args);
      }
    };
    return vdom;
  };

  // selectors,
  Component.prototype.querySelectorAll = function (elem) {
    let root = this.element;
    if (!root.querySelectorAll) {
      root = document.querySelector(this.element);
    }
    return elem ? root.querySelectorAll(elem) : root;
  };

  Component.prototype.toString = function () {
    return '<component baseclass>';
  };

  Component.component = function (props = {}, children = null) {
    let properties = Object.assign({}, props);
    if (children) {
      properties.children = children;
    }
    this.initProps(properties);

    let view = function (component) {
      component.props = properties;
      return component.render();
    };
    // mithril use this property on the view function to cache component
    view.$original = this.prototype.view;

    let output = {
      controller: this.bind(null, properties),
      view: view,
      props: properties,
      component: this
    };

    // If a `key` prop was set, then we'll assume that we want that to actually
    // show up as an attribute on the component object so that Mithril's key
    // algorithm can be applied.
    if (properties.key) {
      output.attrs = {key: properties.key};
    }

    return output;
  };

  Component.initProps = function () {};

  return Component;
})();
