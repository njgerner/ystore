trdFilters.filter("merchantProduct", ['storeService', function (storeService) { 
	return function(products, merchant) {
		var filtererd = [];
		for (var i = 0; i < products.length; i++) {
			if (storeService.getProductMerchant(products[i].productnumber) == merchant.id) {
				filtered.push(storeService.productsByID[products[i].productnumber]);
			}
		}
		return filtered;
	};
}]);