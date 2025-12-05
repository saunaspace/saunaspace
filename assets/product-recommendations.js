class ProductRecommendations extends HTMLElement {
  constructor() {
    super();

    this.section = this.querySelector('.product-recommendations');

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector(
            '[data-container-products]',
          );

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.querySelector('[data-container-products]').innerHTML =
              recommendations.innerHTML;
            this.section.classList.remove('hidden');
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 200px 0px',
    }).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);
