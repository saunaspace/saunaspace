class ProductModal extends ModalDialog {
  constructor() {
    super();
  }

  show(opener) {
    super.show(opener);
    this.showActiveMedia();
  }

  showActiveMedia() {
    const activeMediaId = this.openedBy.getAttribute('data-media-id');

    this.querySelectorAll('[data-media-id]').forEach((media) => {
      media.parentElement.classList.add('hidden');
    });
    this.querySelector(
      `[data-media-id="${activeMediaId}"]`,
    ).parentElement.classList.remove('hidden');
  }
}

customElements.define('product-modal', ProductModal);
