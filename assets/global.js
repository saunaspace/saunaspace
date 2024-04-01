function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

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

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
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
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
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
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
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
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const button = item.querySelector('a');
      if (index === this.currentPage - 1) {
        if (button) button.removeAttribute('tabindex');
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (button) button.setAttribute('tabindex', '-1');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {

  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    console.log('variant change');
    // console.log('variant'+this);
    
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    // this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      console.log("currentVariant Global id"+this.currentVariant);
      var productId = $(".mineClass").attr('data-product-id');
      console.log("currentProduct Global id"+ productId);
      if (
        productId == 2105477365849 ||
        productId == 2105476743257 ||
        productId == 2105475661913 ||
        productId == 2105476546649 ||
        productId == 2105477726297 ||
        productId == 2105475956825 ||
        productId == 6809896288299
      ) {
        var currentVariant = this.currentVariant;
        this.filterVariant(currentVariant.featured_image, productId);
      }
      console.log("currentVariant Global ends"+this.currentVariant);
      
      this.updateMedia();
      // var elements = document.querySelectorAll('.ForTemplateName');
      // var check = 0;
      // elements.forEach(function(element) {
      // var dataTemplateValue = element.getAttribute('data-template');
      //   if(check == 0){
      //   if (dataTemplateValue == 'custombundle') {
      //     this.updateURL();
      //     check = 1;
      //   }
      //   }
      // });
      this.updateURL();
      
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      this.updateVariantLeadTime(this.currentVariant);
    }
     this.changeVariantfunction();
     this.bundleItmesShange();
     this.updatePriceArray();
     this.updatePrices();
  }
  changeVariantfunction(){
  var previousTitle = null;
  var currentTitle = this.getCurrentTitle();
  if (previousTitle == null) {
           previousTitle = currentTitle;
      } 
  console.log("currentTitleNew"+ currentTitle);
  console.log("previousTitleNew"+ previousTitle);
  var optionsText = [];
    $(".select__select.retrive_selected_option").each(function(index, option) { 
        var optionText = $(this).attr('data-option-parent');
        optionsText.push(optionText);
    });
  console.log(optionsText);
  var changeInfo = getChangedIndexValue(currentTitle, previousTitle);
  console.log('changeInfo as JSON:', JSON.stringify(changeInfo));
  if (changeInfo.indexes && changeInfo.parts) {
      console.log("double changed");
      for (var i = 0; i < changeInfo.indexes.length; i++) {
            // console.log(changeInfo.parts[i] + " " + changeInfo.indexes[i]);
            console.log("value :" + changeInfo.parts[i]);
            console.log("option changed :" + optionsText[changeInfo.indexes[i] - 1]);
            $('.bundle_item.required').each(function() {
                var $optionMain = $(this).find('.option-main');
                var $selectTags = $optionMain.find('select').filter(function() {
                    return $(this).attr('data-trim-option').indexOf(optionsText[changeInfo.indexes[i] - 1]) !== -1;
                });
                var siblingSelectTags = $selectTags.siblings('select[data-trim-option]');
                console.log("siblingSelectTags");
                console.log(siblingSelectTags);
                console.log("siblingSelectTags.length");
                console.log(siblingSelectTags.length);
                var valuesArray = [];
                if (siblingSelectTags.length > 0){
                    console.log("greater then 1 so make logic");
                    siblingSelectTags.each(function() {
                      var text = $(this).val();
                      valuesArray.push(text);
                    });
                    console.log("other Values are:: "+ valuesArray);
                    $selectTags.each(function() {
                      var $selectTag = $(this);
                      console.log("$selectTag Val");
                      console.log($selectTag.val());
                      if($selectTag.val() != changeInfo.parts[i] ){
                           console.log("need to change because child is not like parent");
                            var hiddenVar = $(this).closest($optionMain).siblings('.hidden-variants').find('.hidden-variant-title');
                            hiddenVar.each(function() {
                              var variantTitle = $(this).data('variant-title');
                              var variantId = $(this).data('variant-id');
                              var variantPrice = $(this).data('variant-price');
                              var variantImage = $(this).data('variant-image');
                              var match = valuesArray.every(function(value){
                                  return variantTitle.includes(value);
                              }) && variantTitle.includes(changeInfo.parts[i]);
                              if (match) {
                                  console.log("Vneeeeeeeeeeeeeeeeee");
                                  console.log("Variant Title: " + variantTitle);
                                    console.log("Variant ID: " + variantId);
                                    console.log("Variant Price: " + variantPrice);
                                    console.log("Variant Image: " + variantImage);
                                    $($selectTag).val(changeInfo.parts[i]);
                                    var dropdownContent = $('div[data-option-name="'+optionsText[changeInfo.indexes[i] - 1]+'"].dropdown-content small');
                                
                                    dropdownContent.each(function() {
                                          var $small = $(this);
                                          var spanText = $small.find('span').text();
                                          console.log("spanText: " + spanText);
                                      
                                          if (spanText === changeInfo.parts[i]) {
                                              console.log('matched');
                                              var imageUrl = $small.find('img').attr('src');
                                              var $dropbtn = dropdownContent.closest('.dropdown-content').siblings('.dropbtn');
                                              console.log($dropbtn);
                                              if (imageUrl) {
                                                  $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              } else {
                                                  $dropbtn.html('<span>'+changeInfo.parts[i]+'</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              }
                                              return false; 
                                          }
                                      });
                                    bundleItmesShange();
                              }else{
                                  console.log("eeerrrrrrrrrr");
                              }
                            });
                      }else{
                        console.log('no neeeded change');
                      }
                      return false;
                    });
                 }
                 else{
                    console.log("less then one");
                     $selectTags.each(function() {
                        console.log("BundleOptions matched!");
                        var $selectTag = $(this);
                         console.log("$selectTag Val");
                         console.log($selectTag.val());
                         if($selectTag.val() != changeInfo.parts[i] ){
                           console.log("need to change because child is not like parent");
                            var hiddenVar = $(this).closest($optionMain).siblings('.hidden-variants').find('.hidden-variant-title');
                            hiddenVar.each(function() {
                                var variantTitle = $(this).data('variant-title');
                                if (variantTitle == changeInfo.parts[i]) {
                                    var variantId = $(this).data('variant-id');
                                    var variantPrice = $(this).data('variant-price');
                                    var variantImage = $(this).data('variant-image');
                                    console.log("Variant Title: " + variantTitle);
                                    console.log("Variant ID: " + variantId);
                                    console.log("Variant Price: " + variantPrice);
                                    console.log("Variant Image: " + variantImage);
                                    $($selectTag).val(variantTitle);
                                    var dropdownContent = $('div[data-option-name="'+optionsText[changeInfo.indexes[i] - 1]+'"].dropdown-content small');
                                    dropdownContent.each(function() {
                                          var $small = $(this);
                                          var spanText = $small.find('span').text();
                                          if (spanText === variantTitle) {
                                              console.log('matched');
                                              var imageUrl = $small.find('img').attr('src');
                                              var $dropbtn = dropdownContent.closest('.dropdown-content').siblings('.dropbtn');
                                              console.log($dropbtn);
                                              if (imageUrl) {
                                                  $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              } else {
                                                  $dropbtn.html('<span>'+ variantTitle +'</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              }
                                              return false;
                                          }
                                      });
                                    bundleItmesShange();
                                }
                            });
                         }else{
                           console.log("no need to change");
                         }                        
                     });
                 }
            });
            console.log("next changed option and value");
        }
  }
  else{
      console.log("single changed");
  }
  previousTitle = currentTitle;
}
  getChangedIndexValue(previousTitle, currentTitle) { 
    var previousTitleArray = previousTitle.split(' / ');
    var currentTitleArray = currentTitle.split(' / ');
    var maxLength = Math.max(previousTitleArray.length, currentTitleArray.length);
    var result = {};

    if (previousTitle === currentTitle) {
        result.indexes = [];
        result.parts = [];
        for (var i = 0; i < maxLength; i++) {
            result.indexes.push(i + 1);
            result.parts.push(previousTitleArray[i]);
        }
    } 
    else {
        var firstIndexChanged = false;
        for (var i = 0; i < maxLength; i++) {
            if (i >= previousTitleArray.length || i >= currentTitleArray.length) {
                break;
            }
            if (previousTitleArray[i] !== currentTitleArray[i]) {
                result.index = i + 1;
                result.previousValue = previousTitleArray[i];
                result.currentValue = currentTitleArray[i];
                firstIndexChanged = true;
                break;
            }
        }

        if (!firstIndexChanged && previousTitleArray.length !== currentTitleArray.length) {
            var changedTitle = previousTitleArray.length < currentTitleArray.length ? currentTitleArray : previousTitleArray;
            result.index = maxLength + 1;
            result.changedValue = changedTitle[maxLength];
        } else if (!firstIndexChanged) {
            result.index = null;
            result.changedValue = null;
        }
    }

    return result;
}
  getCurrentTitle() {
    var resultStrings = $('.select__select.retrive_selected_option').map(function() {
      return $(this).find('option:selected').text().trim(); // Trim whitespace
    }).get();
  
    return resultStrings.length === 1 ? resultStrings[0] : resultStrings.join(' / ');
  }
  filterVariant(variant, PID) {
  console.log('thumbnail updated in global.js ' + variant.alt);
  if (variant != null && variant.alt != null) {
    $('[data-thumbnail-color]').hide();
    // Show for selected color
    var selected_color = variant.alt;
    var general_color = "[data-thumbnail-color='general']";
    var thumbnail_selector = '[data-thumbnail-color="' + selected_color + '"]';
    $(thumbnail_selector).show();
    
    // Apply additional filtering based on product ID
    switch (PID) {
      case 2105477365849:
      case 2105476743257:
        $('[data-media-position]').filter(function() {
          return $(this).data('media-position') >= 13;
        }).show();
        break;
      case 2105476546649:
        console.log('emf page');
        $('[data-media-position]').filter(function() {
          return $(this).data('media-position') >= 6;
        }).show();
        break;
      case 2105475661913:
        $('[data-media-position]').filter(function() {
          return $(this).data('media-position') >= 11;
        }).show();
        break;
      case 2105477726297:
        console.log('emf page');
        $('[data-media-position]').filter(function() {
          return $(this).data('media-position') >= 7;
        }).show();
        break;
      case 2105475956825:
        console.log('tungsten page');
        $('[data-media-position]').filter(function() {
          return $(this).data('media-position') >= 10;
        }).show();
        break;
    }
    $(general_color).show();
  } else {
    // Show all thumbnails if variant is not selected
    $('[data-thumbnail-color]').show();
  }
}
  bundleItmesShange(){
  $('.bundle_item').each(function() {
    var optionValues = [];
    $(this).find('select[data-trim-option]').each(function() {
        optionValues.push($(this).val());
    });
    if (optionValues.length > 0) {
        var resultString = optionValues.join(' / ');
        // Loop through each .hidden-variants .hidden-variant-title element
        $('.hidden-variants .hidden-variant-title').each(function() {
            // Check if the text of the current element matches resultString
            if ($(this).text() === resultString) {
                // If it matches, retrieve the associated data attributes and log them
                var variantId = $(this).data('variant-id');
                var variantPrice = $(this).data('variant-price');
                var variantImage = $(this).data('variant-image');
                console.log("cureent text:", $(this).text())
                console.log("Variant ID:", variantId);
                
                console.log("Variant Price:", variantPrice);
                console.log("Variant Image:", variantImage);
                if (variantImage.includes("no-image-")) {
                      console.log("Variant Image contains 'no-image-'");
                      variantImage =  $(this).closest(".hidden-variants").attr('data-product-image');
                      console.log("imageee"+ variantImage);
                    
                  } else {
                      console.log("Variant Image does not contain 'no-image-'");
                  }
                $(this).closest('.bundle_item').attr('data-variant', variantId);
                $(this).closest('.bundle_item').attr('data-price', variantPrice);

                // Update the src and alt attributes of the variant image
                var $variantImage = $(this).closest('.bundle_item').find('.varImage');
                $variantImage.attr('src', variantImage);
                $variantImage.attr('alt', $(this).text());
                optianlItmesChange();
            }
        });
    }
});
}
  optianlItmesChange(){
  $('.bundle_item.optional').each(function() {
    var optionValues = [];
    $(this).find('select[data-trim-option]').each(function() {
        optionValues.push($(this).val());
    });
    if (optionValues.length > 0) {
        var resultString = optionValues.join(' / ');
        console.log("we are here");
        $(this).find('.hidden-variants .hidden-variant-title').each(function() {
            if ($(this).text() === resultString) {
                var variantId = $(this).data('variant-id');
                var variantPrice = $(this).data('variant-price');
                var variantImage = $(this).data('variant-image');
                console.log("cureent text:", $(this).text())
                console.log("Variant ID:", variantId);
                
                console.log("Variant Price:", variantPrice);
                console.log("Variant Image:", variantImage);
              
                if (variantImage.includes("no-image-")) {
                      console.log("Variant Image contains 'no-image-'");
                     variantImage =  $(this).closest(".hidden-variants").attr('data-product-image');
                    
                      console.log("imageee"+ variantImage);
                    
                  } else {
                      console.log("Variant Image does not contain 'no-image-'");
                  }
                $(this).closest('.bundle_item.optional').attr('data-variant', variantId);
                $(this).closest('.bundle_item.optional').attr('data-price', variantPrice);

                // Update the src and alt attributes of the variant image
                var $variantImage = $(this).closest('.bundle_item.optional').find('.varImage');
                $variantImage.attr('src', variantImage);
                $variantImage.attr('alt', $(this).text());
            }
        });
    }
});
}
  updatePriceArray() { 
    console.log(".bundle_item.required");
    console.log($(".bundle_item.required").length);
    var array_string = "";
    var variant_array_string = "";
    $(".bundle_item.required").each(function() {
        if ($(this).attr("data-checked") == '0') {
            var price = $(this).attr("data-price");
            var child_variant = $(this).attr("data-variant");

            if (price !== undefined) {
                array_string += price + ", ";
            }
          if (child_variant !== undefined) {
            variant_array_string += child_variant + ", ";
          }
        }
    });
    array_string = array_string.slice(0, -2);
    variant_array_string = variant_array_string.slice(0, -2);
    console.log(array_string);
    $("#price_array").val(array_string);
    console.log("variant_array_string form function!");
    console.log(variant_array_string);
    $("#child_varinats").val(variant_array_string);
}
  updatePrices() {
  const b_discount = parseFloat($("#discount_hidden").val());
  const b_type = $("#discount_type_hidden").val();
  let b_price = $("#price_array").val();
  console.log("Price Array:", b_price);
  // const p_price_item = parseInt($('.customclassForPrice .price__regular .price-item--regular').attr('data-price'));
  // var p_price_item = $(".customclassForPrice .price__regular .price-item--regular").attr("data-amount");
  var p_price_item;
  var $priceItem = $(".customclassForPrice .price__regular .price-item--regular");
  if ($priceItem.attr("data-amount")) {
      p_price_item = $priceItem.attr("data-amount");
  } else {
      p_price_item = $priceItem.attr("data-price");
  }
  console.log("Price:currency::"+p_price_item);
  p_price_item = parseFloat(p_price_item.replace(/[^\d.]/g, ""));
  const child_varianid = $("#child_varinats").val();
  console.log("Price:::", p_price_item);
  console.log("variantid:", child_varianid);
  this.updateRegularPrice(b_discount, b_type, b_price, p_price_item, child_varianid);
}
  updateRegularPrice(b_discount, b_type, b_price, p_price_item, child_varianid) {
  let final_price = 0;
  let priceArray = b_price.split(",").map(Number);
  let variantArray = child_varianid.split(",").map(Number);
  console.log(priceArray);
  let sum_price = priceArray.reduce((sum, price) => sum + Number(price), 0);
  let total_price = p_price_item + sum_price;
  // Calculate final price based on discount type
  if (b_type === "percentage") {
    final_price = total_price - (total_price * (b_discount || 0)) / 100;
  } else if (b_type === "fixed") {
    final_price = total_price - b_discount;
  }
      // Format final_price with commas
    var formattedFinalPrice = final_price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Format total_price with commas
    var formattedTotalPrice = total_price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
  console.log("compare at price:++++++++" + formattedTotalPrice);
  console.log("price:++++++++++++" + formattedFinalPrice);
    setTimeout(function() {
      $(".customclassForPrice .price__regular .price-item.price-item--regular").text("$" + formattedFinalPrice  + " USD");
      $(".campare_at_price").text("$" + formattedTotalPrice  + " USD");
      $(".campare_at_price").css("text-decoration", "line-through");
      $(".customclassForPrice .price__regular").css("display","block");
      console.log("Ends");
    },2000);
}
  
  updateVariantLeadTime(currentVariant){
    //find all the variant descriptions with the data attribute that we added
    console.log('variant lead time');
    const variants = document.querySelectorAll('[data-variant-id]')
  
    variants.forEach( function(variant) {
      //hide all variant descriptions
      variant.style.display = 'none';
      if(variant.dataset.variantId == currentVariant.id){
        //if current variant unhide the variant description
        variant.style.display = 'block'
      }
      });
  }
  updateOptions() {
    console.log(Array);
    this.options = Array.from(document.querySelectorAll('select.retrive_selected_option'), (select) => select.value);
    console.log(this.options);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    console.log('update media ran');
    console.log(this.currentVariant.featured_media);
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    var element = document.querySelector('variant-selects');
    var dataSectionValue = element.getAttribute('data-section');

    const mediaGallery = document.getElementById(`MediaGallery-${dataSectionValue}`);
    // const mediaGallery = document.querySelectorAll('media-gallery');
    console.log('mediaGallery' + mediaGallery);
    
    mediaGallery.setActiveMedia(`${dataSectionValue}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${dataSectionValue} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    var element = document.querySelector('variant-selects');
    var dataSectionValue = element.getAttribute('data-url');
    if (!this.currentVariant || dataSectionValue === 'false') return;
    window.history.replaceState({ }, '', `${dataSectionValue}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;
    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    console.log("setUnavailable");
    console.log(this.dataset.section);
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
   this.variantData = this.variantData || JSON.parse($('[type="application/json"][data-custom-attribute="custom-value"]').text());
    console.log(this.variantData);
    return this.variantData;
  }
  
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

var navOpen=false
var currentNavOpen="";
var isIE11=false;
var cartOpen=false

if(navigator.userAgent.indexOf('MSIE')!==-1
|| navigator.appVersion.indexOf('Trident/') > -1){
  isIE11=true;
}

$(".nav-right").on("click",function() {
	closeMegaNav();
	if(cartOpen) {
    console.log("cart is open");
		$(".nav-full-cart").addClass("hideMe");
		$(".overlay").addClass("hideMe");
		cartOpen=false
	} else {
		$(".nav-full-cart").removeClass("hideMe");
		$(".overlay").removeClass("hideMe");
		cartOpen=true
	}
});

// $(".overlay").on("click",function() {
// 	closeMegaNav();
// 	$(".nav-full-cart").addClass("hideMe");
// 	cartOpen=false
// });

//opens or closes the mega-nav
$(".nav-link").on("click",function() {
	var n=$(this).attr("id");
	$(".nav-full-cart").addClass("hideMe");
	$(".mega-nav").addClass("hideMe");
  cartOpen=false
	if(currentNavOpen==n) {
		closeMegaNav();
    cartOpen=false
		// $(".overlay").addClass("hideMe");
	} else {
		// $(".overlay").removeClass("hideMe");
		currentNavOpen=n;
    cartOpen=false
		navOpen=true;
		$(".nav-close").addClass("hideMe");
		$(".nav-arrow").removeClass("hideMe");
		$("#" + n + " .nav-close").removeClass("hideMe");
		$("#" + n + " .nav-arrow").addClass("hideMe");
		$("." + n + "MN").removeClass("hideMe");
	}
});

//close the mega-nav when clicking on the hamburger to reveal util-nav on mobile
$(".nav-head-close, #ham").on("click",function() {
	closeMegaNav();
});

function closeMegaNav() {
		$(".overlay").addClass("hideMe");
		$(".mega-nav").addClass("hideMe");
		$(".nav-close").addClass("hideMe");
		$(".nav-arrow").removeClass("hideMe");
		currentNavOpen="";
		navOpen=false;
} 

var currentReviewsCarouselWidth=$(".review-carousel").width() + 40;
function scrollReviews(v) {
	tileSize=406; //includes right margin
	numTiles=parseInt(currentReviewsCarouselWidth / tileSize);
	timeToScroll=numTiles * 200;
	moveAmt=numTiles * tileSize  * v;
	$(".review-carousel").animate( { scrollLeft: '+=' + moveAmt }, timeToScroll);
}

function createObserver(o) {
	window['observer' + o] = new IntersectionObserver(window['onChange' + o], options);
	window['observer' + o].observe(eval(o));
}

"use strict";

const el = document.querySelector(".navBG");
const observer = new IntersectionObserver(([e]) => e.target.classList.toggle("stuck", e.intersectionRatio < 1), {
  threshold: [1]
});
observer.observe(el);

window.addEventListener("resize", function() {
	currentRelatedCarouselWidth=$(".related-carousel").width() + 40;
	currentThumbsCarouselWidth=$(".product-thumbs").width() + 20;
	currentReviewsCarouselWidth=$(".review-carousel").width() + 40;
});

$(".cc").on("click",function() {
	whichProduct=$(this).attr("data-productID")
	whichProductCode=$(this).attr("data-productCode")
	whichColor=$(this).attr("data-colorCode")
	tileLink=whichProductCode;
	baseURL=$("#" + tileLink).attr("data-url")
	$("#" + tileLink).attr({"href":baseURL + "#" + whichColor});
	
	$(".p" + whichProduct).removeClass("color-choice-on").addClass("color-choice-off");
	$(this).addClass("color-choice-on");
	$(".img" + whichProduct).attr("src","/assets/" + whichProductCode + "-" + whichColor + "-tile.jpg");
	$(".price" + whichProduct).html($(this).attr("data-colorPrice"));
});

$(document).on('click','.ccrp',function() {
	whichProduct=$(this).attr("data-productID");
	whichProductCode=$(this).attr("data-productCode");
	whichColor=$(this).attr("data-colorCode");
  	whichImage=$(this).attr("data-image");
	$(".p" + whichProduct).removeClass("color-choice-on").addClass("color-choice-off");
	$(this).addClass("color-choice-on");
	$(".img" + whichProduct).attr("srcset",whichImage);
	$(".price" + whichProduct).html($(this).attr("data-colorPrice"));
	tileLink="rp" + whichProductCode;
	baseURL=$("#" + tileLink).attr("data-url");
	$("#" + tileLink).attr({"href":baseURL + "#" + whichColor});
});



(function($){

var mini_cart = $('.go-cart__mini-cart');

$('.js-go-cart-mini-close').on('click', function(e){
  e.stopPropagation();

    mini_cart.removeClass('is-open');
});



})(jQuery);
