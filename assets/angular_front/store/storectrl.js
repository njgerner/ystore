superApp.controller('StoreCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {

    $scope.filteredProducts = [];
    $scope.products = [];
    $scope.productsByCategory = []
    $scope.loading = true;
    $scope.defaultCategory = 'juvuderm';

    $scope.onProductsLoaded = function(result) {
      $scope.products = result;
      $scope.productsByCategory = storeService.productsByCategory;
      var stateUrl = $location.path().split("/");
      if (stateUrl.indexOf("product") >= 0) {
        var ind = stateUrl.indexOf("product");
        $scope.goToProduct(stateUrl[++ind]);
      } else { // TODO need and else if for categories
        $scope.goToCategory($scope.defaultCategory);
      }
      $scope.loading = false;
    }

    $scope.goToProduct = function(productnumber) {
      $state.go('store.product', {productnumber: productnumber});
    }

    $scope.goToCategory = function(category) {
      $state.go('store.' + category);
    }

    $scope.isActive = function(route) {
      return route == $location.path();
    }

    $scope.search = function() {
      if ($scope.searchQuery.length == 0) {
        $scope.goToCategory($scope.defaultCategory);
        return;
      } 
      $scope.filterProducts($scope.searchQuery.toLowerCase());
      $state.go('store.search');
    }

    $scope.filterProducts = function(query) {
      $scope.filteredProducts = [];
      $scope.products.forEach(function(product, index) {
        if(product.name.toLowerCase().indexOf(query) > -1 || product.description.toLowerCase().indexOf(query) > -1){
          $scope.filteredProducts.push(product);
        }
      });
    }
    storeService.getAllProducts(function(result) {$scope.onProductsLoaded(result);});

}]);