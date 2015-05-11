superApp.controller('MerchantInventoryCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {

    $scope.goToOrders = function() {
      $state.go("merchant_orders");
    }

    function onProfileLoaded (profile) {
      $scope.merchant = profile;
    }

    function onProductsLoaded (products) {
      $scope.products = products;
    }

  	function onProfileLoaded (profile) {
  		$scope.merchant = profile;
      storeService.getProductsByMerchant($scope.merchant.id, onProductsLoaded);
    }

  	profileService.getMerchantProfile(onProfileLoaded);

}]);