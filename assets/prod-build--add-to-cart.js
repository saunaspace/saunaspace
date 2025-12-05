$(document).ready(function() {
    let MainSrcSet = $(".media.media--transparent.js-product-gallery-media img").attr("srcset");
    let MainDataSrc = $(".media.media--transparent.js-product-gallery-media img").attr("data-src");
    let MainSrc = $(".media.media--transparent.js-product-gallery-media img").attr("src");

    $('.custom_add_to_cart').on('click', function() {
        var bundleIdentifier = "bundle_unique_" + Math.floor(10000 + Math.random() * 90000);

        addtoCartFunction("ADD", bundleIdentifier);
    });
    $(".custom_update_button").on("click", async function() {
        var CheckBundleEditCheck = getQueryParam('_bundle_id');
        var bundleIdentifier = "bundle_unique_" + Math.floor(10000 + Math.random() * 90000);

        if (CheckBundleEditCheck) {
            const success = await DeleteCartFunction(CheckBundleEditCheck);
            if (success) {
                addtoCartFunction("UPDATE", CheckBundleEditCheck);
            } else {
                console.warn("Bundle was not removed or there was an error.");
                removeBundleIdAndReload();

            }
        } else {
            addtoCartFunction("ADD", bundleIdentifier);
        }
    });

});

function addtoCartFunction(TYPE, bundleIdentifier) {
    console.log("TYPE");
    console.log(TYPE);
    var CheckBundleEditID = getQueryParam('_bundle_id'); // Get bundle_id from the query parameter
    var form = $('form.product__form');
    // Generate a unique bundle identifier
    var BundleDisType = $("input.BundleDisType").val();
    var BundleDisVal = $("input.BundleDisVal").val();
    // Remove old hidden inputs (if any)
    form.find('input[name="properties[_bundle_id]"], input[name="properties[_is_main]"]').remove();
    // Append hidden inputs to the form
    form.append(`<input type="hidden" class="PropertiesInput" name="properties[_bundle_id]" value="${bundleIdentifier}">`);
    form.append(`<input type="hidden" class="PropertiesInput" name="properties[_is_main]" value="true">`);
    // Get required and optional variant IDs
    var variantIdOptionalItems = $("input.OptinalItems").val();
    if (variantIdOptionalItems != '' && variantIdOptionalItems != null) {
        var allVariantIds = [];
        var items = [];
        if (variantIdOptionalItems) {
            variantIdOptionalItems.split(',').forEach(item => {
                let parts = item.trim().split(' - '); // Split by " - "
                if (parts.length === 2) {
                    let variantId = parseInt(parts[0]);
                    let quantity = parseInt(parts[1]);
                    if (!isNaN(variantId) && !isNaN(quantity)) {
                        items.push({
                            id: variantId,
                            quantity: quantity,
                            properties: {
                                "_bundle_id": bundleIdentifier,
                                "_BundleDisType": BundleDisType,
                                "_BundleDisVal": BundleDisVal,
                                "_is_main": false
                            }
                        });
                    }
                }
            });
        }
        var data = {
            items: items
        };
        console.log("Final Data:", data); // Debugging output
        // AJAX request to add items to Shopify cart
        $.ajax({
            type: 'POST',
            url: '/cart/add.js',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(response) {
                console.log("Items added to cart:", response);
                $("button.product-selector__submit.ForaddHide").trigger('click');
                if (TYPE == "UPDATE") {
                    // setTimeout(function() {
                    //   // removeBundleIdAndReload();
                    // }, 3000);
                }
            },
            error: function(error) {
                console.error("Error adding items to cart:", error);
            }
        });
    } else {
        $("button.product-selector__submit.ForaddHide").trigger('click');
        if (TYPE == "UPDATE") {
            // setTimeout(function() {
            //   // removeBundleIdAndReload();
            // }, 3000);
        }
    }
}

function removeBundleIdAndReload() {
    const url = new URL(window.location.href);
    // Remove the _bundle_id param
    url.searchParams.delete('_bundle_id');
    // Reload the page without _bundle_id
    window.location.replace(url.toString());
}

function DeleteCartFunction(Bundle_id_dele) {
    return fetch('/cart.js')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch cart');
            return response.json();
        })
        .then(cart => {
            let itemsToRemove = cart.items.filter(item =>
                item.properties && item.properties._bundle_id === Bundle_id_dele
            );

            if (itemsToRemove.length === 0) {
                console.log('No matching bundle items found in the cart.');
                return false; // Nothing to remove
            }

            console.log("itemsToRemove:", itemsToRemove);

            let updates = {};
            itemsToRemove.forEach(item => {
                updates[item.key] = 0;
            });

            return fetch('/cart/update.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        updates
                    })
                })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to update cart');
                    return response.json();
                })
                .then(data => {
                    console.log('Bundle items removed successfully:', data);
                    return true;
                });
        })
        .catch(error => {
            console.error('Error removing bundle items:', error);
            return false;
        });
}




