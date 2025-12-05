/**
 * Cards Slider component
 *
 * Uses Swiper package to create a carousel
 * More info: https://swiperjs.com/
 */
(() => {
  if (customElements.get('cards-slider')) {
    return;
  }

  class CardsSlider extends HTMLElement {
    constructor() {
      super();
      this.selectors = {
        slider: '[data-slider]',
        pagination: '[data-pagination]',
      };
      this.options = {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
          type: 'bullets',
          el: this.selectors.pagination,
          clickable: true,
        },
        autoplay: this.hasAttribute('data-autoplay-interval') && {
          delay: Number(this.getAttribute('data-autoplay-interval')),
        },
      };
    }

    /**
     * Connected callback.
     *
     * @returns {Void}
     */
    connectedCallback() {
      const slider = this.querySelector(this.selectors.slider);
      if (!slider) {
        return;
      }
      this.slider = new Swiper(slider, this.options);
    }
  }

  customElements.define('cards-slider', CardsSlider);
})();
