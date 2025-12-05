class DropdownInput extends DropdownDisclosure {
  constructor() {
    super();
  }

  init() {
    this.select = this.querySelector('select');
    this.label = this.querySelector('[data-label]');
    this.buttons = this.querySelectorAll('button');
    this.setButtonsHandlers();
    this.hideSelect();
    this.setSelectedOption();
    super.init();
  }

  setButtonsHandlers() {
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', (event) =>
        this.onOptionSelect(event, index),
      );
    });
  }

  hideSelect() {
    if (!this.select) return;

    this.select.classList.add('hidden');
  }

  onOptionSelect(event, index) {
    event.preventDefault();
    this.select.querySelector('option[selected]').removeAttribute('selected');
    this.select.options[index].setAttribute('selected', 'selected');
    this.select.value = event.target.dataset.value;
    this.label.textContent = this.select.options[index].text;
    this.setSelectedOption(event.target, index);
  }

  setSelectedOption(buttonOption) {
    const buttonEl = buttonOption || this.buttons[this.select.selectedIndex];
    this.buttons.forEach((button) => {
      button.parentElement.classList.remove('is-active');
    });
    buttonEl.parentElement.classList.add('is-active');
    this.select.dispatchEvent(new Event('change'));
    if (buttonOption) {
      this.select.closest('form').dispatchEvent(new Event('input'));
    }
    this.setButtonsHandlers();
  }
}

customElements.define('dropdown-input', DropdownInput);
