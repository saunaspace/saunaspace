const sectionsToRender = [
  {
    id: '#CartDrawer-Head',
    section: 'cart-drawer',
    selector: '#shopify-section-cart-drawer #CartDrawer-Head',
  },
  {
    id: '#CartDrawer-Body',
    section: 'cart-drawer',
    selector: '#shopify-section-cart-drawer #CartDrawer-Body',
  },
];

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    // Close drawer
    this.addEventListener(
      'keyup',
      (event) => event.code.toUpperCase() === 'ESCAPE' && this.close(),
    );
    this.querySelector('#CartDrawer-Overlay').addEventListener(
      'click',
      this.close.bind(this),
    );
    // Open Drawer Buttons
    this.setCartLinks();
    // Cart Item Details accordion (MOVED to Cart class)
    // this.addEventListener("click", this.toggleDetails.bind(this));
  }

  setCartLinks() {
    const cartLinks = document.querySelectorAll('[data-cart-link]');

    cartLinks.forEach((cartLink) => {
      cartLink.setAttribute('role', 'button');
      cartLink.setAttribute('aria-haspopup', 'dialog');
      cartLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.open(cartLink);
      });
      cartLink.addEventListener('keydown', (event) => {
        if (event.code.toUpperCase() !== 'SPACE') return;
        event.preventDefault();
        this.open(cartLink);
      });
    });
  }

  open(opener) {
    if (opener) this.setActiveElement(opener);
    this.classList.add('is-visible');
    this.addEventListener(
      'transitionend',
      () => {
        this.focusOnCartDrawer();
      },
      { once: true },
    );
    document.body.classList.add("cart-drawer-active");
    bodyScroll.lock(this.querySelector('#CartDrawer-Body'));
  }

  close() {
    this.classList.remove('is-visible');
    removeTrapFocus(this.activeElement);
    bodyScroll.unlock(this.querySelector('#CartDrawer-Body'));
    document.body.classList.remove("cart-drawer-active");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  focusOnCartDrawer() {
    const containerToTrapFocusOn = this.querySelector('#CartDrawer');
    const focusElement = this.querySelector('[data-drawer-close]');
    trapFocus(containerToTrapFocusOn, focusElement);
  }

  renderContents(response) {
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = document.querySelector(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(
        response.sections[section.section],
        section.selector,
      );
    });
    this.open();
  }

  getSectionsToRender() {
    return [...Cart.getLiveRegions(), ...sectionsToRender];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
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

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [...Cart.getLiveRegions(), ...sectionsToRender];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
