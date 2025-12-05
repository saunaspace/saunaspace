class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems =
        this.closest('cart-drawer-items') || this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.currentItemCount = Array.from(
      this.querySelectorAll('[name="updates[]"]'),
    ).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0,
    );
    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener('change', this.debouncedOnChange.bind(this));
    // Cart Item Details accordion
    this.addEventListener("click", this.toggleDetails.bind(this));
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute('name'),
    );
  }

  getSectionsToRender() {
    return [
      ...Cart.getLiveRegions(),
      {
        id: `#shopify-section-${
          document.getElementById('main-cart-items').dataset.id
        }`,
        section: document.getElementById('main-cart-items').dataset.id,
        selector: `#shopify-section-${
          document.getElementById('main-cart-items').dataset.id
        }`,
      },
    ];
  }

  updateQuantity(line, quantity, name) {
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    Cart.update(body)
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace = document.querySelector(section.id);

          if (!elementToReplace) return;

          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector,
          );
        });
        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem = document.getElementById(`CartItem-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`))
          lineItem.querySelector(`[name="${name}"]`).focus();
      })
      .catch((error) => {
        console.error(error);
        const quantityInputs = document.querySelectorAll(
          `[id*="ProductQuantity-${line}"]`,
        );

        if (quantityInputs.length) {
          quantityInputs.forEach((input) => {
            input.value = input.getAttribute('value');
          });
        }

        this.updateLiveRegions(line, this.currentItemCount);
      });
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      document
        .querySelectorAll(`[data-line-item-error][data-line="${line}"]`)
        .forEach((error) => {
          error.innerHTML = window.cartStrings.quantityError.replace(
            '[quantity]',
            document.querySelector(`[id*="ProductQuantity-${line}"]`).value,
          );
        });
    }

    this.currentItemCount = itemCount;
  }

  // Cart Item Details
  toggleDetails(e) {
    if (!e.target.matches(".js-cart-item-details-toggle")) return;
    const nextSibling = e.target.nextElementSibling;
    if (nextSibling.matches(".js-cart-item-details")) {
      e.preventDefault();
      const isOpen = nextSibling.classList.contains("js-open");
      nextSibling.classList.toggle("js-open", !isOpen);
      e.target.classList.toggle("js-toggled", !isOpen);
    }
  }
}

customElements.define('cart-items', CartItems);
