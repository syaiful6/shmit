import BaseComponent from '../component';
import inherits from '../../utils/inherits';

export default function AppModal () {
  BaseComponent.apply(this, arguments);
}

inherits(AppModal, BaseComponent);

AppModal.prototype.view = function() {
  var modal = this.props.modal,
    onclose = this.props.onclose,
    containerClass = "modal-container js-modal-container fade-in open",
    backGroundClass = "modal-background js-modal-background fade-in open";
  return (
    <div className="modal-application">
      <div className={containerClass} onclick={onclose}>
        {modal && modal.render()}
      </div>
      <div className={backGroundClass}></div>
    </div>
  );
};
