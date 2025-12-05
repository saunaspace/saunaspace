class ProductBuild extends HTMLElement {
  constructor() {
    super();
    this.selectors = {
      introWrapper: '[data-intro-wrapper]',
      startBuildButton: '[data-start-build]',
      tabButton: '[data-tab-button]',
      tab: '[data-tab]',
      innerTabs: '[data-inner-tabs]',
      innerTabsButton: '[data-inner-tab-button]',
      innerTabsTab: '[data-inner-tab]',
      actionsWrapper: '[data-actions-wrapper]',
      arrows: '[data-arrows]',
      nextArrow: '[data-next-arrow]',
      prevArrow: '[data-prev-arrow]',
      mobileSummaryTrigger: '[data-mobile-summary-trigger]',
      mobileSummary: '[data-mobile-summary]',
    };
  }

  /**
   * Start build.
   *
   * @param {Event} event
   */
  startBuild(event) {
    event.preventDefault();

    this.introWrappers.forEach((introWrapper) => {
      introWrapper.classList.toggle(
        'is-visible',
        !introWrapper.classList.contains('is-visible'),
      );
    });
  }

  /**
   * Toggle inner tabs.
   *
   * @param {Event} event
   * @returns {Void}
   */
  toggleInnerTabs(event) {
    const target = event.target;
    const id = target.dataset.tabId;
    const innerTabsWrapper = target.closest(this.selectors.innerTabs);
    if (!id || !innerTabsWrapper) {
      return;
    }

    const tabButtons = innerTabsWrapper.querySelectorAll(
      this.selectors.innerTabsButton,
    );
    const tabs = innerTabsWrapper.querySelectorAll(this.selectors.innerTabsTab);

    this.changeActiveTab(id, tabButtons, tabs);
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

    this.updateArrows();
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
   * Update arrows.
   *
   * @returns {Void}
   */
  updateArrows() {
    const activeTab = this.querySelector(`${this.selectors.tab}.is-active`);
    const activeTabId = parseInt(activeTab.dataset.tabId);
    if (activeTab.matches(this.selectors.innerTabs)) {
      const innerTabs = activeTab.querySelectorAll(this.selectors.innerTabsTab);
      const innerActiveTab = activeTab.querySelector(
        `${this.selectors.innerTabsTab}.is-active`,
      );
      const activeInnerTabId = parseInt(innerActiveTab.dataset.tabId);

      if (activeTabId === 1 && activeInnerTabId === 1) {
        this.prevArrow.setAttribute('disabled', true);
        this.nextArrow.removeAttribute('disabled');
        return;
      }

      if (
        activeTabId === this.tabs.length &&
        activeInnerTabId === innerTabs.length
      ) {
        this.prevArrow.removeAttribute('disabled');
        this.nextArrow.setAttribute('disabled', true);
        return;
      }

      this.nextArrow.removeAttribute('disabled');
      this.prevArrow.removeAttribute('disabled');
      return;
    }

    if (activeTabId === 1) {
      this.prevArrow.setAttribute('disabled', true);
      this.nextArrow.removeAttribute('disabled');
      return;
    }

    if (activeTabId === this.tabs.length) {
      this.prevArrow.removeAttribute('disabled');
      this.nextArrow.setAttribute('disabled', true);
      return;
    }

    this.nextArrow.removeAttribute('disabled');
    this.prevArrow.removeAttribute('disabled');
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
      this.mobileSummary.classList.remove('is-visible');
      this.mobileSummaryTrigger.classList.remove('is-active');
      return;
    }

    this.mobileSummary.classList.toggle('is-visible');
    this.mobileSummaryTrigger.classList.toggle('is-active');
  }

  /**
   * Handle resize.
   */
  handleResize() {
    this.changeActiveTab('1', this.tabButtons, this.tabs);
    this.toggleMobileSummary(null, true);
  }

  /**
   * Connected callback.
   *
   * @returns {Void}
   */
  connectedCallback() {
    this.introWrappers = this.querySelectorAll(this.selectors.introWrapper);
    this.startBuildButton = this.querySelector(this.selectors.startBuildButton);
    this.tabButtons = this.querySelectorAll(this.selectors.tabButton);
    this.tabs = this.querySelectorAll(this.selectors.tab);
    this.innerTabButtons = this.querySelectorAll(
      this.selectors.innerTabsButton,
    );
    this.nextArrow = this.querySelector(this.selectors.nextArrow);
    this.prevArrow = this.querySelector(this.selectors.prevArrow);
    this.mobileSummaryTrigger = this.querySelector(
      this.selectors.mobileSummaryTrigger,
    );
    this.mobileSummary = this.querySelector(this.selectors.mobileSummary);

    if (!this.introWrappers || !this.startBuildButton) {
      return;
    }

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

    this.startBuildButton[action]('click', this.startBuild.bind(this));
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

    if (this.innerTabButtons.length) {
      this.innerTabButtons.forEach((tabButton) => {
        tabButton[action]('click', this.toggleInnerTabs.bind(this));
      });
    }

    if (!this.nextArrow || !this.prevArrow) {
      return;
    }

    [this.nextArrow, this.prevArrow].forEach((arrow) => {
      arrow[action]('click', this.handleArrowClick.bind(this));
    });
  }
}

customElements.define('product-build', ProductBuild);
