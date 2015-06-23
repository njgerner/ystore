superApp.controller('AdminProductsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'merchantService', '$location', 'productService', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, merchantService, $location, productService, $timeout, storeService) {

    $scope.vendornames = {};

  	storeService.getStoreFront(function(error, products) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.products = products;
  		$scope.products.forEach(function (product) {
  			  merchantService.getMerchantName(product.attributes.vendor, function(name) {
  				$scope.vendornames[product.productnumber] = name;
  			});
  		});
  	});

    $scope.displayDate = function(date) {
      return moment(date).format("MMMM Do, YYYY");
    };

    $scope.editProduct = function(productnumber, attribute) {
      $scope.products.forEach(function (product) {
        if (product.productnumber == productnumber) {
          if (attribute == 'featured') {
              product.featured ? product.featured = false : product.featured = true;
          } else if (attribute == 'active' || attribute == 'isYLIFT') {
              product[attribute] == 'Y' ? product[attribute] = 'N' : product[attribute] = 'Y';
          }
          productService.updateProduct(product);
        }
      });
    };

  	$scope.viewProduct = function(productnumber) {
  		$scope.message = "";
  		storeService.getProductByID(productnumber, function(error, product) {
        if (error) {
          $scope.error = error;
          return;
        }
  			$scope.view_product = product;
  		});
  		$scope.mode = 'view';
  	};

}]);