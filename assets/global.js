/**
 * ----------------------------------------------------------------------
 * Helper functions list:
 * Cookies:
 * 1. setCookie - setting a browser cookie.
 * 2. getCookie - get cookie data by name.
 * 3. eraseCookie - remove cookie by name.
 *
 * Function calls:
 * 4. debounce - Used generally for scroll/input change/resize events to
 * avoid updating state too often.
 *
 * DOM Manipulation:
 * 5. bodyScroll - combining object used for body scroll locking.
 * 6. getFocusableElements - get focusable elements within a container.
 * 7. trapFocus - trap focus within a container.
 * 8. removeTrapFocus - remove the trap focus.
 * 9. pauseAllMedia - Pause all page media.
 * 10. getOffsetTop - Get offset from start of document.
 *
 * Data operations:
 * 11. serializeForm - turns formData into a JSON string. Accepts form el.
 * 12. decode - Decode a URI string.
 * 13. deepClone - get deep copy of an object.
 * 14. handleize - transform string to lowercase, replace spaces and low
 * dashes with a dash.
 * 15. fetchConfig - config object for a fetch request.
 * 
 * WUA
 * ----------------------------------------------------------------------
 */

/**
 * Debounce - group a series of sequential calls to a function
 * into a single call to that function after it stops getting
 * called for `wait` amount of ms.
 * @param {Function} fn
 * @param {Number} wait
 */
const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};

/**
 * Set cookie.
 * @param {String} name
 * @param {String} value
 * @param {Number} days
 * @returns Void
 */
