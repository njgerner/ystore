superApp.controller('ProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, storeService) {
  	
  	$scope.profile = authService.profile; // this call should be alright as we will never make it to /profile w/o being authorized
    $scope.ordersLoaded = false;
    $scope.orders = [];
    $scope.createdAt = moment($scope.profile.createdAt).format("MMMM Do, YYYY");

    $scope.getDisplayDate = function(date) {
      if(date) {
         return moment(date).format("MMM Do YYYY");
       } else {
        return "";
       }
    }

    $scope.getDisplayTotal = function(value) {
      if (!value) {
        return "";
      } else {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }
    }

    $scope.logoutNow = function() {
      $state.go("logout");
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

    function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
      }
      if (Array.isArray(orders)) {
        $scope.orders = orders;
      } else {
        $scope.orders.push(orders);
      }
      $scope.ordersLoaded = true;
    }

    // storeService.getProductsInCart(authService.profile.id, function(cart) {}); // why the hell is this here
    storeService.getOrdersByUserID(authService.profile.id, onOrdersLoaded);

}]);