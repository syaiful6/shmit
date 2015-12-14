import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import addEvent from '../../utils/event';

function addClass (elem, className) {
  var splitted = className.split(' ');
  if (elem.classList) {
    splitted.forEach((item) => elem.classList.add(item));
  } else {
    elem.className += ' ' + className;
  }
}

function removeClass (elem, className) {
  var splitted = className.split(' ');
  if (elem.classList) {
    splitted.forEach((item) => elem.classList.remove(item));
  } else {
    var classNames = elem.className.split(' ');
    elem.className = classNames.filter((item) => {
      return splitted.indexOf(item) === -1;
    }).join(' ');
  }
}

function eachNode(node, callback, context) {
  var i, len;
  for (i = 0, len = node.length; i < len; i++) {
    callback.call(context, node[i], i);
  }
}

export default function AppModal () {
  BaseComponent.apply(this, arguments);
  // the modal to show
  this.component = null;
  this._showing = false;
  this._attachListener = false;
}

inherits(AppModal, BaseComponent);

AppModal.prototype.view = function() {
  return (
    <div className="modal-application">
      <div className="modal-container js-modal-container">
        {this.component && this.component.render()}
      </div>
      <div className="modal-background js-modal-background"></div>
    </div>
  );
};

AppModal.prototype.config = function (isInitialized, context) {
  if (isInitialized) {
    return;
  }
  context.retain = true;
};

AppModal.prototype.show = function (component) {
  clearTimeout(this._hideTimeout);

  this._showing = true
  this.component = component;

  var container = this.querySelectorAll('.js-modal-container, .js-modal-background');
  if (!this._attachListener) {
    var elem = this.querySelectorAll();
    if (elem) {
      addEvent(elem, 'sh-modal:hide', this.close.bind(this));
    }
    this._attachListener = true;
  }

  eachNode(container, function (item) {
    removeClass(item, 'fade-out');
    addClass(item, 'fade-in open');
  });

  m.redraw(true);
  this.onready();
};

AppModal.prototype.close = function () {
  if (! this._showing) {
    return;
  }
  var container = this.querySelectorAll('.js-modal-container, .js-modal-background');
  eachNode(container, function (item) {
    removeClass(item, 'fade-in');
    addClass(item, 'fade-out');
  });

  this._hideTimeout = setTimeout(() => {
    eachNode(container, function (item) {
      removeClass(item, 'open');
    });
    this._showing = false;
    this.component = null;
    m.redraw(true);
  });
};

AppModal.prototype.onready = function () {

  if (this.component && typeof this.component.onready === 'function') {
    this.component.onready(this.querySelectorAll());
  }
};
