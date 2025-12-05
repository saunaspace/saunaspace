if (!customElements.get('slider-testimonials')) {
  class SliderTestimonials extends HTMLElement {
    matchMedia = window.matchMedia(this.dataset.breakpoint);
    selectors = {
      clip: '[data-clip]',
      buttons: '[data-buttons]',
    };
    config = {
      slidesPerView: 'auto',
      loop: true,
      speed: 500,
      breakpoints: {
        0: {
          slidesPerView: 1,//'auto',
          spaceBetween: 15,
          centeredSlides: true,
          autoHeight: true,
        },
        750: {
          slidesPerView: 'auto',
          spaceBetween: 50,
          centerInsufficientSlides: true,
          autoHeight: false
        },
        990: {
          slidesPerView: 'auto',
          slidesOffsetBefore: 50,
          spaceBetween: 50,
          autoHeight: false,
        },
      },
    };

    connectedCallback() {
      this.clip = this.querySelector(this.selectors.clip);
      this.buttons = this.querySelector(this.selectors.buttons);
      this.readmoreInitiated = false;

      if (document.readyState != "complete") window.addEventListener('load', this.activateOnBreakpoint.bind(this));
      else this.activateOnBreakpoint();
    }

    disconnectedCallback() {
      this.destroySwiper();
    }

    activateOnBreakpoint() {
      if (!this.dataset.breakpoint || this.matchMedia.matches) {
        this.initSwiper();
      }

      
      if (this.dataset.hasOwnProperty('breakpoint')) {
        this.matchMedia.addEventListener('change', () => {
          if (this.matchMedia.matches) {
            if (this.swiperInstance.enabled) return;
            else return this.initSwiper();
          }
          else {
            this.destroySwiper();
          }
        });
      }
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
        
            // Defer readmore until Swiper is definitely set
            // Just FYI - You don't know what you're doing...
            this.readmoreInitiated = true;
            setTimeout(() => this.initReadmore(), 0);
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

    initReadmore() {
      const readmoreContentItems = this.querySelectorAll(".slide__content p");
      readmoreInit(this, readmoreContentItems);
      this.swiperInstance.update();
    }
  }

  customElements.define('slider-testimonials', SliderTestimonials);
}
