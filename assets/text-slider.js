/**
 * Uses Swiper package to create a carousel for callout section
 * More info: https://swiperjs.com/
 */
class TextSlider extends HTMLElement {
  constructor() {
    super();

    this.currentIndex = 0;

    this.selectors = {
      slider: '[data-slider]',
      items: '[data-text-item]',
    };

    this.selectedMediaIndex =
      Number(
        this.querySelector(this.selectors.slider).querySelector(
          '[data-selected]',
        )?.dataset.index,
      ) || 0;
    this.settings = {
      elements: {
        slider: this.querySelector(this.selectors.slider),
        items: this.querySelectorAll(this.selectors.items),
      },
      instances: {
        slider: null,
      },
      options: {
        slider: {
          slidesPerView: 'auto',
          spaceBetween: 20,
          loop: true,
          watchOverflow: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          noSwiping: true,
        },
      },
    };
  }

  connectedCallback() {
    this.initSlider();
    this.initTextChane();
  }

  initSlider() {
    this.settings.instances.slider = new Swiper(
      this.settings.elements.slider,
      this.settings.options.slider,
    );
  }

  initTextChane() {
    this.changeActiveItem();

    setInterval(() => this.changeActiveItem(), 3000);
  }

  changeActiveItem() {
    const textItems = this.settings.elements.items;
    textItems.forEach((item) => item.classList.remove('current'));

    textItems[this.currentIndex].classList.add('current');
    this.currentIndex = (this.currentIndex + 1) % textItems.length;
  }
}

customElements.define('text-slider', TextSlider);
