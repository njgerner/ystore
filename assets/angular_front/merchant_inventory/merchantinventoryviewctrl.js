superApp.controller('MerchantInventoryViewCtrl',
  ['$rootScope', '$scope', '$state',
  function($rootScope, $scope, $state) {

  	$scope.profile = $scope.profile;
  	$scope.products = $scope.products;

  	$scope.goToProduct = function(id) {
  		$state.go("merchant_inventory.product", {productnumber:id});
  	}

  	$scope.deleteProduct = function(id) {
  		
  	}

}]);