const setCookie = (name, value, days) => {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

/**
 * Get cookie data.
 * @param {String} name
 * @returns {String|Null}
 */
const getCookie = (name) => {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Erase cookie value
 * @param {String} name
 */
const eraseCookie = (name) => {
  document.cookie = name + '=; Max-Age=-99999999';
};

/**
 * Body Scroll Lock global object.
 * Use this to ensure body scroll is locked across browsers and OS.
 * More info: https://github.com/willmcpo/body-scroll-lock#usage-examples
 */
const bodyScroll = {
  lock(container) {console.log("body Lock test");return;
    bodyScrollLock.disableBodyScroll(container);
  },
  unlock(container) {console.log("body Unlock test");return;
    bodyScrollLock.enableBodyScroll(container);
  },
  clear() {console.log("body Clear test");return;
    bodyScrollLock.clearAllBodyScrollLocks();
  },
};

/**
 * Get formatted price from number
 * @param amount {int} : number including cents without commas or periods
 * @param showCents {bool} : return price with cents included - Default: false
 * @param currency {string} : set currency type - Default: 'USD'
 * 
 * Examples:
 * formatToUSD(4500) => $4,500
 * formatToUSD(4500.60) => $4,501 (rounded)
 * formatToUSD(4500.25) => $4,500 (rounded)
 * formatToUSD(450.25, true) => $450.25
 * formatToUSD(2500, true) => $2,500.00
 */
function formatToUSD(amount, showCents = false, currency = 'USD') {
  const config = {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: (showCents) ? 2 : 0,
    minimumFractionDigits: (showCents) ? 2 : 0,
  };
  return new Intl.NumberFormat('en-US', config).format(amount);
}

/**
 * Get all focusable elements within a given container.
 * @param {DOM Element} container
 * @returns
 */
const getFocusableElements = (container) => {
  const selectors = [
    'summary',
    'a[href]',
    'button:enabled',
    '[tabindex]:not([tabindex^="-"])',
    '[draggable]',
    'area',
    'input:not([type=hidden]):enabled',
    'select:enabled',
    'textarea:enabled',
    'object',
    'iframe',
  ];
  return Array.from(container.querySelectorAll(selectors.join(',')));
};

const trapFocusHandlers = {};

/**
 * Remove trap focus.
 * @param {DOM Element} elementToFocus
 */
const removeTrapFocus = (elementToFocus = null) => {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
};

/**
 * Trap focus within a container.
 * @param {DOM Element} container to trap focus within
 * @param {DOM Element} elementToFocus on when focus trapped
 */
const trapFocus = (container, elementToFocus = container) => {
  const elements = getFocusableElements(container);
  const first = elements[0];
  const last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
};

/**
 * Adjust viewport-height css variable.
 */
['load', 'scroll', 'resize'].forEach((eventName) => {
  window.addEventListener(eventName, (e) => {
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`,
    );
  });
});

/**
 * Close Details element on Esc key press.
 * @param {Event Object} event
 */
const onKeyUpEscape = (event) => {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
};

/**
 * Serialize form.
 * @param {DOM Element} form
 * @returns {String} JSON Object
 */
const serializeForm = (form) => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

/**
 * Deep cloning of Object.
 * @param {Object} obj
 * @returns {Object} clone
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Handleize a string. Lowercase and replace spaces and low dashes
 * with a dash.
 * @param {String} str
 * @returns {String} Handleized string
 */
const handleize = (str) => str.replace(/[ /_]/g, '-').toLowerCase();

/**
 * Decode URI string
 * @param {String} str
 * @returns {String} Decoded string
 */
const decode = (str) => decodeURIComponent(str).replace(/\+/g, ' ');

/**
 * Get element offset from start of document.
 * @param {DOM Element} element
 * @returns {Number} Offset top
 */
const getOffsetTop = (element) => {
  let offsetTop = 0;

  do {
    if (!isNaN(element.offsetTop)) {
      offsetTop += element.offsetTop;
    }
  } while ((element = element.offsetParent));

  return offsetTop;
};

/**
 * Pause all media on page.
 */
function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*',
    );
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

/**
 * Configuration object for a fetch request.
 * @param {String} type of content.
 * @returns {Object} The fetch configuration.
 */
const fetchConfig = (type = 'json') => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': `application/${type}`,
      'Accept': `application/${type}`,
    },
  };
};

/**
 * Handle details aria attributes.
 */
document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute(
    'aria-expanded',
    summary.parentNode.hasAttribute('open'),
  );

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute(
      'aria-expanded',
      !event.currentTarget.closest('details').hasAttribute('open'),
    );
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

/**
 * Menu Drawer Custom element class.
 */
class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this)),
    );
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary'))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling);
      summaryElement.nextElementSibling.removeEventListener(
        'transitionend',
        addTrapFocus,
      );
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(summaryElement)
        : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        summaryElement.nextElementSibling.addEventListener(
          'transitionend',
          addTrapFocus,
        );
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    bodyScroll.lock(summaryElement.nextElementSibling);
  }

  closeMenuDrawer(elementToFocus = false) {
    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle
      .querySelectorAll('.submenu-open')
      .forEach((submenu) => {
        submenu.classList.remove('submenu-open');
      });
    bodyScroll.unlock(
      this.mainDetailsToggle.querySelector('summary').nextElementSibling,
    );
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute('open') &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement
      .querySelector('summary')
      .setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(
            detailsElement.closest('details[open]'),
            detailsElement.querySelector('summary'),
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

/** NOTE: Sticky header located at the bottom of this file. */

/**
 * Header drawer custom element class.
 */
class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    this.header =
      this.header ||
      document.querySelector(
        '#shopify-section-header header, .shopify-section-group-header-group header',
      );
    this.promoBar = this.getPromoBar();
    this.debouncedResize = debounce(() => {
      if (
        !window.matchMedia(
          `(min-width: ${this.getAttribute('data-breakpoint')}px)`,
        ).matches
      )
        return;

      this.closeMenuDrawer();
    }, 300);
    //window.addEventListener('resize', this.debouncedResize.bind(this));

    //window.addEventListener('scroll', this.updateHeaderTopPosition.bind(this));
  }

  openMenuDrawer(summaryElement) {
    this.updateHeaderTopPosition();
    this.header.classList.add('menu-open');
    document.body.classList.add('header-menu-open');
    super.openMenuDrawer(summaryElement);
  }

  closeMenuDrawer(elementToFocus) {
    super.closeMenuDrawer(elementToFocus);
    this.header.classList.remove('menu-open');
    document.body.classList.remove('header-menu-open');
  }

  updateHeaderTopPosition() {
    if (!this.promoBar) this.promoBar = this.getPromoBar();
    const promobarOffset = (this.promoBar) ? this.promoBar.offsetHeight : 0;
    const offset = (this.header.classList.contains("is-scrolled")) ? this.header.offsetHeight : this.header.offsetHeight + promobarOffset;
    console.log("offset",offset);
    document.documentElement.style.setProperty(
      '--header-top-position',
      `${parseInt(offset)}px`,
    );
  }

  getPromoBar() {
    let promoBar = document.querySelector('.js-promo-bar');
    if (!promoBar) promoBar = document.getElementById("qab_container");
    if (!promoBar) console.warn("No promobar found!");
    return promoBar;
  }
}

customElements.define('header-drawer', HeaderDrawer);

/**
 * Quantity Input custom element class.
 */
class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this)),
    );
  }

  onButtonClick(event) {
    event.preventDefault();

    const previousValue = this.input.value;

    event.target.name === 'increment'
      ? this.input.stepUp()
      : this.input.stepDown();

    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

/**
 * Modal opener custom element class.
 * Used in combination with ModalDialog for inserting a dialog
 * trigger in the document.
 * `data-modal` property connects the modal with the modal-opener.
 * Must contain a button element.
 */
class ModalOpener extends HTMLElement {
  constructor() {
    super();

    this.button = this.querySelector('button');

    if (!this.button) return;

    this.button.addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick() {
    this.modal = document.querySelector(this.getAttribute('data-modal'));

    if (this.modal) this.modal.show(this.button);
  }
}
customElements.define('modal-opener', ModalOpener);

/**
 * Modal dialog custom element class.
 * Inserts a modal that is connected to a modal-opener.
 */
class ModalDialog extends HTMLElement {
  constructor() {
    super();

    this.dialogHolder = this.querySelector('[role="dialog"]');
    this.buttons = this.querySelectorAll('[id^="ModalClose-"]');

    if (this.buttons) {
      this.buttons.forEach((button) => {
        button.addEventListener('click', this.hide.bind(this, false));
      });
    }

    this.addEventListener('keyup', (event) => {
      if (event.code?.toUpperCase() === 'ESCAPE') this.hide();
    });
    this.addEventListener('click', (event) => {
      if (event.target === this) this.hide();
    });
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    bodyScroll.lock(this.dialogHolder);
    document.body.classList.add("modal-active");
    this.setAttribute('open', '');
    trapFocus(this, this.dialogHolder);
    window.pauseAllMedia();
    const deferredMedia = this.querySelector('deferred-media');
    deferredMedia?.loadContent();
  }

  hide() {
    bodyScroll.unlock(this.dialogHolder);
    document.body.classList.remove("modal-active");
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.dialogHolder);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

/**
 * Deferred media custom element class.
 * Must contain a button and a template element
 */
class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  connectedCallback() {
    const nextEl = this.nextElementSibling;
    if (!nextEl) return;
    const videoPlayTrigger = nextEl.querySelector(`a[href*='.mp4'], a[href*='youtube'], a[href*='vimeo']`);

    if (videoPlayTrigger) {
      videoPlayTrigger.addEventListener("click", this.triggerLoadContent.bind(this));
    }
  }

  loadContent(focus = true) {
    console.log("load content");
    if (!this.classList.contains("js-open-in-modal")) {
      window.pauseAllMedia();
      if (!this.getAttribute('loaded')) {
        const content = document.createElement('div');
        const videoCnt = this.querySelector('template').content.firstElementChild.cloneNode(
          true,
        );console.log("another test", videoCnt);
        content.appendChild(
          videoCnt,
        );

        this.setAttribute('loaded', true);
        
        const deferredElement = this.appendChild(
          content.querySelector('.deferred-media__wrapper'),
        );
        
        if (focus) deferredElement.focus();
        
        if (this.querySelector("iframe.oembed")) {
          this.classList.add("has-oembed-video");
          this.openVideoFullscreen({ video: this.querySelector("iframe.oembed") });
        }
      }
    }
    else {
      openVideoLightbox(this.getOembedUrl());
    }
  }

  triggerLoadContent(e) {
    if (e) e.preventDefault();
    if (!this.classList.contains("js-open-in-modal")) {
      this.loadContent(false);
      this.openVideoFullscreen();
    }
    else {
      openVideoLightbox(this.getOembedUrl());
    }
  }

  openVideoFullscreen(e) {
    if (e && typeof e.preventDefault != "undefined") e.preventDefault();
    const video = (e && typeof e.video != "undefined") ? e.video : this.querySelector("video, iframe");
    if (!video) return;

    if (this.classList.contains("js-open-in-modal")) {
      openVideoLightbox(this.getOembedUrl());
      return;
    }

    if (this.classList.contains("js-open-fullscreen")) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {/* Firefox */
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {/* Chrome, Safari and Opera */
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {/* IE/Edge */
        video.msRequestFullscreen();
      }
    }
  }

  getOembedUrl() {
    let videoUrl = this.getAttribute("data-video");
    if (this.hasAttribute("data-video-id") && this.hasAttribute("data-oembed-type")) {
      const vidId = this.getAttribute("data-video-id");
      const vidType = this.getAttribute("data-oembed-type");
      const attributes = (vidType === "youtube") ? `autoplay=1&muted=1&loop=1&controls=1&rel=0` :  `autoplay=1&muted=1&loop=1&controls=1`;
      videoUrl = (vidType === "youtube") ? `https://www.youtube.com/embed/${vidId}?${attributes}` : `https://player.vimeo.com/video/${vidId}?${attributes}`;
    }
    console.log("video url", videoUrl);
    return videoUrl;
  }

}

customElements.define('deferred-media', DeferredMedia);

/**
 * Cart class for base cart actions
 * More info: https://shopify.dev/docs/api/ajax/reference/cart
 */
class Cart {
  /**
   * Get global live regions to update on cart change.
   * @returns {Array} Live region sections objects
   */
  static getLiveRegions() {
    return [
      {
        id: '#cart-counter',
        section: 'cart-counter',
        selector: '#shopify-section-cart-counter',
      },
    ];
  }

  /**
   * Add items to cart.
   * @param {Object} body Form data
   * @returns {Promise} Resolves with the cart object
   */
  static add(body) {
    if (!body) {
      return undefined;
    }

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    return fetch(`${routes.cart_add_url}`, {
      ...config,
      ...{ body },
    });
  }

  /**
   * Update cart quantity, properties and selling plan.
   * @param {String} body JSON object
   * @returns {Promise} Resolves with the cart object
   * @example Body: '{"line":1,"quantity":3}'
   */
  static update(body) {
    if (!body) {
      return undefined;
    }

    return fetch(`${routes.cart_change_url}`, {
      ...fetchConfig(),
      ...{ body },
    });
  }

  /**
   * Clear all items from cart.
   * @returns {Promise} Promise
   */
  static clear() {
    return fetch(`${routes.cart_clear_url}`, {
      ...fetchConfig(),
    });
  }

  /**
   * Get cart Object.
   * @returns {Promise} Resolves with the cart object
   */
  static get() {
    return fetch(`${routes.cart_url}`, {
      ...fetchConfig(),
    });
  }
}

/**
 * Product selector.
 *
 * Requirements:
 * 1. Options must have `data-name` attribute.
 * 2. Product form with unique ID.
 * 3. Price container must have unique ID.
 * 3. Component Attributes:
 *    1. data-url
 *    2. data-form-id
 *    3. data-price-id
 * -------------------------------
 * 4. Required scripts:
    <script type="application/json" data-variants-json>
      {{- product.variants | json -}}
    </script>

    <script type="application/json" data-variants-prices>
      [
        {%- for variant in product.variants -%}
          {%- capture price_html -%}
            {% render 'price', product_ref: product, variant: variant, use_variant: true %}
          {%- endcapture -%}
          {
            "id": {{ variant.id | json }},
            "price_html": {{ price_html | json }},
            "price_single": {{ variant.price | money | json }}
          }{%- unless forloop.last -%},{%- endunless -%}
        {%- endfor -%}
      ]
    </script>
 */

class ProductSelector extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * Connected callback.
   */
  connectedCallback() {
    this.form = document.querySelector(
      `form#${this.getAttribute('data-form-id')}`,
    );
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitButton = this.form.elements['add'];
    this.cartDrawer = document.querySelector('cart-drawer');
    this.variants = JSON.parse(
      this.querySelector('[data-variants-json][type="application/json"]')
        .textContent,
    );
    this.prices = JSON.parse(
      this.querySelector('[data-variants-prices]').textContent,
    );
    this.addEventListener('change', this.onVariantChange.bind(this));
    this.unavailableText = ` - ${window.variantStrings.unavailable}`;
    this.priceContainer = document.querySelector(
      `#${this.getAttribute('data-price-id')}`,
    );

    this.updateOptions();
    this.filterOptions();
  }

  /**
   * On submit handler.
   *
   * @param {Object} event
   * @returns {Void}
   */
  onSubmitHandler(event) {
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
   * On variant change.
   *
   * @param {Object} event
   * @returns {Void}
   */
  onVariantChange(event) {
    if (event.target.type === 'number') return;
    this.updateOptions();
    this.updateVariant();
    this.toggleAddButton(false, '');
    this.handleErrorMessage();
    this.filterOptions();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '');
      this.setUnavailable();

      return;
    }

    if (!this.currentVariant.available) {
      this.toggleAddButton(true, window.variantStrings.soldOut);
    }

    this.updateVariantInput();
    this.updatePrice();
  }

  /**
   * Update options.
   *
   * @returns {Void}
   */
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll('input[type="radio"]:checked, select'),
      (el) => ({ name: el.dataset.name, value: el.value }),
    );
  }

  /**
   * Update variant.
   *
   * @returns {Void}
   */
  updateVariant() {
    this.currentVariant = this.variants.find((variant) => {
      return !variant.options
        .map((option, index) => this.options[index]?.value === option)
        .includes(false);
    });

    this.currentVariantPrice = this.prices.find((priceObj) => {
      return priceObj.id === this.currentVariant?.id;
    });
  }

  /**
   * Update variant input.
   *
   * @returns {Void}
   */
  updateVariantInput() {
    const input = this.form?.elements['id'];

    if (!input) {
      return;
    }

    input.value = this.currentVariant?.id;
  }

  /**
   * Set unavailable.
   *
   * @returns {Void}
   */
  setUnavailable() {
    if (!this.submitButton) return;
    this.submitButton.textContent = window.variantStrings.unavailable;
    this.priceContainer?.classList.add('visually-hidden');
  }

  /**
   * Render product info.
   *
   * @returns {Void}
   */
  updatePrice() {
    if (!this.priceContainer || !this.currentVariantPrice?.price_html) {
      return;
    }

    this.priceContainer.classList.remove('visually-hidden');
    this.priceContainer.innerHTML = this.currentVariantPrice.price_html;
  }

  /**
   * Toggle add button.
   *
   * @param {Boolean} disable
   * @param {String} text
   * @returns {Void}
   */
  toggleAddButton(disable, text) {
    if (!this.submitButton) {
      return;
    }

    if (disable) {
      this.submitButton.setAttribute('disabled', 'disabled');
      if (text) this.submitButton.textContent = text;

      return;
    }

    this.submitButton.removeAttribute('disabled');
    this.submitButton.textContent = window.variantStrings.addToCart;
  }

  /**
   * Filter unavailable options.
   * Toggles 'is-unavailable' attribute based on options availability.
   *
   * @returns {Void}
   */
  filterOptions() {
    for (const [key, { name }] of this.options.entries()) {
      this.querySelectorAll(`[data-name="${name}"]`).forEach((swatch) => {
        const selectOptions = swatch.querySelectorAll('option');
        if (selectOptions.length) {
          return selectOptions.forEach((option) => {
            if (this.isOptionAvailable(key, option.value)) {
              return (option.innerHTML = option.innerHTML.replace(
                this.unavailableText,
                '',
              ));
            }

            if (option.innerHTML.includes(this.unavailableText)) return;

            option.innerHTML = `${option.innerHTML}${this.unavailableText}`;
          });
        }

        return swatch.classList.toggle(
          'is-unavailable',
          !this.isOptionAvailable(key, swatch.value),
        );
      });
    }
  }

  /**
   * Is option available.
   * Check if at least one available variant that contains this option exists.
   *
   * @param {Number} index
   * @param {String} value
   * @returns {Boolean}
   */
  isOptionAvailable(index, value) {
    return this.variants.some((variant) => {
      if (!variant.available) return false;

      const valuesToCheck = {};
      const currentHandle = `option${index + 1}`;

      for (let i = 0; i < index; i++) {
        const optionHandle = `option${i + 1}`;
        const optionValue = this.options[i].value;
        valuesToCheck[optionHandle] = optionValue;
      }

      valuesToCheck[currentHandle] = value;

      return Object.entries(valuesToCheck).every(
        ([handle, value]) => variant[handle] === value,
      );
    });
  }
}

