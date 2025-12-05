if (!customElements.get('hero-carousel')) {
  class HeroCarousel extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.initSlider();
      if (this.dataset.slideCount > 1) {
        if (document.readyState === 'complete') this.initScrollAnimation();
        else window.addEventListener("load", this.initScrollAnimation.bind(this));
      }
    }

    initSlider() {
      this.sliderEl = this.querySelector('.swiper');
      if (!this.sliderEl) return;

      this.options = {
        slidesPerView: 1,
        effect: 'fade',
        pagination: {
          el: this.querySelector('.swiper-pagination'),
          clickable: true,
        },
        autoHeight: true,
      };
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

    initScrollAnimationTOREMOVE() {
      this.stickyPos = 0;
      this.isSticky = false;
      const _this = this;
      const scrollOffset = 140;
      this.setupScrollAnimation();
      window.addEventListener("scroll", userScrolling.bind(this));

      function userScrolling(e) {
        const stickyElStyles = window.getComputedStyle(this.sliderEl);
        this.stickyPos = parseInt(stickyElStyles.top, 10);
        const currentTop = this.sliderEl.getBoundingClientRect().top;
        this.isSticky = (currentTop == this.stickyPos);
        console.log("is sticky", this.isSticky);
        //console.log(`currentTop: ${currentTop} || stickyPos: ${this.stickyPos}`);
        //console.log(this.getBoundingClientRect().top);
      }
    }
  }

  customElements.define('hero-carousel', HeroCarousel);
}
