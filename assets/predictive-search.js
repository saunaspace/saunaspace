class PredictiveSearch extends MenuDrawer {
  constructor() {
    super();

    this.cachedResults = {};
    this.input = this.querySelector('input[role="combobox"]');
    this.predictiveSearchResults = this.querySelector(
      'predictive-search-results',
    );

    this.setupEventListeners();
  }

  openMenuDrawer(summaryElement) {
    super.openMenuDrawer(summaryElement);
    setTimeout(() => {
      this.input.focus();
    }, 50);
  }

  setupEventListeners() {
    const form = this.querySelector('form');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener(
      'input',
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this),
    );
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  hasQuery() {
    return !!this.getQuery().length;
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!this.hasQuery()) {
      this.close(true);
      return;
    }

    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.hasQuery() || this.querySelector('[aria-selected="true"] a') || this.closest("#search-popup"))
      event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!this.hasQuery()) return;

    if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(
      `${routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm,
      )}&${encodeURIComponent(
        'resources[type]',
      )}=product,article,page&${encodeURIComponent(
        'resources[limit]',
      )}=5&section_id=predictive-search`,
    )
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search').innerHTML;
        this.cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  populateSearchResults(html = '') {
    this.predictiveSearchResults.innerHTML = html;
  }

  renderSearchResults(resultsMarkup) {
    this.populateSearchResults(resultsMarkup);
    this.open();
  }

  open() {
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
  }

  close(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('open');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
  }
}

customElements.define('predictive-search', PredictiveSearch);
