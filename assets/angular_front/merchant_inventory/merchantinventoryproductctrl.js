superApp.controller('MerchantInventoryProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', '$stateParams', 'productService',
  function($rootScope, $scope, $state, storeService, $stateParams, productService) {

  	$scope.updateProduct = function() {
  		if ($scope.updating) {
  			return;
  		}
  		$scope.updating = true;
  		productService.updateProduct($scope.product, onProductLoaded);
  	}

  	function onProductLoaded (product) {
  		$scope.mode = 'view';
  		$scope.updating = false;
  		$scope.product = product;
  	}

  	storeService.getProductByID($stateParams.productnumber, onProductLoaded);

}]);