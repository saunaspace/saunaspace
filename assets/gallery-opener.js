if (!customElements.get('gallery-opener')) {
  class GalleryOpener extends ModalOpener {
    constructor() {
      super();
    }

    onButtonClick() {
      super.onButtonClick();

      if (!this.modal) return;

      const gallerySlider = this.modal.querySelector('slider-default');

      gallerySlider.slider.slideTo(this.dataset.index);
      console.log(gallerySlider.slider);
    }
  }

  customElements.define('gallery-opener', GalleryOpener);
}
