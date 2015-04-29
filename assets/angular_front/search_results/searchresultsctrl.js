superApp.controller('SearchResultsCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
  	$scope.query = $stateParams.query;

    $scope.displayProducts = function(products) {
    	$scope.products = products;
      $scope.displayedProducts = $scope.products.slice(0,15);
    }

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

    //i think this will work but i can't test it with so few products.... guess we'll find out in a few months!
    $scope.loadMore = function() {
      var last = $scope.products[$scope.displayedProducts.length - 1];
      for(var i = 1; i <= 6; i++) {
        $scope.products.push(last + i);
      }
    }

    if($scope.query) {
       storeService.getFilteredProducts($scope.query.toLowerCase(), function(products) { $scope.displayProducts(products); });
    } else {
      $scope.allProducts = [];
      $scope.dispayedProducts = [];
    }

}]);