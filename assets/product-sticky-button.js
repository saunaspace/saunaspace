if (!customElements.get('product-sticky-button')) {
  class ProductStickyButton extends HTMLElement {
    constructor() {
      super();

      this.productSection = this.closest('[data-section]');
      this.productSubmit = this.productSection?.querySelector('[name="add"]');

      if (!this.productSubmit) return;

      this.addEventListener('click', (e) => {
        e.preventDefault();

        this.productSubmit.click();
      });

      window.addEventListener('scroll', this.toggleVisibility.bind(this));

      this.toggleVisibility();
    }

    toggleVisibility() {
      const sectionRect = this.productSection.getBoundingClientRect();
      const offset = 320;
      const isSectionVisible = sectionRect.y + sectionRect.height - offset >= 0;

      this.classList.toggle('is-visible', !isSectionVisible);
    }
  }

  customElements.define('product-sticky-button', ProductStickyButton);
}
