if (!customElements.get('plug-type-options')) {
  class PlugTypeOptions extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.trigger = this.querySelector('[data-action]');
      this.submenu = this.querySelector('[data-submenu]');
      this.nosubmenuItem = this.querySelector('[data-nosub]');

      if (!this.trigger || !this.submenu) {
        return;
      }

      this.trigger.addEventListener('click', this.handleTriggerClick.bind(this));
      this.addEventListener('change', this.handleChange.bind(this));
      this.nosubmenuItem.addEventListener("click", this.hideSubmenu.bind(this));
    }

    handleTriggerClick(e) {
      this.classList.add("submenu-active");
      this.submenu.classList.add('is-active');

      if (!this.submenu.querySelector('input:checked')) {
        this.submenu.querySelector('input[default-international-plug]').click();
      }
    }

    handleChange() {
      //console.log('plug option changed');

      if (!this.submenu.querySelector('input:checked')) {
        this.classList.remove("submenu-active");
        this.submenu.classList.remove('is-active');
      }
    }

    hideSubmenu(e) {
      if (this.submenu) {
        this.classList.remove("submenu-active");
        this.submenu.classList.remove('is-active');
      }
    }
  }
  customElements.define('plug-type-options', PlugTypeOptions);
}
