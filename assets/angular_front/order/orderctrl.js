superApp.controller('OrderCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
    $scope.orderid = $stateParams.orderid;
    $scope.loading = true;

    $scope.goToProfile = function() {
      $state.go("profile");
    }

    $scope.displayCreatedAt = function(time) {
      return moment(time).format("MMMM Do, YYYY")
    }
    
    storeService.getOrderByID($scope.orderid, function(order) {
      $scope.order = order;
      $scope.loading = false;
    });
}]);