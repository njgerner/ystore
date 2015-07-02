superApp.controller('AdminOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

    $scope.totalOrderVolume = 0;
    $scope.monthOrderVolume = 0;
    $scope.dailyOrderVolume = 0;
    $scope.error = null;

    $scope.getDisplayDate = function (date) {
      return moment(date).format('LL');
    }

    $scope.formatShipTo = function(shipTo) {
      if (!shipTo) {
        return "No shipping information provided";
      } else {
        return  "<strong>" + shipTo.name + "</strong>" + "<br>" + 
                shipTo.address1 + " " + (shipTo.address2 || "") + "<br>" + 
                shipTo.city + ", " + shipTo.state + " " + shipTo.zip;
      }
    }

    $scope.formatValue = function (value) {
      return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
    }

    function buildChart (ordersByDate) {
      var data = [];
      for (date in ordersByDate) {     
        data.push(ordersByDate[date]);   
      }
      $('#orders-chart').highcharts({
        chart: {
          zoomType: 'x'
        },
        title: {
          text: 'Daily Sales Totals'
        },
        xAxis: {
          type: 'datetime',
          minRange: 14 * 24 * 3600000 // fourteen days
        },
        yAxis: {
          title: {
            text: 'Total Sales in USD'
          }
        },
        legend: {
            enabled: false
        },
        series: [{
          type: 'line',
          name: 'Total',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.UTC(2015, 6, 11),
          data: data
        }]
      });
    }

  	function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
      } else {
        var ordersByDate = {};
        for (var i = 0; i < orders.length; i++) {
          if (ordersByDate[moment(orders[i].createdAt).format("M/D")] === undefined) {
            ordersByDate[moment(orders[i].createdAt).format("M/D")] = 0;
          }
          ordersByDate[moment(orders[i].createdAt).format("M/D")] += parseInt(orders[i].total);
          $scope.totalOrderVolume += parseInt(orders[i].total);
          if (moment(orders[i].createdAt).isAfter(moment().subtract(1, 'months'))) {
            $scope.monthOrderVolume += parseInt(orders[i].total);
          }
          if (moment(orders[i].createdAt).isAfter(moment().subtract(1, 'days'))) {
            $scope.dailyOrderVolume += parseInt(orders[i].total);
          }
        }
        $scope.orders = orders;
        buildChart(ordersByDate);
      }
  	}

  	adminService.getAllOrders(onOrdersLoaded);
}]);