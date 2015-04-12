superApp.controller('ProductCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService) {

    $scope.loading = true;
    $scope.added = false;
    $scope.productnumber = $stateParams.productnumber;
    $scope.error = false;

    $scope.onProductsLoaded = function() {
        $scope.product = storeService.productsByID[$scope.productnumber];
        $scope.loading = false;
    }

    $scope.itemAdded = function() {
        console.log('added!');
        $scope.added = true;
    }

    $scope.addToCart = function() {
        console.log('adding ' + $scope.quantity + ' to cart.');
        if ($scope.quantity <= 0) {
            $scope.error = 'Please select a quantity first';
            return;
        }
        if ($scope.quantity % $scope.product.attributes.increment != 0) {
            $scope.error = 'The quantity entered must be a multiple of ' + $scope.product.attributes.increment;
            return;
        }
        $scope.error = false;
        storeService.addItemToCart($scope.profileid, $scope.product.productnumber, $scope.quantity, function() {
            $scope.itemAdded();
            $rootScope.showCart(function() {}); // want cart to pop out when item is added
        });
    }

    $scope.reset = function() {
        $scope.added = false;
        $scope.error = false;
        $scope.quantity = 0;
    }

    if (storeService.productsReceived) {
        $scope.product = storeService.productsByID[$scope.productnumber];
        $scope.loading = false;
    } else {
        storeService.getAllProducts(function(result) {$scope.onProductsLoaded();});
    }

    if (authService.authorized) {
        $scope.profileid = authService.profile.id;
    }

}]);