customElements.define('product-selector', ProductSelector);

/**
 * Change header theme.
 * REMOVED: Moved this function to the sticky header function
 */
/*
const header = document.querySelector('.js-header');
function changeHeaderTheme() {
  if (!header) return;
  const offset = header.offsetHeight

  if (scrollY > offset) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}
window.addEventListener('scroll', changeHeaderTheme);
window.addEventListener('load', changeHeaderTheme);
*/

/**
 * Set header height.
 * REMOVED: Setting heights with CSS instead.
 * Need the values to be fixed, and to be the values when the header is at the top since it changes height when not at top
 */
const setHeaderHeight = () => {
  const header = document.querySelector('.js-header');
  const promoBar = document.querySelector('.js-promo-bar');

  document.documentElement.style.setProperty(
    '--header-height',
    `${header.offsetHeight}px`,
  );

  document.documentElement.style.setProperty(
    '--promo-bar-height',
    `${promoBar ? promoBar.offsetHeight : 0}px`,
  );
};

//window.addEventListener('load', setHeaderHeight);
//window.addEventListener('resize', setHeaderHeight);
//window.addEventListener('scroll', setHeaderHeight);

// WUA
/**
 * Sticky header
 */
stickyHeader();
function stickyHeader() {
  const header = document.querySelector(".shopify-section.site-header .js-header");
  const promoBar = document.querySelector(".js-promo-bar");
  //setup();
  initScrollClasses();

  function setup() {
    const headerElements = document.querySelectorAll(".js-sticky-header-item");
    const main = document.getElementById("MainContent");
    const firstSec = main.firstChild;
    headerElements.forEach(el => {
      main.insertBefore(el, firstSec);
    });
  }
  function initScrollClasses() {
    let lastScroll = 0;
    const body = document.body;
    const updateWithDebounce = debounce(updateScrollClasses, 10);
    let headerHeight = getHeaderHeight();

    window.addEventListener('load', updateScrollClasses);
    window.addEventListener('scroll', updateWithDebounce);
    window.addEventListener('resize', updateHeaderHeight);

    function updateScrollClasses() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      //console.log(currentScroll);
      const isAtTop = currentScroll <= 0;
      const isScrollingDown = currentScroll > lastScroll;
      const isScrollingUp = currentScroll < lastScroll;
      const buffer = 300;
      if (isAtTop) {
        body.classList.remove('scrolling-down', 'scrolling-up');
        body.classList.add('at-top');
        header.classList.remove('is-scrolled');
      }
      else {
        body.classList.remove('at-top');
        if (isScrollingDown) {
          body.classList.remove('scrolling-up');
          body.classList.add('scrolling-down');
          changeHeaderTheme('down');
        }
        // Added buffer because the height of the header changes when not at the top
        // This was causing it to kind of glitch when you first start to scroll down because
        // the height change throws the scroll position off and makes it look like they're scrolling up
        // for a split second when they're really scrolling down
        else if (isScrollingUp && currentScroll > buffer) {
          body.classList.remove('scrolling-down');
          body.classList.add('scrolling-up');
          changeHeaderTheme('up');
        }
      }
      // Quick nav (Learn more pages)
      body.classList.toggle('pagenav-active', currentScroll > 150);
      // Extra scroll classes
      body.classList.toggle('header-scrolled', currentScroll > headerHeight);
      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    }
    function changeHeaderTheme(scrollDir) {
      const offset = (!promoBar) ? 0 : promoBar.getBoundingClientRect().bottom;
      if (scrollY > offset) {
        header.classList.add('is-scrolled');
      }
      else {
        header.classList.remove('is-scrolled');
      }
    }
    function updateHeaderHeight(e) {
      const newHeaderHeight = getHeaderHeight();
      if (newHeaderHeight !== null) headerHeight = newHeaderHeight;
    }
    function getHeaderHeight() {
      const rootEl = document.documentElement;
      const headerHeightString = getComputedStyle(rootEl).getPropertyValue('--header-height');
      if (typeof headerHeightString !== "undefined" && headerHeightString != '') {
        return parseInt(headerHeightString);
      }
      else return null;
    }
  }
  function init_with_scrolltrigger() {
    if (typeof gsap === "undefined") { console.warn("GSAP NOT FOUND!"); return; }
    gsap.registerPlugin(ScrollTrigger);
    let st = ScrollTrigger.create({
      trigger: header,
      pin: true,
      start: "top top",
      end: "+=" + document.body.scrollHeight,
      toggleClass: "pinned",
      anticipatePin: 1,
      //markers: true,
    });
    console.log("header scrolltrigger", st);
  }
}


