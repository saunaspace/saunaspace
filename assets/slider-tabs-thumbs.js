if (!customElements.get('slider-tabs-thumbs')) {
  class SliderTabsThumbs extends HTMLElement {
    matchMedia = window.matchMedia(this.dataset.breakpoint);
    tabletMedia = window.matchMedia('(max-width: 990px)');
    selectors = {
      slider: '[data-slider]',
      thumbs: '[data-thumbs]',
      clip: '[data-clip]',
      buttons: '[data-buttons]',
      slide: '[data-slide]',
    };

    settings = {
      elements: {
        slider: null,
        thumbs: null,
      },
      instances: {
        slider: null,
        thumbs: null,
      },
      config: {
        slider: {
          slidesPerView: 'auto',
          speed: 500,
          effect: 'fade',
          allowTouchMove: false,//true,
          fadeEffect: {
            crossFade: true,
          },
          breakpoints: {
            990: {
              allowTouchMove: false
            }
          },
          on: {
            slideChangeTransitionStart: (swiper) => {
              //console.log("slideChangeTransitionStart");
            }
          }
        },
        thumbs: {
          loop: true,
          centeredSlides: true,
          allowTouchMove: true,
          watchSlidesProgress: true,
          breakpoints: {
            0: {
              slidesPerView: 'auto',
              spaceBetween: 32,
            },
            750: {
              slidesPerView: 'auto',
              spaceBetween: 30,
            },
            990: {
              direction: 'vertical',
              slidesPerView: 7,
              spaceBetween: 0,
              loopAdditionalSlides: 100,
              centeredSlidesBounds: true,
              updateOnWindowResize: true,
              allowTouchMove: false
            },
          },
          on: {
            autoplay: (swiper) => {
              // Adding separate `autoplay` options to both sliders may cause them to get out of sync,
              // so we are changing the slide manually.
              return; // Moved to slideChange event to allow touchmove changes

              const { liquidIndex } = swiper.el.querySelector(
                '.swiper-slide-active',
              ).dataset;

              this.settings.instances.slider.slideTo(parseInt(liquidIndex));
            },
            slideChange: (swiper) => {
              if (this.settings.instances.slider == null) return console.log("slider is null");
              const { liquidIndex } = swiper.slides[swiper.activeIndex].dataset;
              if (this.settings.instances.slider.destroyed) return console.log("Slider was previously destroyed");
              this.settings.instances.slider?.slideTo(parseInt(liquidIndex));
            },
            click: (swiper) => {
              // We're not using slider's thumbs, because of duplicate slides.
              // Slide main slider to appropriate slide, based on index from liquid.
              const { liquidIndex } = swiper.clickedSlide.dataset;
              this.settings.instances.thumbs.slideTo(swiper.clickedIndex);
              this.settings.instances.slider.slideTo(parseInt(liquidIndex));
            },
          },
        },
      },
    };

    connectedCallback() {
      this.settings.elements.slider = this.querySelector(this.selectors.slider);
      this.settings.elements.thumbs = this.querySelector(this.selectors.thumbs);
      this.slides = this.querySelectorAll(this.selectors.slide);

      this.activateOnBreakpoint();

      this.tabletMedia.addEventListener('change', () => {
        this.settings.instances.slider.destroy();
        this.settings.instances.thumbs.destroy();

        setTimeout(() => {
          this.initSwiper();
        }, 1000);
      });
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

      this.triggerAutoPlayOnScroll();
    }

    // Use GSAP 
    triggerAutoPlayOnScroll() {console.log("triggerAutoPlayOnScroll");
      if (typeof gsap === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);
      let st = ScrollTrigger.create({
        trigger: this.closest('.services'),
        start: "top center",
        end: "bottom center",
        toggleClass: "section-active",
        markers: (window.location.search === "?markers"),//true,
        // onEnter: ({prog,dir,isA}) => {console.log(`%c ST - OnEnter: AP Start!`,"color:orange");},
        // onEnterBack: ({prog,dir,isA}) => {console.log(`%c ST - OnEnter Back: AP Start!`,"color:orange");},
        // onLeave: ({prog,dir,isA}) => {console.log(`%c ST - OnLeave: AP Stop!`,"color:orange");},
        // onLeaveBack: ({prog,dir,isA}) => {console.log(`%c ST - OnLeave Back: AP Stop!`,"color:orange");},
        // onRefresh: (swiper) => console.log(`scroll trigger refresh`),
        onToggle: (stInstance) => {
          if (typeof this.settings.instances.thumbs != "object") return console.warn("No slider instance found");
          //console.log(`%cON TOGGLE!: ${stInstance.isActive}`, "color:orange");
          if (typeof this.settings.instances.thumbs.autoplay === "undefined") return console.log("Slider autoplay is undefined");
          if (stInstance.isActive) this.settings.instances.thumbs.autoplay.start();
          else this.settings.instances.thumbs.autoplay.stop();
        }
      });

      document.addEventListener("load", st.refresh);
      setInterval(st.refresh, 2000);
    }

    initSwiper() {
      if (!this.settings.elements.slider || !this.settings.elements.thumbs)
        return;

      const { autoplayDelay } = this.dataset;
      const wrapper = this.settings.elements.thumbs.querySelector('.swiper-wrapper');
      this.settings.config.thumbs.autoplay = {
        delay: autoplayDelay,
      };

      //this.cloneSlides(3, wrapper);

      this.settings.instances.thumbs = new Swiper(
        this.settings.elements.thumbs,
        this.settings.config.thumbs,
      );
      this.settings.instances.slider = new Swiper(
        this.settings.elements.slider,
        this.settings.config.slider,
      );

      this.settings.instances.thumbs.autoplay.stop();
    }

    destroySwiper() {
      this.swiperInstance?.destroy();
    }

    cloneSlides(n, wrapper) {
      const array = Array.from(wrapper.children);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < array.length; j++) {
          const clone = wrapper.children[j].cloneNode(true);
          wrapper.appendChild(clone);
        }
      }
    }
  }

  customElements.define('slider-tabs-thumbs', SliderTabsThumbs);
}