/**
 * Added 4.7.25 - HTML Burger added this code after initial duplication of theme
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);

}
$(document).ready(function () {
    // Fetch cart data first
    $.getJSON('/cart.js', function (cart) {
        // Filter all cart items where _bundle_id exists and equals "bundle_unique_71095"
      const bundleId = getQueryParam('_bundle_id');

        console.log(cart);
        let bundleItems = cart.items.filter(item => item.properties && item.properties._bundle_id === bundleId);

        bundleItems.forEach(item => {
            if (item.properties._is_main === "true") {
                console.log("Got true Item");
                // Set the main product ID in the form input
                $("form.product__form input[name='id']").val(item.id);

                // Find the corresponding variant selector and check the option
                let variantSelect = $("select.Variant_with_values");
                let selectedOption = variantSelect.find(`option[data-varaint-id='${item.id}']`);
                
                if (selectedOption.length) {
                    selectedOption.prop("selected", true);
                    variantSelect.trigger("change");
                }

                // Handle color and plug selections
                let optionsText = selectedOption.attr("value");
                if (optionsText) {
                    let [color, plug] = optionsText.split(" / ");
                    console.log("color:");
                    console.log(color);
                    console.log("plug:");
                    console.log(plug);
                    checkVariant("color", color);
                    checkVariant("Plug", plug);
                }
                let required_items = item.properties._required_array;

                if (required_items) {
                    let ids = required_items.split(","); // Split into an array
                    ids.forEach(id => {
                        handleOptionalOrRequired("data-required-id", "ForClickRequired", id.trim(), null);
                    });
                }
            } else {
                console.log("Got attached Item");

                // Handle optional and required selections
                handleOptionalOrRequired("data-optional-id", "ForClickOptional", item.id, item.quantity);
            }
        });
    });

    function checkVariant(optionName, value) {
        console.log("I am checking Item");
        console.log(optionName);
        console.log(value);
        optionName = optionName.toLowerCase();
        value = value.toLowerCase();
        let radioInput = $(`input[type='radio'][data-edit-name='${optionName}'][data-edit-value='${value}']`);
        if (radioInput.length) {
            console.log("Radio Found");
            radioInput.prop("checked", true).trigger("change");
            let label = $(`label.product-build__variant-pill[data-option-name='${optionName}'][data-option-value='${value}']`);
            if (label.length) {
                console.log("Label Found");
            
                let closestPill = label.closest(".plug-type-options__submenu");
            
                if (closestPill.length) {
                    closestPill.siblings("ul").find("button.plug-type-options__submenu-trigger div.product-build__variant-pill.product-build__variant-pill--landscape").trigger("click");
                }
                
                label.trigger("click");
            } else {
                console.log("Label not Found");
            }
        }else{
            console.log("Radio not Found");
        }
    }

    function handleOptionalOrRequired(attribute, containerId, itemId, Qty) {
        console.log("I am handleOptionalOrRequired");
        console.log(attribute, containerId, itemId);
    
        // Find all <select> elements inside the dynamically provided container
        let selectElements = $(`.${containerId}`).find("select");
    
        console.log("SELECT ELEMENTS FOUND:", selectElements.length);
    
        selectElements.each(function () {
            let selectElement = $(this);
    
            // Find the matching <option> inside the current <select> where data-variant-id matches itemId
            let matchingOption = selectElement.find(`option[data-variant-id='${itemId}']`);
    
            console.log("CHECKING SELECT:", selectElement, "MATCHING OPTION:", matchingOption);
    
            if (matchingOption.length) {
                // Select the matching option
                selectElement.val(matchingOption.val()).change();
    
                // Find the closest label and trigger click
                let label = selectElement.siblings("label.product-build__variant-pill").first();
    
                console.log("LABEL FOUND:", label);
    
                if (label.length) {
                    if(Qty !== null){
                        label.siblings(".qty-container").find("input.qty-input").val(Qty);
                    }
                    label.find("span").first().trigger("click");
                }
            }
        });
    }
    let CheckBundleEdit = getQueryParam('_bundle_id');

  if(CheckBundleEdit !== null && CheckBundleEdit !== "" && CheckBundleEdit !== undefined){
      console.log("CheckBundleEdit");
      console.log(CheckBundleEdit);
      $(".custom_add_to_cart").hide();
      $(".custom_update_button").show();
      
  }
});