(() => {
  if (customElements.get('products-carousel')) {
    return;
  }

  class ProductsCarousel extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.options = {};
    }

    connectedCallback() {
      this.initSlider();
    }

    initSlider() {
      if (!this.querySelector('[data-slider]')) return;

      this.options = {
        navigation: {
          prevEl: this.querySelector('.swiper-arrow--prev'),
          nextEl: this.querySelector('.swiper-arrow--next'),
        },
        slidesPerView: 2,
        spaceBetween: 20,
        breakpoints: {
          750: {
            slidesPerView: 4,
          },
        },
      };
      if (this.hasAttribute('data-autoplay')) {
        this.options.autoplay = {
          delay: this.dataset.autoplaySpeed,
        };
      }
      this.slider = new Swiper(
        this.querySelector('[data-slider]'),
        this.options,
      );
    }
  }

  customElements.define('products-carousel', ProductsCarousel);
})();
