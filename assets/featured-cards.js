(() => {
  if (customElements.get('featured-cards')) {
    return;
  }

  class FeaturedCards extends HTMLElement {
    constructor() {
      super();
      this.options = {
        slidesPerView: 1.1,
        spaceBetween: 20,
        breakpoints: {
          758: {
            slidesPerView: 2.3,
          },
          1024: {
            spaceBetween: 40,
            slidesPerView: 3,
          },
        },
      };
    }

    /**
     * Init slider.
     *
     * @returns {Void}
     */
    initSlider() {
      if (!this.hasAttribute('data-slider')) {
        return;
      }

      this.slider = new Swiper(this, this.options);
    }

    connectedCallback() {
      this.initSlider();
    }
  }

  customElements.define('featured-cards', FeaturedCards);
})();
