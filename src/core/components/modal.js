import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';

export default function Modal () {
  BaseComponent.apply(this, arguments);
}

inherits(Modal, BaseComponent);

Modal.prototype.view = function () {
  var props = Object.assign({}, this.props);
  props.hasAction = props.hasAction == null ? false : props.hasAction;
  props.showClose = props.showClose == null ? true : props.hasAction;

  return (
    <article className={this.className()}>
      <section className="modal-content" onclick={this.noBuble.bind(this)}>
        <header class="modal-header">
          <h1>{this.title()}</h1>
        </header>
        {props.showClose ?
          <a className="close icon-x" href="" title="Close">
            <span className="hidden">Close</span></a> : ''}
        <section class="modal-body">
          {this.content()}
        </section>
        {props.hasAction ?
          this.footerContent() : ''}
      </section>
    </article>
  );
};

Modal.prototype.noBuble = function(e) {
  cancelEventPropagation(e);
  return false;
}

Modal.prototype.title = function () {

};

Modal.prototype.content = function () {

};

Modal.prototype.footerContent = function () {

};

Modal.prototype.className = function () {
  var type = this.props.type || '',
    klass = type ? `modal-${type}` : 'modal';
  return `${klass} js-modal open`;
};

Modal.prototype.onready = function (parentSelector) {
  this.parentSelector = parentSelector;
};
