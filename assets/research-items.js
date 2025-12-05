(() => {
/**
 * NOTE: Testing this out. For now research-items is not being defined (at bottom of page)
 */
if (customElements.get('research-items')) {
  return;
}

research_articles_page_init();
async function research_articles_page_init() {
  const section = document.querySelector(".js-research-items");
  if (!section) return;
  section.classList.add("loading");
  const tags = getBlogTags();console.log("tags",tags);
  if (!tags || tags.length < 1) return;
  let articles = await getArticles();console.log("articles", articles);
  if (!articles || articles.length < 1) return;
  const articlesByTag = getArticlesByTags(articles);console.log("articlesByTag",articlesByTag);
  const articlesByLetter = getArticlesByLetter(articles);console.log("articlesByLetter",articlesByLetter);
  const sortByTriggers = document.querySelectorAll(".js-sortby");
  const filterTriggers = document.querySelectorAll("[data-filter] input[name='filter']");
  const mobileFiltersToggle = document.querySelector("[data-filters-toggle]");
  
  renderArticles();
  section.classList.remove("loading");
  sortByTriggers.forEach(trigger => trigger.addEventListener("change", updateSortBy) );
  filterTriggers.forEach(trigger => trigger.addEventListener("change", scrollToSection) );
  mobileFiltersToggle.addEventListener("click", toggleMobileFilters);
  checkUrlForFiltering();

  // TO DO:
  // Setup letter and tag filters to be dynamic based off of research articles pulled in - not rendered by the backend like it currently is
  // Create fallback for if article loading fails


  // On Load - Check URL for initial filtering
  function checkUrlForFiltering(e) {
    const hash = window.location.hash;
    if (hash === "") return;
    scrollToSection(hash);
  }
  // Scroll to Group when filter is clicked
  function scrollToSection(e) {
    const trigger = (typeof e === "object") ? e.currentTarget : document.querySelector(e);
    const id = trigger.getAttribute("id").replace("letter-","").toLowerCase();
    //console.log(`%cFilter clicked - id: ${id}`, "color:green");
    const target = document.querySelector(`.research-items__group[data-group="${id}"]`);
    if (!target) { console.warn("No section target found for this filter!", id, target); return; }
    //console.log("Section scroll-to target", target);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Only showing one filter at a time right now so we are going to remove the check property on all the other filters
    // Could change the input type to radio but the client may want to show actually filter articles instead of just scrolling down to section
    clearFilterCheckboxes(id);
  }
  function clearFilterCheckboxes(id) {
    document.querySelectorAll("[data-filter] input[name='filter']").forEach(input => {
      input.checked = (id === input.getAttribute("id").replace("letter-","").toLowerCase());
    });
  }
  function toggleMobileFilters(e) {
    if (e) e.preventDefault();
    const filterOptionsContainer = document.querySelector("[data-filters-collapsible]");
    if (!filterOptionsContainer) { console.warn("No filter options container found"); return; }
    filterOptionsContainer.classList.toggle("is-expanded");
  }
  function updateFilterTriggers(sortBy) {
    const filterTriggers = document.querySelectorAll(`.filter-type-group[data-type="${sortBy}"] [data-filter] input[name="filter"]`);
    if (!filterTriggers) { console.warn("No filter triggers found", sortBy); return; }
    const filterGroups = document.querySelectorAll(".js-articles-container .research-items__group");
    if (!filterGroups) { console.warn("No filter groups found", sortBy); return; }
    const filterGroupsArr = Array.from(filterGroups);
    filterTriggers.forEach(trigger => {
      const triggerID = (sortBy === "tag") ? trigger.getAttribute("id") : trigger.value.toLowerCase();
      const matchingGroup = filterGroupsArr.filter(filterGroup => { return filterGroup.dataset.group === triggerID });
      trigger.classList.toggle("disabled", matchingGroup.length < 1);
      if (matchingGroup.length < 1) console.log("No matching groups found for this filter", trigger, triggerID);
    });
  }
  // Use renderArticles('letter') to sort alphabetically
  function renderArticles(sortBy = 'tag') {
    const container = section.querySelector(".js-articles-container");
    if (!container) { console.warn("No article container found!"); return; }
    const newContainer = document.createElement('div');
    const articlesSorted = (sortBy === "tag") ? articlesByTag : articlesByLetter;
    Object.keys(articlesSorted).forEach(groupKey => {
      const groupContainer = document.createElement('div');
      groupContainer.classList.add("research-items__group");
      groupContainer.setAttribute("data-group", groupKey);
      const groupHeader = document.createElement('h3');
      groupHeader.classList.add("research-items__group-heading");
      const groupTitle = (sortBy === 'tag') ? getTagTitleByKey(groupKey) : groupKey.toUpperCase();
      groupHeader.innerText = groupTitle;
      groupContainer.appendChild(groupHeader);
      articlesSorted[groupKey].forEach(articleIndex => {
        const a = articles[articleIndex].cloneNode(true);
        groupContainer.appendChild(a);
      });
      newContainer.appendChild(groupContainer);
    });
    newContainer.classList.add('js-articles-container');
    container.replaceWith(newContainer);
    updateFilterTriggers(sortBy);
  }
  function renderArticles__NO_SORTING() {
    const container = section.querySelector(".js-articles-container");
    if (!container) { console.warn("No article container found!"); return; }
    const newContainer = document.createElement('div');
    articles.forEach(a => {
      newContainer.appendChild(a);
    });
    newContainer.classList.add('js-articles-container');
    container.replaceWith(newContainer);
  }
  function updateSortBy(e) {
    const trigger = (e) ? e.target : this;
    const sortByOption = trigger.getAttribute("data-sortby");
    section.setAttribute("data-current-filter", sortByOption);
    renderArticles(sortByOption);
  }
  function getTagTitleByKey(key) {
    const matchingTag = tags.find(tag => tag.handle === key);
    //console.log("matching tag",matchingTag);
    return matchingTag.tagName;
  }
  function getBlogTags() {
    const tagItems = section.querySelectorAll(`[data-type="filter-tag"]`);
    if (!tagItems) { console.warn("No tag elements found!"); return false; }
    const tags = [];
    tagItems.forEach(el => {
      const elInput = el.querySelector("input");
      const tagObj = { tagName: elInput.value, handle: elInput.getAttribute("id") };
      tags.push(tagObj);
    });

    return tags;
  }
  function getArticlesByTag(articles) {// Single Tag Articles
    let articlesGrouped = {};
    for (var i=0;i<articles.length;i++) {
      const articleTag = articles[i].getAttribute("data-filter-tag");
      if (!articleTag || articleTag === "") { console.warn("No filter found for article", articles[i]); continue; }
      if (articleTag in articlesGrouped === false) articlesGrouped[articleTag] = [];
      articlesGrouped[articleTag].push(i);
    }
    articlesGrouped = sortObjectProperties(articlesGrouped);
    return articlesGrouped;
  }
  function getArticlesByTags(articles) {// Articles with Multiple Tags
    let articlesGrouped = {};
    for (var i=0;i<articles.length;i++) {
      const articleTags = articles[i].getAttribute("data-tags");
      if (!articleTags || articleTags === "") { console.warn("No tags found for article", articles[i]); continue; }
      const tagsArr = articleTags.split(",");
      tagsArr.forEach(articleTag => {
        if (articleTag in articlesGrouped === false) articlesGrouped[articleTag] = [];
        articlesGrouped[articleTag].push(i);
      });
    }
    articlesGrouped = sortObjectProperties(articlesGrouped);
    return articlesGrouped;
  }
  function getArticlesByLetter(articles) {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let articlesGrouped = {};
    for (var i=0;i<articles.length;i++) {
      const articleTitleEl = articles[i].querySelector(".research-items__item-heading");
      if (!articleTitleEl || articleTitleEl === "") { console.warn("No title found for article", articles[i]); continue; }
      const articleTitle = articleTitleEl.textContent.charAt(0).toLowerCase();
      if (articleTitle in articlesGrouped === false) articlesGrouped[articleTitle] = [];
      articlesGrouped[articleTitle].push(i);
    }
    articlesGrouped = sortObjectProperties(articlesGrouped);
    return articlesGrouped;
  }
  function sortObjectProperties(obj) {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObject = {};
  
    for (const key of sortedKeys) {
      sortedObject[key] = obj[key];
    }
  
    return sortedObject;
  }
  async function getArticles() {
    const dataUrl = section.getAttribute("data-blog-url");
    const url = window.location.origin + dataUrl;
    const countTotal = section.getAttribute("data-article-count");
    let articles = [];
    let currentPage = 1;
    let currentArticleCount = 0;
    let error = false;

    while (currentArticleCount < countTotal && !error) {
      const newArticles = await fetchPage(url + `?view=research-ajax&page=${currentPage}`);
      if (!newArticles || newArticles.length < 1) {
        console.warn("No new articles found!");
        error = true;
      }
      else {
        for(var i=0;i < newArticles.length;i++) {
          articles.push(newArticles[i]);
        }
        currentArticleCount = currentArticleCount + newArticles.length;
        //console.log("while loop", `current page: ${currentPage} || currentArticleCount: ${currentArticleCount}`);
        currentPage++;
      }
    }
    
    return articles;
  }
  async function fetchPage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const html = await response.text();
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Extract the section using the selector
      const section = doc.querySelector('.blog-research-articles');
      if (!section) { console.warn("No blog section found!"); return false; }
      const newArticles = section.querySelectorAll(`[js-research-item]`);//console.log("Articles fetched", articles);
      
      return newArticles;
    }
    catch (error) {
      console.error(error.message);
    }
  }
}


