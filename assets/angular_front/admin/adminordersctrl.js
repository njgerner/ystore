superApp.controller('AdminOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

  	$scope.totalOrderVolume = 0;
  	$scope.monthOrderVolume = 0;
    $scope.data = [];

  	function onOrdersLoaded (orders) {
      var ordersByDate = {};
  		for (var i = 0; i < orders.length; i++) {
        if (ordersByDate[moment(orders[i].createdAt).format("M/D")] === undefined) {
          ordersByDate[moment(orders[i].createdAt).format("M/D")] = 0;
        }
        ordersByDate[moment(orders[i].createdAt).format("M/D")] += orders[i].total;
        $scope.totalOrderVolume += orders[i].total;
        if (moment(orders.createdAt).isAfter(moment().subtract(1, 'months'))) {
          $scope.monthOrderVolume += orders[i].total;
        }
      }
      for (var i = 0; i < ordersByDate.length; i++) {
        $scope.data[i] = {};
        $scope.data[i].x = Object.keys(ordersByDate)[i];
        $scope.data[i].value = ordersByDate[i];
      }
      $scope.options = {};
  		$scope.orders = orders;
  	}

  	adminService.getAllOrders(onOrdersLoaded);
}]);