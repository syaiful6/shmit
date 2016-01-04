export default (function () {
  function StyleNode() {}

  StyleNode.prototype.config = function (isInitialized, context) {
    if (isInitialized) {
      return;
    }
    if (this.classNames) {
      this._activate();

      context.onunload = () => this._deactivate()
    }
  };

  // used by unit test, the actual use case use document body as target.
  StyleNode.prototype.setNode = function (targetNode) {
    this._targetNode = targetNode;
  };

  StyleNode.prototype._activate = function () {
    var classes = this.classNames,
      node = this._targetNode || document.body;
    if (!Array.isArray(classes)) {
      classes = [classes];
    }
    classes.forEach((cls) => {
      if (body.classList) {
        node.classList.add(cls);
      } else {
        node.className += ` ${cls}`;
      }
    });
  };

  StyleNode.prototype._deactivate = function () {
    var classes = this.classNames,
      node = this._targetNode || document.body;
    if (!Array.isArray(classes)) {
      classes = [classes];
    }
    if (body.classList) {
      classes.forEach((cls) => {
        node.classList.remove(cls);
      });
    } else {
      let collections = node.className.split(' ');
      collections = collections.filter(c => classes.indexOf(c) === -1);
      node.className = collections.join(' ');
    }
  };

  return StyleNode;
})();