/**
 * Promo Bar
 */
initPromoBar();
function initPromoBar() {
  const promoBar = document.querySelector(".js-promo-bar");
  const promoCloseBtn = document.querySelector(".js-promo-close");
  if (!promoBar || !promoCloseBtn) return;

  updateVar();
  promoCloseBtn.addEventListener("click", closePromoBar);

  function updateVar() {
    document.documentElement.style.setProperty(
      '--promo-bar-height',
      `${promoBar ? promoBar.offsetHeight : 0}px`,
    );
  }
  function closePromoBar(e) {
    if (e) e.preventDefault();
    slideUp(promoBar.parentElement);
  }
  function slideUp(element, duration = 500) {
    if (!element) return;
    element.style.transition = `height ${duration}ms ease-in-out`;
    element.style.overflow = 'hidden';
    const originalHeight = element.offsetHeight;
    element.style.height = `${originalHeight}px`;

    // Trigger the transition
    requestAnimationFrame(() => {
      element.style.height = '0px';
    });

    // After the transition, reset the element
    setTimeout(() => {
      element.style.display = 'none';
      element.style.height = `${originalHeight}px`;
      element.style.transition = '';
      element.style.overflow = '';
      // update --promo-bar-height
      updateVar();
    }, duration);
  }
}


/**
 * Search popup
 */
