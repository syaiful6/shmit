import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import iter from '../../utils/itertools';
import {cancelEventPropagation} from '../../utils/event';

export default function AppModal () {
  BaseComponent.apply(this, arguments);
  // the modal to show
  this.component = null;
  this._showing = false;
}

inherits(AppModal, BaseComponent);

AppModal.prototype.view = function() {
  let containerClass = "modal-container js-modal-container",
    backGroundClass = "modal-background js-modal-background";
  if (this._showing) {
    backGroundClass += "fade-in open";
    containerClass += "fade-in open";
  }
  return (
    <div className="modal-application">
      <div className={containerClass} onclick={this.close.bind(this)}>
        {this.component && this.component.render()}
      </div>
      <div className={backGroundClass}></div>
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

  m.redraw(true);
  this.onready();
};

AppModal.prototype.close = function (e) {
  if (! this._showing) {
    return;
  }
  cancelEventPropagation(e);

  this._hideTimeout = setTimeout(() => {
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
