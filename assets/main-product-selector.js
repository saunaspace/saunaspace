class MainProductSelector extends ProductSelector {
  constructor() {
    super();
  }

  /**
   * On variant change.
   *
   * @param {Object} event
   * @returns {Void}
   */
  onVariantChange(event) {
    super.onVariantChange(event);
    if (event.target.type === 'number' || !this.currentVariant) {
      return;
    }

    this.updateMedia();
    this.updateURL();
  }

  /**
   * Update media.
   *
   * @returns {Void}
   */
  updateMedia() {
    if (!this.currentVariant || !this.currentVariant.featured_media) return;

    const productMedia = document.querySelector('product-media');
    productMedia.setActiveMedia(this.currentVariant.featured_media.id);
  }

  /**
   * Update URL.
   *
   * @returns {Void}
   */
  updateURL() {
    if (!this.currentVariant) return;
    const params = new URLSearchParams(window.location.search);
    params[params.has('variant') ? 'set' : 'append'](
      'variant',
      this.currentVariant.id,
    );
    window.history.replaceState(
      {},
      '',
      `${this.dataset.url}?${params.toString()}`,
    );
  }
}

customElements.define('main-product-selector', MainProductSelector);
