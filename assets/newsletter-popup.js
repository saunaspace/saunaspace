class NewsletterPopup extends ModalDialog {
  constructor() {
    super();
    this.delay = this.dataset.delay * 1000;
    this.closed = getCookie('newsletter-closed');
    this.subscribed = getCookie('newsletter-subscribed');

    this.form = this.querySelector('.js-form');

    if (!!this.form) {
      this.form.addEventListener('submit', this.onSubscribe.bind(this));
    }
  }

  connectedCallback() {
    this.addEventHandlers();
    if (this.dataset.openInDesignMode === 'true') {
      return;
    }

    setTimeout(() => {
      if (this.closed !== null || this.subscribed !== null) return;

      this.show();
    }, this.delay);
  }

  addEventHandlers() {
    if (this.dataset.openInDesignMode === 'true') {
      document.addEventListener('shopify:section:select', (event) => {
        if (event.target.contains(this)) {
          this.show();
        }
      });

      document.addEventListener('shopify:section:deselect', (event) => {
        this.hide();
      });
    }
  }

  hide() {
    super.hide();
    setCookie('newsletter-closed', 'true');
  }

  onSubscribe() {
    setCookie('newsletter-subscribed', 'true');
    this.hide();
  }
}

customElements.define('newsletter-popup', NewsletterPopup);
