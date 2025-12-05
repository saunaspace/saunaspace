class ProductForm extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * On submit handler.
   *
   * @param {Object} event
   * @returns {Void}
   */
  onSubmit(event) {
    event.preventDefault();

    this.submitButton.classList.add('disabled');

    const formData = new FormData(this.form);
    formData.append(
      'sections',
      this.cartDrawer.getSectionsToRender().map((section) => section.section),
    );
    formData.append('sections_url', window.location.pathname);

    Cart.add(formData)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
          return;
        }

        this.cartDrawer.renderContents(response);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.submitButton.classList.remove('disabled');
      });
  }

  /**
   * Handle error message.
   *
   * @param {String/Object} errorMessage Comes from Shopify.
   * @returns {Void}
   */
  handleErrorMessage(errorMessage = false) {
    const errorWrapper = this.querySelector('[data-error-wrapper]');
    if (!errorWrapper || !errorMessage) return;

    window.dispatchEvent(
      new CustomEvent('formError', { detail: errorMessage }),
    );
    errorWrapper.classList.toggle('hidden', !errorMessage);

    if (typeof errorMessage == 'string') {
      errorWrapper.textContent = errorMessage || '';
    }
  }

  /**
   * Connected callback.
   *
   * @returns {Void}
   */
  connectedCallback() {
    this.form = this.querySelector('form');

    if (!this.form) {
      return;
    }

    this.submitButton = this.form.elements['add'];
    this.cartDrawer = document.querySelector('cart-drawer');

    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }
}

customElements.define('product-form', ProductForm);
