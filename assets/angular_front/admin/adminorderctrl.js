superApp.controller('AdminOrderCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', '$stateParams', 'storeService',
  function($rootScope, $scope, $state, adminService, $stateParams, storeService) { 

    $scope.error = null;
  	$scope.orderid = $stateParams.orderid;
  	if (!$scope.orderid) {
  		$state.go("admin.orders");
  	}

  	$scope.getDisplayDate = function (date) {
      return moment(date).format('LL');
    }

  	$scope.formatValue = function (value) {
      if (!value) {
        return "";
      } else {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

  	function onOrderLoaded (error, order) {
      if (error) {
        $scope.error = error;
      } else {
        $scope.products = [];
        $scope.order = order;
        if ($scope.order.products && $scope.order.products.length) {
          $scope.order.products.forEach(function (p) {
            storeService.getProductByID(p.productnumber, function (error, product) {
              if (error) {
                $scope.error = error;
              }
              $scope.products.push(product);
            });
          });
        }
      }
  	}

  	storeService.getOrderByID($scope.orderid, onOrderLoaded);

}]);