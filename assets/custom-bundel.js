$(document).ready(function () {
  changeVariantfunction();
  var selectedColor = $(".select__select.retrive_selected_option[name='options[Color]']").val();
  var images = document.querySelectorAll('img.forColorSelect[alt="'+selectedColor+'"]');
  images.forEach(function(image) {
      image.style.border = '2px solid black';
  });
  // $('.form__label.colorLable').text("-Color : " + selectedColor + "-");
  $('.form__label.colorLable').html('<svg height="3" width="20" xmlns="http://www.w3.org/2000/svg"> <line x1="20" y1="0" x2="" y2="0" style="stroke:black;stroke-width:2" /> </svg> Color : ' + selectedColor + '<svg height="3" width="20" xmlns="http://www.w3.org/2000/svg"> <line x1="20" y1="0" x2="" y2="0" style="stroke:black;stroke-width:2" /> </svg>');
  const n_type = $("#discount_type_hidden").val();
  const n_discount = parseFloat($("#discount_hidden").val());
  if (n_type == "fixed" && n_discount != null && n_discount > 0) {
    console.log("you got discount of $" + n_discount.toFixed(2) + ".");
    $(".price__container").after(
      '<span style=" color: #d8661f;" class="price-savings">bundle savings + $' +
        n_discount.toFixed(2) +
        " off</span>"
    );
  }
  if (n_type == "percentage" && n_discount != null && n_discount > 0) {
    console.log("you got discount of " + n_discount.toFixed(2) + "%");
    $(".price__container").after(
      '<span style=" color: #d8661f;" class="price-savings">bundle savings + ' +
        n_discount.toFixed(2) +
        "% off</span>"
    );
  }
  window.clicked_id = 0;
  // optional add to form
  $(".optional_checkbox").change(function () {
  var handle = $(this).val();
  var index = $(this).data("index");
  var hiddenInput = $("#title_index_" + index);
  var parentDiv = $(this).closest(".bundle_item.optional");
  // var array_string = "";
  // var variant_array_string = "";
  if ($(this).is(":checked")) {
    // hiddenInput.removeAttr('disabled');
    parentDiv.attr("data-checked", "0");
  } else {
    // hiddenInput.attr('disabled', 'disabled');
    parentDiv.attr("data-checked", "1");
  }
  updateOptionalVariants();
  });
  // required selection on change
  $('.requiredSelect').on("change", function(){
      var closestMain = $(this).closest(".bundle_item.required");
      var currentVar = $(this).val();
      var hiddenVARIANTS = $(this).closest(".bundle_item.required").find('.hidden-variants .hidden-variant-title');
      if ($(this).siblings('.requiredSelect').length > 0) {
          console.log("clicked");
  
          var values = [];
          closestMain.find('.requiredSelect').each(function(index, element) {
              values.push($(element).val());
          });
          var concatenatedValue = values.join(" / ");
          console.log(concatenatedValue);
          checkAndSet(hiddenVARIANTS , concatenatedValue, closestMain);      
          
      } else {
          console.log("clicked too");
          checkAndSet(hiddenVARIANTS , currentVar, closestMain);      
      }
      setTimeout(updatePriceArray, 2000);
      setTimeout(updatePrices, 2500);
  });
  // edit button
  $(".edit_btn").click(function () {
  clicked_id = $(this).data("child");
  console.log(clicked_id);
  $(".modal-content p").html(" ");
  var handle = $(this).attr("data-handle");
  var variantid = $(this).attr("data-id");
  
  var url =
  "/products/" + handle + "?variant=" + variantid + "&view=custombundle";
  var editButtonId = "edit_button_" + clicked_id;
  $.ajax({
  url: url,
  method: "GET",
  dataType: "html",
  success: function (data) {
    $(".modal-content p").html($(data).find("section.page-width").html());
    var modal2 = document.querySelector(".modal");
    modal2.style.display = "block";
    $(modal2).attr("id", editButtonId);
    $(modal2).attr("data-id", clicked_id);
    updatePriceArray();
  },
  error: function (error) {
    console.error("Error:", error);
  },
  });
  });
  // dropdown change select value
  $('.bundle_item.required small').on('click', function(){
      var optionName = $(this).closest("div.dropdown-content").data("option-name");
      var newvalue = $(this).find('span').text();
      var imageUrl = $(this).find('img').attr('src');
      var $dropbtn = $(this).closest('.custom-dropdown').find('.dropbtn');
      if (imageUrl) {
          $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
      } else {
          $dropbtn.html('<span>'+ newvalue +'</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
      }
      var element = $(this).closest('.bundle_item.required').find("select[data-option='" + optionName + "']");
      element.val(newvalue);
      console.log("bundleItmesShange();");
      bundleItmesShange();
      if($(this).closest(".bundle_item").hasClass('required')){
        updatePriceArray();
        updatePrices();
      }else{
        console.log('error! no class found');
      }
      
    });
  $('.bundle_item.optional small').on('click', function(){
      var optionName = $(this).closest("div.dropdown-content").data("option-name");
      var newvalue = $(this).find('span').text();
      var imageUrl = $(this).find('img').attr('src');
      var $dropbtn = $(this).closest('.custom-dropdown').find('.dropbtn');
      if (imageUrl) {
          $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;">');
      } else {
          $dropbtn.html('<span>'+ newvalue +'</span> ');
      }
      var element = $(this).closest('.bundle_item.optional').find("select[data-option='" + optionName + "']");
      element.val(newvalue);
      console.log("optionName:", optionName);
      console.log("newvalue:", newvalue);
      console.log("imageUrl:", imageUrl);
      console.log("$dropbtn:", $dropbtn);
      console.log("element:", element);  
      optianlItmesChange();
      updateOptionalVariants();
      
  });

});

setTimeout(updatePriceArray, 2000);
setTimeout(updatePrices, 2500);

function updatePrices() {
  const b_discount = parseFloat($("#discount_hidden").val());
  const b_type = $("#discount_type_hidden").val();
  let b_price = $("#price_array").val();
  console.log("Price Array:", b_price);
  // const p_price_item = parseInt($('.customclassForPrice .price__regular .price-item--regular').attr('data-price'));
  // var p_price_item = $(".customclassForPrice .price__regular .price-item--regular").attr("data-amount");
  var p_price_item;
  var $priceItem = $(".customclassForPrice .price__regular .price-item--regular");
  if ($priceItem.attr("data-amount")) {
      p_price_item = $priceItem.attr("data-amount");
  } else {
      p_price_item = $priceItem.attr("data-price");
  }
  console.log("Price:currency::"+p_price_item);
  p_price_item = parseFloat(p_price_item.replace(/[^\d.]/g, ""));
  const child_varianid = $("#child_varinats").val();
  console.log("Price:::", p_price_item);
  console.log("variantid:", child_varianid);
  updateRegularPrice(b_discount, b_type, b_price, p_price_item, child_varianid);
}
function updatePriceArray() { 
    console.log(".bundle_item.required");
    console.log($(".bundle_item.required").length);
    var array_string = "";
    var variant_array_string = "";
    $(".bundle_item.required").each(function() {
        if ($(this).attr("data-checked") == '0') {
            var price = $(this).attr("data-price");
            var child_variant = $(this).attr("data-variant");

            if (price !== undefined) {
                array_string += price + ", ";
            }
          if (child_variant !== undefined) {
            variant_array_string += child_variant + ", ";
          }
        }
    });
    array_string = array_string.slice(0, -2);
    variant_array_string = variant_array_string.slice(0, -2);
    console.log(array_string);
    $("#price_array").val(array_string);
    console.log("variant_array_string form function!");
    console.log(variant_array_string);
    $("#child_varinats").val(variant_array_string);
}
function updateRegularPrice(b_discount, b_type, b_price, p_price_item, child_varianid) {
  let final_price = 0;
  let priceArray = b_price.split(",").map(Number);
  let variantArray = child_varianid.split(",").map(Number);
  console.log(priceArray);
  let sum_price = priceArray.reduce((sum, price) => sum + Number(price), 0);
  let total_price = p_price_item + sum_price;
  // Calculate final price based on discount type
  if (b_type === "percentage") {
    final_price = total_price - (total_price * (b_discount || 0)) / 100;
  } else if (b_type === "fixed") {
    final_price = total_price - b_discount;
  }
      // Format final_price with commas
    var formattedFinalPrice = final_price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Format total_price with commas
    var formattedTotalPrice = total_price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
  console.log("compare at price:" + formattedTotalPrice);
  console.log("price:" + formattedFinalPrice);
  $(".customclassForPrice .price__regular .price-item.price-item--regular").text("$" + formattedFinalPrice  + " USD");
  $(".campare_at_price").text("$" + formattedTotalPrice  + " USD");
  $(".campare_at_price").css("text-decoration", "line-through");
  $(".customclassForPrice .price__regular").css("display","block");
}
function updateOptionalVariants() {
  console.log("called");
    var optionalVariants = [];
    $(".bundle_item.optional").each(function() {
        if ($(this).attr("data-checked") == "0") {
            optionalVariants.push($(this).attr("data-variant"));
        }
    });

    if (optionalVariants.length > 0) {
        $("#optinalIds").val(optionalVariants.join(', '));
    } else {
        $("#optinalIds").val("empty");
    }
}
function checkAndSet(hiddenVARIANTS, string, closestMain) {
      console.log("called");
      hiddenVARIANTS.each(function(index, element) {
          if ($(element).attr("data-variant-title") == string) {
              var priceSingle = $(element).attr("data-variant-price");
              var imageSingle = $(element).attr("data-variant-image");
              var idSingle = $(element).attr("data-variant-id");
              closestMain.attr("data-variant", idSingle);
              closestMain.attr("data-price", priceSingle);
              closestMain.find("img").attr("src", imageSingle);
          }
      });     
  }
function bundleItmesShange(){
  $('.bundle_item.required').each(function() {
    var optionValues = [];
    $(this).find('select[data-trim-option]').each(function() {
        optionValues.push($(this).val());
    });
    if (optionValues.length > 0) {
        var resultString = optionValues.join(' / ');
      console.log("we are here");
        $(this).find('.hidden-variants .hidden-variant-title').each(function() {
            if ($(this).text() === resultString) {
                var variantId = $(this).data('variant-id');
                var variantPrice = $(this).data('variant-price');
                var variantImage = $(this).data('variant-image');
                console.log("cureent text:", $(this).text())
                console.log("Variant ID:", variantId);
                
                console.log("Variant Price:", variantPrice);
                console.log("Variant Image:", variantImage);
                  if (variantImage.includes("no-image-")) {
                      console.log("Variant Image contains 'no-image-'");
                      variantImage =  $(this).closest(".hidden-variants").attr('data-product-image');
                      console.log("imageee"+ variantImage);
                    
                  } else {
                      console.log("Variant Image does not contain 'no-image-'");
                  }
                $(this).closest('.bundle_item.required').attr('data-variant', variantId);
                $(this).closest('.bundle_item.required').attr('data-price', variantPrice);

                // Update the src and alt attributes of the variant image
                var $variantImage = $(this).closest('.bundle_item.required').find('.varImage');
                $variantImage.attr('src', variantImage);
                $variantImage.attr('alt', $(this).text());
                optianlItmesChange();
            }
        });
    }
});
}
function optianlItmesChange(){
  $('.bundle_item.optional').each(function() {
    var optionValues = [];
    $(this).find('select[data-trim-option]').each(function() {
        optionValues.push($(this).val());
    });
    if (optionValues.length > 0) {
        var resultString = optionValues.join(' / ');
        console.log("we are here");
        $(this).find('.hidden-variants .hidden-variant-title').each(function() {
            if ($(this).text() === resultString) {
                var variantId = $(this).data('variant-id');
                var variantPrice = $(this).data('variant-price');
                var variantImage = $(this).data('variant-image');
                console.log("cureent text:", $(this).text())
                console.log("Variant ID:", variantId);
                
                console.log("Variant Price:", variantPrice);
                console.log("Variant Image:", variantImage);
              
                if (variantImage.includes("no-image-")) {
                      console.log("Variant Image contains 'no-image-'");
                     variantImage =  $(this).closest(".hidden-variants").attr('data-product-image');
                    
                      console.log("imageee"+ variantImage);
                    
                  } else {
                      console.log("Variant Image does not contain 'no-image-'");
                  }
                $(this).closest('.bundle_item.optional').attr('data-variant', variantId);
                $(this).closest('.bundle_item.optional').attr('data-price', variantPrice);

                // Update the src and alt attributes of the variant image
                var $variantImage = $(this).closest('.bundle_item.optional').find('.varImage');
                $variantImage.attr('src', variantImage);
                $variantImage.attr('alt', $(this).text());
            }
        });
    }
});
}
function getCurrentTitle() {
  var resultStrings = $('.select__select.retrive_selected_option').map(function() {
    return $(this).find('option:selected').text().trim(); // Trim whitespace
  }).get();

  return resultStrings.length === 1 ? resultStrings[0] : resultStrings.join(' / ');
}
function getChangedIndexValue(previousTitle, currentTitle) { 
    var previousTitleArray = previousTitle.split(' / ');
    var currentTitleArray = currentTitle.split(' / ');
    var maxLength = Math.max(previousTitleArray.length, currentTitleArray.length);
    var result = {};

    if (previousTitle === currentTitle) {
        result.indexes = [];
        result.parts = [];
        for (var i = 0; i < maxLength; i++) {
            result.indexes.push(i + 1);
            result.parts.push(previousTitleArray[i]);
        }
    } 
    else {
        var firstIndexChanged = false;
        for (var i = 0; i < maxLength; i++) {
            if (i >= previousTitleArray.length || i >= currentTitleArray.length) {
                break;
            }
            if (previousTitleArray[i] !== currentTitleArray[i]) {
                result.index = i + 1;
                result.previousValue = previousTitleArray[i];
                result.currentValue = currentTitleArray[i];
                firstIndexChanged = true;
                break;
            }
        }

        if (!firstIndexChanged && previousTitleArray.length !== currentTitleArray.length) {
            var changedTitle = previousTitleArray.length < currentTitleArray.length ? currentTitleArray : previousTitleArray;
            result.index = maxLength + 1;
            result.changedValue = changedTitle[maxLength];
        } else if (!firstIndexChanged) {
            result.index = null;
            result.changedValue = null;
        }
    }

    return result;
}
function changeVariantfunction(){
  var previousTitle = null;
  var currentTitle = getCurrentTitle();
  if (previousTitle == null) {
           previousTitle = currentTitle;
      } 
  console.log("currentTitleNew"+ currentTitle);
  console.log("previousTitleNew"+ previousTitle);
  var optionsText = [];
    $(".select__select.retrive_selected_option").each(function(index, option) { 
        var optionText = $(this).attr('data-option-parent');
        optionsText.push(optionText);
    });
  console.log(optionsText);
  var changeInfo = getChangedIndexValue(currentTitle, previousTitle);
  console.log('changeInfo as JSON:', JSON.stringify(changeInfo));
  if (changeInfo.indexes && changeInfo.parts) {
      console.log("double changed");
      for (var i = 0; i < changeInfo.indexes.length; i++) {
            // console.log(changeInfo.parts[i] + " " + changeInfo.indexes[i]);
            console.log("value :" + changeInfo.parts[i]);
            console.log("option changed :" + optionsText[changeInfo.indexes[i] - 1]);
            $('.bundle_item.required').each(function() {
                var $optionMain = $(this).find('.option-main');
                var $selectTags = $optionMain.find('select').filter(function() {
                    return $(this).attr('data-trim-option').indexOf(optionsText[changeInfo.indexes[i] - 1]) !== -1;
                });
                var siblingSelectTags = $selectTags.siblings('select[data-trim-option]');
                console.log("siblingSelectTags");
                console.log(siblingSelectTags);
                console.log("siblingSelectTags.length");
                console.log(siblingSelectTags.length);
                var valuesArray = [];
                if (siblingSelectTags.length > 0){
                    console.log("greater then 1 so make logic");
                    siblingSelectTags.each(function() {
                      var text = $(this).val();
                      valuesArray.push(text);
                    });
                    console.log("other Values are:: "+ valuesArray);
                    $selectTags.each(function() {
                      var $selectTag = $(this);
                      console.log("$selectTag Val");
                      console.log($selectTag.val());
                      if($selectTag.val() != changeInfo.parts[i] ){
                           console.log("need to change because child is not like parent");
                            var hiddenVar = $(this).closest($optionMain).siblings('.hidden-variants').find('.hidden-variant-title');
                            hiddenVar.each(function() {
                              var variantTitle = $(this).data('variant-title');
                              var variantId = $(this).data('variant-id');
                              var variantPrice = $(this).data('variant-price');
                              var variantImage = $(this).data('variant-image');
                              var match = valuesArray.every(function(value){
                                  return variantTitle.includes(value);
                              }) && variantTitle.includes(changeInfo.parts[i]);
                              if (match) {
                                  console.log("Vneeeeeeeeeeeeeeeeee");
                                  console.log("Variant Title: " + variantTitle);
                                    console.log("Variant ID: " + variantId);
                                    console.log("Variant Price: " + variantPrice);
                                    console.log("Variant Image: " + variantImage);
                                    $($selectTag).val(changeInfo.parts[i]);
                                    var dropdownContent = $('div[data-option-name="'+optionsText[changeInfo.indexes[i] - 1]+'"].dropdown-content small');
                                
                                    dropdownContent.each(function() {
                                          var $small = $(this);
                                          var spanText = $small.find('span').text();
                                          console.log("spanText: " + spanText);
                                      
                                          if (spanText === changeInfo.parts[i]) {
                                              console.log('matched');
                                              var imageUrl = $small.find('img').attr('src');
                                              var $dropbtn = dropdownContent.closest('.dropdown-content').siblings('.dropbtn');
                                              console.log($dropbtn);
                                              if (imageUrl) {
                                                  $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              } else {
                                                  $dropbtn.html('<span>'+changeInfo.parts[i]+'</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              }
                                              return false; 
                                          }
                                      });
                                    bundleItmesShange();
                              }else{
                                  console.log("eeerrrrrrrrrr");
                              }
                            });
                      }else{
                        console.log('no neeeded change');
                      }
                      return false;
                    });
                 }
                 else{
                    console.log("less then one");
                     $selectTags.each(function() {
                        console.log("BundleOptions matched!");
                        var $selectTag = $(this);
                         console.log("$selectTag Val");
                         console.log($selectTag.val());
                         if($selectTag.val() != changeInfo.parts[i] ){
                           console.log("need to change because child is not like parent");
                            var hiddenVar = $(this).closest($optionMain).siblings('.hidden-variants').find('.hidden-variant-title');
                            hiddenVar.each(function() {
                                var variantTitle = $(this).data('variant-title');
                                if (variantTitle == changeInfo.parts[i]) {
                                    var variantId = $(this).data('variant-id');
                                    var variantPrice = $(this).data('variant-price');
                                    var variantImage = $(this).data('variant-image');
                                    console.log("Variant Title: " + variantTitle);
                                    console.log("Variant ID: " + variantId);
                                    console.log("Variant Price: " + variantPrice);
                                    console.log("Variant Image: " + variantImage);
                                    $($selectTag).val(variantTitle);
                                    var dropdownContent = $('div[data-option-name="'+optionsText[changeInfo.indexes[i] - 1]+'"].dropdown-content small');
                                    dropdownContent.each(function() {
                                          var $small = $(this);
                                          var spanText = $small.find('span').text();
                                          if (spanText === variantTitle) {
                                              console.log('matched');
                                              var imageUrl = $small.find('img').attr('src');
                                              var $dropbtn = dropdownContent.closest('.dropdown-content').siblings('.dropbtn');
                                              console.log($dropbtn);
                                              if (imageUrl) {
                                                  $dropbtn.html('<img src="' + imageUrl + '" style="width: 50px; height: 50px; border-radius: 50%;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              } else {
                                                  $dropbtn.html('<span>'+ variantTitle +'</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12" class="icon--down-arrow"><path fill="#283455" d="M1.465 5.407c-.257-.26-.255-.68.004-.938.26-.26.68-.26.94 0l2.885 2.882c.39.39 1.023.39 1.413 0l2.886-2.882c.26-.259.68-.259.94 0 .258.259.26.678.003.938L7.426 8.56c-.784.793-2.064.793-2.847 0L1.465 5.407z"></path></svg>');
                                              }
                                              return false;
                                          }
                                      });
                                    bundleItmesShange();
                                }
                            });
                         }else{
                           console.log("no need to change");
                         }                        
                     });
                 }
            });
            console.log("next changed option and value");
           
        }
  }
  else{
      console.log("single changed");
      // console.log("Index of the changed part: " + changeInfo.index);
      // console.log("option changed :" + optionsText[changeInfo.index - 1]);
      // console.log("Previous value: " + changeInfo.previousValue);
      // // console.log("Current value: " + changeInfo.currentValue);
      //   $('.bundle_item.required').each(function() {
      //     var $optionMain = $(this).find('.option-main');
      //     var $selectTags = $optionMain.find('select').filter(function() {
      //       return $(this).attr('data-trim-option').indexOf(optionsText[changeInfo.index - 1]) !== -1;
      //     });
      //     var siblingSelectTags = $selectTags.siblings('select[data-trim-option]');
      //     console.log("siblingSelectTags");
      //     console.log(siblingSelectTags);
      //     console.log("siblingSelectTags.length");
      //     console.log(siblingSelectTags.length);
      //   });
  }
}

document.querySelectorAll('.forColorSelect').forEach(function(element) {
    element.addEventListener('click', function() {
       
        var parentContainer = document.querySelector("select[name='options[Color]']");
        var siblings = document.querySelectorAll('.forColorSelect');
        siblings.forEach(function(sibling) {
            sibling.style.border = "none";
        });
        var color = this.getAttribute("alt");
        var selectElement = document.querySelector("select[name='options[Color]']");
        selectElement.value = color.trim();
        this.style.border = "2px solid black";
        $('.form__label.colorLable').html('<svg height="3" width="20" xmlns="http://www.w3.org/2000/svg"> <line x1="20" y1="0" x2="" y2="0" style="stroke:black;stroke-width:2" /> </svg> Color : ' + selectElement.value + '<svg height="3" width="20" xmlns="http://www.w3.org/2000/svg"> <line x1="20" y1="0" x2="" y2="0" style="stroke:black;stroke-width:2" /> </svg>');
        var event = new Event('change');
        selectElement.dispatchEvent(event);
        const variantSelects=new VariantSelects();
        variantSelects.onVariantChange();
        changeVariantfunction();
        console.log(document.querySelector("select[name='options[Color]']").value);
        bundleItmesShange();
        updatePriceArray();
        updatePrices();
    });
});
// model selection button click
// document.querySelector('.selection_button').addEventListener('click', function() {
//     var priceElement = document.querySelector('span.price-item--regular');
//     if (priceElement) {
//         var price = priceElement.getAttribute('data-price');
//         var p_price_item = parseFloat(price.replace(/[^\d.]/g, ""));
//         console.log("Price currency::"+p_price_item);
      
//         var title = priceElement.getAttribute('data-title');
//         var variant = priceElement.getAttribute('data-variant');
      
//         var titleParts = title.split("/"); 
//         var numberOfParts = titleParts.length;
//           for (var i = 0; i < numberOfParts; i++) {
//               var elementId = 'index_title_option_' + (i + 1);
//               console.log('.detail_' + clicked_id + ' #' + elementId); 
//              $('body .detail_' + clicked_id + ' #' + elementId).text(titleParts[i].trim());
//           }
//         document.getElementById('title_index_'+clicked_id).value = title;
//         var bundleItems = document.querySelectorAll('.bundle_item');
//         var bundleItem = bundleItems[clicked_id-1];
//           if (bundleItem) {
//               bundleItem.setAttribute('data-price', p_price_item);
//               bundleItem.setAttribute('data-variant', variant);
//               var anchorTag = bundleItem.querySelector('.edit_btn');
//               if (anchorTag) {
//                  anchorTag.setAttribute('data-id', variant);
//               }
//           }
//         modal.style.display = 'none';
//         setTimeout(updatePriceArray, 2000);
//         setTimeout(updatePrices, 2500);
      
//     } else {
//         console.log('Price element not found.');
//     }
//     updateOptionalVariants();
// });


