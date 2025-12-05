(() => {
  if (customElements.get('hero-carousel-alt')) {
    return;
  }

  class HeroCarouselAlt extends HTMLElement {
    constructor() {
      super();
      this.sliderEl = this.querySelector(`[data-slider]`);
      this.options = {
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        pagination: {
          el: this.querySelector('[data-pagination]'),
          type: 'bullets',
          clickable: true,
        },
      };
    }

    connectedCallback() {
      this.initSlider();
      if (this.dataset.slideCount > 1) {
        if (document.readyState === 'complete') this.initScrollAnimation();
        else window.addEventListener("load", this.initScrollAnimation.bind(this));
      }
    }

    /**
     * Init Slider.
     *
     * @returns {Void}
     */
    initSlider() {
      if (!this.sliderEl) {//if (!this.hasAttribute('data-slider')) {
        return;
      }

      this.slider = new Swiper(this.sliderEl, this.options);
      const slider = this.slider;
      window.addEventListener("load", function() {
        slider.update();
      });
    }

    //Scrolling Animation
    initScrollAnimation() {
      this.scrollOffset = 0;//140;
      this.slideScrollAmount = 100 / this.dataset.slideCount;
      this.setupScrollAnimation();
      this.initScrollTrigger();
    }

    initScrollTrigger() {
      const stOptions = {
        trigger: this,
        start: `top ${this.scrollOffset}px`,
        end: 'bottom bottom',
        //markers: {startColor:"green",endColor:"red"},
        onToggle: (self) => document.body.classList.toggle("sticky-carousel-active", self.isActive),
        onUpdate: (self) => this.updateSlider(self.progress.toFixed(2) * 100),
        //onRefresh: ({progress, direction, isActive}) => console.log("OnRefresh - hero carousel active?", isActive),
      };

      gsap.registerPlugin(ScrollTrigger);
      this.st = ScrollTrigger.create(stOptions);
      window.addEventListener("resize", this.triggerSTRefresh.bind(this));
    }

    triggerSTRefresh() {
      // Has issues with window resizing, trigger points were way off.
      // This will trigger a ScrollTrigger refresh after a short delay to fix the issue.
      if (!this.st) return;
      setTimeout(this.st.refresh, 500);
    }

    updateSlider(progress) {
      //console.log(`progress:${progress}%`);
      const slideIndex = progress / this.slideScrollAmount;
      //console.log(`slide:${Math.floor(slideIndex)}`);
      this.slider.slideTo(slideIndex);
    }

    setupScrollAnimation() {
      document.body.classList.add("scroll-carousel-animations");
    }
  }

  customElements.define('hero-carousel-alt', HeroCarouselAlt);
})();