searchPopup();
function searchPopup() {
  const searchPopup = document.getElementById("search-popup");
  const popupTrigger = document.querySelector(".js-search-popup-trigger");
  if (!searchPopup || !popupTrigger) return;

  popupTrigger.addEventListener("click", openSearchPopup);
  searchPopup.querySelector(".js-search-popup-close").addEventListener("click", closeSearchPopup);

  
  function openSearchPopup(e) {
    if (e) e.preventDefault();
    document.body.classList.add("search-popup-opened");
    searchPopup.classList.add("open");
  }
  function closeSearchPopup(e) {
    if (e) e.preventDefault();
    document.body.classList.remove("search-popup-opened");
    searchPopup.classList.remove("open");
  }
}


/**
 * Navigation Parent Links that are not supposed to be linkable
 */
fixDeadParentLinks();
function fixDeadParentLinks() {
  const deadParentLinks = document.querySelectorAll(".header__nav-links-item > a[href='#'], .header-drawer__submenu-item > a[href='#']");
  if (!deadParentLinks) return;
  deadParentLinks.forEach(link => link.addEventListener('click', e => e.preventDefault()) );
}


/**
 * Details/Summary (Accordion)
 * Closes other open accordion tabs
 */
accordionFix();
function accordionFix() {
  const sections = document.querySelectorAll("section.faq.scheme-1");
  sections.forEach(initSection);


  function initSection(section) {
    const accordionItems = section.querySelectorAll("details");
    if (!accordionItems) return;
    accordionItems.forEach(addListener);

    function addListener(item) {
      item.querySelector("summary").addEventListener("click", closeOpenedItems);
    }
    function closeOpenedItems(e) {
      const thisAccordion = this.closest('details');
      thisAccordion.classList.add('current-active');
      accordionItems.forEach(item => {
        if (item.hasAttribute("open") && ! item.classList.contains("current-active")) item.removeAttribute("open");
        if (typeof ScrollTrigger != "undefined") setTimeout(() => { ScrollTrigger.refresh(); }, 100);
      });
      thisAccordion.classList.remove('current-active');
    }
  }
}



/**
 * Video Popups
 * Open a video into a popup
 * @param videoUrl {string}
 */
initVideoLightBox();
function initVideoLightBox() {
  document.addEventListener("click", closeVideoPopup);
  const triggers = document.querySelectorAll(`.hero-banner__actions a[href*=".mp4"], .hero-banner__actions a[href*=".youtube"], .hero-banner__actions a[href*=".vimeo"], .js-video-popup, [data-video-popup]`);

  triggers.forEach(initPopupTrigger);


  function initPopupTrigger(trigger) {
    if (!trigger.hasAttribute('data-video-popup') && !trigger.hasAttribute('href')) return console.warn("Item does not have video attribute", trigger);
    const videoUrl = (trigger.hasAttribute('data-video-popup')) ? trigger.getAttribute('data-video-popup') : trigger.getAttribute("href");
    if (!videoUrl) return console.warn("No video url found", trigger);

    trigger.addEventListener("click", openVideo);

    function openVideo(e) {
      e.preventDefault();
      openVideoLightbox(videoUrl);
    }
  }
  function closeVideoPopup(e) {
    if (e.target.classList.contains("js-video-popup-close")) {
      e.preventDefault();
      const closeBtn = e.target;
      const modal = closeBtn.closest(".video-popup-modal");
      if (!modal) return console.error("No modal found!", closeBtn);
      const video = modal.querySelector("video");
      if (video) video.pause();
      modal.remove();
      document.body.classList.remove("video-modal-active");
    }
  }
}
function openVideoLightbox(videoUrl) {
  if (typeof videoUrl != "string") return console.error("No video url found!");
  const popup = document.createElement("div");
  popup.classList.add(...["video-popup-modal", "active"]);
  const popupHTML = getPopupTemplate(videoUrl).replaceAll("{{ videoUrl }}", videoUrl);
  popup.innerHTML = popupHTML;
  document.body.append(popup);
  document.body.classList.add("video-modal-active");
  if (videoUrl.includes(".mp4")) {
    setTimeout(() => {
      document.querySelector(".video-popup-modal video").play();
    }, 500);
  }

  function getPopupTemplate(videoUrl) {
    const videoType = getVideoType(videoUrl);
    const closeBtn = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M4.835,4.835a1.143,1.143,0,0,1,1.618,0L12.5,10.884l6.047-6.049a1.144,1.144,0,0,1,1.618,1.618L14.115,12.5l6.049,6.047a1.144,1.144,0,0,1-1.618,1.618L12.5,14.115,6.453,20.164a1.144,1.144,0,1,1-1.618-1.618L10.884,12.5,4.835,6.453a1.143,1.143,0,0,1,0-1.618Z" transform="translate(-4.499 -4.499)" fill="currentColor"></path></svg>`;
    let videoHTML = '';
    if (videoType === "HTML") {
      videoHTML = `<div class="video-cnt">
                    <video src="{{ videoUrl }}" class="video-popup-video" playsinline muted controls></video>
                  </div>`;
    }
    else if (videoType === "YouTube" || videoType === "Vimeo") {
      const iframeHTML = getIframeHTML(videoType);
      videoHTML = `<div class="oembed-cnt">
                    ${iframeHTML}
                  </div>`;
    }
    else videoHTML = `<h4 style="color:white;">Sorry there was an error loading the video. Please try again</h4>`;
    return `
    <div class="video-popup-overlay"></div>
    <div class="video-popup" data-video="{{ videoUrl }}">
      <button class="video-popup-close js-video-popup-close" aria-label="close video">${closeBtn}<span>Close</span></button>
      <div class="video-popup-content-cnt">
        ${videoHTML}
      </div>
    </div>
    `;
  }
  function getIframeHTML(oembedType) {
    const iframeAttributes = (oembedType === "YouTube") ? `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` : `webkitallowfullscreen mozallowfullscreen`;
    return `<iframe src="{{ videoUrl }}" class="video-popup-oembed oembed-type--${oembedType}" width="100%" height="auto" frameborder="0" style="aspect-ratio:16/9" ${iframeAttributes}></iframe>`;
  }
  function getVideoType(url) {
    // Regular expressions for YouTube and Vimeo URLs
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
  
    if (youtubeRegex.test(url)) {
      return 'YouTube';
    } else if (vimeoRegex.test(url)) {
      return 'Vimeo';
    } else if (url.includes(".mp4")) {
      return "HTML";
    }
    else {
      return 'None';
    }
  }
}



/**
 * Chart sections with videos
 * Set video with play button and mute button
 */
