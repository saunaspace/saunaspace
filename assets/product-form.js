if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      
      if (this.cart) {
        formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      config.body = formData;
      console.log("config!!!");
      let check = false;
      let optinal = "empty";
       for (let entry of formData.entries()) {
          const [name, value] = entry;
          if(name== "_optionalVariants" && value !== "empty" ){
            if(check == false){
              console.log(name, value);
              check  = true;
              optinal = value;
            }
          }
        }
      console.log("ready to check::"+ check);
     
      fetch("/cart/add.js", config)
        .then((response) => response.json())
        .then((response) => {
          console.log("Both Executed!");
           if(check == true){
              console.log("ready to call!");
              let uniqueId = this.generateUniqueID();
              setTimeout(() => {
                      var response = this.optinaladdcart(optinal, uniqueId); 
                      console.log(response);
                }, 2000);
            }
            // this.openCart();
          
          if (response.status) {

          
            this.handleErrorMessage(response.description);
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener('modalClosed', () => {
              setTimeout(() => { this.cart.renderContents(response) });
            }, { once: true });
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
     
    }
    generateUniqueID() {
      console.log("ID passed");
      const timestamp = new Date().getTime();
      const additionalString = 'UNIQUE';
      const randomNumber = Math.floor(Math.random() * 1000);
      const uniqueID = `${timestamp}-${additionalString}-${randomNumber}`;
      return uniqueID;
    }
    // openCart() {
    //     $('.go-cart__mini-cart.js-go-cart-mini-cart').addClass('is-open');
    //     setTimeout(() => {
    //         $('.go-cart__mini-cart.js-go-cart-mini-cart').removeClass('is-open');
    //     }, 2000);
    // }
    optinaladdcart(optinal, uniqueID){
      console.log("Optinal passed");
      
      if (optinal == "empty") {
        console.log("optinal null!");
      } else {
        console.log("optinal have values!");
        let arrayOfNumbers = optinal.split(',');
        let formData = {
            'items': []
        };
        for (let i = 0; i < arrayOfNumbers.length; i++) {
            let number = arrayOfNumbers[i].trim();
            console.log(number);
            let item = {
                'id': number,
                'quantity': 1, 
                'properties': {
                    'unique_id': uniqueID
                }
            };
          formData.items.push(item);
        }
        console.log(formData);
                window.fetch("/cart/add.js", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                  console.log(response);
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
      }
}
    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}

