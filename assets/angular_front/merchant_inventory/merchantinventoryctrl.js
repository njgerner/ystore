superApp.controller('MerchantInventoryCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {

    $scope.profileLoading = true;
    $scope.productNames = [];
    $scope.filteredProducts = [];

    $scope.goToOrders = function() {
      $state.go("merchant_orders");
    }

    $scope.filter = function(query) {
      if(query == '') {    //for when user clicks 'all inventory'
        $scope.query = '';
        $scope.filteredProducts = $scope.products;
      }else {
        $scope.filteredProducts = [];
        $scope.products.forEach(function(product, index) {
            if(product.name.toUpperCase().indexOf(query.toUpperCase()) > -1) {
              $scope.filteredProducts.push(product);
            }
        });
      }
    }

    function onProductsLoaded (error, products) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.products = products;
      $scope.filteredProducts = products;
      products.forEach(function(product, index) {
                $scope.productNames.push(product.name);
            });
      $scope.productsLoading = false;
    }

  	function onProfileLoaded (error, profile) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchant = profile;
      $scope.profileLoading = false;
      storeService.getProductsByMerchant($scope.merchant.id, onProductsLoaded);
    }

  	profileService.getMerchantProfile(onProfileLoaded);

}]);