superApp.controller('SearchResultsCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
  	$scope.query = $stateParams.query;

    $scope.displayProducts = function(products) {
    	$scope.products = products;
    }

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

	storeService.getFilteredProducts($scope.query.toLowerCase(), function(products) { $scope.displayProducts(products); });

}]);