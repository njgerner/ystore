superApp.controller('MerchantInventoryCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {

    $scope.profileLoading = true;

    $scope.goToOrders = function() {
      $state.go("merchant_orders");
    }

    function onProductsLoaded (products) {
      $scope.products = products;
      console.log('products', $scope.products);
      $scope.productsLoading = false;
    }

  	function onProfileLoaded (profile) {
      $scope.merchant = profile;
      $scope.profileLoading = false;
      storeService.getProductsByMerchant($scope.merchant.id, onProductsLoaded);
    }

  	profileService.getMerchantProfile(onProfileLoaded);

}]);