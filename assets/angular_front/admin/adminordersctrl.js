superApp.controller('AdminOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

  	$scope.totalOrderVolume = 0;
  	$scope.monthOrderVolume = 0;

  	function onOrdersLoaded (orders) {
  		for (var i = 0; i < orders.length; i++) {
  			$scope.totalOrderVolume += orders[i].total;
  			if (moment(orders.createdAt).isAfter(moment().subtract(1, 'months'))) {
  				$scope.monthOrderVolume += orders[i].total;
  			}
  		}
  		$scope.orders = orders;
  	}

  	adminService.getAllOrders(onOrdersLoaded);
}]);