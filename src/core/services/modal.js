export default function Modal () {
  this.modal = null;
  this.showing = false;
}

Modal.prototype.openModal = function (modal) {
  m.startComputation();
  m.redraw.strategy("diff");
  try {
    this.modal = modal;
    this.showing = true;
  } finally {
    m.endComputation();
  }
};

Modal.prototype.closeModal = function () {
  m.startComputation();
  m.redraw.strategy("diff");
  try {
    if (!this.showing) {
      return;
    }
    this.showing = false;
    this.modal = null;
  } finally {
    m.endComputation();
  }
}


