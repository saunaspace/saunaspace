if (!customElements.get('product-featured')) {
  class ProductFeatured extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        swatch: '[data-swatch]',
        media: '[data-product-media]',
        image: '[data-product-image]',
        productLink: '[data-product-link]',
      };

      this.variants = JSON.parse(
        this.querySelector('[type="application/json"][data-variants]')
          .textContent,
      );

      this.variantsImages = JSON.parse(
        this.querySelector('[type="application/json"][data-variants-images]')
          .textContent,
      );
    }

    connectedCallback() {
      this.swatches = this.querySelectorAll(this.selectors.swatch);
      this.media = this.querySelector(this.selectors.media);
      this.image = this.querySelector(this.selectors.image);
      this.productLinks = this.querySelectorAll(this.selectors.productLink);

      this.swatches.forEach((swatch) => {
        swatch.addEventListener('change', this.onSwatchChange.bind(this));
      });
    }

    onSwatchChange(e) {
      const { optionPosition } = e.target.dataset;

      const formatString = (string) => {
        return string?.toLowerCase().replaceAll(' ', '-');
      };

      const filtered = this.variants.filter((variant) => {
        return (
          formatString(variant.options[optionPosition]) ===
          formatString(e.target.value)
        );
      });

      let link = this.productLinks[0].href;

      if (link.includes('?')) {
        link = link.split('?')[0];
      }

      this.productLinks.forEach((productLink) => {
        productLink.href = `${link}?variant=${filtered[0].id}`;
      });

      const newImage = this.getImage(filtered[0].id);

      // New image is the same as the current image
      if (this.image.src.split('//')[1] === newImage.src.split('//')[1]) return;

      this.media.classList.add('is-loading');

      this.image.addEventListener(
        'transitionend',
        () => {
          this.image.src = newImage.src;
          this.image.srcset = newImage.srcset;
          this.image.onload = () => {
            this.media.classList.remove('is-loading');
            this.media.classList.add('is-loaded');
          };
        },
        { once: true },
      );
    }

    getImage(variantId) {
      return this.variantsImages.filter(
        (variant) => variant.id === variantId,
      )[0].image;
    }
  }

  customElements.define('product-featured', ProductFeatured);
}
