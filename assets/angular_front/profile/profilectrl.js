superApp.controller('ProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, storeService) {
  	
  	$scope.profile = authService.profile; // this call should be alright as we will never make it to /profile w/o being authorized
    $scope.ordersLoaded = false;
    $scope.orders = [];
    //nick is a mean person :( // you're damn right
    $scope.createdAt = moment($scope.profile.createdAt).format("MMMM Do, YYYY");
    authService.loggedin = true;
    $rootScope.$broadcast('loggedin');

    $scope.onOrdersLoaded = function(orders) {
      if (Array.isArray(orders)) { // dumb orchestrate return issue, a good intern problem to fix
        $scope.orders = orders;
      } else {
        $scope.orders.push(orders);
      }
      $scope.ordersLoaded = true;
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

     // load the cart on login
    storeService.getCartByUserID(authService.userid, function(cart) {});
    storeService.getOrdersByUserID(authService.profile.id, function(orders) { $scope.onOrdersLoaded(orders); });

}]);