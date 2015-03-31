superApp.controller('ProductCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService) {

    $scope.loading = true;
    $scope.added = false;
    $scope.productnumber = $stateParams.productnumber;
    $scope.userid = authService.userid;
    $scope.error = false;

    $scope.onProductsLoaded = function() {
        $scope.product = storeService.productsByID[$scope.productnumber];
        $scope.loading = false;
    }

    $scope.itemAdded = function() {
        $scope.added = true;
    }

    $scope.addToCart = function() {
        if ($scope.quantity % $scope.product.attributes.increment != 0) {
            $scope.error = 'The quantity entered must be a multiple of ' + $scope.product.attributes.increment;
            return;
        }
        $scope.error = false;
        storeService.addItemToCart($scope.userid, $scope.product.productnumber, $scope.quantity, function(cart) {
            $scope.itemAdded();
            $rootScope.showCart(function() {}); // want cart to pop out when item is added
        });
    }

    $scope.reset = function() {
        $scope.added = false;
        $scope.error = false;
    }

    if (storeService.productsReceived) {
    	$scope.product = storeService.productsByID[$scope.productnumber];
        $scope.loading = false;
    } else {
    	storeService.getAllProducts(function(result) {$scope.onProductsLoaded();});
    }

}]);