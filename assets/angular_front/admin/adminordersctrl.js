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
        ordersByDate[moment(orders[i].createdAt).format("M/D")] += parseInt(orders[i].total);
        $scope.totalOrderVolume += parseInt(orders[i].total);
        if (moment(orders.createdAt).isAfter(moment().subtract(1, 'months'))) {
          $scope.monthOrderVolume += parseInt(orders[i].total);
        }
      }
      console.log('orders by date', ordersByDate);
      for (var i = 0; i < Object.keys(ordersByDate).length; i++) {
        $scope.data[i] = {};
        $scope.data[i].x = Object.keys(ordersByDate)[i];
        $scope.data[i].value = ordersByDate[i];
      }
      console.log('scope data', $scope.data);
      $scope.dataLoaded = true;
      $scope.options = {
        margin: {
          left: 100
        },
        series: [
          {y: 'Total Volume ($)', color: 'steelblue', thickness: '2px', type: 'area', striped: true, label: 'Pouet'}
        ],
        lineMode: 'linear',
        tension: 0.7,
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'pouet';}},
        drawLegend: true,
        drawDots: true,
        hideOverflow: false,
        columnsHGap: 5
      }
  		$scope.orders = orders;
  	}

  	adminService.getAllOrders(onOrdersLoaded);
}]);