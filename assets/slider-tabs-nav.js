if (!customElements.get('slider-tabs-nav')) {
  class SliderTabsNav extends HTMLElement {
    matchMedia = window.matchMedia(this.dataset.breakpoint);
    selectors = {
      clip: '[data-clip]',
      buttons: '[data-buttons]',
    };
    config = {
      slidesPerView: 'auto',
      direction: 'vertical',
      speed: 500,
      breakpoints: {},
    };

    connectedCallback() {
      this.clip = this.querySelector(this.selectors.clip);
      this.buttons = this.querySelector(this.selectors.buttons);

      this.activateOnBreakpoint();
    }

    disconnectedCallback() {
      this.destroySwiper();
    }

    activateOnBreakpoint() {
      if (!this.dataset.breakpoint || this.matchMedia.matches) {
        this.initSwiper();
      }

      this.matchMedia.addEventListener('change', () => {
        if (this.matchMedia.matches) {
          return this.initSwiper();
        }

        this.destroySwiper();
      });
    }

    initSwiper() {
      const { items, spacing } = this.dataset;

      this.config = Object.assign(this.config, {
        slidesPerView: items ? parseInt(items) : 'auto',
        spaceBetween: spacing ? parseInt(spacing) : 0,
        on: {
          init: (instance) => {
            if (instance.slides.length > instance.params.slidesPerView) {
              this.classList.add('has-slides');
            }
          },
        },
      });

      if (this.buttons) {
        this.config = Object.assign(this.config, {
          navigation: {
            prevEl: this.buttons.children[0],
            nextEl: this.buttons.children[1],
          },
        });
      }

      this.swiperInstance = new Swiper(this.clip, this.config);
    }

    destroySwiper() {
      this.swiperInstance?.destroy();
    }
  }

  customElements.define('slider-tabs-nav', SliderTabsNav);
}
