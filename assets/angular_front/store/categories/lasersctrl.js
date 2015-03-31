superApp.controller('LasersCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {

    $scope.loading = true;

    $scope.goToProduct = function(productnumber) {
      $state.go('store.product', {productnumber: productnumber});
    }

    $scope.onProductsLoaded = function(result) {
      $scope.loading = false;
      $scope.laserProducts = result;
    }

    storeService.getProductsByCategory('lasers', function(result) {$scope.onProductsLoaded(result);});

}]);