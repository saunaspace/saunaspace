class DropdownDisclosure extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {console.log("dropdown-d");
    //this.init();
  }

  init() {
    this.querySelector('summary').addEventListener(
      'click',
      this.onSummaryClick.bind(this),
    );

    if (!this.hasAttribute('data-close-on-click')) return;

    this.linksWrapper = this.querySelector('[data-links]');

    this.addEventListener('click', (e) => {
      if (!e.target.hasAttribute('data-link')) return;

      this.querySelector('summary').click();
    });
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    isOpen
      ? this.close(event, summaryElement, detailsElement)
      : this.open(summaryElement, detailsElement);
  }

  open(summaryElement, detailsElement) {
    setTimeout(() => {
      detailsElement.classList.add('is-open');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(detailsElement, summaryElement);
  }

  close(event, summaryElement, detailsElement) {
    if (event === undefined) return;
    event.preventDefault();

    detailsElement.classList.remove('is-open');
    removeTrapFocus(summaryElement);
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      elapsedTime < 400
        ? window.requestAnimationFrame(handleAnimation)
        : detailsElement.removeAttribute('open');
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('dropdown-disclosure', DropdownDisclosure);
