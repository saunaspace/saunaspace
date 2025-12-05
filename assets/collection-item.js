if (!customElements.get('collection-item')) {
  class CollectionItem extends HTMLElement {
    constructor() {
      super();

      this.buttonLoadMore = this.querySelector('[data-button-load-more]');

      if (!this.buttonLoadMore) return;

      this.itemsWrapper = this.querySelector('[data-items]');

      this.setHeight();

      window.addEventListener('resize', () => {
        const matchesBreakpoint = window.matchMedia(
          this.dataset.breakpoint,
        ).matches;

        if (matchesBreakpoint) return;

        this.setHeight();
      });

      this.buttonLoadMore.addEventListener('click', (e) => {
        this.itemsWrapper.style.setProperty('--max-height', 'none');
        this.classList.add('is-expanded');
      });
    }

    setHeight() {
      if (this.classList.contains('is-expanded')) return;

      const lastVisibleItem = this.itemsWrapper.querySelector(
        `.card-product:nth-child(${this.dataset.itemsLimit})`,
      );

      const overlayHeight = 200;
      const height =
        lastVisibleItem.offsetTop +
        lastVisibleItem.offsetHeight +
        overlayHeight;

      this.itemsWrapper.style.setProperty('--max-height', `${height}px`);
    }
  }

  customElements.define('collection-item', CollectionItem);
}
