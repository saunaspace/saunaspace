if (!customElements.get('slider-default')) {
  class SliderDefault extends HTMLElement {
    constructor() {
      super();

      this.thumbs = this.querySelector('[data-thumbs]');
      this.counterCurrent = this.querySelector('[data-counter-current]');

      this.sliderOptions = {
        effect: this.dataset.effect ? this.dataset.effect : 'slide',
        fadeEffect: {
          crossFade: true,
        },
        slidesPerView: 'auto',
        allowTouchMove: !this.hasAttribute('data-disable-mobile'),
        centeredSlides: this.hasAttribute('data-center-slides'),
        loop: this.hasAttribute('data-loop'),
        rewind: this.hasAttribute('data-rewind'),
        breakpoints: {
          750: {
            allowTouchMove: !this.hasAttribute('data-disable-desktop'),
            centeredSlides: this.hasAttribute('data-center-desktop'),
          },
        },
      };

      if (this.hasAttribute('data-disabled')) return;

      this.initSlider();
    }

    initSlider() {
      const pagination = this.querySelector('[data-pagination]');
      const nextEl = this.querySelector('[data-next]');
      const prevEl = this.querySelector('[data-prev]');

      this.sliderOptions.pagination = {
        el: pagination,
        type: 'bullets',
        clickable: true,
      };

      this.sliderOptions.navigation = {
        nextEl: nextEl,
        prevEl: prevEl,
      };

      if (this.thumbs) {
        const thumbsSlider = this.querySelector('[data-thumbs-slider]');
        const thumbsNext = this.querySelector('[data-thumbs-next]');
        const thumbsPrev = this.querySelector('[data-thumbs-prev]');

        this.thumbsSlider = new Swiper(thumbsSlider, {
          slidesPerView: 'auto',
          /*navigation: {
            nextEl: thumbsNext,
            prevEl: thumbsPrev,
          },*/
        });

        this.sliderOptions.thumbs = {
          swiper: this.thumbsSlider,
          autoScrollOffset: 1,
        };
      }

      if (this.hasAttribute('data-autoplay')) {
        this.sliderOptions.autoplay = {
          delay: this.dataset.autoplaySpeed,
        };
      }

      this.slider = new Swiper(
        this.querySelector('[data-slider]'),
        this.sliderOptions,
      );

      if (!this.counterCurrent) return;

      this.slider.on('slideChange', () => {
        this.counterCurrent.textContent = this.slider.realIndex + 1;
      });
    }
  }

  customElements.define('slider-default', SliderDefault);
}