chartWVideosInit();
function chartWVideosInit() {
  const videos = document.querySelectorAll("section.chart .chart__image video");
  if (videos) videos.forEach(setupTable);

  function setupTable(video) {
    window.addEventListener("load", () => video.play());// TEMP - ToDo: Add play and mute buttons and setup function 5.15
  }
}



/**
 * Discount Code - Dr Stacked Discounts app
 */
initDiscountCodeEvents();
function initDiscountCodeEvents() {
  document.body.addEventListener('docapp-discount-applied', discountUpdated);

  function discountUpdated(e) {
    //console.log("discount updated", e);
    if (typeof e.cart === "undefined" || typeof e.cart.total_price === "undefined") return;
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return console.error("No cart drawer found!");
    const subtotalText = cartDrawer.querySelector(".st-actual");
    if (!subtotalText) return;
    const subtotal = Math.ceil(e.cart.total_price * 0.01);
    //console.log("money format test", formatToUSD(subtotal));
    subtotalText.textContent = `${formatToUSD(subtotal)} USD`;
  }
}



/**
 * What's in the box - Dropdown Sections
 */
witbDDInit();
function witbDDInit() {
  const ddTriggers = document.querySelectorAll(".js-witb-trigger");
  ddTriggers.forEach(initTrigger);

  function initTrigger(trigger) {
    //console.log("js-witb-trigger", trigger);
    trigger.addEventListener("click", updateSection);

    function updateSection(e) {
      const section = trigger.closest('.witb-w-dropdown');
      const index = trigger.dataset.index;
      //console.log("index", index);
      const bgImg = section.querySelector(`.js-bg-item[data-index="${index}"]`);
      //console.log("matching bg image", bgImg);

      trigger.closest('details').querySelectorAll('button')
        .forEach(button => button.classList.toggle('is-active', button === trigger));
      trigger.closest('details').querySelector('summary span').textContent = trigger.textContent;
      trigger.closest('section').querySelectorAll('[data-rte]')
        .forEach(wrapper => wrapper.classList.toggle('hidden', wrapper.dataset.handle !== trigger.dataset.handle));
      trigger.closest('details').removeAttribute('open');

      section.querySelectorAll(`.js-bg-item`).forEach(bgItem => {
        bgItem.classList.toggle("is-active", bgItem.getAttribute("data-index") == index);
        console.log(bgItem);
      });
    }
  }
}


/**
 * TrueMed Popups
 */
truemedPopupInit();
function truemedPopupInit() {
  $(".js-truemed-trigger").on("click", triggerTruemedWidget);

  function triggerTruemedWidget(e) {
    if (e) e.preventDefault();
    const $truemedCnt = $(".truemed-instructions");
    if (!$truemedCnt.length) { console.warn("No true med container found"); return; }
    const $truemedTrigger = $truemedCnt.find(".truemed-instructions-open, button");
    if (!$truemedTrigger.length) { console.warn("No trumed trigger found"); return; }
    console.log("TRUMED TRIGGER",$truemedTrigger);
    $truemedTrigger.trigger("click");
  }
}



/**
 * SplitIt Popups
 */
splititPopupInit();
function splititPopupInit() {
  $(".js-splitit-trigger").on("click", triggerSplititModal);
  //window.splititmodalopen = triggerSplititModal;

  function triggerSplititModal(e) {
    if (e) e.preventDefault();
    const $modalTrigger = $(".js-splitit-modal-trigger button");
    if (!$modalTrigger.length) return console.error("No splitit modal trigger found!");
    $modalTrigger.trigger("click");
  }
}



/**
 * Text with Tables - (.shopify-section.sec--text-w-table[-alt] .chart)
 * Setup table - replace numbers with dots to match the design
 * Setup scroll event to toggle class on scroll-end scroll begining
 */
txtWTablesInit();
function txtWTablesInit() {
  const tables = document.querySelectorAll("section.chart .chart__content table");
  if (tables) tables.forEach(setupTable);
  const chartContainers = document.querySelectorAll("section.chart .chart__content, .table-comparison .table-comparison__content");
  if (chartContainers) chartContainers.forEach(setupContainer);

  function setupContainer(scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;

      // Check for the beginning of the scroll
      if (scrollLeft === 0) {
        scrollContainer.classList.add("at-beginning");
      } else {
        scrollContainer.classList.remove("at-beginning");
      }

      // Check for the end of the scroll (with tolerance for sub-pixel precision)
      if (Math.abs(scrollWidth - scrollLeft - clientWidth) <= 1) { // {Link: Stack Overflow says: scrollTop is a non-rounded number, while scrollHeight and clientHeight are rounded — so the only way to determine if the scroll area is scrolled to the bottom is by seeing if the scroll amount is close enough to some threshold (in this example, that should be 1).}
        scrollContainer.classList.add("at-end");
      } else {
        scrollContainer.classList.remove("at-end");
      }
    });
  }
  function setupTable(table) {
    const td = table.querySelectorAll("tr > td");
    if (td) td.forEach(cell => {
      const content = cell.textContent;
      //console.log(content,isNaN(content));
      if (isNaN(content)) return;
      const number = parseInt(content);
      let html = '';
      for(var i=0;i<number;i++) {
        html += `<span class="table-star"></span>`;
      }
      cell.innerHTML = html;
    });
  }
}



/**
 * Live Chat Triggers
 * Links with the url "#live-chat" will trigger the live chat button
 */
liveChatTriggers();
function liveChatTriggers() {
  const lcTriggers = document.querySelectorAll(`a[href*="#live-chat"]`);
  lcTriggers.forEach(trigger => {
    trigger.addEventListener("click", triggerChatButton);
  });

  function triggerChatButton(e) {
    if (e) e.preventDefault();
    if (typeof GorgiasChat != "undefined") GorgiasChat.open();
    else console.warn(`"window.GorgiasChat" variable is undefined`);
  }
}


/**
 * Trademark icon fix
 * wraps "®" text inside span for customization throughout site
 */
trademarkFix();
function trademarkFix() {
  const textElements = document.querySelectorAll("p,h1,h2,h3,h4,h5,h6,a:not(.article__image)");
  textElements.forEach(el => {
    if (el.textContent.includes("®")) {
      if (!el.querySelector("span.tm")) {
        const content = el.innerHTML.replace(/®/g, '<span class="tm">®</span>');
        el.innerHTML = content;//console.log(el, el.innerHTML);
      }
    }
  });
}
function trademarkFixJquery() {
  const $textElements = $("p,h1,h2,h3,h4,h5,h6,a");
  $textElements.each((i,el) => {
    const $this = $(el);
    if ($this.text().includes("®")) {
      if (!$this.find("span.tm").length) {console.log("tr fix",$this);
        const _html = $this.html().replace(/®/g, '<span class="tm">®</span>');
        $this.html(_html);
      }
    }
  });
}



