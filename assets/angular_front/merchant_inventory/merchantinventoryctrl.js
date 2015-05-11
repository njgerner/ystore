superApp.controller('MerchantInventoryCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {

    $scope.profileLoading = true;
    $scope.productsLoading = true;

    $scope.goToOrders = function() {
      $state.go("merchant_orders");
    }

    $scope.onProductsLoaded = function(products) {
      console.log('on products loaded', products);
      $scope.products = products;
    }

    $scope.onProfileLoaded = function(profile) {
      $scope.merchant = profile;
    }

  	$scope.onProfileLoaded = function(profile) {
  		$scope.merchant = profile;
      console.log('onProfileLoaded', $scope.merchant);
      storeService.getProductsByMerchant($scope.merchant.id, $scope.onProductsLoaded);
    }

  	profileService.getMerchantProfile($scope.onProfileLoaded);

}]);