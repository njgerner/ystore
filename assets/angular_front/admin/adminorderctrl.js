superApp.controller('AdminOrderCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', '$stateParams', 'storeService',
  function($rootScope, $scope, $state, adminService, $stateParams, storeService) { 

  	$scope.orderid = $stateParams.orderid;
  	if (!$scope.orderid) {
  		$state.go("admin.orders");
  	}

  	$scope.getDisplayDate = function (date) {
      return moment(date).format('LL');
    }

  	$scope.formatValue = function (value) {
      return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

  	function onOrderLoaded (order) {
  		$scope.products = [];
  		$scope.order = order;
  		if ($scope.order.products && $scope.order.products.length) {
	  		$scope.order.products.forEach(function (p) {
	  			storeService.getProductByID(p.productnumber, function (product) {
	  				$scope.products.push(product);
	  			});
	  		});
  		}
  	}

  	storeService.getOrderByID($scope.orderid, onOrderLoaded);

}]);