/**
 * Read More - setup a section that has readmore items, update swiper instance after read more button is clicked (optional)
 * section: {obj/HTML Element} - Section with readmore items
 * readmoreContentItems: {obj/NodeList} - Elements that contain the read more text
 * lineLimit: {int} - Limit of number of lines of text before applying the read more button (default: 4)
 * swiperInstance: {obj} - Swiper instance to be updated after the readmore trigger is clicked (optional)
 */
function readmoreInit(section, readmoreContentItems, lineLimit = 4, swiperInstance = false) {
  if (typeof section === "undefined" || typeof readmoreContentItems === "undefined") return;
  /*readmoreTextSetup*/wrapTextAfterLines(readmoreContentItems, lineLimit);
  window.addEventListener('resize', function() {
    setTimeout(() => { debounce(/*readmoreTextSetup*/wrapTextAfterLines(readmoreContentItems, lineLimit), 100) }, 200);
  });
  section.addEventListener('click', readmoreTriggerClick);


  function readmoreTriggerClick(e) {
    const target = e.target;
    if (target.classList.contains('readmore-trigger')) {
      target.parentElement.nextSibling.classList.add("show");
      target.parentElement.remove();
      if (swiperInstance != false) swiperInstance.update();
    }
  }
}
/**
 * Read More Text Setup - limit text by number of lines (default 4), wraps remaining text in <span>, add readmore trigger button (optional)
 */
function wrapTextAfterLines(selector, maxLines = 4, addButton = true) {
  // Validate maxLines
  if (!Number.isInteger(maxLines) || maxLines < 1) {
    console.error('maxLines must be a positive integer');
    return;
  }

  // Select all elements matching the provided selector
  const elements = (typeof selector === "object") ? selector : document.querySelectorAll(selector);//document.querySelectorAll(selector);
  if (elements instanceof NodeList) elements.forEach(elementInit);
  else elementInit(elements);

  function elementInit(element) {
    // Check if element already been setup for readmore. If so remove the readmore span and trigger button before re-running setup function
    const readmoreContent = element.querySelector(".readmore-content");
    const readmoreVisible = element.querySelector(".readmore-visible");
    const readmoreTrigger = element.querySelector(".rm-trigger-wrap");
    if (readmoreContent) readmoreContent.replaceWith(...readmoreContent.childNodes);
    if (readmoreVisible) readmoreVisible.replaceWith(...readmoreVisible.childNodes);
    if (readmoreTrigger) readmoreTrigger.remove();
    // Store the original HTML to restore later if needed
    const originalHTML = element.innerHTML;
    const originalText = element.textContent;

    // Split content into text segments and <br> tags
    const segments = [];
    let currentText = '';
    element.childNodes.forEach(node => {
      if (node.nodeType === 3) { // Text node
        currentText += node.textContent;
      } else if (node.nodeName === 'BR') {
        if (currentText) {
          segments.push({ type: 'text', content: currentText });
          currentText = '';
        }
        segments.push({ type: 'br' });
      }
    });
    if (currentText) {
      segments.push({ type: 'text', content: currentText });
    }

    // Wrap each word in text segments with a span for line detection
    let spanIndex = 0;
    element.innerHTML = segments.map(segment => {
      if (segment.type === 'text') {
        const words = segment.content.trim().split(/\s+/);
        return words.map(word => `<span data-index="${spanIndex++}">${word}</span>`).join(' ');
      } else {
        return '<br>';
      }
    }).join('');

    // Count lines, considering both <br> tags and soft line breaks
    const spans = element.querySelectorAll('span');
    let lineCount = 0;
    let currentTop = null;
    let maxLineEndIndex = -1;
    let currentSpanIndex = 0;

    segments.forEach(segment => {
      if (segment.type === 'br') {
        lineCount++; // <br> forces a new line
        currentTop = null; // Reset top position for next line
      } else if (segment.type === 'text') {
        const words = segment.content.trim().split(/\s+/);
        words.forEach((_, i) => {
          const span = spans[currentSpanIndex];
          if (span) {
            const rect = span.getBoundingClientRect();
            if (currentTop === null || rect.top > currentTop) {
              lineCount++;
              currentTop = rect.top;
            }
            if (lineCount === maxLines) {
              maxLineEndIndex = parseInt(span.getAttribute('data-index'));
            }
            currentSpanIndex++;
          }
        });
      }
    });

    // If more than maxLines, wrap text after the specified line in a span
    if (lineCount > maxLines && maxLineEndIndex !== -1) {
      // Rebuild content, splitting at the specified line
      let wordsBefore = [];
      let wordsAfter = [];
      let currentIndex = 0;

      segments.forEach(segment => {
        if (segment.type === 'br') {
          if (currentIndex <= maxLineEndIndex) {
            wordsBefore.push('<br>');
          } else {
            wordsAfter.push('<br>');
          }
        } else {
          const words = segment.content.trim().split(/\s+/);
          words.forEach(word => {
            if (currentIndex <= maxLineEndIndex) {
              wordsBefore.push(word);
            } else {
              wordsAfter.push(word);
            }
            currentIndex++;
          });
        }
      });

      // Reconstruct HTML with the span for extra lines
      const beforeText = wordsBefore.join(' ').replace(/<br>\s*/g, '<br>');
      const afterText = wordsAfter.join(' ').replace(/<br>\s*/g, '<br>');
      const btnHTML = (addButton) ? '<span class="rm-trigger-wrap"><button aria-label="read more" class="readmore-trigger"><span>Read More</span></button></span>' : '';
      element.innerHTML = `<span class="readmore-visible">${beforeText}</span>${afterText ? ` ${btnHTML}<span class="readmore-content">${afterText}</span>` : ''}`;
    }
    else {
      // Restore original HTML if maxLines or fewer lines
      element.innerHTML = originalHTML;
    }
  }
}
// - Replaced this becuase didn't handle <br> tags
function readmoreTextSetup(selector, lineCountLimit = 4, addButton = true) {
  // Select all elements matching the provided selector
  const elements = (typeof selector === "object") ? selector : document.querySelectorAll(selector);

  elements.forEach(element => {
    // Check if element already been setup for readmore. If so remove the readmore span and trigger button before re-running setup function
    const readmoreContent = element.querySelector(".readmore-content");
    const readmoreTrigger = element.querySelector(".readmore-trigger");
    if (readmoreContent) readmoreContent.replaceWith(...readmoreContent.childNodes);
    if (readmoreTrigger) readmoreTrigger.remove();
    // Create a temporary span to wrap each word for line detection
    const words = element.textContent.trim().split(/\s+/);
    element.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');

    // Get all spans (each containing a word)
    const spans = element.querySelectorAll('span');
    let lineCount = 0;
    let currentTop = null;
    let limitLineEndIndex = -1;

    // Iterate through spans to count lines
    spans.forEach((span, index) => {
      const rect = span.getBoundingClientRect();
      if (currentTop === null || rect.top > currentTop) {
        // New line detected
        lineCount++;
        currentTop = rect.top;
      }
      // Track the index of the last span in the lineCountLimit line
      if (lineCount === lineCountLimit) {
        limitLineEndIndex = index;
      }
    });

    // If more than lineCountLimit, wrap text after the line limit in a span
    if (lineCount > lineCountLimit && limitLineEndIndex !== -1) {
      const originalText = element.textContent;
      // Restore original text
      element.innerHTML = originalText;

      // Split text into before and after line limit
      let wordsBefore = [];
      let wordsAfter = [];
      let currentSpanIndex = 0;

      words.forEach((word, i) => {
        if (currentSpanIndex <= limitLineEndIndex) {
          wordsBefore.push(word);
        } else {
          wordsAfter.push(word);
        }
        currentSpanIndex++;
      });

      // Rebuild the content with the text after lineCountLimit line wrapped in a span
      const btnHTML = (addButton) ? '<span class="rm-trigger-wrap"><button aria-label="read more" class="readmore-trigger"><span>Read More</span></button></span>' : '';
      element.innerHTML = `${wordsBefore.join(' ')} ${btnHTML}<span class="readmore-content">${wordsAfter.join(' ')}</span>`;
    }
    else {
      // Restore original text if fewer lines than lineCountLimit
      element.innerHTML = element.textContent;
    }
  });
}