// This approach took too long to fetch all the pages since there's 30+ tags. Faster to fetch them all together (fewer pages) and sort them out with JS
async function research_articles_page_init___FetchByTags() {
  const section = document.querySelector(".js-research-items");
  if (!section) return;
  const tags = getBlogTags();console.log("tags",tags);
  if (!tags || tags.length < 1) return;
  let articleTagGroups = await getArticleGroups(tags);console.log("article groups", articleTagGroups);
  if (!articleTagGroups || articleTagGroups.length < 1) return;
  //renderArticles();

  
  function renderArticles() {
    const container = section.querySelector(".js-articles-container");
    if (!container) { console.warn("No article container found!"); return; }
    articles.forEach(a => {
      container.appendChild(a);
    });
  }
  function getBlogTags() {
    const tagItems = section.querySelectorAll(`[data-type="filter-tag"]`);
    if (!tagItems) { console.warn("No tag elements found!"); return false; }
    const tags = [];
    tagItems.forEach(el => {
      const elInput = el.querySelector("input");
      const tagObj = { tagName: elInput.value, handle: elInput.getAttribute("id") };
      tags.push(tagObj);
    });

    return tags;
  }
  async function getArticleGroups(tags) {
    const dataUrl = section.getAttribute("data-blog-url");
    const url = window.location.origin + dataUrl;
    const articlesByTag = [];
    for (const tag of tags) {
      const tagArticles = await getArticlesByTag(tag);
      articlesByTag.push({ tag:tag, articles: tagArticles });
    }

    return articlesByTag;

    async function getArticlesByTag(tag) {
      let countTotal = 0;
      let articles = [];
      let pageCount = 1;
      let currentPage = 1;
      let currentArticleCount = 0;
      let continueToFetch = true;

      //while (currentArticleCount < countTotal && !error) {
      while (continueToFetch) {
        const newArticlesContainer = await fetchPage(url + `/tagged/${tag.handle}?view=research-ajax&page=${currentPage}`);
        if (!newArticlesContainer) {
          console.warn("No new articles container found!");
          continueToFetch = false;
        }
        else {
          countTotal = Number(newArticlesContainer.getAttribute("data-article-total"));
          pageCount = Number(newArticlesContainer.getAttribute("data-page-count"));
          const newArticles = newArticlesContainer.querySelectorAll(`[js-research-item]`);
          if (!newArticles || newArticles.length < 1) { console.warn("No articles found!"); return; }
          for(var i=0;i < newArticles.length;i++) {
            articles.push(newArticles[i]);
          }
          currentArticleCount = currentArticleCount + newArticles.length;
          if (pageCount === 1 || currentPage >= pageCount || currentArticleCount >= countTotal) continueToFetch = false;
          //console.log("while loop", `current page: ${currentPage} || currentArticleCount: ${currentArticleCount}`);
          currentPage++;
        }
      }

      return articles;
    }
  }
  async function fetchPage(url, containerSelector = ".js-reseach-items") {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const html = await response.text();
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Extract the section using the selector
      const section = doc.querySelector(containerSelector);
      if (!section) { console.warn("No articles section found!"); return false; }
      
      return section;
    }
    catch (error) {
      console.error(error.message);
    }
  }
}



  /**
   * Research items.
   */
  class ResearchItems extends HTMLElement {
    constructor() {
      super();
      this.selectors = {
        filtersWrapper: '[data-filters]',
        filtersToggle: '[data-filters-toggle]',
        filtersCollapsible: '[data-filters-collapsible]',
        filter: '[data-filter]',
        group: '[data-group]',
        item: '[data-item]',
        seeMore: '[data-see-more]',
      };
      this.actionClasses = {
        hiddenItem: 'is-hidden',
        collapsedItem: 'is-collapsed',
      }
      this.mobileMatchQuery = window.matchMedia('(max-width: 1023px)');
    }

    /**
     * typedef {String} - (author|filter-tag)
     */
    get currentFilterType () {
      return this.filtersWrapper.querySelector('[name="filter_type"]:checked').value;
    }

    /**
     * typedef {HTMLInputElement[]}
     */
    get checkedInputs () {
      return [...this.filters].reduce((checkedInputs, filter) => {
        const checkedInput = filter.querySelector('input:checked');
        if (checkedInput) {
          checkedInputs.push(checkedInput);
        }
        return checkedInputs;
      }, []);
    }

    /**
     * typedef {String[]}
     */
    get currentFilters () {
      return [
        ...this.filtersWrapper.querySelectorAll(
          `${this.selectors.filter}[data-type="${this.currentFilterType}"] input:checked`
        )
      ].map((element) => element.value)
    }

    /**
     * Handle filter change.
     *
     * @param {Event} event
     */
    handleFilterChange(event) {
      const { target } = event;
      const { name } = target;

      this.updateCollapsedInGroups(true);

      if (name === 'filter_type') {
        this.clearCurrentFilters();
        this.updateItemsView();
        this.updateCollapsedInGroups();
        this.updateFiltersView(this.currentFilterType);
        return;
      }

      this.updateItemsView();
      this.updateCollapsedInGroups();
    }

    /**
     * Clear current filters.
     */
    clearCurrentFilters() {
      this.checkedInputs.forEach((input) => {
        input.checked = false;
      });
    }

    /**
     * Update items view.
     */
    updateItemsView() {
      const currentFilters = this.currentFilters;
      const currentFilterType = this.currentFilterType;

      if (currentFilters.length === 0) {
        this.items.forEach((item) => {
          item.classList.remove(this.actionClasses.hiddenItem);
        });
        return;
      }

      this.items.forEach((item) => {
        const shouldHide = item.hasAttribute(`data-${currentFilterType}`)
          && !currentFilters.includes(item.getAttribute(`data-${currentFilterType}`));
        item.classList.toggle(this.actionClasses.hiddenItem, shouldHide);
      });
    }

    /**
     * Update filters view.
     *
     * @param {String} filterType - (author|filter-tag)
     */
    updateFiltersView(filterType) {
      [...this.filters].forEach((filter) => {
        filter.classList.toggle(this.actionClasses.hiddenItem, filter.dataset.type !== filterType);
      })
    }

    /**
     * Update collapsed in groups.
     *
     * @param {Boolean} reset
     * @returns {Void}
     */
    updateCollapsedInGroups(reset = false) {
      const isMobile = this.mobileMatchQuery.matches;
      if (!this.groups.length || !isMobile) {
        return;
      }

      [...this.groups].forEach((group) => {
        if (reset) {
          this.resetCollapsedInGroup(group);
          return;
        }

        this.addCollapsedForGroup(group);
      })
    }

    /**
     * Add collapsed for group.
     *
     * @param {HTMLElement} itemGroup
     * @returns {Void}
     */
    addCollapsedForGroup(itemGroup) {
      if (!itemGroup) {
        return;
      }
      const visibleItems = itemGroup.querySelectorAll(`${this.selectors.item}:not(.${this.actionClasses.hiddenItem})`);
      if (visibleItems.length < 4) {
        return;
      }

      const seeMore = this.seeMoreTemplate.content.cloneNode(true);
      [...visibleItems].slice(3).forEach((item) => {
        item.classList.add(this.actionClasses.collapsedItem);
      });
      itemGroup.appendChild(seeMore);
      itemGroup.querySelector(this.selectors.seeMore).addEventListener('click', () => {
        this.showCollapsedInGroup(itemGroup);
      })
    }

    /**
     * Show collapsed in group.
     *
     * @param {HTMLElement} itemGroup
     * @returns {Void}
     */
    showCollapsedInGroup(itemGroup) {
      if (!itemGroup) {
        return;
      }

      itemGroup.querySelectorAll(`.${this.actionClasses.collapsedItem}`).forEach((collapsedItem) => {
        collapsedItem.classList.remove(this.actionClasses.collapsedItem);
      });
      itemGroup.querySelector(this.selectors.seeMore).classList.add('hidden');
    }

    /**
     * Reset collapsed in group.
     *
     * @param {HTMLElement} itemGroup
     * @returns {Void}
     */
    resetCollapsedInGroup(itemGroup) {
      if (!itemGroup) {
        return;
      }

      itemGroup.querySelectorAll(`.${this.actionClasses.collapsedItem}`).forEach((collapsedItem) => {
        collapsedItem.classList.remove(this.actionClasses.collapsedItem);
      });
      itemGroup.querySelector(this.selectors.seeMore)?.remove();
    }

    /**
     * Clear collapsed on desktop.
     *
     * @param {HTMLElement} itemGroup
     * @returns {Void}
     */
    clearCollapsedOnDesktop(itemGroup) {
      this.resetCollapsedInGroup(itemGroup);
    }

    /**
     * Handle filters visibility.
     */
    handleFiltersVisibility() {
      const isMobile = this.mobileMatchQuery.matches;
      this.filtersToggle?.classList?.toggle('is-active', !isMobile);
      this.filtersCollapsible?.classList?.toggle('is-expanded', !isMobile);
    }

    /**
     * Toggle filters visibility.
     */
    toggleFiltersVisibility() {
      this.filtersToggle?.classList?.toggle('is-active');
      this.filtersCollapsible?.classList?.toggle('is-expanded');
    }

    /**
     * Handle resize.
     *
     * @returns {Void}
     */
    handleResize() {
      this.handleFiltersVisibility();

      if (!this.groups.length) {
        return;
      }
      const isOnMobile = this.mobileMatchQuery.matches;

      [...this.groups].forEach((group) => {
        if (!isOnMobile) {
          this.clearCollapsedOnDesktop(group);
          return;
        }

        const hasSeeMore = !!group.querySelector(this.selectors.seeMore);
        if (hasSeeMore) {
          return;
        }

        this.addCollapsedForGroup(group);
      })
    }

    /**
     * Connected callback.
     */
    connectedCallback() {
      this.cacheHTMLElements();
      if (!this.filters || !this.items) {
        console.error('Missing filters or items.');
        return;
      }
      this.handleResize();
      this.toggleEventListeners();
    }

    /**
     * Handle filter change.
     */
    disconnectedCallback() {
      this.toggleEventListeners(false);
    }

    /**
     * Toggle event listeners.
     *
     * @param {Boolean} shouldAdd
     */
    toggleEventListeners(shouldAdd = true) {
      const method = shouldAdd ? 'addEventListener' : 'removeEventListener';
      this.filtersToggle?.[method]('click', this.toggleFiltersVisibility.bind(this));
      this.filtersWrapper[method]('change', this.handleFilterChange.bind(this));
      this.onResize = debounce(this.handleResize.bind(this), 200);
      window[method]('resize', this.onResize.bind(this));
    }

    /**
     * Cache HTML elements.
     *
     * @returns {Void}
     */
    cacheHTMLElements() {
      this.filtersWrapper = this.querySelector(this.selectors.filtersWrapper);
      if (!this.filtersWrapper) {
        return;
      }

      this.filtersToggle = this.filtersWrapper.querySelector(this.selectors.filtersToggle);
      this.filtersCollapsible = this.filtersWrapper.querySelector(this.selectors.filtersCollapsible);
      this.filters = this.filtersWrapper.querySelectorAll(this.selectors.filter);

      this.groups = this.querySelectorAll(this.selectors.group);
      this.items = this.querySelectorAll(this.selectors.item);

      this.seeMoreTemplate = this.querySelector(`template${this.selectors.seeMore}`);
    }
  }

  // customElements.define('research-items', ResearchItems);
})();
