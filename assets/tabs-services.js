if (!customElements.get('tabs-services')) {
  class TabsServices extends HTMLElement {
    constructor() {
      super();
      this.selectors = {};
    }

    connectedCallback() {
      this.attachListeners();
    }

    attachListeners() {}
  }

  customElements.define('tabs-services', TabsServices);
}
