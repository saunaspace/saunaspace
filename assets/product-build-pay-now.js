class ProductBuildPay extends HTMLElement {
  //static currentStep = 0;
  constructor() {
    super();
    this.selectors = {
      tabButton: '[data-tab-button]',
      tab: '[data-tab]',
      actionsWrapper: '[data-actions-wrapper]',
      arrows: '[data-arrows]',
      mobilePriceTabs: '[data-mobile-price]',
      mobileSummaryTrigger: '[data-mobile-summary-trigger]',
      mobileSummary: '[data-mobile-summary]',
      stepButton: '[data-step-button]',
      stepContainer: '[data-step-index]',
      mediaContainer: '[data-media-index]'
    };
  }

  /**
   * Connected callback.
   *
   * @returns {Void}
   */
  connectedCallback() {
    this.tabButtons = this.querySelectorAll(this.selectors.tabButton);
    this.tabs = this.querySelectorAll(this.selectors.tab);
    this.mobileSummaryTrigger = this.querySelector(
      this.selectors.mobileSummaryTrigger,
    );
    this.mobileSummary = this.querySelector(this.selectors.mobileSummary);
    this.stepContainers = [...this.querySelectorAll(this.selectors.stepContainer)];
    // this.mediaContainers = [...this.querySelectorAll(this.selectors.mediaContainer)]; # Removed the need for the media container to be changed out on each step. 5.17
    this.stepButtons = [...this.querySelectorAll(this.selectors.stepButton)];
    this.mobilePriceTabs = [...this.querySelectorAll(this.selectors.mobilePriceTabs)];
    // WUA - start
    this.currentStep = 0;
    if (typeof window.productSteps === "undefined") window.productSteps = { };
    window.productSteps.active = this.currentStep;
    this.stepChangeEv = new CustomEvent('product_step_change', { bubbles: true, cancelable: false });
    // WUA - end
    this.toggleHandlers();
  }

  /**
   * Disconnected callback.
   */
  disconnectedCallback() {
    this.toggleHandlers(true);
  }

  /**
   * Toggle handlers
   *
   * @param {Boolean} shouldRemove
   */
  toggleHandlers(shouldRemove = false) {
    const action = shouldRemove ? 'removeEventListener' : 'addEventListener';

    this.onResize = debounce(this.handleResize.bind(this), 100);
    window[action]('resize', this.onResize.bind(this));

    if (this.mobileSummaryTrigger && this.mobileSummary) {
      this.mobileSummaryTrigger[action](
        'click',
        this.toggleMobileSummary.bind(this),
      );
    }

    if (this.tabButtons.length) {
      this.tabButtons.forEach((tabButton) => {
        tabButton[action]('click', this.toggleTabs.bind(this));
      });
    }

    if (this.stepContainers.length) {
      window[action]('scroll', this.handleStepScroll.bind(this));
    }
  }

  handleStepScroll(e) {
    const centerScreen = window.innerHeight / 2;
    let target = false;
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      // WUA - Removed: Need the media containers to toggle as scrolling down
      // this.mediaContainers[0].classList.add('is-visible');
      // this.mediaContainers.slice(1).forEach(el => el.classList.remove('is-visible'));
      // return;
      // Instead of middle of screen - check if step container is scrolling behind the sticky media container at the top
      const stickyMediaHeight = document.querySelector(".product__col").offsetHeight;
      //console.log(`%ccheck height:${stickyMediaHeight}`, "color:orange");
      let counter = 0;
      target = this.stepContainers.find(container => {
        const bcr = container.getBoundingClientRect();
        const start = bcr.top;
        const end = bcr.bottom;
        // const index = container.getAttribute('data-step-index');
        // console.log(`%cIndex:${index} || start: ${start} || end: ${end} || stickheigt: ${stickyMediaHeight}`, "color:orange");
        counter++;
        return (counter === 1 && end > stickyMediaHeight) || (start < stickyMediaHeight && end > stickyMediaHeight);
      });
    }
    // WUA - I basically didn't touch any of this setup below
    else {
      target = this.stepContainers.find(container => {
        const bcr = container.getBoundingClientRect();
        const start = bcr.top;
        const end = bcr.bottom;
        return start < centerScreen && end > centerScreen
      });
    }
    
    if (!target) {
      return;
    }

    const index = target.getAttribute('data-step-index'); // WUA
    if (this.currentStep === index) return; // WUA
    //console.log(`%cNEW STEP: ${index}`, "color:red;");
    //console.log(`%cCURRENT STEP: ${this.currentStep}`, "color:green;");
    
    // # - Removed the media updating setup from here. No longer needed 5.17

    const hasButtonForIndex = this.stepButtons.find(btn => btn.getAttribute('data-step-button') == index);
    if (hasButtonForIndex) {
      this.stepButtons.forEach(el => {
        const elIndex = el.getAttribute('data-step-button')

        if (elIndex == index) {
          el.classList.add('is-active');
          return
        }

        el.classList.remove('is-active')
      })
    }

    this.currentStep = index;
    this.setAttribute("data-active-step", this.currentStep);
    window.productSteps.active = this.currentStep;
    //document.dispatchEvent(this.stepChangeEv);
  }

  /**
   * Toggle tabs.
   *
   * @param {Event} event
   * @returns {Void}
   */
  toggleTabs(event) {
    const target = event.target;
    const id = target.dataset.tabId;
    if (!id) {
      return;
    }

    this.changeActiveTab(id, this.tabButtons, this.tabs);
  }

  /**
   * Change active tab.
   *
   * @param {String} id
   * @param {HTMLElement[]} tabButtons
   * @param {HTMLElement[]} tabs
   * @returns {Void}
   */
  changeActiveTab(id, tabButtons, tabs) {
    if (!tabButtons || !tabs) {
      return;
    }

    tabButtons.forEach((tabButton) => {
      tabButton.classList.toggle('is-active', tabButton.dataset.tabId === id);
    });

    [...tabs].forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.tabId === id);
    });

    this.mobilePriceTabs.forEach(tab => {
      tab.classList.toggle('is-active', tab.dataset.mobilePrice === id);
    })

    this.updateActions(id);
  }

  /**
   * Update actions.
   *
   * @param {String} id
   */
  updateActions(id) {
    const isOnLastTab = parseInt(id) === this.tabs.length;
    [...this.querySelectorAll(this.selectors.actionsWrapper)].forEach(
      (actionWrapper) => {
        const isArrows = actionWrapper.matches(this.selectors.arrows);
        if (isArrows) {
          actionWrapper.classList.toggle('is-active', !isOnLastTab);
          return;
        }
        actionWrapper.classList.toggle('is-active', isOnLastTab);
      },
    );
  }

  /**
   * Handle arrow click.
   *
   * @param {Event} event
   */
  handleArrowClick(event) {
    const target = event.target;
    const isNext = target.hasAttribute('data-next-arrow');
    const activeTab = this.querySelector(`${this.selectors.tab}.is-active`);

    this.updateTabFromArrow(activeTab, isNext);
  }

  /**
   * Update tab from arrow click.
   *
   * @param {HTMLElement} activeTab
   * @param {Boolean} isNext
   * @returns {Void}
   */
  updateTabFromArrow(activeTab, isNext) {
    if (activeTab.matches(this.selectors.innerTabs)) {
      const innerTabs = activeTab.querySelectorAll(this.selectors.innerTabsTab);
      const innerActiveTab = activeTab.querySelector(
        `${this.selectors.innerTabsTab}.is-active`,
      );
      const activeTabId = parseInt(innerActiveTab.dataset.tabId);

      if (activeTabId < innerTabs.length && isNext) {
        // Change to next inner tab
        const innerTabButtons = activeTab.querySelectorAll(
          this.selectors.innerTabsButton,
        );
        this.changeActiveTab(
          (activeTabId + 1).toString(),
          innerTabButtons,
          innerTabs,
        );
        return;
      }

      if (activeTabId > 1 && !isNext) {
        // Change to prev inner tab
        const innerTabButtons = activeTab.querySelectorAll(
          this.selectors.innerTabsButton,
        );
        this.changeActiveTab(
          (activeTabId - 1).toString(),
          innerTabButtons,
          innerTabs,
        );
        return;
      }
    }

    if (isNext) {
      // Change to next tab
      const nextTab = activeTab.nextElementSibling;
      if (nextTab) {
        this.changeActiveTab(nextTab.dataset.tabId, this.tabButtons, this.tabs);
      }
      return;
    }

    // Change to prev tab
    const prevTab = activeTab.previousElementSibling;
    this.changeActiveTab(prevTab.dataset.tabId, this.tabButtons, this.tabs);
  }

  /**
   * Toggle mobile summary.
   *
   * @param {Boolean} forceClose
   * @returns {Void}
   */
  toggleMobileSummary(event, forceClose = false) {
    if (forceClose) {
      this.mobileSummary?.classList.remove('is-visible');
      this.mobileSummaryTrigger?.classList.remove('is-active');
      return;
    }

    this.mobileSummary?.classList.toggle('is-visible');
    this.mobileSummaryTrigger?.classList.toggle('is-active');
  }

  /**
   * Handle resize.
   */
  handleResize() {
    this.changeActiveTab('1', this.tabButtons, this.tabs);
    this.toggleMobileSummary(null, true);
  }
}

customElements.define('product-build-pay', ProductBuildPay);
