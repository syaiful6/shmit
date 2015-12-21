import BaseComponent from '../component';
import inherits from '../../utils/inherits';
import {cancelEventPropagation} from '../../utils/event';

export default function Modal () {
  BaseComponent.apply(this, arguments);
}

inherits(Modal, BaseComponent);

Modal.prototype.view = function () {
  var props = Object.assign({}, this.props),
    type = props.type || '',
    klass = type ? `modal-${type} js-modal open` : 'modal js-modal open';

  props.showClose = props.showClose == null ? true : props.hasAction;

  return (
    <article className={klass}>
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
        {this.footerContent()}
      </section>
    </article>
  );
};

/**
* stop event buble here because we dont want the modal close
* when user click on modal content area
*/
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

Modal.prototype.onready = function (parentSelector) {
  this.parentSelector = parentSelector;
};
