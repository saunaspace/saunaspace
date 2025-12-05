(() => {
  if (customElements.get('review-images')) {
    return;
  }

  class ReviewImages extends HTMLElement {
    constructor() {
      super();
      this.selectors = {
        image: '[data-image]',
        showNext: '[data-show-next]',
      };
      this.hiddenClass = 'is-hidden';
      this.desktopLimit = 14;
      this.desktopRowAmount = this.desktopLimit / 2;
      this.tabletLimit = 10;
      this.tabletRowAmount = this.tabletLimit / 2;
      this.mobileLimit = 9;
      this.mobileRowAmount = this.mobileLimit;

      this.tabletMatchQuery = window.matchMedia('(max-width: 1023px)');
      this.mobileMatchQuery = window.matchMedia('(max-width: 767px)');
    }

    get deviceImageLimits() {
      const isTablet = this.tabletMatchQuery.matches;
      const isMobile = this.mobileMatchQuery.matches;

      if (isMobile) {
        return {
          limit: this.mobileLimit,
          rowAmount: this.mobileRowAmount,
        };
      }

      if (isTablet) {
        return {
          limit: this.tabletLimit,
          rowAmount: this.tabletRowAmount,
        };
      }

      return {
        limit: this.desktopLimit,
        rowAmount: this.desktopRowAmount,
      };
    }

    /**
     * Hide initial extra images.
     */
    hideInitialExtraImages() {
      this.showNext.classList.remove('hidden');
      const { limit } = this.deviceImageLimits;

      [...this.images].forEach((image, index) => {
        image.classList.toggle(this.hiddenClass, index >= limit);
      });
    }

    /**
     * Handle show next click.
     *
     * @returns {Void}
     */
    handleShowNextClick() {
      const hiddenImages = this.querySelectorAll(`${this.selectors.image}.${this.hiddenClass}`);

      if (!hiddenImages.length) {
        return;
      }

      const { rowAmount } = this.deviceImageLimits;

      [...hiddenImages].forEach((image, index) => {
        if (index < rowAmount) {
          image.classList.remove(this.hiddenClass);
        }
      });

      this.checkIfAllImagesShown();
    }

    /**
     * Check if all images are shown.
     */
    checkIfAllImagesShown() {
      const hiddenImages = this.querySelectorAll(`${this.selectors.image}.${this.hiddenClass}`);

      if (!hiddenImages.length) {
        this.showNext.classList.add('hidden');
      }
    }

    /**
     * Handle resize.
     */
    handleResize() {
      this.hideInitialExtraImages();
    }

    /**
     * Toggle listeners.
     *
     * @param {Boolean} shouldAdd
     */
    toggleListeners(shouldAdd = true) {
      const action = shouldAdd ? 'addEventListener' : 'removeEventListener';
      this.showNext[action]('click', this.handleShowNextClick.bind(this));
      window[action]('resize', this.handleResize.bind(this));
    }

    /**
     * Connected callback.
     *
     * @returns {Void}
     */
    connectedCallback() {
      this.cacheElements();

      if (!this.images.length || !this.showNext) {
        return;
      }

      this.toggleListeners();
      this.hideInitialExtraImages();
    }

    /**
     * Disconnected callback.
     */
    disconnectedCallback() {
      this.toggleListeners(false);
    }

    /**
     * Cache elements.
     */
    cacheElements() {
      this.images = this.querySelectorAll(this.selectors.image);
      this.showNext = this.querySelector(this.selectors.showNext);
    }
  }

  customElements.define('review-images', ReviewImages);
})();
