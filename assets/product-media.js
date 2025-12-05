/**
 * Uses Swiper package to create a carousel for product media
 * More info: https://swiperjs.com/
 */
class ProductMedia extends HTMLElement {
  constructor() {
    super();

    this.selectors = {
      slider: '[data-slider]',
      thumbs: '[data-thumbs]',
      mediaItem: '[data-media-id]',
    };
    this.selectedMediaIndex =
      Number(
        this.querySelector(this.selectors.slider)?.querySelector(
          '[data-selected]',
        )?.dataset.index,
      ) || 0;
    this.settings = {
      elements: {
        slider: this.querySelector(this.selectors.slider),
        thumbs: this.querySelector(this.selectors.thumbs),
      },
      instances: {
        slider: null,
        thumbs: null,
      },
      options: {
        slider: {
          effect: 'fade',
          initialSlide: this.selectedMediaIndex,
          spaceBetween: 20,
          watchOverflow: true,
          navigation: {
            prevEl: this.querySelector('.swiper-arrow--prev'),
            nextEl: this.querySelector('.swiper-arrow--next'),
          },
          pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true,
          },
        },
        thumbs: {
          initialSlide: this.selectedMediaIndex,
          direction: 'vertical',
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    };
  }

  connectedCallback() {
    this.init();
  }

  init() {
    if (!this.settings.elements.slider || !this.settings.elements.thumbs)
      return;

    this.settings.instances.thumbs = new Swiper(
      this.settings.elements.thumbs,
      this.settings.options.thumbs,
    );
    this.settings.options.slider.thumbs = {
      swiper: this.settings.instances.thumbs,
    };

    this.settings.instances.slider = new Swiper(
      this.settings.elements.slider,
      this.settings.options.slider,
    );
  }

  setActiveMedia(id) {
    const mediaFound = Array.from(
      this.querySelectorAll(this.selectors.mediaItem),
    ).find((media) => Number(media.dataset.mediaId) === id);
    if (!mediaFound) return;
    this.settings.instances.slider.slideTo(Number(mediaFound.dataset.index));
  }
}

customElements.define('product-media', ProductMedia);
