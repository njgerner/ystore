superApp.controller('AdminProductsCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'merchantService', 'productService', 'storeService',
  function($rootScope, $scope, $state, adminService, merchantService, productService, storeService) {

    $scope.vendornames = {};

    adminService.getAllProducts(function (err, products) {
      if(err) {
        $scope.error = error;
        return;
      }
      $scope.products = products;
      $scope.vendorIDs = [];
      for(var i = 0; i < products.length; i++) {
        if($scope.vendorIDs.indexOf(products[i].attributes.vendor) < 0) {
          $scope.vendorIDs.push(products[i].attributes.vendor);
          adminService.getMerchantProfile(products[i].attributes.vendor, function (err, profile) {
            if(err) {
              $scope.error = err;
            }else{
              $scope.vendornames[profile.id] = profile.name;
            }
          });
        }
      }
    });

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