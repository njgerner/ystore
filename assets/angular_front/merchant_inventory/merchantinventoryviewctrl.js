superApp.controller('MerchantInventoryViewCtrl',
  ['$rootScope', '$scope', '$state',
  function($rootScope, $scope, $state) {

  	$scope.goToProduct = function(id) {
  		$state.go("merchant_inventory.product", {productnumber:id});
  	}

  	$scope.deleteProduct = function(id) {
  		
  	}

}]);