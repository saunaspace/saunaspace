if (!customElements.get('load-more')) {
  class LoadMore extends HTMLElement {
    constructor() {
      super();
    }

    handleClick(event) {
      const target = event.target.closest('[js-load-more]');

      if (!target) return;

      event.preventDefault();

      fetch(target.getAttribute('href'))
        .then((res) => res.text())
        .then((text) => {
          const html = new DOMParser().parseFromString(text, 'text/html');

          const newGrid = html.querySelector('[js-blog-grid]');
          if (!newGrid) return;

          target.parentElement.outerHTML = newGrid.innerHTML;
        })
        .catch((err) => console.log(err));
    }

    connectedCallback() {
      this.addEventListener('click', this.handleClick.bind(this));
    }
  }

  customElements.define('load-more', LoadMore);
}
