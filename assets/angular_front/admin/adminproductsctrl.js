superApp.controller('AdminProductsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', 'productService', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, $location, productService, $timeout, storeService) {

  	$scope.mode = "";
    $scope.vendornames = [];

  	storeService.getAllProducts(function(products) {
  		$scope.products = products;
  		$scope.products.forEach(function (product) {
  			storeService.getMerchantNameByID(product.attributes.vendor, function(name) {
  				$scope.vendornames[product.productnumber] = name;
  			});
  		});
  	});

    $scope.displayDate = function(date) {
      return moment(date).format("MMMM Do, YYYY");
    };

    $scope.editProduct = function(productnumber, attribute) {
      $scope.products.forEach(function (product) {
        if(product.productnumber == productnumber) {
          if(attribute == 'featured') {
              product.featured ? product.featured = false:product.featured = true;
          }else if(attribute == 'active') {
              product.active == 'Y' ? product.active = 'N':product.active = 'Y';
          }
        }
      });
    };

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