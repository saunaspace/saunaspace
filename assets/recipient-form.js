if (!customElements.get('recipient-form')) {
  customElements.define(
    'recipient-form',
    class RecipientForm extends HTMLElement {
      constructor() {
        super();
        this.sectionId = this.dataset.sectionId;

        this.selectors = {
          liveRegion: `#Recipient-fields-live-region-${this.sectionId}`,
          checkboxInput: `#Recipient-checkbox-${this.sectionId}`,
          hiddenControlField: `#Recipient-control-${this.sectionId}`,
          emailInput: `#Recipient-email-${this.sectionId}`,
          nameInput: `#Recipient-name-${this.sectionId}`,
          messageInput: `#Recipient-message-${this.sectionId}`,
          sendonInput: `#Recipient-send-on-${this.sectionId}`,
          offsetProperty: `#Recipient-timezone-offset-${this.sectionId}`,
          errorMessageWrapper: '.product-form__recipient-error-message-wrapper',
        };

        this.elements = {};
        Object.entries(this.selectors).forEach(([key, value]) => {
          this.elements[key] = this.querySelector(value);
        });

        this.elements.errorMessage =
          this.elements.errorMessageWrapper?.querySelector('.error-message');

        this.elements.checkboxInput.disabled = false;
        this.elements.hiddenControlField.disabled = true;
        if (this.elements.offsetProperty)
          this.elements.offsetProperty.value = new Date()
            .getTimezoneOffset()
            .toString();

        this.defaultErrorHeader = this.elements.errorMessage?.innerText;

        this.addEventListener('change', this.onChange.bind(this));
        this.onChange();
        window.addEventListener('formError', (e) => {
          this.displayErrorMessage(e.detail);
        });
      }

      connectedCallback() {
        this.closest('form')?.addEventListener('submit', () => {
          this.clearErrorMessage();
        });
      }

      onChange() {
        if (this.elements.checkboxInput.checked) {
          this.enableInputFields();
          this.elements.liveRegion.innerText =
            this.elements.liveRegion.getAttribute('data-expanded');

          return;
        }

        this.clearInputFields();
        this.disableInputFields();
        this.clearErrorMessage();
        this.elements.liveRegion.innerText =
          this.elements.liveRegion.getAttribute('data-collapsed');
      }

      inputFields() {
        return [
          this.elements.emailInput,
          this.elements.nameInput,
          this.elements.messageInput,
          this.elements.sendonInput,
        ];
      }

      disableableFields() {
        return [...this.inputFields(), this.elements.offsetProperty];
      }

      clearInputFields() {
        this.inputFields().forEach((field) => (field.value = ''));
      }

      enableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = false));
      }

      disableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = true));
      }

      displayErrorMessage(body) {
        this.clearErrorMessage();
        this.elements.errorMessageWrapper.hidden = false;
        if (typeof body === 'object') {
          this.elements.errorMessage.innerText = this.defaultErrorHeader;
          return Object.entries(body).forEach(([key, value]) => {
            const errorMessageId = `RecipientForm-${key}-error-${this.sectionId}`;
            const message = `${value.join(', ')}`;
            const errorMessageElement = this.querySelector(
              `#${errorMessageId}`,
            );
            const errorTextElement =
              errorMessageElement?.querySelector('.error-message');

            if (!errorTextElement) return;

            errorTextElement.innerText = `${message}.`;
            errorMessageElement.classList.remove('hidden');

            const inputElement = this.elements[`${key}Input`];
            if (!inputElement) return;

            inputElement.setAttribute('aria-invalid', true);
            inputElement.closest('.field')?.classList.add('field--has-error');
            inputElement.setAttribute('aria-describedby', errorMessageId);
          });
        }

        this.errorMessage.innerText = body;
      }

      clearErrorMessage() {
        this.elements.errorMessageWrapper.hidden = true;

        this.querySelectorAll('[js-recipient-form-error]').forEach((field) => {
          field.classList.add('hidden');
          const textField = field.querySelector('.error-message');
          if (textField) textField.innerText = '';
        });

        this.inputFields().forEach((inputElement) => {
          inputElement.setAttribute('aria-invalid', false);
          inputElement.closest('.field')?.classList.remove('field--has-error');
          inputElement.removeAttribute('aria-describedby');
        });
      }

      resetRecipientForm() {
        if (!this.checkboxInput.checked) {
          return;
        }

        this.checkboxInput.checked = false;
        this.clearInputFields();
        this.clearErrorMessage();
      }
    },
  );
}