/**
 * Hero - Oembed Sections
 */
heroOembedInit();
function heroOembedInit() {
  const $sections = $(".js-hero-oembed");
  $sections.each(initSection);
  
  function initSection(i, section) {
    const $sec = $(section);
    const $iframe = $sec.find("iframe");
    const $cta = $sec.find("a");

    $cta.on("click", playOembed);

    function playOembed(e) {
      if (e) e.preventDefault();
      if ($iframe.is("[data-src]") && $iframe.attr("data-src") != "") {
        $iframe.attr("src", $iframe.attr("data-src"));
      }
      $sec.addClass("oembed-active");
    }
  }
}


/**
 * SilverLining Image Animation
 * 
 * Sections: text-and-deferred-media.liquid
 * NOTE: To setup section for silverlining sparkle animation make sure section id = "sl-animation"
 */
slAnimationSections();
function slAnimationSections() {
  const $sec = $("#sl-animation");
  if (!$sec.length) return;

  initAnimation();

  function initAnimation() {
    const $imgCnt = $sec.find(".text-and-deferred-media__image");
    if (!$imgCnt.length) return console.warn("No image container found!", $sec);
    $imgCnt.addClass("fabric-image").append(`<div class="sparkle-overlay"></div>`);
    const $animationCnt = $sec.find(".sparkle-overlay");

    sparkle();

    function sparkle() {
      let sparklesEnabled = true;
      let sparkleInterval;
      const sparkleOverlay = $animationCnt.get(0);
      // For subtle use 800. For intense use 150. Default 300.
      let interval = 100;
      const winWidth = $(window).width();
      if (winWidth > 2000) interval = interval / 2;
      else if (winWidth > 1600) interval = interval / 1.5;
      else if (winWidth < 1023 && winWidth > 550) interval = interval * 1.5;
      else if (winWidth <= 550) interval = interval * 1.75;
      
      // Initialize sparkles
      sparkleInterval = setInterval(createSparkle, interval);//console.log("interval",interval);

      // Create initial burst of sparkles
      for (let i = 0; i < 5; i++) {
        setTimeout(createSparkle, i * 100);
      }


      function createSparkle() {
        if (!sparklesEnabled) return;
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        // Random sparkle type
        const types = ['normal', 'large-cross', 'cross']; // options are: normal, large, cross, large-cross
        const randomType = types[Math.floor(Math.random() * types.length)];
        if (randomType !== 'normal') {
          sparkle.classList.add(randomType);
        }

        // Random position
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';

        // Random animation delay and duration
        const delay = Math.random() * 2;
        const duration = (Math.random() * 2 + 1.5);
        const totalTime = delay + duration + .1;
        //console.log(Math.ceil(totalTime * 1000));
        sparkle.style.animationDelay = delay + 's';
        sparkle.style.animationDuration = duration + 's';

        sparkleOverlay.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
          }
        }, Math.ceil(totalTime * 1000));
      }

    }
  }
}



/**
 * Scrolltriggers
 */
initScrolltriggers();
function initScrolltriggers() {
  const $stTriggers = $(".js-st-trigger");
  if (!$stTriggers.length) return;
  if (typeof gsap === "undefined") { console.warn("GSAP NOT FOUND!"); return; }

  gsap.registerPlugin(ScrollTrigger);
  $stTriggers.each(initST);


  function initST(i,el) {
    const $el = $(el);
    const defaultOptions = {
      trigger: el,
      pin: false,
      start: "top top",
      end: "bottom top",
      toggleClass: "element-scrolled",
      anticipatePin: 1,
      markers: (window.location.search.includes("test")),
    };
    let stOptions = defaultOptions;
    if (el.hasAttribute("data-st-options")) {
      const dataOptions = JSON.parse(el.dataset.stOptions);
      if (typeof dataOptions !== "undefined") stOptions = { ...defaultOptions, ...dataOptions };
      else console.warn("There was an issue with the st data options", el);
    }

    const st = ScrollTrigger.create(stOptions);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  const scrolledPercent = (scrollTop / docHeight) * 100;

  if (scrolledPercent > 15) {
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});


  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});












/**
 * TEMPORARY - Update URLs to pages that have different templates
 */
//tempUpdateLinks();
function tempUpdateLinks() {console.log("Page links updated (Temporary)");
  const linkUpdates = [
    ["/products/firelight-infrared-sauna", "build-pay-now", "/products/firelight-infrared-sauna-builder"],
    //["/pages/sauna-product-learn-more", "benefits-firelight"],
    //["/pages/100-day-home-trial", "trial"],
    //["/pages/warranty", "guarantee"]
  ];
  const links = document.querySelectorAll("a");
  
  links.forEach(updateLink);

  function updateLink(link) {
    const href = link.getAttribute("href");
    if (!href) return;
    linkUpdates.forEach(info => {
      if (href.includes(info[0])) {
        const url = (info.length > 2) ? info[2] : info[0];
        link.setAttribute("href", url + "?view=" + info[1]);
      }
    });
  }
}
/**
 * TEMPORARY - Hide Shopify preview bar
 */
if (window.location.search.includes("admin")) {
  console.warn("preview bar is being hidden");
  $("#PBarNextFrameWrapper").css("visibility", "hidden");
}




