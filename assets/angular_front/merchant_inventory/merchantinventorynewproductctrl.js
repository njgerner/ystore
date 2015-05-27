superApp.controller('MerchantInventoryNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService',
  function($rootScope, $scope, $state, productService) {

  	$scope.product = {};

  	$scope.addProduct = function() {
  		if ($scope.updating) {
  			return;
  		}
  		$scope.updating = true;
  		productService.addProduct($scope.product, onProductAdded);
  	}

  	function onProductAdded (product) {
  		$state.go("merchant_inventory.product", {productnumber:product.productnumber});
  	}

}]);