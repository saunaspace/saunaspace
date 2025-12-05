productMainDefaultInit();

function productMainDefaultInit() {
    const $page = $("section.product");
    if (!$page.length) return console.warn("No product page found!");
    const $productForm = $(".product__actions form");
    const $variantSelector = $(".product-variant-selector");
    const $builderVariantRows = $(".product__variants-row[data-variant]");
    const $prodRadioOptions = $(".variant-option-radio, .option--color[type='radio']");
    const $accessorySelects = $(".optional-accessory-select");
    const $accessoryProductDataInputs = $("input.accessory-product-data");
    const $stickyProduct = $(".product-sticky-button");
    const $atcTrigger = $(".js-product-atc-trigger");
    const pageEvents = eventsObj();
    const currentVariantSelected = { id: null, name: null, price: null, priceFormatted: null, image: null, comparePrice: null, comparePriceFormatted: null, sku: null, inventory: null, leadTime: null };
    const currentPricing = { productCost: null, productComparePrice: null, accessoriesCost: null, accessoriesComparePrice: null, totalComparePrice: null, totalPrice: null };

    productMedia();
    plugOptions();
    variantDropdownOptions();
    productPricing();
    productForm();
    accessories();
    leadTimes();
    urlUpdate();
    variantSKU();
    paymentOptionTabs();
    if ($stickyProduct.length) stickyProduct();
    if ($prodRadioOptions.length && $variantSelector.length) selectionUpdated(); // initial init
    if ($prodRadioOptions.length && $variantSelector.length) $prodRadioOptions.on("change", selectionUpdated);
    $productForm.on("click", "button.product-selector__submit", triggerATC);
    $atcTrigger.add(".custom_add_to_cart").on("click", function(e) { $productForm.find(".product-selector__submit").trigger("click") });


    //-- Radio option or Accessory change
    function selectionUpdated(e) {//console.log("selection updated");
        if (e) e.preventDefault();
        const productOptions = $variantSelector.attr("data-options").split(" / ");//console.log("options",productOptions);
        let selectedOptions = [];

        productOptions.forEach(findSelectedOption);
        console.log("selected options",selectedOptions);
        updateCurrentVariantVar();
        console.log("currentVarSelected",currentVariantSelected);
        pageEvents.emit("selection_updated");


        function updateCurrentVariantVar() {
            const optionString = selectedOptions.join(" / ");
            const $matchingOption = $variantSelector.find("option").filter((i,option) => {
                return option.value === optionString;
            });
            if (!$matchingOption.length) return console.warn("No matching option found!", optionString);
            currentVariantSelected.id = parseInt($matchingOption.attr("data-variant-id"));
            currentVariantSelected.image = $matchingOption.attr("data-image-url");
            currentVariantSelected.name = optionString;
            currentVariantSelected.price = parseFloat($matchingOption.attr("data-price").replaceAll(",",""));
            currentVariantSelected.comparePrice = parseFloat($matchingOption.attr("data-compare-price").replaceAll(",",""));
            currentVariantSelected.priceFormatted = formatToUSD(currentVariantSelected.price);
            currentVariantSelected.comparePriceFormatted = formatToUSD(currentVariantSelected.comparePrice);
            currentVariantSelected.leadTime = $matchingOption.attr("data-lead-time");
            currentVariantSelected.sku = $matchingOption.attr("data-sku");
            currentVariantSelected.inventory = $matchingOption.attr("data-inventory") || null;
        }
        function findSelectedOption(option) {
            //- TODO: if (option === "Accessories") return selectedOptions.push($("#accessories-options").val());
            let selectedValue = "";
            const $matchingOptions = $builderVariantRows.filter(`[data-variant="${option}"]`);
            if (!$matchingOptions.length) return console.warn("No matching variant options found", option);
            console.log("matching",$matchingOptions);
            const $selectedInput = $matchingOptions.find("input:checked");
            if (!$selectedInput.length) return console.warn("No selected input found", $matchingOptions);
            console.log("selected input", $selectedInput);
            selectedOptions.push($selectedInput.val());
        }
    }


    //-- Cart & Product Form
    function productForm() {
        const $formIdInput = $productForm.find(`input[name="id"]`);
        if (!$formIdInput.length) return console.warn("No input ID found!", $productForm);

        pageEvents.on("selection_updated", updateInputs);

        function updateInputs() {
            $formIdInput.val(currentVariantSelected.id);
            if (currentVariantSelected.inventory) {
                const inventory = parseInt(currentVariantSelected.inventory);
                if (inventory < 1) {
                    $productForm.add($atcTrigger).addClass("disabled-no-inventory");
                    return;
                }
            }
            $productForm.add($atcTrigger).removeClass("disabled-no-inventory");
        }
    }


    //-- Plug Options
    function plugOptions() {
        const $plugBuilder = $builderVariantRows.filter(`[data-variant="Plug"]`);
        if (!$plugBuilder.length) return console.log("No plug builder found");
        const $plugRadioOptions = $prodRadioOptions.filter(".plug-option-radio");
        if (!$plugRadioOptions.length) return console.log("No plug radio options found");
        const $currentSelectedLabel = $plugBuilder.find(`[data-current-selected-plug]`);
        
        $plugRadioOptions.on("change", updatePlugDropdown);


        function updatePlugDropdown(e) {
            if ($currentSelectedLabel.length) {
                const label = this.parentElement.dataset.plugTypeLabel;
                $currentSelectedLabel.text(label);
            }
            const closeDD = closeDropdown.bind(this);
            closeDD();
        }
        function closeDropdown(e) {
            this.closest('details').removeAttribute('open');
        }
    }


    //-- Options with dropdown (similar to plugs)
    function variantDropdownOptions() {
        const $varDropdownSections = $builderVariantRows.filter(".variant-option-with-dropdown");
        if (!$varDropdownSections.length) return false;
        //console.log("$varddSecs",$varDropdownSections);

        $varDropdownSections.each(initDropdownSection);
        
        function initDropdownSection(i, section) {
            const $section = $(section);
            const $currentSelectedLabel = $section.find(`[data-current-selected-option]`);
            const $radioOptions = $section.find(".dropdown-option-radio");
            if (!$currentSelectedLabel.length || !$radioOptions.length) return console.error("No label or radio options found!", $section);

            $radioOptions.on("change", updateDropdown);

            function updateDropdown(e) {
                const label = this.value;
                $currentSelectedLabel.text(label);//.closest("details").attr("data-selected-option", label);
                const closeDD = closeDropdown.bind(this);
                closeDD();
            }
            function closeDropdown(e) {
                this.closest('details').removeAttribute('open');
            }
        }
    }


    //-- Image Slider
    function productMedia() {
        const sliderThumbs = getMediaSliderThumbs();
        const sliderMain = getMediaSliderMain();
        const $mainSlider = $(".product__media-slider .swiper");
        const $thumbsSlider = $(".product__media-thumbs .swiper");
        const thumbActiveClass = "swiper-slide-thumb-active";
        
        if (sliderMain != false) pageEvents.on("selection_updated", updateSlider);
        if (sliderThumbs != false) $thumbsSlider.find(".swiper-slide").on("click", changeThumbSlide);

        function changeThumbSlide(e) {
            if (e) e.preventDefault();
            const $slide = $(this);
            let slideIndex = null;
            if ($slide.is(`[data-custom-thumbnail]`)) {
                slideIndex = $mainSlider.find(".swiper-slide").filter(`[data-custom-thumbnail-main="${$slide.attr('data-custom-thumbnail')}"]`).index();
            }
            else if ($slide.is(`[data-var-id]`)) {
                slideIndex = $mainSlider.find(".swiper-slide").filter(`[data-variant-id*="${$slide.attr('data-var-id')}"]`).index();
            }
            else if ($slide.is(`[data-media-id]`)) {
                slideIndex = $mainSlider.find(".swiper-slide").filter(`[data-media-id="${$slide.attr('data-media-id')}"]`).index();
            }
            if (slideIndex != null && slideIndex >= 0) {
                sliderMain.slideTo(slideIndex, 0);
                $thumbsSlider.find(`.${thumbActiveClass}`).removeClass(thumbActiveClass);
                $slide.addClass("swiper-slide-thumb-active");
                //sliderThumbs.slideTo($slide.index(), 0);
            }
            else return console.warn("No matching thumbnail image found!", $slide);
        }
        function updateSlider(e) {
            const slides = sliderMain.slides;
            let matchingSlide = null;
            slides.forEach(slide => {
                if (slide.hasAttribute("data-variant-id")) {
                    const slideVarIds = slide.dataset.variantId.split(",");
                    slideVarIds.forEach(id => {
                        if (parseInt(id) === currentVariantSelected.id) matchingSlide = slide;
                    });
                }
            });
            if (matchingSlide != null) {
                sliderMain.slideTo(matchingSlide.dataset.index, 0);
                if (matchingSlide.hasAttribute("data-custom-thumbnail-main")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-custom-thumbnail="${matchingSlide.dataset.customThumbnailMain}"]`);
                }
                else if (matchingSlide.hasAttribute("data-var-id")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-var-id="${matchingSlide.dataset.varId}"]`);
                }
                else if (matchingSlide.hasAttribute("data-media-id")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-media-id="${matchingSlide.dataset.mediaId}"]`);
                }
                //console.log("matching thumb", $matchingThumb, $matchingThumb.index());
                $thumbsSlider.find(`.${thumbActiveClass}`).removeClass(thumbActiveClass);
                if ($matchingThumb != null && $matchingThumb.length) {
                    sliderThumbs.slideTo($matchingThumb.index(), 0);
                    $matchingThumb.addClass(thumbActiveClass);
                }
                pageEvents.emit("selection_update_slider_updated", matchingSlide);
            }
            else console.warn("no matching image found");
        }
    }


    //-- Pricing
    function productPricing() {
        const $pricingContainer = $(".price");
        if (!$pricingContainer.length) return console.warn("No pricing container found!");
        
        pageEvents.on("selection_updated", updatePricing);

        function updatePricing(e) {
            const productPrice = currentVariantSelected.price;
            const accessoriesPrice = getAccessoriesPrice();
            const totalRaw = productPrice + accessoriesPrice.total;
            let compareTotalRaw = null;
            if (currentVariantSelected.comparePrice != null && currentVariantSelected.comparePrice != "") compareTotalRaw = currentVariantSelected.comparePrice;
            if (accessoriesPrice.compareTotal != null) {
                compareTotalRaw = (compareTotalRaw != null) ? compareTotalRaw + accessoriesPrice.compareTotal : accessoriesPrice.compareTotal;
            }
            currentPricing.productCost = formatToUSD(productPrice);
            currentPricing.productComparePrice = (currentVariantSelected.comparePrice != null && currentVariantSelected.comparePrice != "") ? formatToUSD(currentVariantSelected.comparePrice) : null;
            currentPricing.accessoriesCost = formatToUSD(accessoriesPrice.total);
            currentPricing.accessoriesComparePrice = formatToUSD(accessoriesPrice.compareTotal);
            currentPricing.totalComparePrice = (compareTotalRaw != null && compareTotalRaw > totalRaw) ? formatToUSD(compareTotalRaw) : null;
            currentPricing.totalPrice = formatToUSD(totalRaw);
            console.log("current pricing",currentPricing);
            // Has compare price
            if ($pricingContainer.hasClass("price--on-sale")) {
                const $salePrice = $("ins.sale-price");
                const $comparePrice = $("del.compare-price");
                $salePrice.text(currentPricing.totalPrice);//currentVariantSelected.priceFormatted
                if (currentPricing.totalComparePrice != null) $comparePrice.text(currentPricing.totalComparePrice);//currentVariantSelected.comparePriceFormatted
            }
            // Default
            else {
                const $pricingItems = $(".ForChangePrice");
                if (!$pricingItems.length) return console.warn("No pricing elements found!");
                $pricingItems.text(currentPricing.totalPrice);//currentVariantSelected.priceFormatted    
            }

            // SplitIt - 8.5.25
            const splititMonthly = Math.ceil(parseFloat(currentPricing.totalPrice.replace("$","").replaceAll(",","")) / 12);
            const splititMonthlyOriginal = Math.ceil(parseFloat(currentPricing.totalPrice.replace("$","").replaceAll(",","")) / 12);
            $("span.js-splitit").each((i,el) => {
                const type = el.dataset.type;
                if (type === "monthly") {
                    el.textContent = `$${splititMonthly}/mo`;
                }
                else if (type === "total-today") {
                    el.textContent = `$${splititMonthly}`;
                }
                else if (type === "monthly-original") {
                    el.textContent = `$${splititMonthlyOriginal}/mo`;
                }
            });
        }
        function getAccessoriesPrice() {
            const $selectedAccessories = $accessorySelects.filter(":checked");
            let total = 0;
            let compareTotal = 0;
            //if (!$selectedAccessories.length) { console.log("no selected accessories found"); }
            if (!$selectedAccessories.length) return { total: total, compareTotal: null };
            $selectedAccessories.each((i,el) => {
                const subtotal = parseInt(el.dataset.price) * parseInt(el.dataset.qty);
                const compareSubtotal = (el.dataset.comparePrice != "") ? parseInt(el.dataset.comparePrice) * parseInt(el.dataset.qty) : subtotal;
                total = total + subtotal;
                compareTotal = compareTotal + compareSubtotal;
            });
            if (compareTotal <= total) { console.warn("somethings wrong with access compare total", compareTotal); compareTotal = null; }
            return { total: total, compareTotal: compareTotal };
        }
    }


    //-- Trigger Add to Cart: Only for products with addon options
    function triggerATC(e) {
        if (!$accessoryProductDataInputs.length) return;
        if (e) e.preventDefault();
        // $productForm.find(".product-selector__submit").trigger("click"); // REMOVED - Manually adding products to cart. 5.22
        if ($productForm.hasClass("disabled-no-inventory")) return console.error("No inventory on this product. Cannot add to cart!");
        const $inputs = $productForm.find(`input[type="hidden"]`);
        if (!$inputs.length) return console.error("No product form inputs found!", $inputs);
        const cartDrawer = document.querySelector('cart-drawer');
        if (!cartDrawer) return console.error("No cart drawer found!");
        //const bundleId = "bundle_unique_" + Math.floor(10000 + Math.random() * 90000);
        const itemsToAdd = getItemsToAdd();
        if (typeof itemsToAdd === "undefined" || itemsToAdd.length < 1) return console.error("No items to add to cart found!");

        console.log("product items to add", itemsToAdd);
        //return alert("Product add to cart temporarily disabled!");
        addProductsToCart(itemsToAdd);

        function addProductsToCart(itemsData, callbackFn) {
            const bodyData = {
                items: itemsData,
                sections: cartDrawer.getSectionsToRender().map((section) => section.section),
                sections_url: window.location.pathname
            };
            const config = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            };
    
            console.log(`Attempting to add all products to cart`, bodyData);
            // Add product to cart
            fetch(window.Shopify.routes.root + 'cart/add.js', config)
            .then((response) => response.json())
            .then((response) => {
                if (response.status) {
                    console.error(response.description);
                    return;
                }
                console.log("All products successfully added to cart");
                cartDrawer.renderContents(response); // Update Cart
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                if (typeof callbackFn === "object") callbackFn(); 
            });
        }
        function getItemsToAdd() {
            const selectedItems = [];
            let accessoryItems = ""; // string that gets added to main product properties data [REMOVED 6.17.25]
            
            $accessoryProductDataInputs.each(setupItems);
            $productForm.each(setupItems);
            return selectedItems;

            function setupItems(i,el) {
                const $el = $(el);

                if ($el.is("form")) setupItemForm($el);
                else setupItemAccessory($el);
            }
            function setupItemForm($form) {
                //const $propertyInputs = $inputs.filter(`[name^="properties"]`);
                //console.log("Property Inputs",$propertyInputs);
                const productData = getProductDataObj();
                productData.id = currentVariantSelected.id;
                // productData.properties._is_main = true;
                // $propertyInputs.each(setupPropInput);
                // console.log("form product data",productData);
                // if (accessoryItems != "") productData.properties["Selected Accessories"] = accessoryItems;
                selectedItems.push(productData);

                function setupPropInput(i, input) {
                    const $input = $(input);
                    const property = $input.attr("name").replace("properties[","").replace("]","");
                    productData.properties[property] = $input.val();
                }
            }
            function setupItemAccessory($input) {
                if ($input.val() === "") return console.log("Product not selected", $input.attr("data-product"));
                const selectedVariantId = parseInt($input.attr("data-selected-variant"));
                const selectedQuantity = parseInt($input.attr("data-selected-quantity"));
                const productData = getProductDataObj();
                productData.id = selectedVariantId;
                productData.quantity = selectedQuantity;
                //productData.properties._is_main = false;console.log("accesss product data",productData);
                //accessoryItems += (accessoryItems === "") ? "" : ", ";
                //accessoryItems += `Product: ${$input.attr("data-product")} | Quantity: ${selectedQuantity}`;
                selectedItems.push(productData);
            }
            function getProductDataObj() {
                return {
                    id: null,
                    quantity: 1
                }
            }
        }
    }


    //-- Option/Variant - Accessories
    function accessories() {
        const $accessoryProducts = $(".product__variants-addons li");
        if (!$accessoryProducts.length) return console.log("No Accessory Variant Options found");

        $(".js-accessory-label-selector").on("click", toggleAccessory);
        $(".accessory-qty-cnt .qty-btn").on("click", qntUpdate);
        $(".js-accs-default-qty .qty-btn").on("click", updateQty);
        $(".access-dropdown-option-radio").on("change", updateAccessoryProductSelector);
        $(".accessory-atc-trigger").on("click", updateAccessoryDataInputs);
        pageEvents.on("accessories_updated", updateAccessoriesVarInput);
        initProductSliders();
        initAccessoriesReadMore();


        function toggleAccessory(e) {
            const $label = $(this);
            const toggleClass = "isSelected";
            const isActive = $label.hasClass(toggleClass) === false;
            const $accsInput = $label.siblings(".optional-accessory-select");
            const $defaultQtyOptions = $label.siblings(".js-accs-default-qty");
            $label.toggleClass(toggleClass, isActive);
            if ($defaultQtyOptions.length) $defaultQtyOptions.toggleClass(toggleClass, isActive);
            if (!$accsInput.length) return console.error("No accessory input found!",$label);
            const varId = (isActive) ? $accsInput.attr("data-default-id") : "";
            const varPrice = (isActive) ? $accsInput.attr("data-default-price").replace(",","") : "";
            const varComparePrice = (isActive) ? $accsInput.attr("data-default-compare-price").replace(",","") : "";
            const varQty = (isActive) ? 1 : "";
            $accsInput.attr("data-id", varId);
            $accsInput.attr("data-price", varPrice);
            $accsInput.attr("data-compare-price", varComparePrice);
            $accsInput.attr("data-qty", varQty);
            $accsInput.prop("checked", isActive);
            const productHandle = $label.closest(`[data-product-handle]`).attr("data-product-handle");
            const $matchingDataInput = $accessoryProductDataInputs.filter(`[data-product-handle="${productHandle}"]`);
            if (!$matchingDataInput.length) return console.warn("No Matching data input found!", $label);
            const inputVal = (isActive) ? `${varId} x ${varQty}` : "";
            updateMatchingDataInput($matchingDataInput, varId, varPrice, varQty, inputVal);
            if (!isActive) {
                if ($defaultQtyOptions.length) $defaultQtyOptions.find(".qty-input").val(1); // reset input val if not active
            }
            selectionUpdated();
        }
        function updateAccessoryDataInputs(e) {
            if (e) e.preventDefault();
            const $submitBtn = $(this);
            const $modal = $submitBtn.closest(".modal-dialog");
            const $productSelector = $submitBtn.siblings(".accessory-product-variant-selector");
            const $selectedOption = $productSelector.find("option:selected");
            if (!$productSelector.length || !$selectedOption.length) return console.warn("No product selector or selected option found!", $modal);
            console.log("access product selector", $productSelector);
            console.log("selected option", $selectedOption);
            const productHandle = $productSelector.attr("data-product-handle");
            const $qtyInput = $submitBtn.siblings(".accessory-qty-cnt").find(".qty-input");
            if (!$qtyInput.length) return console.warn("No qnt input found!");
            const quantity = parseInt($qtyInput.val());
            if (quantity < 1) return console.warn("Quantity less than 1!");
            if (!$accessoryProductDataInputs.length) return console.warn("Accessory product data inputs not found!");
            const $matchingDataInput = $accessoryProductDataInputs.filter(`[data-product-handle="${productHandle}"]`);
            if (!$matchingDataInput.length) return console.warn("No Matching data input found!", $submitBtn);
            const selectedVariantId = $selectedOption.val();
            const priceOfAccessory = $selectedOption.attr("data-price");

            // When a user adds an accessory to the bundle, we update the matching data input with the info later used to add the cart to the product
            $submitBtn.addClass("disabled");
            const inputVal = `${selectedVariantId} x ${quantity}`;
            updateMatchingDataInput($matchingDataInput, selectedVariantId, priceOfAccessory, quantity, inputVal);
            // Close the modal and update all the accessory variant inputs
            $productSelector.attr("data-qty", $qtyInput.val()); // for main product form data
            $modal.find(".modal-dialog__close").trigger('click');
            pageEvents.emit("accessories_updated", $productSelector);
            $submitBtn.removeClass("disabled");
            $qtyInput.val(1); // reset qty input
            selectionUpdated();
        }
        function addProductToCart_quickadd_not_bundle_product(e) {
            if (e) e.preventDefault();
            const $submitBtn = $(this);
            const $modal = $submitBtn.closest(".modal-dialog");
            const $productSelector = $submitBtn.siblings(".accessory-product-variant-selector");
            if (!$productSelector.length) return console.warn("No product selector found!");
            const $qtyInput = $submitBtn.siblings(".accessory-qty-cnt").find(".qty-input");
            if (!$qtyInput.length) return console.warn("No qnt input found!");
            const quantity = parseInt($qtyInput.val());
            if (quantity < 1) return console.warn("Quantity less than 1!");
            const cartDrawer = document.querySelector('cart-drawer');
            const data = {
                items: [{
                    id: $productSelector.val(),
                    quantity: quantity
                }],
                sections: cartDrawer.getSectionsToRender().map((section) => section.section),
                sections_url: window.location.pathname
            };
            const config = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            
            $submitBtn.addClass("disabled");
            fetch(window.Shopify.routes.root + 'cart/add.js', config)
            .then((response) => response.json())
            .then((response) => {
                if (response.status) {
                    console.error(response.description);
                    return;
                }
                $productSelector.attr("data-qty", $qtyInput.val()); // for main product form data
                cartDrawer.renderContents(response); // Update Cart
                $modal.find(".modal-dialog__close").trigger('click');
                $qtyInput.val(1); // reset qty input
                pageEvents.emit("accessories_updated", $productSelector);
                selectionUpdated();
                $productSelector.attr("data-qty", 1); // reset product selector
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                $submitBtn.removeClass("disabled");
            });

        }
        function updateAccessoriesVarInput($productSelector) {
            // Triggered when a product is added to the bundle (cart) via the quickview
            // Updates the matching product on the main product panel
            const productName = $productSelector.attr("data-product");
            const productHandle = $productSelector.attr("data-product-handle");
            const $selectedOption = $productSelector.find("option:selected");
            const productPrice = $selectedOption.attr("data-price").replace(",","");
            const productComparePrice = $selectedOption.attr("data-compare-price").replace(",","");
            const productImage = $selectedOption.attr("data-image-url");
            if (!productName || !productHandle) return console.warn("No product name or handle found!", $productSelector);
            if (!productPrice) return console.warn("No product price found!", $productSelector);
            const $container = $accessoryProducts.filter(`[data-product="${productName}"]`);
            if (!$container.length) return console.warn("No matching option found!", productName, $accessoryProducts);
            // Update the matching addon product in the main product panel to the same options as what the user selected in the quickview modal
            const $cbInput = $container.find(`input[name="${productName}"]`);
            if (!$cbInput.length) return console.warn("No cb input found!", $container);
            $cbInput.prop("checked",true).attr("data-id", $productSelector.val()).attr("data-qty", $productSelector.attr("data-qty")).attr("data-price", productPrice).attr("data-compare-price", productComparePrice);
            const $label = $cbInput.siblings("label");
            $label.addClass("isSelected");
            $cbInput.siblings(".qty-container").addClass("isSelected");
            if (productImage != "" && !productImage.includes("no-image")) $label.find(".option-img img").attr("src", productImage);
            $container.find(".qty-input").val($productSelector.attr("data-qty"));
            // 8.26.25
            const $variantOptionRows = $container.find(".access-product__variants-row");
            if (!$variantOptionRows.length) return console.warn("No accessory variant option rows found!", $container);
            const productOptions = $productSelector.attr("data-options").split(" / ");
            const selectedOption = $selectedOption.attr("data-variant").split(" / ");
            console.log("options",productOptions);
            productOptions.forEach(updateProductOption);
            

            function updateProductOption(option, index) {
                const $variantOptionRow = $variantOptionRows.filter(`[data-variant="${option}"]`);
                if (!$variantOptionRow.length) return console.warn("No matching variant options found", option);
                //console.log("matching",$variantOptionRow);
                const optionValue = selectedOption[index] || null;
                if (typeof(optionValue) === "undefined" || optionValue === null) return console.warn("No matching option value found!", option);
                const $selectedInput = $variantOptionRow.find(`input[value="${optionValue}"]`);
                if (!$selectedInput.length) return console.warn("No selected input found", $variantOptionRow, optionValue);
                console.log("selected input", $selectedInput);
                // Update dropdown or swatch input - add class "disabled-for-toggle" so that it won't trigger another selection update
                $selectedInput.addClass("disabled-for-toggle").trigger("click");
                if ($variantOptionRow.hasClass("access-product__variants-row--swatches")) {
                    // Don't think we need to do anything here 8.26.25
                }
                else {
                    // Else dropdown then update the text to show the selected option
                    const $detailsEl = $selectedInput.closest("details");
                    if (!$detailsEl.length) return console.warn("No details element found!",$selectedInput);
                    //console.log("$detailsel",$detailsEl);
                    $detailsEl.find(`[data-current-selected-option]`).text($selectedInput.val());
                }
            }
        }
        function updateAccessoryProductSelector(e) {
            const $target = $(this);
            // If the event change was triggered because the product was updated from the quickview and needs to be updated here
            // disregard the event and remove the "disabled-for-toggle" class
            if ($target.hasClass("disabled-for-toggle")) return $target.removeClass("disabled-for-toggle");
            
            const $container = $target.closest(".accessory-product-quickview, .addon-option-item");
            if (!$container.length) return console.warn("No modal found!", $target);
            const $productSelector = $container.find(".accessory-product-variant-selector, .addon-product-variant-selector");
            if (!$productSelector.length) return console.warn("No accessory product selector found!", $container);
            const $variantOptionRows = $container.find(".access-product__variants-row");
            if (!$variantOptionRows.length) return console.warn("No accessory variant option rows found!", $container);
            const productOptions = $productSelector.attr("data-options").split(" / ");
            console.log("options",productOptions);
            let selectedOptions = [];
    
            productOptions.forEach(findSelectedOption);
            console.log("selected options",selectedOptions);
            const optionString = selectedOptions.join(" / ");
            const $matchingOption = $productSelector.find("option").filter(`[data-variant="${optionString}"]`);
            if (!$matchingOption.length) return console.warn("No matching option found!");
            //console.log("Matching product select option", $matchingOption);
            $matchingOption.prop('selected', true);
            pageEvents.emit("accessories_option_updated", $matchingOption);
            //console.log("product selector val",$productSelector.val());

            // If product selected from the main product panel (not quickview modal)
            if ($container.hasClass("addon-option-item")) {
                const $addonSelectionInput = $container.find(".optional-accessory-select");
                if (!$addonSelectionInput.length) return console.warn("No addon selection input found!", $container);
                const $addonToggleSelector = $addonSelectionInput.siblings(".js-accessory-label-selector");
                if (!$addonToggleSelector.length) return console.warn("No addon selector found!", $addonSelectionInput);
                const $addonImg = $addonToggleSelector.find(".opt-img-accessory-product img");
                if (!$addonImg.length) console.warn("No accessory image found!", $container);
                else $addonImg.attr("src", $matchingOption.data("image-url"));
                // Update default properties to selected option
                $addonSelectionInput.attr("data-default-id", $matchingOption.val()).attr("data-default-price", $matchingOption.data("price")).attr("data-default-compare-price", $matchingOption.data("compare-price"));
                // If already selected then update all properties
                if ($addonToggleSelector.hasClass("isSelected")) {
                    $addonSelectionInput.attr("data-id", $matchingOption.val()).attr("data-price", $matchingOption.data("price")).attr("data-compare-price", $matchingOption.data("compare-price"));
                    const productHandle = $addonSelectionInput.closest(`[data-product-handle]`).attr("data-product-handle");
                    const $matchingDataInput = $accessoryProductDataInputs.filter(`[data-product-handle="${productHandle}"]`);
                    if (!$matchingDataInput.length) return console.warn("No Matching data input found!", productHandle);
                    const varQty = $addonSelectionInput.attr("data-qty");
                    const inputVal = `${$matchingOption.val()} x ${varQty}`;
                    // args: ($matchingDatInput, variantID, price, qty, inputVal)
                    updateMatchingDataInput($matchingDataInput, $matchingOption.val(), $matchingOption.data("price"), varQty, inputVal);
                    selectionUpdated();
                }
                // Else trigger click
                else {
                    $addonToggleSelector.trigger("click");
                }

                updateQuckviewProduct();
            }
            else {
                $container.find(".accessory-product-price span").text("$" + $matchingOption.attr("data-price"));
                $container.find(".accessory-product-price del").text("$" + $matchingOption.attr("data-compare-price"));
            }

            // If swatches return
            if ($target.closest(".access-product__variants-row--swatches").length) return;
            // Else if dropdown then update the text to show the selected option
            const $detailsEl = $target.closest("details");
            if (!$detailsEl.length) return console.warn("No details element found!",$target);
            //console.log("$detailsel",$detailsEl);
            $detailsEl.find(`[data-current-selected-option]`).text($target.val());
            $detailsEl.get(0).removeAttribute('open');

            function findSelectedOption(option) {
                const $matchingOptions = $variantOptionRows.filter(`[data-variant="${option}"]`);
                if (!$matchingOptions.length) return console.warn("No matching variant options found", option);
                //console.log("matching",$matchingOptions);
                const $selectedInput = $matchingOptions.find("input:checked");
                if (!$selectedInput.length) return console.warn("No selected input found", $matchingOptions);
                //console.log("selected input", $selectedInput);
                selectedOptions.push($selectedInput.val());
            }
            function updateQuckviewProduct() {
                const productName = $container.attr("data-product");
                const $matchingQV = $(`.accessory-product-quickview[data-product="${productName}"]`);
                if (!$matchingQV.length) return console.warn("No matching quickview found!", productName);
                const $matchingInput = $matchingQV.find(`input[value="${$target.val()}"]`);
                if (!$matchingInput.length) return console.warn("No matching quickview input found!", $matchingQV);
                //console.log("matching qv input",$matchingInput);
                $matchingInput.trigger("click");
            }
        }
        function updateMatchingDataInput($matchingDataInput, selectedVarId, price, quantity, inputVal) {
            if (!$matchingDataInput.length) return console.warn("No matching data input");
            $matchingDataInput.attr("data-selected-variant", selectedVarId);
            $matchingDataInput.attr("data-selected-quantity", quantity);
            $matchingDataInput.attr("data-price-single", price);
            $matchingDataInput.val(inputVal);
            console.log("accessory data input", $matchingDataInput);
        }
        function updateQty(e) {
            const $container = $(this).closest(".qty-container");
            if (!$container.length) return console.warn("No container found!");
            const $qtyInput = $container.find(".qty-input");
            const $label = $container.siblings(".js-accessory-label-selector");
            const $prodInput = $container.siblings(".optional-accessory-select");
            const productHandle = $container.closest(`[data-product-handle]`).attr("data-product-handle");
            const $matchingDataInput = $accessoryProductDataInputs.filter(`[data-product-handle="${productHandle}"]`);
            if (!$matchingDataInput.length) console.warn("No Matching data input found!", $container);
            const updateFn = qntUpdate.bind(this);
            updateFn(e);
            const quantity = $qtyInput.val();
            if (quantity < 1) {
                $label.trigger("click");
                $qtyInput.val(1);
            }
            else {
                $prodInput.attr("data-qty", quantity);
                $matchingDataInput.attr("data-selected-quantity", quantity);
                selectionUpdated();
            }
        }
        function initProductSliders() {
            $(".accessory-product-quickview").each((i,el) => {
                const $productMedia = $(el).find(".product__media");
                if (!$productMedia.length) { console.warn("No prod media found"); return; }
                initAccessoryImageSlider($productMedia);
            });
        }
    }


    //-- Lead Times
    function leadTimes() {
        const $ltInfo = $("main .js-variant-leadtime");
        if (!$ltInfo.length) return console.warn("No lead time info found");
        pageEvents.on("selection_updated", updateLeadTime);

        function updateLeadTime() {
            const newLT = currentVariantSelected.leadTime;
            if (newLT != "") $ltInfo.text(newLT);
            //console.log("Lead Time updated", newLT, $ltInfo);
        }
    }


    //-- URL Updating
    function urlUpdate() {
        pageEvents.on("selection_updated", updateURL);

        function updateURL() {
            if (currentVariantSelected.id === null || currentVariantSelected.id === "") return console.warn("No variant id found!");
            const url = window.location.origin + window.location.pathname;
            window.history.replaceState(null, null, url + `?variant=${currentVariantSelected.id}`);
        }
    }


    //-- Variant SKU
    function variantSKU() {
        const $skuInfo = $(".js-variant-sku");
        if (!$skuInfo.length) return console.warn("No variant sku to update found");
        pageEvents.on("selection_updated", updateVarSKU);

        function updateVarSKU() {
            const newSKU = currentVariantSelected.sku;
            if (newSKU != "") $skuInfo.text(newSKU);
            console.log("SKU updated", newSKU, $skuInfo);
        }
    }



    //-- Sticky Product
    function stickyProduct() {
        pageEvents.on("selection_updated", checkIfProductAvailable);
        pageEvents.on("selection_update_slider_updated", updateStickyImage);

        function checkIfProductAvailable() {
            if (currentVariantSelected.inventory != null) {
                const inventory = parseInt(currentVariantSelected.inventory) || 0;
                //console.log("inventory",inventory);
                $stickyProduct.toggleClass("disabled-no-inventory", inventory < 1);
            }
        }
        function updateStickyImage(matchingSlide) {
            const $img = $stickyProduct.find(".media img");
            if (!$img.length) return console.warn("No sticky product image found!");
            const $matchingImg = $(matchingSlide).find("img");
            if (!$matchingImg.length) return console.warn("No matching slide image found!", matchingSlide);
            const $newImg = $matchingImg.clone();
            $img.replaceWith($newImg);
        }
    }



    //-- Payment Option Tabs
    function paymentOptionTabs() {
        const $tabLinks = $(".product-build__tabs-nav-button");
        const $poTabs = $(".product-build__tabs-tab");
        if (!$tabLinks.length || !$poTabs.length) return console.warn("No tab links or purchase option tabs found!");

        $tabLinks.on("click", updateTabs);


        function updateTabs(e) {
            if (e) e.preventDefault();
            const tabID = this.dataset.tabId;
            const $nextActive = $poTabs.filter(`[data-tab-id="${tabID}"]`);
            if (!$nextActive.length) return console.warn("No matching tab found!", this);
            $tabLinks.add($poTabs).removeClass("is-active");
            $(this).add($nextActive).addClass("is-active");
        }
    }



    /* Helpers */
    //- Accessories Helpers
    function qntUpdate(e) {
        if (e) e.preventDefault();
        const $this = $(this);
        const $input = $this.siblings(".qty-input");
        if (!$input.length) return console.warn("No qty input found!", $this);
        const minCount = parseInt($input.attr("min"));
        let count = parseInt($input.val());
        const action = $this.attr("data-action");
        count = (action === "decrease") ? count - 1 : count + 1;
        if (count <= minCount) count = minCount;
        $input.val(count);
    }
    function initAccessoryImageSlider($productMedia) {
        const $sliderMain = $productMedia.find("[data-slider]");
        const $sliderThumbs = $productMedia.find("[data-thumbs]");
        const options = {
            sliderMain: {
              effect: 'fade',
              navigation: {
                prevEl: $sliderMain.find('.swiper-arrow--prev').get(0),
                nextEl: $sliderMain.find('.swiper-arrow--next').get(0),
              },
            },
            sliderThumbs: {
              slidesPerView: 'auto',
            },
        };

        const sliderThumbs = new Swiper($sliderThumbs.get(0), options.sliderThumbs);
        options.sliderMain.thumbs = { swiper: sliderThumbs };
        const sliderMain = new Swiper($sliderMain.get(0), options.sliderMain);
        const $quickviewModal = $productMedia.closest(".accessory-product-quickview");
        pageEvents.on("accessories_option_updated", updateSlider);

        function updateSlider($selectedOption) {
            //console.warn("testing",$selectedOption, $quickviewModal);
            const selectedVarId = $selectedOption.val();
            const $selectedQV = $selectedOption.closest(".accessory-product-quickview");
            if ($quickviewModal.is($selectedQV)) {
                sliderMain.slides.forEach(slide => {
                    if (slide.hasAttribute("data-var-id")) {
                        if (slide.getAttribute("data-var-id") == selectedVarId) {
                            console.log("img index", slide.getAttribute("data-index"));
                            sliderMain.slideTo(slide.getAttribute("data-index"));
                        }
                    }
                });
            }
        }
    }
    function initAccessoriesReadMore() {
        const $productDescriptions = $(".accessory-product-description");
        $productDescriptions.each((i,el) => {
            readmoreInit(el, el.querySelector("p"));
        });
    }

    //- Media Slider (Swiper)
    function getMediaSliderMain(sliderThumbs) {
        const $slider = $(".product__media-slider .swiper");
        if (!$slider.length) return false;
        const slider = $slider.get(0);
        const _thumbs = (typeof sliderThumbs === "object") ? { swiper: sliderThumbs } : false;
        return new Swiper(slider, {
            effect: 'fade',
            //initialSlide: this.selectedMediaIndex,
            spaceBetween: 20,
            watchOverflow: true,
            navigation: {
                prevEl: slider.querySelector('.swiper-arrow--prev'),
                nextEl: slider.querySelector('.swiper-arrow--next'),
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
            thumbs: _thumbs
        });
    }
    function getMediaSliderThumbs() {
        const $slider = $(".product-media-thumbs-slider.swiper");
        if (!$slider.length) return false;
        const $sliderNav = $slider.siblings('.swiper-arrow');
        const slider = $slider.get(0);
        const navigation = ($sliderNav.length)
            ? { prevEl: $sliderNav.filter(".swiper-arrow--prev").get(0), nextEl: $sliderNav.filter(".swiper-arrow--next").get(0) }
            : false;
        return new Swiper(slider, {
            //initialSlide: this.selectedMediaIndex,
            direction: 'vertical',
            slidesPerView: 4,
            spaceBetween: 30,
            navigation: navigation
        });
    }

    //-- TrueMed Trigger
    function triggerTruemedWidget(e) {
        if (e) e.preventDefault();
        const $truemedCnt = $(".truemed-instructions");
        if (!$truemedCnt.length) { console.warn("No true med container found"); return; }
        const $truemedTrigger = $truemedCnt.find(".truemed-instructions-open, button");
        if (!$truemedTrigger.length) { console.warn("No trumed trigger found"); return; }
        console.log("TRUMED TRIGGER",$truemedTrigger);
        $truemedTrigger.trigger("click");
    }

    //- Events Setup
    function eventsObj() {
        return {
            events: {},
            on: function(eventName, fn) {
                this.events[eventName] = this.events[eventName] || [];
                this.events[eventName].push(fn);
            },
            off: function(eventName, fn) {
                if (this.events[eventName]) {
                    for (var i = 0; i < this.events[eventName].length; i++) {
                        if (this.events[eventName][i] === fn) {
                            this.events[eventName].splice(i, 1);
                            break;
                        }
                    };
                }
            },
            emit: function(eventName, data) {
                if (this.events[eventName]) {
                    this.events[eventName].forEach(function(fn) {
                        fn(data);
                    });
                }
            }
        };
    }
}