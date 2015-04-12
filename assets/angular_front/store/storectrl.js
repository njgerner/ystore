superApp.controller('StoreCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
   'authService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService,
    authService) {

    $scope.filteredProducts = [];
    $scope.products = [];
    $scope.productsInCart = [];
    $scope.productsByCategory = []
    $scope.loading = true;

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

    // $scope.goToCategory = function(category) {
    //   $state.go('store.' + category);
    // }

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

    $scope.openCart = function() {
      $rootScope.showCart(function(isVisible) {$scope.showCart = isVisible});
    };

    function onProductsInCartReceived (result) {
      console.log('result from pIn', result);
      $scope.productsInCart = result;
    }

    function onProductsLoaded (result) {
      $scope.products = result;
      $scope.productsByCategory = storeService.productsByCategory;
      storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);
      var stateUrl = $location.path().split("/");
      if (stateUrl.indexOf("product") >= 0) {
        var ind = stateUrl.indexOf("product");
        $scope.goToProduct(stateUrl[++ind]);
      }
      // } else { // TODO need and else if for categories
      //   $scope.goToCategory($scope.defaultCategory);
      // }
      $scope.loading = false;
    }

    storeService.getAllProducts(onProductsLoaded);

}]);