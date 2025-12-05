if (!customElements.get('tabs-content')) {
  class TabsContent extends HTMLElement {
    constructor() {
      super();
    }

    selectors = {
      tabButton: '[data-tab-button]',
      tab: '[data-tab]',
    };

    connectedCallback() {
      this.tabButtons = [...this.querySelectorAll(this.selectors.tabButton)];
      this.tabs = [...this.querySelectorAll(this.selectors.tab)];

      this.tabButtons.forEach((tabButton) => {
        tabButton.addEventListener('click', this.toggleTabs.bind(this));
      });
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

      this.tabButtons.forEach((tabButton) => {
        tabButton.classList.toggle('is-active', tabButton.dataset.tabId === id);
      });

      this.tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.tab === id);
      });
    }
  }
  customElements.define('tabs-content', TabsContent);
}
