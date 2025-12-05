/**
 * Product Customizer UI
 * - handles setting up the variant options (colors, plugs, supersauna, silverlining, accessories)
 * - handles setting and updating the prices on load and when options are changed
 * - handles updating the variant images when options are changed
 * 
*/
$(document).ready(function() {

/**
 * Event Handlers
 * 
 */
// Qty Buttons
document.addEventListener("click", handleQtyButtons);
const $doc = $(document);

// Optional variant/option change (used to be Accessories)
$doc.on("click", ".ForClickOptional .product-build__variant-pill", handleOptionalVarChange);

// Required variant/option change (SilverLining/Plug) (Used to also be SuperSauna)
$doc.on("click", ".ForClickRequired", handleRequiredVarChange);

// Variant/Option change (All variants/options - including the ones above)
$doc.on("click", ".product-build__variant-pill", handleVarChange);

// WUA - Step change - update images
$doc.on("product_step_change", SetImages);

// WUA - TruMed widget modal trigger
$doc.on("click", ".js-truemed-trigger", triggerTruemedWidget);

// WUA - Pricing modal: show correct tab
$doc.on("click", ".product-build__price-popup-trigger modal-opener", setModalTab);


/**
 * Init
 * 
 */
let addForm = $("form.product__form"); // Select the form correctly
$(".ForClickRequiredUL").each(function() {
    let propertyTitle = $(this).attr("data-property-title");
    let optionalItemsInput = addForm.find("input.OptinalItemsString").first(); // Find the first matching input

    if (propertyTitle) {
        let inputValue = propertyTitle === "SilverLining" ? "No Silver Lining" : "";
        let input = `<input type="hidden" class="PropertiesInput" name="properties[${propertyTitle}]" value="${inputValue}">`;
        if (optionalItemsInput.length) {
            $(input).insertBefore(optionalItemsInput); // Insert before the existing input
        } else {
            addForm.append(input); // If no existing input found, append to the form
        }
    }
});
let BundleDiscount = JSON.parse($(".BundleDiscount").val());
let TotalRequired = 0;
let discountRequired = 0;
console.log("BundleDiscount: ", BundleDiscount);
// Get option order dynamically from .optionIndexes attributes
let option_1 = $('.optionIndexes').attr("data-opt-1")?.toLowerCase() || "";
let option_2 = $('.optionIndexes').attr("data-opt-2")?.toLowerCase() || "";
let option_3 = $('.optionIndexes').attr("data-opt-3")?.toLowerCase() || "";
// Filter out empty values
const optionOrder = [option_1, option_2, option_3].filter(value => value !== "");
console.log("optionOrder:", optionOrder);
// Get initial selection from "select.Variant_with_values"
let initialVariantText = $("select.Variant_with_values option:first").val() || "";
let selectedOptions = initialVariantText.split(" / ").map(val => val.trim()); // Trim spaces
console.log("selectedOptions:", selectedOptions);
let variant_string = "";
let selectedVariant = null;
optionOrder.forEach((option, index) => {
    if (index == 0) {
        if (selectedOptions[index] !== undefined) {
            variant_string = updateSelection(optionOrder, option, selectedOptions[index], selectedOptions);
            if (variant_string != "" || variant_string != null) {
                selectedVariant = get_variant(variant_string);
            }
        }
    }
});
console.log("Updated Selection onload:", variant_string);
let TotalPriceload = 0;
let discountedPriceload = 0;
if (selectedVariant.length) {
    console.log("Element:", selectedVariant); // Logs the entire <option> element
    console.log("Value:", selectedVariant.attr("value")); // Get the value
    console.log("data-varaint-id:", selectedVariant.attr("data-varaint-id")); // Get the text inside the option
    console.log("data-price:", selectedVariant.attr("data-price")); // Get the text inside the option
    console.log("data-image-url:", selectedVariant.attr("data-image-url")); // Get the text inside the option
    if (selectedVariant.attr("data-price") !== undefined && selectedVariant.attr("data-price") !== "" && selectedVariant.attr("data-price") !== null) {
        TotalPriceload += parseFloat(selectedVariant.attr("data-price").replace(/,/g, "")); // Remove commas and convert to number
        TotalPriceload = parseFloat(TotalPriceload.toFixed(2));
        console.log("before loop TotalPrice:", TotalPriceload);
        TotalRequired += parseFloat(selectedVariant.attr("data-price").replace(/,/g, "")); // Remove commas and convert to number
        TotalRequired = parseFloat(TotalRequired.toFixed(2));
        console.log("before loop TotalPrice:", TotalRequired);
        get_required_variant(optionOrder, variant_string);
        get_optional_variant(optionOrder, variant_string);
        SetImages();
        SetPrices(TotalPriceload, BundleDiscount);
    }
}
else {
    console.log("Variant not found!");
}



/**
 * Event Handlers
 * 
 */
//-- Optional variant/option change (used to be Accessories)
function handleOptionalVarChange(event) {
    // console.warn("USER CLICKS OPTION"); //  WUA
    console.log("ForClickRequired clicked");
    $(this).toggleClass("isSelected");

    var selectors = [
        "input.optionalHiddenOptions",
        "select.optionalProduct",
        "label.product-build__variant-pill"
    ];
    $(this).siblings(".qty-container").toggleClass("isSelected").find(".qty-input").val("1"); // WUA mod
    selectors.forEach(selector => {
        var $children = $(this).siblings(selector);

        if ($children.length) { // Ensure elements exist
            $children.toggleClass("isSelected");
        }
    });
    let TotalOptinalInside = getTotalpriceMain();
    console.log("TotalOptinalInside clicked");
    console.log(TotalOptinalInside);

    SetPrices(TotalOptinalInside, BundleDiscount);
}


//-- Required variant/option change (Super Sauna / SilverLining Options)
function handleRequiredVarChange(event) {
    console.log("ForClickRequired clicked");
    var $ul = $(this).closest("ul"); // Get the parent <ul>
    var selectors = [
        "input.requiredHiddenOptions",
        "select.requiredProduct",
        "label.product-build__variant-pill"
    ];
    selectors.forEach(selector => {
        if ($ul.find(selector)) {
            $ul.find(selector).removeClass("isSelected");
        }
    });
    selectors.forEach(selector => {
        if ($(this).children(selector)) {
            $(this).children(selector).addClass("isSelected");
        }
    });
    get_required_variant(optionOrder, variant_string);
    get_optional_variant(optionOrder, variant_string);
    SetImages();
    let TotalrequiredInside = getTotalpriceMain();
    console.log("TotalOptinalInside clicked");
    console.log(TotalrequiredInside);
    SetPrices(TotalrequiredInside, BundleDiscount);
}


//-- Variant/Option change (All variants/options - including the ones above)
function handleVarChange(event) {
    const $this = $(this);// WUA
    if (!$(this).closest("li.ForClickOptional").length) {
        console.log("ForClickRequired is greater then 0");
        // $(this).closest('ul.product-build__variant-pills') // Find the closest parent <ul>
        //     .find('span') // Select all <span> elements within it
        //     .css("border", "none"); // Remove existing borders
        // $(this).find('span:first').css("border", "3px solid black");
        // WUA
        // The code above just removes the border to all items and then adds a border to the active item
        // I'm going to achieve the same by setting the input to "checked"/"unchecked" - and use that to style the item
        const $parentOptionsCnt = $this.closest('ul.product-build__variant-pills');
        const $varOptions = $parentOptionsCnt.find("input[type='radio']");
        $varOptions.prop("checked", false).attr("checked", false);
        $this.siblings("input[type='radio']").prop("checked", true).attr("checked", true);
    }
    let TriggerValue = $(this).siblings("input[type='radio']").val();
    let TriggerName = $(this).siblings("input[type='radio']").attr("name");
    if (TriggerName !== "Required_products" && TriggerName !== "optinal_products" && TriggerValue !== undefined && TriggerName !== undefined) {
        console.log("OptionName:", TriggerName);
        console.log("TriggerValue:", TriggerValue);
        variant_string = updateSelection(optionOrder, TriggerName, TriggerValue, selectedOptions);
        console.log("Updated Selection onclick:", variant_string);
        if (variant_string != "" || variant_string != null) {
            let selectedVariant = get_variant(variant_string);
            console.log("VariantData onclick:", variant_string);
            let TotalPrice = 0;
            let discountedPrice = 0;
            if (selectedVariant.length) {
                var form = $('form.product__form');
                var selectedVariantId = selectedVariant.attr("data-varaint-id"); // Fix typo
                form.find('input[type="hidden"][name="id"]').val(selectedVariantId); // Set the value correctly
                console.log("Element:", selectedVariant); // Logs the entire <option> element
                console.log("Value:", selectedVariant.attr("value")); // Get the value
                console.log("data-varaint-id:", selectedVariant.attr("data-varaint-id")); // Get the text inside the option
                console.log("data-price:", selectedVariant.attr("data-price")); // Get the text inside the option
                console.log("data-image-url:", selectedVariant.attr("data-image-url")); // Get the text inside the option
                if(selectedVariant.attr("data-price") !== undefined && selectedVariant.attr("data-price") !== "" && selectedVariant.attr("data-price") !== null){
                    TotalPrice += parseFloat(selectedVariant.attr("data-price").replace(/,/g, "")); // Remove commas and convert to number
                    TotalPrice = parseFloat(TotalPrice.toFixed(2));
                    console.log("before loop TotalPrice:", TotalPrice);
                    get_required_variant(optionOrder, variant_string);
                    get_optional_variant(optionOrder, variant_string);
                    SetImages();
                    SetPrices(TotalPrice, BundleDiscount);
                }
            } else {
                console.log("Variant not found!");
            }
        }
    } else {
        console.log("i am here!");
    }
}


//-- Qty Buttons
function handleQtyButtons(event) {
    if (event.target.classList.contains("qty-btn")) {
        let container = event.target.closest(".qty-container");
        let input = container.querySelector(".qty-input");
        let currentQty = parseInt(input.value); // ❌ Removed || 1

        console.log("Current Qty Before Change:", currentQty);

        if (event.target.dataset.action === "decrease") {
            if (currentQty > 0) {
                input.value = currentQty - 1;
                console.log("Qty Decreased:", input.value);
            }

            if (input.value == 0) {
                console.log("Qty reached 0 - Toggling isSelected");

                let optionalHiddenOptions = container.parentElement.querySelectorAll("input.optionalHiddenOptions, select.optionalProduct, label.product-build__variant-pill");

                optionalHiddenOptions.forEach(element => {
                    element.classList.toggle("isSelected");
                });

                container.classList.toggle("isSelected");
            }
        } else if (event.target.dataset.action === "increase") {
            input.value = currentQty + 1;
            console.log("Qty Increased:", input.value);
        }

        let TotalOptinalInsideQTY = getTotalpriceMain();
        console.log("Total Optional Inside Qty:", TotalOptinalInsideQTY);

        SetPrices(TotalOptinalInsideQTY, BundleDiscount);
    }
}


//-- TrueMed Trigger
function triggerTruemedWidget(e) {
    if (e) e.preventDefault();
    const $truemedCnt = $(".truemed-instructions");
    if (!$truemedCnt.length) { console.warn("No true med container found"); return; }
    const $truemedTrigger = $truemedCnt.find(".truemed-instructions-open, button");
    if (!$truemedTrigger.length) { console.warn("No trumed trigger found"); return; }console.log("TRUMED TRIGGER",$truemedTrigger);
    $truemedTrigger.trigger("click");
}


//-- Set tab on price modal
function setModalTab(e) {
    const $this = $(this);
    const modalID = $this.closest("[data-modal]").data("modal");
    const tabID = $this.closest("[data-tab-id]").data("tab-id");console.log(`%ctabID:${tabID}`,"color:green");
    const $modal = $(modalID);
    if (!$modal.length) { console.warn("No modal found", $this, modalID, tabID); return; }
    const $trigger = $modal.find(`.tabs-content__button[data-tab-id="${tabID}"]`);
    if (!$trigger.length) { console.warn("No modal tab trigger found", $this, modalID, tabID, $modal); return; }
    $trigger.trigger("click");
}




/**
 * Util Functions
 * 
*/
// TODO: Setup plugs to be part of required variant - Add .requiredHiddenOption[.isSelected] - Add .product-build__variant-pill[.isSelected]
function get_required_variant(optionOrder, get_required_variants) {
    console.log("get_required_variant optionOrder");
    console.log(optionOrder);
    let required_inputs = $("input.requiredHiddenOptions[type='hidden']");
    let isValid = false;
    let array_options = [];
    let addForm = $("form.product__form");
    required_inputs.each(function() {
        let requiredInput = $(this);
        let get_required_variantaa = get_required_variants; // Example dynamic value
        let requiredValues = get_required_variantaa.split(" / "); // Break into an array
        updateVariantProperties();
        let selectElement = requiredInput.siblings("select"); // Find the nearest <select>
        let bestMatch = null;
        let maxMatchCount = 0;
        selectElement.find("option").each(function() {
            let option = $(this);
            let matchCount = 0;
            // Extract values from data-variant-req-opt-1, 2, 3
            let optionValues = [
                option.attr("data-variant-req-opt-1"),
                option.attr("data-variant-req-opt-2"),
                option.attr("data-variant-req-opt-3")
            ].filter(Boolean); // Remove empty values
            // Count how many values match
            optionValues.forEach(val => {
                if (requiredValues.includes(val)) matchCount++;
            });
            // Update the best match if this option has more matches
            if (matchCount > maxMatchCount) {
                bestMatch = option;
                maxMatchCount = matchCount;
            }
        });
        // If we found a matching option, select it
        if (bestMatch) {
            bestMatch.prop("selected", true);
            console.log("Selected optionss:", bestMatch.val());
        }
        else {
            console.log("No suitable match found.");
        }
    });
}

function get_optional_variant(optionOrder, get_optional_variant) {
    console.log("get_optional_variant optionOrder", get_optional_variant);
    console.log(optionOrder);
    let optional_inputs = $("input.optionalHiddenOptions[type='hidden']");//console.log("wua",optional_inputs);
    // let isValid = false; // WUA - wasn't being used
    // let array_options = []; // WUA - wasn't being used

    optional_inputs.each(function() {
        let optionalInput = $(this);
        // If optional product only has default variant
        optionalProdOpt1 = optionalInput.attr("data-optional-opt-1");
        if (optionalProdOpt1 === "" || optionalProdOpt1 === "default") {
            optionalInput.siblings("select").find("option").first().prop("selected", true);
            return;
        }
        let get_optional_variantaa = get_optional_variant; // Example dynamic value
        let optionalValues = get_optional_variantaa.split(" / "); // Break into an array
        // updateVariantProperties();
        let selectElement = optionalInput.siblings("select"); // Find the nearest <select>
        let bestMatch = null;
        let maxMatchCount = 0;
        selectElement.find("option").each(function() {
            let option = $(this);
            let matchCount = 0;
            // Extract values from data-variant-req-opt-1, 2, 3
            let optionValues = [
                option.attr("data-variant-req-opt-1"),
                option.attr("data-variant-req-opt-2"),
                option.attr("data-variant-req-opt-3")
            ].filter(Boolean); // Remove empty values
            // Count how many values match
            optionValues.forEach(val => {
                if (optionalValues.includes(val)) matchCount++;
            });
            // Update the best match if this option has more matches
            if (matchCount > maxMatchCount) {
                bestMatch = option;
                maxMatchCount = matchCount;
            }
        });
        // If we found a matching option, select it
        if (bestMatch) {
            bestMatch.prop("selected", true);
            console.log("Selected option:", bestMatch.val());
        }
        else {
            console.log("No suitable match found.");
        }
    });
}

function get_variant(variant_string) {
    var $option = $("select.Variant_with_values").find(`option[value="${variant_string}"]`);
    $option.prop("selected", true);
    return $option;
}

function SetImages() {return false;
    console.log("Inside SetImages start");
    // actual product variants - color + plug (as of 4.4)
    let mainSelectValues = $("select.Variant_with_values").val();
    console.log("mainSelectValues", mainSelectValues);

    let firstPart = mainSelectValues.split(" / ")[0].toLowerCase();
    let arrayNames = [];

    // Required options - SuperSauna + SilverLining (as of 4.4)
    $('li.ForClickRequired').each(function() {
        let selectedLabel = $(this).find('label.product-build__variant-pill.isSelected');
        if (selectedLabel.length) {
            let requiredSelect = selectedLabel.siblings('select.requiredProduct');
            if (requiredSelect.length) {
                arrayNames.push(requiredSelect.data('product-title').toLowerCase());
            }
            else {
                arrayNames.push('nosilvershield');
            }
        }
    });

    console.log("arrayNames", arrayNames);

/**/
    // WUA
    //$("input.VariantImage").each((i,el) => {console.log('%c' + el.value, "color: pink");});
    const selectedColor = firstPart.replace(" ", "").replace("hard-dyedtumeric","tumeric");console.log("SSSSelected color: ",selectedColor);
    const selectedSS = (arrayNames.length > 0) ? arrayNames[0] : false;console.log("SSSSSelected SS", selectedSS);
    const selectedSL = (arrayNames.length > 1) ? arrayNames[1].replace("silvershield","silverlining") : false;console.log("SSSSSelected SL", selectedSL);
    const currentStep = (typeof window.productSteps === "undefined" || window.productSteps.active == 0) ? 1 : window.productSteps.active;
    console.log(`%ccurrent step: ${currentStep}`, "color: orange");
    /* Backup while testing
    let $activeMediaContainer = $(`[data-media-index='${currentStep}']`);//console.log("NEW ACTIVE MEDIA",$activeMediaContainer);
    // if no media container for this step select the active one
    if (!$activeMediaContainer.length) { $activeMediaContainer = $(`.product-build__wrapper.is-visible`); }
    // if still no match return
    if (!$activeMediaContainer.length) { console.warn("No active media container found"); return; }
    const $activeImages = $activeMediaContainer.find(".product__media-slider .step-variant-image");
    if (!$activeImages.length) { console.warn("No variant images found"); return; }
    const $newActiveImage = getNewActiveImage($activeImages);
    if (!$newActiveImage || !$newActiveImage.length) { console.warn("No new active image found"); return; }//console.log("new active image",$newActiveImage.attr("src"));
    const $newActiveSlider = $activeMediaContainer.find("product-media");
    if (!$newActiveSlider.length) { console.warn("No new active slider found"); return; }
    const $newActiveSlide = $newActiveImage.closest(".swiper-slide");
    if (!$newActiveSlide.length) { console.warn("No new active slide found"); return; }
    const newActiveSlideIndex = $newActiveSlide.attr("data-media-id");console.log("New active slide index",newActiveSlideIndex);
    const newActiveMediaEv = new CustomEvent("set_new_active_media", { detail: { id: newActiveSlideIndex }});
    $newActiveSlider.get(0).dispatchEvent(newActiveMediaEv);
    */
    $(`[data-media-index]`).each((i,mediaContainer) => {
        const $activeMediaContainer = $(mediaContainer);
        const $activeImages = $activeMediaContainer.find(".product__media-slider .step-variant-image");
        if (!$activeImages.length) { console.warn("No variant images found"); return; }
        const $newActiveImage = getNewActiveImage($activeImages);
        if (!$newActiveImage || !$newActiveImage.length) { console.warn("No new active image found"); return; }//console.log("new active image",$newActiveImage.attr("src"));
        const $newActiveSlider = $activeMediaContainer.find("product-media");
        if (!$newActiveSlider.length) { console.warn("No new active slider found"); return; }
        const $newActiveSlide = $newActiveImage.closest(".swiper-slide");
        if (!$newActiveSlide.length) { console.warn("No new active slide found"); return; }
        const newActiveSlideIndex = $newActiveSlide.attr("data-media-id");//console.log("New active slide index",newActiveSlideIndex);
        const newActiveMediaEv = new CustomEvent("set_new_active_media", { detail: { id: newActiveSlideIndex }});
        $newActiveSlider.get(0).dispatchEvent(newActiveMediaEv);
    });
    const $newBundleImage = getNewActiveImage($(`[data-media-index]`).last().find(".product__media-slider .step-variant-image"));
    const newBundleImgURL = (!$newBundleImage || !$newBundleImage.length) ? "https://cdn.shopify.com/s/files/1/0567/1865/5531/files/luminati-infrared-sauna-natural-gallery-01.jpg" : $newBundleImage.attr("src");
    $("input.bundleimagecart").val(`${newBundleImgURL}?width=500`);
    //console.log(`%cbundle image test: ${newBundleImgURL}`, "color:aqua;");

    function getNewActiveImage($activeImages) {
        let $newActive = false;
        $activeImages.each((i,el) => {
            const $activeImage = $(el);
            const imageName = $activeImage.attr("alt");
            const imageOptions = imageName.split("-");
            //console.log("image Options",imageOptions);
            if (imageOptions.length === 0) { console.warn("no image options found"); return; }
            let isMatch = true;
            if (imageOptions[0] != selectedColor) isMatch = false;
            if (imageOptions.length > 1 && selectedSS != false) {
                if (imageOptions[1] != selectedSS) isMatch = false;
            }
            if (imageOptions.length > 2 && selectedSL != false) {
                if (imageOptions[2] != selectedSL) isMatch = false;
            }
            if (isMatch) $newActive = $activeImage;
        });

        return $newActive;
    }



    return;// How they have the rest of this setup isn't going to work. Need to setup another way

    let variantImages = $("input.VariantImages").filter(function() {
        return $(this).attr("data-variant-title") === mainSelectValues;
    }).val();
    
    variantImages = variantImages ? variantImages.split(", ") : [];
    
    console.log("$Variant_images", variantImages);
    
    let bestMatch = "";
    let highestMatchCount = 0;
    
    variantImages.forEach(imageUrl => {
        let fileName = imageUrl.split("/").pop().split(".")[0].toLowerCase();
        let matchCount = 0;
        
        if (fileName.includes(firstPart)) {
            matchCount++;
        }
        
        arrayNames.forEach(name => {
            if (fileName.includes(name)) {
                matchCount++;
            }
        });
        
        if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            imageurlNormalize = normalizeImageUrl(imageUrl);
            bestMatch = imageurlNormalize;
        }
    });
    
    if (!bestMatch) {
        let variantImage = $("input.VariantImage").filter(function() {
            return $(this).attr("data-variant-title") === mainSelectValues;
        }).val();
        variantImageNormalize = normalizeImageUrl(variantImage);
        bestMatch = variantImageNormalize || "";
    }
    
    
    
    if (!bestMatch) {
        console.log("No image present");
        $(".media.media--transparent.js-product-gallery-media img").attr({
            "srcset": MainSrcSet,
            "data-src": MainDataSrc,
            "src": MainSrc
        });
        let MainSrcNormalize = normalizeImageUrl(baseImageUrl);
        
        $("input.bundleimage").val(MainSrcNormalize);
    } else {
        console.log("Best Matching Image:", bestMatch);
        let baseImageUrl = bestMatch.split("?")[0];
        $(".media.media--transparent.js-product-gallery-media img").attr({
            "srcset": `${baseImageUrl}?width=375 375w, ${baseImageUrl}?width=550 550w, ${baseImageUrl}?width=750 750w, ${baseImageUrl}?width=1024 1024w`,
            "data-src": `${baseImageUrl}?width=500`,
            "src": `${baseImageUrl}?width=500`
        });
        let baseImageUrlNormalize = normalizeImageUrl(baseImageUrl);
        $("input.bundleimage").val(`${baseImageUrlNormalize}?width=500`);

    }
    
    console.log("Inside SetImages ends");
/**/

}

function normalizeImageUrl(url) {// NEW 4.7.25
    if (!url) {
        console.log("No URL found.");
    } else {
        if (url.includes("https://saunadev.space/cdn/shop/files")) {
            url = url.replace("https://saunadev.space/cdn/shop/files", "https://cdn.shopify.com/s/files/1/0567/1865/5531/files");
        }
        
        if (url.includes("//saunadev.space/cdn/shop/files")) {
            url = url.replace("//saunadev.space/cdn/shop/files", "https://cdn.shopify.com/s/files/1/0567/1865/5531/files");
        }
        
        if (url.includes("saunadev.space/cdn/shop/files")) {
            url = url.replace("saunadev.space/cdn/shop/files", "https://cdn.shopify.com/s/files/1/0567/1865/5531/files");
        }
            console.log(`%cNormalized URL: ${url}`, "color:aqua"); // WUA mod
            return url;

        }
}

function updateSelection(optionOrder, TriggerName, TriggerValue, selectedOptions) {
    // Find the index of TriggerName in optionOrder
    let index = optionOrder.indexOf(TriggerName);
    if (index !== -1) {
        // Update the selected value at the corresponding index
        selectedOptions[index] = TriggerValue;
        // Generate the formatted output string
        let outputString = selectedOptions.filter(val => val !== "").join(" / ");
        return outputString;
    }
}

function updateVariantProperties() {
    $("label.product-build__variant-pill.isSelected").each(function() {
        let labelDataProperty = $(this).attr('data-property-title');
        let labelDataInputValue = $(this).attr('data-input-value');
        console.log("labelDataProperty");
        console.log(labelDataProperty);
        console.log("labelDataInputValue");
        console.log(labelDataInputValue);
        if (labelDataProperty.includes("SilverLining") && labelDataInputValue.includes("SilverLining")) {
            $(`input[type="hidden"].PropertiesInput[name="properties[${labelDataProperty}]"]`).val("Added");
        } else {
            $(`input[type="hidden"].PropertiesInput[name="properties[${labelDataProperty}]"]`).val(labelDataInputValue);
        }
    });
}

function SetPrices(TotalPriceAll, BundleDiscount) {
    TotalPriceAll=parseFloat(TotalPriceAll);
    let variant_required_ids_string = "";
    let variant_required_price_string = "";
    let variant_optional_ids_string = "";
    let variant_optional_titles_string = "";
    let required_inputs = $("input.requiredHiddenOptions.isSelected[type='hidden']");
    required_inputs.each(function() {
        let requiredInput = $(this);
        updateVariantProperties();
        let selectElement = requiredInput.siblings("select"); // Find the nearest <select>
        if (selectElement.length) {
            let selectedOption = selectElement.find("option:selected"); // Get the selected option
            let value = selectedOption.val();
            let price = selectedOption.data("price");
            console.log("data-price");
            console.log(selectedOption.attr("data-price"));
            let comparePrice = selectedOption.data("compare-price");
            if(selectedOption.attr("data-price") !== undefined && selectedOption.attr("data-price") !== "" && selectedOption.attr("data-price") !== null ){
                TotalPriceAll += parseFloat(selectedOption.attr("data-price").replace(/,/g, "")); // Remove commas and convert to number
                TotalPriceAll = parseFloat(TotalPriceAll.toFixed(2)); // Ensure rounding to 2 decimal places
                let data_variant_id = selectedOption.attr("data-variant-id"); // Corrected way to get data
                if (data_variant_id) {
                // Append variant ID with a separator
                variant_required_ids_string += (variant_required_ids_string ? "," : "") + data_variant_id;
                }
                if(price){
                variant_required_price_string += (variant_required_price_string ? "," : "") + selectedOption.attr("data-price").replace(/,/g, "");
                }
                console.log({
                    value: value,
                    price: price,
                    comparePrice: comparePrice
                });
            }
        }
    });
    $('.RequiredItems').val(variant_required_ids_string);
    $('.RequiredItemsPriceArray').val(variant_required_price_string);

    let optinal_inputs = $("input.optionalHiddenOptions.isSelected[type='hidden']");
    optinal_inputs.each(function() {
        let optinalInput = $(this);
        // updateVariantProperties();
        
        let QtyParent = optinalInput.siblings(".qty-container.isSelected").find("input.qty-input"); // Find the nearest <select>
            QtyParent = parseInt(QtyParent.val()) || 1;
        let selectElement = optinalInput.siblings("select"); // Find the nearest <select>
        if (selectElement.length) {
            let selectedOption = selectElement.find("option:selected"); // Get the selected option
            let value = selectedOption.val();
            
            let price = selectedOption.data("price");
            let comparePrice = selectedOption.data("compare-price");
            console.log("data-price optinal");
            console.log(selectedOption.attr("data-price"));
            if(selectedOption.attr("data-price") !== undefined && selectedOption.attr("data-price") !== "" && selectedOption.attr("data-price") !== null){
                    TotalPriceAll += parseFloat(selectedOption.attr("data-price").replace(/,/g, ""))*QtyParent; // Remove commas and convert to number
                    TotalPriceAll = parseFloat(TotalPriceAll.toFixed(2)); // Ensure rounding to 2 decimal places
                    let data_variant_id = selectedOption.attr("data-variant-id"); // Corrected way to get data
                    if (data_variant_id) {
                    // Append variant ID with a separator
                    variant_optional_ids_string += (variant_optional_ids_string ? "," : "") + `${data_variant_id} - ${QtyParent}`;
                    }
                    let data_variant_title = selectedOption.attr("data-variant-title"); // Corrected way to get data
                    if (data_variant_title) {
                    // Append variant ID with a separator
                    variant_optional_titles_string += (variant_optional_titles_string ? "," : "") + data_variant_title;
                    }
                
                    console.log({
                        value: value,
                        price: price,
                        comparePrice: comparePrice
                    }); 
            }
            
        }
    });
    $('.OptinalItems').val(variant_optional_ids_string);
    $('.OptinalItemsString').val(variant_optional_titles_string);

    console.log("TotalPrice:", TotalPriceAll);
    console.log("BundleDiscount type:", BundleDiscount[0]);
    console.log("BundleDiscount amount:", BundleDiscount[1]);
    let discountRequired = TotalPriceAll; // Initialize with TotalPrice
    if (BundleDiscount[0] === "percent" || BundleDiscount[0] === "Percent") {
        let discountAmount = (parseFloat(BundleDiscount[1]) / 100) * TotalPriceAll;
        discountRequired = TotalPriceAll - discountAmount;
    }
    else {
        discountRequired = TotalPriceAll - parseFloat(BundleDiscount[1]);
    }
    discountRequired = Math.max(discountRequired, 0);
    console.log("Discounted Price:", discountRequired);
    $(".TotalPrice").text(formatToUSD(TotalPriceAll)); // WUA mod
    $(".DiscountedPrice").text(formatToUSD(discountRequired)); // WUA mod

    // WUA - Modals
    const savings = TotalPriceAll - discountRequired;console.log("savings",savings);
    $("span[data-total]").text(formatToUSD(discountRequired));
    $(".SavingsPrice").text(formatToUSD(savings));
    $("span[data-savings]").text("-" + formatToUSD(savings));
    $("span[data-original-price]").text(formatToUSD(TotalPriceAll));
}

function formatToUSD(amount) {// WUA
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getTotalpriceMain() {
    if($("select.Variant_with_values option:selected").attr("data-price") !== undefined && $("select.Variant_with_values option:selected").attr("data-price") !== "" && $("select.Variant_with_values option:selected").attr("data-price") !== null){
        return $("select.Variant_with_values option:selected").attr("data-price").replace(/,/g, "");
    }
}



});// doc ready