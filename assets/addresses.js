class CustomerAddresses {
  constructor() {
    this.selectors = {
      customerAddresses: '[data-customer-addresses]',
      addressCountrySelect: '[data-address-country-select]',
      addressContainer: '[data-address]',
      toggleAddressButton: 'button[data-form-id]',
      deleteAddressButton: 'button[data-confirm-message]',
    };
    this.attributes = {
      confirmMessage: 'data-confirm-message',
    };
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(this.selectors.customerAddresses);
    return container
      ? {
          container,
          addressContainer: container.querySelector(
            this.selectors.addressContainer,
          ),
          toggleButtons: document.querySelectorAll(
            this.selectors.toggleAddressButton,
          ),
          deleteButtons: container.querySelectorAll(
            this.selectors.deleteAddressButton,
          ),
          countrySelects: container.querySelectorAll(
            this.selectors.addressCountrySelect,
          ),
        }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        'AddressCountry_new',
        'AddressProvince_new',
        {
          hideElement: 'AddressProvinceContainer_new',
        },
      );
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(
          `AddressCountry_${formId}`,
          `AddressProvince_${formId}`,
          {
            hideElement: `AddressProvinceContainer_${formId}`,
          },
        );
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleToggleButtonsClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    const targetForm = document.querySelector(`#${target.dataset.formId}`);
    targetForm.classList.toggle('hidden');
  }

  _handleToggleButtonsClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(this.attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
}
