superApp.controller('AdminProductsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', 'productService', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, $location, productService, $timeout, storeService) {

  	$scope.mode = "";

  	storeService.getAllProducts(function(products) {
  		$scope.products = products;
  		$scope.products.forEach(function (product) {
  			storeService.getMerchantNameByID(product.attributes.vendor, function(name) {
  				product.vendorname = name;
  			});
  		});
  	});

  	$scope.products.forEach(function (product) {
  		product.createdAt = moment(product.createdAt).format("MMMM Do, YYYY");
  	});

  	$scope.viewProduct = function(productnumber) {
  		$scope.message = "";
  		storeService.getProductByID(productnumber, function(product) {
  			$scope.view_product = product;
  		});
  		$scope.mode = 'view';
  	};

  	$scope.updateProduct = function() {
  		if ($scope.updating) {
  			return;
  		}
  		$scope.updating = true;
  		productService.updateProduct($scope.view_product, function(result) {
  			if(result.err) {
  				$scope.message = "Error updating product."
  			}else {
  				$scope.message = "Product successfully updated."
  			}
  		});
  		$scope.updating = false;
  		$scope.mode = 'view';
  	};

}]);