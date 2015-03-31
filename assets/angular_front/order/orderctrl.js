superApp.controller('OrderCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
    $scope.orderid = $stateParams.orderid;
    $scope.loading = true;

    $scope.goToProfile = function() {
      $state.go("profile");
    }
    
    storeService.getOrderByID($scope.orderid, function(order) {
      $scope.order = order;
      $scope.order.createdAt = moment($scope.order.createdAt).format("MMMM Do, YYYY");
      $scope.loading = false;
    });
}]);