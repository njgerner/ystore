superApp.controller('MerchantInventoryProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', '$stateParams',
  function($rootScope, $scope, $state, storeService, $stateParams) {

  	function onProductLoaded (product) {
  		$scope.product = product;
  	}

  	storeService.getProductByID($stateParams.productnumber, onProductLoaded);

}]);