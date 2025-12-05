(() => {
  if (customElements.get('hero-carousel-v3')) {
    return;
  }

  class HeroCarouselV3 extends HTMLElement {
    constructor() {
      super();
      this.options = {
        slidesPerView: 'auto',
        spaceBetween: 31,
        freeMode: true,
        centerInsufficientSlides: true,
        on: {
          afterInit: function () {
            setTimeout(() => {
              if (this.el.querySelector('.swiper-wrapper')) {
                this.el.querySelector('.swiper-wrapper').style.transform = 'translate3d(-192px, 0px, 0px)'
              }
            }, 500);
          },
        }
      };
    }

    /**
     * Init Slider.
     *
     * @returns {Void}
     */
    initSlider() {
      if (!this.hasAttribute('data-slider')) {
        return;
      }

      const slider = new Swiper(this, this.options);
    }

    connectedCallback() {
      this.initSlider();
    }
  }

  customElements.define('hero-carousel-v3', HeroCarouselV3);
})();
