superApp.controller('StoreCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
   'authService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService,
    authService) {

    $rootScope.pageTitle = 'Store';
    $scope.filteredProducts = [];
    $scope.products = [];
    $scope.productsInCart = [];
    $scope.productsByCategory = []
    $scope.loading = true;
    $scope.authLoaded = authService.authorizationReceived;

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

    $scope.isActive = function(route) {
      return route == $location.path();
    }

    $scope.openCart = function() {
      $rootScope.showCart(function(isVisible) {$scope.showCart = isVisible});
    };

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

    function onProductsInCartReceived (result) {
      $scope.productsInCart = result;
    }

    function onProductsLoaded (error, result) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.products = result;
      $scope.productsByCategory = storeService.productsByCategory;
      storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);
      var stateUrl = $location.path().split("/");
      if (stateUrl.indexOf("product") >= 0) {
        var ind = stateUrl.indexOf("product");
        $scope.goToProduct(stateUrl[++ind]);
      }
      $scope.loading = false;
    }

    $scope.$watch('authLoaded', function (newValue, oldValue) {
      if (newValue) {
        storeService.getStoreFront(onProductsLoaded, true);
      }
    });

}]);