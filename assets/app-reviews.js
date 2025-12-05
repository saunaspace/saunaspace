if (!customElements.get('app-reviews')) {
  class AppReviews extends HTMLElement {
    
    connectedCallback() {
      this.slider = this.querySelector(".swiper");
      if (this.slider) this.initSwiper();
      //this.initReadMore();
    }

    disconnectedCallback() {
      if (this.slider) this.destroySwiper();
    }

    destroySwiper() {
      this.swiperInstance?.destroy();
    }

    initSwiper() {
      const config = {
        slidesPerView: 1,
        loop: true,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        navigation: {
          prevEl: this.querySelector('.swiper-button-prev'),
          nextEl: this.querySelector('.swiper-button-next'),
        },
        autoHeight: true,
      };

      this.swiper = new Swiper(this.slider, config);
    }

    initReadMore() {
      const reviewsContentItems = this.querySelectorAll(".col-content .content-cnt p");
      readmoreInit(this, reviewsContentItems, 3);
    }

    readmoreTriggerClick(e) {
      const target = e.target;
      if (target.classList.contains('readmore-trigger')) {
        target.nextSibling.classList.add("show");
        target.remove();
        this.swiper.update();
      }
    }
  }

  customElements.define('app-reviews', AppReviews);
}


// Original - 5.12.25
if (!customElements.get('app-reviews-v1')) {
  class AppReviewsV1 extends HTMLElement {
    matchMedia = window.matchMedia(this.dataset.breakpoint);

    instances = {
      content: null,
      avatar: null,
      info: null,
    };

    elements = {
      content: null,
      avatar: null,
      info: null,
    };

    selectors = {
      sliderContent: '[data-slider-content]',
      sliderAvatar: '[data-slider-avatar]',
      sliderInfo: '[data-slider-info]',
      clip: '[data-clip]',
      buttons: '[data-buttons]',
      pagination: '[data-pagination]',
    };

    config = {
      content: {
        slidesPerView: 'auto',
        speed: 500,
        breakpoints: {},
        allowTouchMove: false,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
      },
      avatar: {
        slidesPerView: 'auto',
        speed: 500,
        breakpoints: {},
        allowTouchMove: false,
      },
      info: {
        slidesPerView: 'auto',
        speed: 500,
        breakpoints: {},
        autoHeight: true,
        allowTouchMove: false,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
      },
    };

    connectedCallback() {
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
      this.elements.content = this.querySelector(this.selectors.sliderContent);
      this.elements.avatar = this.querySelector(this.selectors.sliderAvatar);
      this.elements.info = this.querySelector(this.selectors.sliderInfo);
      this.buttons = this.elements.info.querySelector(this.selectors.buttons);
      this.pagination = this.elements.info.querySelector(
        this.selectors.pagination,
      );

      if (this.buttons) {
        this.config.info.navigation = {
          prevEl: this.buttons.querySelector('[data-prev]'),
          nextEl: this.buttons.querySelector('[data-next]'),
        };
      }

      if (this.pagination) {
        this.config.info.pagination = {
          el: this.pagination,
          type: 'fraction',
        };
      }

      this.instances.content = new Swiper(
        this.elements.content.querySelector(this.selectors.clip),
        this.config.content,
      );

      // const avatars = this.querySelectorAll(this.selectors.sliderAvatar);

      this.instances.avatar = new Swiper(
        this.elements.avatar.querySelector(this.selectors.clip),
        this.config.avatar,
      );
      this.instances.info = new Swiper(
        this.elements.info.querySelector('.slider-reviews-info__clip'),
        this.config.info,
      );

      this.instances.info.on('slideChange', (swiper) => {
        this.instances.content.slideTo(swiper.activeIndex);
        this.instances.avatar.slideTo(swiper.activeIndex);
      });
    }

    destroySwiper() {
      this.swiperInstance?.destroy();
    }
  }

  customElements.define('app-reviews-v1', AppReviewsV1);
}
