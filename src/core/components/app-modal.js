import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import iter from '../../utils/itertools';
import {cancelEventPropagation} from '../../utils/event';

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

export default function AppModal () {
  BaseComponent.apply(this, arguments);
  // the modal to show
  this.component = null;
  this._showing = false;
}

inherits(AppModal, BaseComponent);

AppModal.prototype.view = function() {
  return (
    <div className="modal-application">
      <div className="modal-container js-modal-container" onclick={this.close.bind(this)}>
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

  this._showing = true;
  component.close = this.close.bind(this);
  this.component = component;

  var container = this.querySelectorAll('.js-modal-container, .js-modal-background');

  for (let elem of iter(container)) {
    addClass(elem, 'fade-in open');
  }

  m.redraw(true);
  this.onready();
};

AppModal.prototype.close = function (e) {
  if (! this._showing) {
    return;
  }
  cancelEventPropagation(e);
  var container = this.querySelectorAll('.js-modal-container, .js-modal-background'),
    elem;

  for (elem of iter(container)) {
    removeClass(elem, 'fade-in');
    addClass(elem, 'fade-out');
  }

  this._hideTimeout = setTimeout(() => {
    for (elem of iter(container)) {
      removeClass(elem, 'fade-out open');
    }

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
