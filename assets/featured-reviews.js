(() => {
  if (customElements.get('featured-reviews')) {
    return;
  }

  class FeaturedReviews extends HTMLElement {
    constructor() {
      super();
      this.selectors = {
        filtersHolder: '[data-review-filters]',
        filter: '[data-category]',
        reviewsHolder: '[data-reviews]',
        review: '[data-review]',
        slider: '[data-slider]',
        sliderPrevArrow: '[data-arrow-prev]',
        sliderNextArrow: '[data-arrow-next]'
      };
      this.actionClasses = {
        activeFilter: 'is-active'
      };
      this.currentFilter = 'all';
      this.sliderOptions = {
        spaceBetween: 20,
        slidesPerView: 1.22,
        breakpoints: {
          768: {
            slidesPerView: 2
          },
          1200: {
            spaceBetween: 40,
            slidesPerView: 3
          }
        },
        navigation: {
          nextEl: this.querySelector(this.selectors.sliderNextArrow),
          prevEl: this.querySelector(this.selectors.sliderPrevArrow)
        }
      };

      if (this.hasAttribute('data-autoplay')) {
        this.sliderOptions.autoplay = {
          delay: 5000
        }
      }
    }

    /**
     * Filter reviews.
     *
     * @param {Event} event
     * @returns {Void}
     */
    filterReviews(event) {
      event.preventDefault();
      const { target } = event;
      const filter = target.dataset.category;

      if (filter == this.currentFilter) {
        return;
      }

      this.updateCurrentFilter(filter);

      [...this.reviews].forEach(review => {
        if (this.currentFilter === 'all') {
          review.classList.add('swiper-slide');
          review.classList.remove('hidden');
          return;
        }
        review.classList.toggle('hidden', review.dataset.category !== filter);
        review.classList.toggle('swiper-slide', !(review.dataset.category !== filter));
      });

      this.swiper?.update();
    }

    /**
     * Update current filter.
     *
     * @param {String} filter - Filter string (all|[any])
     */
    updateCurrentFilter(filter) {
      this.currentFilter = filter;
      this.filtersHolder.querySelector(`.${this.actionClasses.activeFilter}`).classList.remove(this.actionClasses.activeFilter);
      this.filtersHolder.querySelector(`[data-category="${filter}"]`).classList.add(this.actionClasses.activeFilter);
    }

    /**
     * Init slider.
     *
     * @returns {Void}
     */
    initSlider() {
      if (!this.slider) {
        return;
      }

      this.swiper = new Swiper(this.slider, this.sliderOptions);
    }

    /**
     * Connected callback.
     */
    connectedCallback() {
      this.cacheElements();

      if (!this.filters.length || !this.reviews.length) {
        return;
      }

      this.toggleEventListeners();
      this.initSlider();
    }

    /**
     * Disconnect callback.
     */
    disconnectedCallback() {
      this.toggleEventListeners(false);
    }

    /**
     * Toggle event listeners.
     *
     * @param {Boolean} shouldAdd
     */
    toggleEventListeners(shouldAdd = true) {
      const action = shouldAdd ? 'addEventListener' : 'removeEventListener';
      [...this.filters].forEach(filter => {
        filter[action]('click', this.filterReviews.bind(this));
      });
    }

    /**
     * Cache elements.
     */
    cacheElements() {
      this.filtersHolder = this.querySelector(this.selectors.filtersHolder);
      this.reviewsHolder = this.querySelector(this.selectors.reviewsHolder);

      if (!this.filtersHolder || !this.reviewsHolder) {
        return;
      }

      this.filters = this.filtersHolder.querySelectorAll(this.selectors.filter);
      this.reviews = this.reviewsHolder.querySelectorAll(this.selectors.review);

      this.slider = this.querySelector(this.selectors.slider);
    }
  }

  customElements.define('featured-reviews', FeaturedReviews);
})();
