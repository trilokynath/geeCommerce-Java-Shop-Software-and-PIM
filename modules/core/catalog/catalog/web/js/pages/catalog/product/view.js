define(['jquery', 'bootstrap', 'gc/gc', 'catalog/api', 'customer-review/api', 'customer-review/utils/common', 'catalog/utils/media', 'page/media', 'page/variants', 'price/utils/common', 'jquery-magnific-popup', 'jquery-slick'], function ($, Bootstrap, gc, catalogAPI, customerReviewAPI, customerReviewUtil, mediaUtil, pageMedia, pageVariants, priceUtil ) {

	function ProductVM() {
		var self = this;
		
		self.id = gc.app.pageInfo('id');
		self.mainImage = {};
		self.galleryImages = [];
	}

	function VariantVM() {
		var self = this;
		
		self.selectedOptions = {};
		
		self.setOption = function(attrCode, optionId) {
			self.selectedOptions[attrCode] = optionId.toString();
		}
	}

	var productVM = new ProductVM();
	var variantVM = new VariantVM();

	// ---------------------------------------------------------------
	// Load add to cart and price fragment.
	// ---------------------------------------------------------------

	//pageBundle.initConditionsCheck(productVM.id)


	//todo move to bundle
    var conditions = []
	$('input[name=condition]').each(function(){

		var product = $(this).attr('product');
        var condition = $(this).attr('condition');
        var withProduct = $(this).attr('with');
		
        var item = _.findWhere(conditions, { product: product });
        if(item){
        	item.withProducts.push(withProduct)
		} else {
        	item = {};
        	item.product = product;
        	item.condition = condition;
        	item.withProducts = [withProduct];
        	conditions.push(item);
		}
    });

    if(conditions) {
        initBundleConditions();
        function initBundleConditions() {
            $(".bundle-item").on("change", function () {
                handleConditions();
            })

            handleConditions();
        }

        function handleConditions() {
            var products = collectSelectedOptions();

            var productsToDisable = [];
            _.each(products, function (product) {
                var condition = _.findWhere(conditions, {product: product});
                if (condition) {

                    //productsToDisable = productsToDisable.concat(condition.withProducts)
                }

                _.each(conditions, function (condition) {

                    if (condition.withProducts.includes(product)) {
                        productsToDisable.push(condition.product);
                    }
                });
            })

            disableOptions(productsToDisable);

        }
        
        function disableOptions(productsToDisable) {
                var productsToEnable = [];


                _.each($(".bundle-group"), function (bundleGroup) {
                    if ($(bundleGroup).attr("group-type") == "RADIOBUTTON" || $(bundleGroup).attr("group-type") == "CHECKBOX") {
                        $(bundleGroup).find("input").each(function () {
                        	var product = $(this).val();
                        	var masterProduct =  $(this).attr('bundle_master_option');

                            if($(this).is(":disabled")) {
								if(!productsToDisable.includes(product) && !productsToDisable.includes(masterProduct)){
									productsToEnable.push(product)
								}
                            } else {
                                if(productsToDisable.includes(product) || productsToDisable.includes(masterProduct) ){
                                    $(this).prop('disabled', true);
                                    if($(this).is(":checked")) {
                                        $(this).prop('checked', false);
                                    }
                                }
							}
                        });
                    }

                    if($(bundleGroup).attr("group-type") == "SELECT" || $(bundleGroup).attr("group-type") == "MULTISELECT" ){
                        $(bundleGroup).find('option').each(function(){

                            var product = $(this).val();
                            var masterProduct =  $(this).attr('bundle_master_option');

                            if($(this).is(":disabled")) {
                                if(!productsToDisable.includes(product) && !productsToDisable.includes(masterProduct)){
									productsToEnable.push(product)
                                }
                            } else {
                                if(productsToDisable.includes(product) || productsToDisable.includes(masterProduct)){
                                    $(this).prop('disabled', true);
                                    if($(this).is(":selected")) {
                                        $(this).prop('selected', false);
                                    }
                                }
                            }
                        });

                    }

                })


                _.each(productsToEnable, function (productToEnable) {
                    $("[bundle_option=" + productToEnable + "]").prop('disabled', false);
                });

          //  }
        }

        function collectSelectedOptions() {
            var products = [];

            if ($(".bundle-config").length) {

                var bundleMap = {};
                var bundleId =  $(".bundle-config").attr('bundle-id');

                _.each($(".bundle-group"), function (bundleGroup) {

                    var bundleId = $(bundleGroup).attr("group-id");
                    bundleMap[bundleId] = [];

                    if ($(bundleGroup).attr("group-type") == "LIST") {
                        $(bundleGroup).find('input[name=selectedVariant], input[name=bundleProduct]').each(function () {
                            var $productItem = $(this);
                            if ($productItem.val()) {
                                products.push($productItem.val());

                                bundleMap[bundleId].push($productItem.val());

                                if($productItem.attr('bundle_master_option')){
                                    products.push($productItem.attr('bundle_master_option'));
                                }
                            }
                        })
                    }


                    if ($(bundleGroup).attr("group-type") == "RADIOBUTTON") {
                        var $productItem = $(bundleGroup).find("input:checked");

                        if ($productItem.val()) {
                            products.push($productItem.val());

                            bundleMap[bundleId].push($productItem.val());

                            if($productItem.attr('bundle_master_option')){
                                products.push($productItem.attr('bundle_master_option'));
                            }
                        }
                    }

                    if ($(bundleGroup).attr("group-type") == "CHECKBOX") {
                        var $productItems = $(bundleGroup).find("input:checked");

                        _.each($productItems, function (productItem) {
                            var $productItem = $(productItem);
                            if ($productItem.val()) {
                                products.push($productItem.val());

                                bundleMap[bundleId].push($productItem.val());

                                if($productItem.attr('bundle_master_option')){
                                    products.push($productItem.attr('bundle_master_option'));
                                }
                            }
                        })
                    }

                    if ($(bundleGroup).attr("group-type") == "SELECT") {
                        $(bundleGroup).find('option:selected').each(function () {
                            var $productItem = $(this);
                            if ($productItem.val()) {
                                products.push($productItem.val());

                                bundleMap[bundleId].push($productItem.val());

                                if($productItem.attr('bundle_master_option')){
                                    products.push($productItem.attr('bundle_master_option'));
                                }
                            }
                        });

                    }

                    if ($(bundleGroup).attr("group-type") == "MULTISELECT") {

                        $(bundleGroup).find('option:selected').each(function () {
                            var $productItem = $(this);
                            if ($productItem.val()) {
                                products.push($productItem.val());

                                bundleMap[bundleId].push($productItem.val());

                                if($productItem.attr('bundle_master_option')){
                                    products.push($productItem.attr('bundle_master_option'));
                                }
                            }
                        });

                    }

                })



                catalogAPI.getBundlePrices(bundleId, bundleMap).then(function (data) {
                           setBundlePrices(data.data.results);

                })

                return products;
            }
        }


        function setBundlePrices(priceResult) {

            if ($(".bundle-config").length) {
                var cartPrice = priceResult["cart"];
                if (cartPrice)
                    cartPrice = cartPrice[0];

                if (!$(".prd-bundle-price").length) {
                    setTimeout(function () {
                        $(".prd-bundle-price").html(priceUtil.formatPrice(cartPrice));
                    }, 1000)
                }

                $(".prd-bundle-price").html(priceUtil.formatPrice(cartPrice));

                _.each($(".bundle-group"), function (bundleGroup) {

                    var bundleGroupId = $(bundleGroup).attr("group-id");

                    var groupPriceResult = priceResult[bundleGroupId];

                    if ($(bundleGroup).attr("group-type") == "RADIOBUTTON" || $(bundleGroup).attr("group-type") == "CHECKBOX") {

                        $(bundleGroup).find("input").each(function () {
                            var product = $(this).val();

                            // it's not a product, just option = no product selected
                            if(!product)
                                product = "0";

                            if ($(this).is(":disabled")) {
                                $(".bundle-item-price[bundle_option=" + product + "]").html("");
                            } else {
                                $(".bundle-item-price[bundle_option=" + product + "]").html(priceUtil.formatPriceWithSign(groupPriceResult[product]));
                            }
                        });
                    }

                    if ($(bundleGroup).attr("group-type") == "SELECT" || $(bundleGroup).attr("group-type") == "MULTISELECT") {
                        $(bundleGroup).find('option').each(function () {

                            var product = $(this).val();
                            if ($(this).is(":disabled")) {
                                $(this).text($(this).attr('original-text'));
                            } else {
                                $(this).text($(this).attr('original-text') + " " + priceUtil.formatPriceWithSign(groupPriceResult[product]));
                            }
                        });

                    }

                })
            }
        }
    }



	gc.app.fragment('/catalog/product/price-container/' + productVM.id, '#prd-cart-box', function(element) {

		// ---------------------------------------------------------------
		// Set up variants once price container has loaded.
		// ---------------------------------------------------------------
		catalogAPI.getVariants(productVM.id).then(function(response) {

			if(_.isEmpty(response.data) || _.isEmpty(response.data.results))
				return;

			var variantOptions = response.data.results.variant_options;
			var variantProducts = response.data.results.variant_products;

			if(_.isEmpty(variantOptions) || _.isEmpty(variantProducts))
				return;

			gc.app.render({ template: 'templates/catalog/product/variants.html', data: { variants: variantOptions },
				target: '.prd-variants' },
				function(data) {

				var targetEL = data.target;

				// --------------------------------------------------------------------
				// See if there is a preselected variant product-id in the URI-hash
				// and if there is highlight the options and show appropriate images.
				// --------------------------------------------------------------------
				var preselectedVariantId = pageVariants.getPreselectedVariantFromURI();

                // if(!preselectedVariantId){
                //     preselectedVariantId = Object.keys(variantProducts)[0];
                // }
                if(!preselectedVariantId){
                    $('.prd-cart-btn button').prop('disabled', true);
                    $('.prd-cart-btn button').addClass("disabled");
                }


                if(preselectedVariantId) {
					var preselectedVariant = pageVariants.findVariantById(preselectedVariantId, variantProducts);
					var preselectedOptionElements = pageVariants.getPreselectedOptionElements(preselectedVariant, variantOptions);

					if(!_.isEmpty(preselectedOptionElements)) {
						_.each(preselectedOptionElements, function($el) {
							var attrCode = $el.data('attr');
                            var optionId = $el.data('option');
							variantVM.setOption(attrCode, optionId);
						});

						_.each(preselectedOptionElements, function($el) {
							var optionLabel = $el.data('label');
							pageVariants.setSelectedOptionLabel($el, optionLabel);

							pageVariants.deactivateUnavailableOptions($el, variantVM, variantOptions);
						});

						pageVariants.highlightSelectedOption(preselectedOptionElements);

					}

                    var selectedProductVariant = pageVariants.findVariant(variantVM, variantProducts);

                    // Tell cart form which variant has been selected.
                    if(!_.isUndefined(selectedProductVariant) && !_.isUndefined(selectedProductVariant.id)) {
                        $('#prd-cart-form-product-id').val(selectedProductVariant.id);
                        $('.prd-cart-btn button').removeAttr("disabled");
                        $('.prd-cart-btn button').removeClass("disabled");
                        pageVariants.setPreselectedVariantInURI(selectedProductVariant.id);

                        var variantImages = pageVariants.getVariantImages(selectedProductVariant);

                        if(variantImages && variantImages.length > 0) {
                            pageMedia.moveToImage(variantImages[0].origImage);
                        }
                    } else {
                        $('.prd-cart-btn button').addClass("disabled");
                    }
				}

				// --------------------------------------------------------------------
				// Handle highlighting and images when user clicks on an option
				// and attempt to find a matching product variant.
				// --------------------------------------------------------------------
				$('.variant-options a').on('click', function() {

					// Don't do anything if option is disabled.
					if($(this).hasClass('disabled')) {
						return false;
					}

					var attrCode = $(this).data('attr');
					var optionId = $(this).data('option');
					var optionLabel = $(this).data('label');

					pageVariants.highlightSelectedOption($(this));

					pageVariants.deactivateUnavailableOptions($(this), variantVM, variantOptions);

					pageVariants.setSelectedOptionLabel($(this), optionLabel);

					variantVM.setOption(attrCode, optionId);

					var selectedProductVariant = pageVariants.findVariant(variantVM, variantProducts);

					// Tell cart form which variant has been selected.
					if(!_.isUndefined(selectedProductVariant) && !_.isUndefined(selectedProductVariant.id)) {
						$('#prd-cart-form-product-id').val(selectedProductVariant.id);
						$('.prd-cart-btn button').removeAttr("disabled");
						$('.prd-cart-btn button').removeClass("disabled");
						pageVariants.setPreselectedVariantInURI(selectedProductVariant.id);

						var variantImages = pageVariants.getVariantImages(selectedProductVariant);

						pageMedia.moveToImage(variantImages[0].origImage);

					} else {
						$('.prd-cart-btn button').addClass("disabled");
					}
				});
			});
		});
	});

	// ---------------------------------------------------------------
	// Set up images.
	// ---------------------------------------------------------------
	
	catalogAPI.getEnabledViewImages(productVM.id).then(function(response) {
		if(!response.data.catalogMediaAssets)  {
		    return;
		}
		
		var _mainImage = _.findWhere(response.data.catalogMediaAssets, {productMainImage: true})
		var _galleryImages = _.where(response.data.catalogMediaAssets, {productGalleryImage: true})

		productVM.mainImage = {
			origImage: _mainImage.path,
			largeImage: _mainImage.webDetailPath ? _mainImage.webDetailPath : mediaUtil.buildImageURL(_mainImage.path, 330, 330), 
			thumbnail: _mainImage.webThumbnailPath ? _mainImage.webThumbnailPath : mediaUtil.buildImageURL(_mainImage.path, 60, 60), 
			zoomImage: _mainImage.webZoomPath ? _mainImage.webZoomPath : mediaUtil.buildImageURL(_mainImage.path, 1024, 1024), 
			index: 0
		};
		
		var idx = 1;
		_.each(_galleryImages, function(image) {
			productVM.galleryImages.push({
				origImage: image.path,
				largeImage: image.webDetailPath ? image.webDetailPath : mediaUtil.buildImageURL(image.path, 330, 330), 
				thumbnail: image.webThumbnailPath ? image.webThumbnailPath : mediaUtil.buildImageURL(image.path, 50, 50), 
				zoomImage: image.webZoomPath ? image.webZoomPath : mediaUtil.buildImageURL(image.path, 1024, 1024), 
				index: idx++
			});
		});
		
		pageMedia.renderImages(productVM);
	});
	
	
	customerReviewUtil.initSummary();
	
	
});
