saunaProductInit();

function saunaProductInit() {
    const $prodRadioOptions = $(".product-option-radio");
    if (!$prodRadioOptions.length) console.error("Product radio options not found!");
    const $variantSelectorActual = $("#sauna-product-variants-actual");
    if (!$variantSelectorActual.length || !$variantSelectorActual.find("option").length) return console.error("No variant selector actual found!");
    const $accessorySelects = $(".optional-accessory-select");
    const $accessoryProductDataInputs = $("input.accessory-product-data");
    if (!$accessoryProductDataInputs.length) console.warn("Accessory product data inputs not found!");
    // when an accessory is added to the bundle these inputs store the data used to add the product to the cart when the user adds the main product to the cart
    const $productForm = $("#sauna-product-form");
    if (!$productForm.length) return console.error("No product form found!", $productForm);
    const pageEvents = eventsObj();
    const currentVariantSelected = { id: null, name: null, price: null, image: null, comparePrice: null };
    const currentVariantActual = { id: null, name: null, price: null, image: null, comparePrice: null };
    const currentPricing = { productCost: null, productComparePrice: null, accessoriesCost: null, accessoriesComparePrice: null, totalComparePrice: null, totalPrice: null };
    const silverLiningOption = { isSelected: () => { return isSilverLiningSelected() }, price: getSilverLiningPrice(), id: getSilverLiningID() };

    productPricing();
    productForm();
    productMedia();
    silverLining();
    accessories();
    plugOptions();
    leadTimes();
    urlUpdate();
    initMobilePin();
    //variantSKU();
    $(".product-build__price-popup-trigger modal-opener").on("click", setModalTab);

    selectionUpdated(); // initial init
    $prodRadioOptions.on("change", selectionUpdated);
    $(".custom_add_to_cart").on("click", triggerATC);


    //-- Radio option or Accessory change
    function selectionUpdated(e) {//console.log("selection updated");
        const $variantSelector = $(".product-variant-selector");
        const $variantOptions = $(".js-variant-options");
        const productOptions = $variantSelector.attr("data-options").split(" / ");//console.log("options",productOptions);
        const $slVariantOption = $variantOptions.filter(".sl-options");
        if (!$slVariantOption.length) console.error("No SL variant option found!");
        const slOptionName = $slVariantOption.attr("data-variant") || "SilverLining";
        const slOptionVal = $slVariantOption.attr("data-sl-option-val") || "SilverLining";
        const slOptionDeclineVal = $slVariantOption.attr("data-sl-option-decline-val") || "No SilverLining";
        let selectedOptions = [];

        productOptions.forEach(findSelectedOption);
        console.log("selected options", selectedOptions);
        updateCurrentVariantVar();
        updateCurrentVariantVarActual();
        console.log("currentVarSelected", currentVariantSelected);
        console.log("currentVarActual", currentVariantActual);
        pageEvents.emit("selection_updated");


        function updateCurrentVariantVarActual() {
            // Need to know the plug, panel, color, and sl-or-no-sl
            const color = selectedOptions[0].toLowerCase();
            const panel = selectedOptions[1].toLowerCase();
            const sl = (silverLiningOption.isSelected()) ? 'silverlining' : 'no silverlining';
            const $selectedPlug = $(".product-option-radio.option--plug:checked");
            if (!$selectedPlug.length) return console.warn("No Selected Plug Found!", $selectedPlug);
            const plug = ($selectedPlug.length) ? $selectedPlug.val().toLowerCase() : "usa";
            const $matchingOption = $variantSelectorActual.find("option").filter(function(i) {
                const option = this;
                const optionVal = option.value.replace("AU/NZ", "AU---NZ").split("/");
                const _panel = optionVal[0].replace("FireLight", "").replace("Infrared", "").trim().toLowerCase();
                const _color = optionVal[1].trim().toLowerCase();
                const _sl = optionVal[2].trim().toLowerCase();
                const _plug = optionVal[3].replace("---","/").trim().toLowerCase();
                let isMatch = false;
                if (_panel === panel && _color === color && _sl === sl && _plug === plug) isMatch = true;
                //console.log(`${_panel} === ${panel} && ${_color} === ${color} && ${_sl} === ${sl} && ${_plug} === ${plug}`);
                return isMatch;
            });
            if (!$matchingOption.length) return console.error("No matching variant actual found!", `${panel} / ${color} / ${sl} / ${plug}`);
            //console.log("Matching Option from Var Actual", $matchingOption);
            currentVariantActual.id = parseInt($matchingOption.attr("data-variant-id"));
            currentVariantActual.image = $matchingOption.attr("data-image-url");
            currentVariantActual.name = `${panel} / ${color} / ${sl} / ${plug}`;
            currentVariantActual.price = parseFloat($matchingOption.attr("data-price").replaceAll(",",""));
            currentVariantActual.comparePrice = parseFloat($matchingOption.attr("data-compare-price").replaceAll(",",""));
            currentVariantActual.sku = $matchingOption.attr("data-sku");
            currentVariantActual.leadTime = $matchingOption.attr("data-lead-time");
        }
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
        }
        function findSelectedOption(option) {
            // if (option === "Accessories") return selectedOptions.push($("#accessories-options").val());
            if (option === slOptionName) {
                const optionValue = (silverLiningOption.isSelected()) ? slOptionVal : slOptionDeclineVal;
                return selectedOptions.push(optionValue);
            }
            let selectedValue = "";
            const $matchingOptions = $variantOptions.filter(`[data-variant="${option}"]`);
            if (!$matchingOptions.length) return console.warn("No matching variant options found", option);
            //console.log("matching",$matchingOptions);
            const $selectedInput = $matchingOptions.find("input:checked");
            if (!$selectedInput.length) return console.warn("No selected input found", $matchingOptions);
            //console.log("selected input", $selectedInput);
            selectedOptions.push($selectedInput.val());
        }
    }


    //-- Pricing
    function productPricing() {
        pageEvents.on("selection_updated", updatePricing);

        function updatePricing(e) {
            const productPrice = currentVariantActual.price;
            const accessoriesPrice = getAccessoriesPrice();
            const totalRaw = productPrice + accessoriesPrice.total;
            let compareTotalRaw = null;
            if (currentVariantActual.comparePrice != null && currentVariantActual.comparePrice != "") compareTotalRaw = currentVariantActual.comparePrice;
            if (accessoriesPrice.compareTotal != null) {
                compareTotalRaw = (compareTotalRaw != null) ? compareTotalRaw + accessoriesPrice.compareTotal : accessoriesPrice.compareTotal;
            }
            currentPricing.productCost = formatToUSD(productPrice);
            currentPricing.productComparePrice = (currentVariantActual.comparePrice != null && currentVariantActual.comparePrice != "") ? formatToUSD(currentVariantActual.comparePrice) : null;
            currentPricing.accessoriesCost = formatToUSD(accessoriesPrice.total);
            currentPricing.accessoriesComparePrice = formatToUSD(accessoriesPrice.compareTotal);
            currentPricing.totalComparePrice = (compareTotalRaw != null && compareTotalRaw > totalRaw) ? formatToUSD(compareTotalRaw) : null;
            currentPricing.totalPrice = formatToUSD(totalRaw);
            console.log("current pricing",currentPricing);
            updatePricingElements();
        }
        function updatePricingElements() {
            $("[data-total-price]").text(currentPricing.totalPrice);
            if (currentVariantActual.comparePrice != null && currentVariantActual.comparePrice != "") $(".compare-price").text(currentPricing.totalComparePrice);
            // Modals
            $("span[data-total]").text(currentPricing.totalPrice);
            // SplitIt
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
            if (compareTotal <= total) compareTotal = null;
            return { total: total, compareTotal: compareTotal };
        }
    }


    //-- Cart & Product Form
    function productForm() {
        const $inputs = $productForm.find(`input[type="hidden"]`);
        if (!$inputs.length) return console.warn("No product form inputs found!", $inputs);

        pageEvents.on("selection_updated", updateInputs);

        function updateInputs() {
            accessoryOptions();
            $inputs.filter(".selected-variant").val(currentVariantActual.id);//.val(currentVariantSelected.id);
        }
        function accessoryOptions() {
            const $accsInput = $inputs.filter(".prop-accessories");
            if (!$accsInput.length) return console.warn("No accessories input found!", $inputs);

            const selectedAccessories = { ids: '', value: '' };
            const $selectedAccessories = $accessorySelects.filter(":checked");
            if (!$selectedAccessories.length) { console.log("No accessories selected", $accessorySelects); return; }
            // TO DO: Loop through $selectedAccessories and get [name] value && [data-id] && [data-qty]
            $selectedAccessories.each((i,el) => {
                const name = el.getAttribute("name");
                const id = el.getAttribute("data-id");
                const qty = el.getAttribute("data-qty");
                selectedAccessories.ids += (selectedAccessories.ids === '') ? '' : ', ';
                selectedAccessories.ids += id;
                selectedAccessories.value += (selectedAccessories.value === '') ? '' : ', ';
                selectedAccessories.value += `Product: ${name} | Quantity: ${qty}`;
            });
            console.log("selected accessory products:", selectedAccessories);
            $accsInput.val(selectedAccessories.value).attr("data-accessory-ids", selectedAccessories.ids);
        }
    }


    //-- Image Slider
    function productMedia() {
        const sliderThumbs = getMediaSliderThumbs();
        const sliderMain = getMediaSliderMain();
        const $mainSlider = $(".product__media-slider .swiper");
        const $thumbsSlider = $(".product__media-thumbs .swiper");
        const thumbActiveClass = "swiper-slide-thumb-active";
        const $stickyProduct = $(".product-sticky-button");
        
        pageEvents.on("selection_updated", updateSlider);
        $thumbsSlider.find(".swiper-slide").on("click", changeThumbSlide);
        if ($stickyProduct.length) pageEvents.on("selection_update_slider_updated", updateStickyProduct);

        function changeThumbSlide(e) {
            if (e) e.preventDefault();
            const $slide = $(this);
            let slideIndex = null;
            if ($slide.is(`[data-custom-thumbnail]`)) {
                slideIndex = $mainSlider.find(".swiper-slide").filter(`[data-custom-thumbnail-main="${$slide.attr('data-custom-thumbnail')}"]`).index();
            }
            else {
                slideIndex = $mainSlider.find(".swiper-slide").filter(`[data-variant-id="${$slide.attr('data-var-id')}"]`).index();
            }
            if (slideIndex != null) {
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
                //if (parseInt(slide.dataset.variantId) === currentVariantSelected.id) matchingSlide = slide;
                if (slide.hasAttribute("data-variant-id")) {
                    const slideVarIds = slide.dataset.variantId.split(",");
                    slideVarIds.forEach(id => {
                        if (parseInt(id) === currentVariantSelected.id) matchingSlide = slide;
                    });
                }
            });
            if (matchingSlide != null) {
                sliderMain.slideTo(matchingSlide.dataset.index, 0);
                /*sliderThumbs.slides.forEach(slide => {
                    let $matchingThumb = null;
                    if (matchingSlide.hasAttribute("data-custom-thumbnail")) {
                        $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-custom-thumbnail="${matchingSlide.dataset.customThumbnail}"]`);
                    }
                    else if (matchingSlide.hasAttribute("data-var-id")) {
                        $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-var-id="${matchingSlide.dataset.variantId}"]`);
                    }
                    $thumbsSlider.find(`.${thumbActiveClass}`).removeClass(thumbActiveClass);
                    if ($matchingThumb != null) $matchingThumb.addClass(thumbActiveClass);
                });*/
                if (matchingSlide.hasAttribute("data-custom-thumbnail-main")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-custom-thumbnail="${matchingSlide.dataset.customThumbnailMain}"]`);
                }
                else if (matchingSlide.hasAttribute("data-var-id")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-var-id="${matchingSlide.dataset.varId}"]`);
                }
                else if (matchingSlide.hasAttribute("data-media-id")) {
                    $matchingThumb = $thumbsSlider.find(".swiper-slide").filter(`[data-media-id="${matchingSlide.dataset.mediaId}"]`);
                }
                console.log("matching thumb", $matchingThumb, $matchingThumb.index());
                $thumbsSlider.find(`.${thumbActiveClass}`).removeClass(thumbActiveClass);
                if ($matchingThumb != null && $matchingThumb.length) {
                    sliderThumbs.slideTo($matchingThumb.index(), 0);
                    $matchingThumb.addClass(thumbActiveClass);
                }
                pageEvents.emit("selection_update_slider_updated", matchingSlide);
            }
            else console.warn("no matching image found");
        }
        function updateStickyProduct(matchingSlide) {
            const $img = $stickyProduct.find(".media img");
            if (!$img.length) return console.warn("No sticky product image found!");
            const $matchingImg = $(matchingSlide).find("img");
            if (!$matchingImg.length) return console.warn("No matching slide image found!", matchingSlide);
            const $newImg = $matchingImg.clone();
            $img.replaceWith($newImg);
        }
    }
    

    //-- Option - SilverLining
    function silverLining() {
        const $slIcon = $(".silverlining-sticky-icon");
        if (!$slIcon.length) return;
        $(".col--prod-image-slider").append($slIcon);

        pageEvents.on("selection_updated", updateIcon);

        function updateIcon(e) {
            $slIcon.toggleClass("active", silverLiningOption.isSelected());
        }
    }


    //-- Option/Variant - Accessories
    function accessories() {
        //const $variantOptions = $("#accessories-options");
        const $accessoryProducts = $(".js-variant-options.accessoriesOption li");
        //if (!$variantOptions.length || !$accessoryProducts.length) return console.warn("No Accessories or Accessory Variant Options found!");
        if (!$accessoryProducts.length) return console.warn("No Accessories found!");

        $(".js-accessory-label-selector").on("click", toggleAccessory);
        $(".accessory-qty-cnt .qty-btn").on("click", qntUpdate);
        $(".js-accs-default-qty .qty-btn").on("click", updateQty);
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
            // const selectedAccessoriesOption = getSelectedAccessoriesOptions();
            // console.log("selected accessories options", selectedAccessoriesOption);
            // $variantOptions.val(selectedAccessoriesOption);
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
        function updateAccessoriesVarInput($productSelector) {
            const productName = $productSelector.attr("data-product");
            const productHandle = $productSelector.attr("data-product-handle");
            const productPrice = $productSelector.find('option:selected').attr("data-price").replace(",","");
            const productComparePrice = $productSelector.find("option:selected").attr("data-compare-price").replace(",","");
            if (!productName || !productHandle) return console.warn("No product name or handle found!", $productSelector);
            if (!productPrice) return console.warn("No product price found!", $productSelector);
            const $matchingOption = $accessoryProducts.filter(`[data-product="${productName}"]`);
            if (!$matchingOption.length) return console.warn("No matching option found!", productName, $accessoryProducts);
            const $cbInput = $matchingOption.find(`input[name="${productName}"]`);
            if (!$cbInput.length) return console.warn("No cb input found!", $matchingOption);
            $cbInput.prop("checked",true).attr("data-id", $productSelector.val()).attr("data-qty", $productSelector.attr("data-qty")).attr("data-price", productPrice).attr("data-compare-price", productComparePrice);
            // const selectedAccessoriesOption = getSelectedAccessoriesOptions();
            // $variantOptions.val(selectedAccessoriesOption);
            $matchingOption.find(".js-accessory-label-selector").addClass("isSelected");
            $matchingOption.find(".qty-container").addClass("isSelected");
            $matchingOption.find(".qty-input").val($productSelector.attr("data-qty"));
        }
        function updateMatchingDataInput($matchingDataInput, selectedVarId, price, quantity, inputVal) {
            if (!$matchingDataInput.length) return console.warn("No matching data input");
            $matchingDataInput.attr("data-selected-variant", selectedVarId);
            $matchingDataInput.attr("data-selected-quantity", quantity);
            $matchingDataInput.attr("data-price-single", price);
            $matchingDataInput.val(inputVal);
            console.log("accessory data input", $matchingDataInput);
        }
        function getSelectedAccessoriesOptions() {
            let selectedAccessoriesOption = 'None';
            const $selectedAccessories = $accessorySelects.filter(`[data-accessories-option]:checked`);
            if (!$selectedAccessories.length) { return selectedAccessoriesOption; }
            //console.log($selectedAccessories);
            const selectedAccessoriesArr = [];
            $selectedAccessories.each((i, el) => {
                selectedAccessoriesArr.push(el.dataset.accessoriesOption);
            });
            console.log("Selected Accessories", selectedAccessoriesArr);
            if (selectedAccessoriesArr.length > 1) {
                const $multiOptions = $variantOptions.find("[data-multi-option]");
                if (!$multiOptions.length) { console.log("Could not find any multi options"); return selectedAccessoriesOption; }
                const multiOption = $multiOptions.first().val(); // Note: This is only setup to handle 1 mutli option
                if (multiOption == `${selectedAccessoriesArr[0]} + ${selectedAccessoriesArr[1]}` || multiOption == `${selectedAccessoriesArr[1]} + ${selectedAccessoriesArr[0]}`) {
                    return multiOption;
                }
                else {
                    console.log("No Multi option match", multiOption, selectedAccessoriesArr);
                    return selectedAccessoriesOption;
                }
            }
            else {
                $variantOptions.find("option").each((i,el) => {
                    if (el.value == selectedAccessoriesArr[0]) selectedAccessoriesOption = el.value;
                });
            }

            return selectedAccessoriesOption;
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


    //-- Trigger Add to Cart
    function triggerATC(e) {
        if (e) e.preventDefault();
        const $inputs = $productForm.find(`input[type="hidden"]`);
        if (!$inputs.length) return console.error("No product form inputs found!", $inputs);
        const cartDrawer = document.querySelector('cart-drawer');
        if (!cartDrawer) return console.error("No cart drawer found!");
        const itemsToAdd = getItemsToAdd();
        if (typeof itemsToAdd === "undefined" || itemsToAdd.length < 1) return console.error("No items to add to cart found!");
        
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
            
            $accessoryProductDataInputs.each(setupItems);
            $("#sauna-product-form").each(setupItems);
            return selectedItems;

            function setupItems(i,el) {
                const $el = $(el);

                if ($el.is("#sauna-product-form")) setupItemForm($el.find("form"));
                else setupItemAccessory($el);
            }
            function setupItemForm($form) {
                const productData = getProductDataObj();
                productData.id = currentVariantActual.id;
                selectedItems.push(productData);

                function setupPropInput(i, input) {
                    const $input = $(input);
                    const property = $input.attr("name").replace("properties[","").replace("]","");
                    //console.log(`${property}: ${$input.val()}`);
                    propInputs[property] = $input.val();
                    //productData.properties[property] = $input.val();
                }
            }
            function setupItemAccessory($input) {
                if ($input.val() === "") return console.log("Product not selected", $input.attr("data-product"));
                const selectedVariantId = parseInt($input.attr("data-selected-variant"));
                const selectedQuantity = parseInt($input.attr("data-selected-quantity"));
                const productData = getProductDataObj();
                productData.id = selectedVariantId;
                productData.quantity = selectedQuantity;
                console.log("accesss product data", productData);
                selectedItems.push(productData);
            }
            function getProductDataObj() {
                return {
                    id: null,
                    quantity: 1,
                }
            }
        }
    }


    //-- Plug Options
    function plugOptions() {
        const $internationalPlugToggle = $("li.international-plugs");
        if (!$internationalPlugToggle.length) return console.warn("No international plug toggle found!");

        $(".plug-item--international").on("click", updatePlugIcon);

        function updatePlugIcon(e) {
            const iconUrl = $(this).attr("data-icon");
            if (!iconUrl) return console.warn("No plug icon url found!", this);
            $internationalPlugToggle.find(".option-img").css("background-image", `url(${iconUrl})`);
        }
    }


    //-- Set tab on price modal
    function setModalTab(e) {
        if (e) e.preventDefault();
        const $this = $(this);
        const modalID = $this.closest("[data-modal]").data("modal");
        const tabID = $this.closest("[data-tab-id]").data("tab-id");
        //console.log(`%ctabID:${tabID}`,"color:green");
        const $modal = $(modalID);
        if (!$modal.length) { console.warn("No modal found", $this, modalID, tabID); return; }
        const $trigger = $modal.find(`.tabs-content__button[data-tab-id="${tabID}"]`);
        if (!$trigger.length) { console.warn("No modal tab trigger found", $this, modalID, tabID, $modal); return; }
        $trigger.trigger("click");
    }


    //-- Lead Times
    function leadTimes() {
        const $ltInfo = $("main .js-variant-leadtime");
        if (!$ltInfo.length) return console.warn("No lead time info found");
        pageEvents.on("selection_updated", updateLeadTime);

        function updateLeadTime() {
            const newLT = currentVariantActual.leadTime;
            if (newLT != "" && newLT != "undefined") $ltInfo.text(newLT);
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


    //-- Init Mobile Pin
    function initMobilePin() {
        const $mobilePinSpacer = $(".js-mobile-pin-spacer");
        if (!$mobilePinSpacer.length) return console.log("No mobile pin spacer found!");
        const $target = $($mobilePinSpacer.attr("data-target"));
        if (!$target.length) return console.warn("No mobile pin spacer Target found!");
        let windowWidth = window.innerWidth;

        setSpacerHeight();
        $(window).on("resize", setSpacerHeight);
        initST();

        function setSpacerHeight(e) {
            const currentWindowWidth = window.innerWidth;
            if (e && e.type === "resize" && currentWindowWidth !== windowWidth) {
                setTimeout(setSpacerHeight, 500);
                return;
            }
            windowWidth = currentWindowWidth;
            const newHeight = $target.height();
            console.log("New spacer height", parseInt(newHeight));
            $mobilePinSpacer.height(parseInt(newHeight));
            if (typeof window.ScrollTrigger === 'function') window.ScrollTrigger.refresh();
        }
        function initST() {
            if (typeof gsap === "undefined") { console.warn("GSAP NOT FOUND!"); return; }
            gsap.registerPlugin(ScrollTrigger);
            const options = {
                trigger: $target.parent().get(0),
                pin: false,
                start: "top top",
                end: () => {//"bottom top",
                    const $header = $(".site-header");
                    const targetHeight = $target.height();
                    const totalHeight = $header.height() + targetHeight;
                    console.log("total height", totalHeight);
                    return "bottom top+=" + totalHeight + "px";
                },
                toggleClass: "product-build-active",//"section-scrolled",
                anticipatePin: 1,
                markers: (window.location.search.includes("test")),
                onRefresh: ({progress, direction, isActive}) => console.log(progress, direction, isActive),
            };
            const st = ScrollTrigger.create(options);
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
    }
    function initAccessoriesReadMore() {
        const $productDescriptions = $(".accessory-product-description.js-readmore-content");
        $productDescriptions.each((i,el) => {
            readmoreInit(el, el.querySelector("p"));
        });
    }

    //- SilverLining Helpers
    function isSilverLiningSelected() {
        const $slSelectInput = $("#sl_option_select_input");
        if (!$slSelectInput.length) { console.warn("No SL Data Input found!"); return false; }
        return $slSelectInput.is(":checked");
    }
    function getSilverLiningPrice() {
        const $slDataInput = $("#silverlining_product_input");
        if (!$slDataInput.length) { console.warn("No SL Data Input found!"); return false; }
        return parseFloat($slDataInput.attr("data-price").replaceAll(",",""));
    }
    function getSilverLiningID() {
        const $slDataInput = $("#silverlining_product_input");
        if (!$slDataInput.length) { console.warn("No SL Data Input found!"); return false; }
        return parseInt($slDataInput.val());
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
            thumbs: _thumbs,
            /* - testing 6.18.25
            on: {
                slideChange: (swiper) => {
                    console.log("slide main - slideChange");
                }
            }*/
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