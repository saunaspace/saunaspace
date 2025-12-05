/**
 * This uses Shopify consent-tracking-api: https://shopify.dev/api/consent-tracking
 */
class CookieBanner extends HTMLElement {
  constructor() {
    super();
    this.activeClass = 'is-visible';
    this.actionsSelector = '[data-action]';
    this.storageKeys = {
      session: 'bannerClosed',
      cookie: 'termsAccepted',
    };

    // selectors
    this.actions = this.querySelectorAll(this.actionsSelector);

    this.actions?.forEach((action) => {
      action.addEventListener('click', this.performAction.bind(this));
    });
  }

  connectedCallback() {
    this.addEventHandlers();
    if (Shopify.designMode && this.dataset.openInDesignMode === 'true') {
      return;
    }

    this.initBanner();
    this.loadShopifyScript();
  }

  addEventHandlers() {
    if (this.dataset.openInDesignMode === 'true') {
      document.addEventListener('shopify:section:select', (event) => {
        if (event.target.contains(this)) {
          this.classList.add(this.activeClass);
        }
      });

      document.addEventListener('shopify:section:deselect', (event) => {
        this.classList.remove(this.activeClass);
      });
    }
  }

  loadShopifyScript() {
    if (typeof window.Shopify === undefined) return;

    window.Shopify.loadFeatures(
      [
        {
          name: 'consent-tracking-api',
          version: '0.1',
        },
      ],
      (error) => {
        if (error) throw error;
      },
    );
  }

  initBanner() {
    const bannerClosed =
      sessionStorage.getItem(this.storageKeys.session) === 'true';
    const cookiesAccepted = getCookie(this.storageKeys.cookie) === 'true';

    if (bannerClosed) return;
    if (cookiesAccepted) return;
    this.classList.add(this.activeClass);
  }

  performAction(event) {
    event.preventDefault();
    const action =
      event.target.getAttribute('id') !== null
        ? event.target.getAttribute('id')
        : event.target.parentElement.getAttribute('id');
    if (!action) return;

    if (action === 'close-cookies') {
      sessionStorage.setItem(this.storageKeys.session, 'true');
      this.classList.remove(this.activeClass);
    }

    window.Shopify.customerPrivacy.setTrackingConsent(
      action === 'accept-cookies',
      () => {
        this.classList.remove(this.activeClass);
      },
    );
    setCookie(this.storageKeys.cookie, action === 'accept-cookies');
  }
}

customElements.define('cookie-banner', CookieBanner);
