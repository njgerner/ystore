superApp.controller('MerchantOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {


    $scope.displayDate = function(date) {
      return moment(date).format("MMMM Do, YYYY");
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

    $scope.updateOrder = function(order) {
      storeService.updateOrder(order);
    }

    $scope.getMerchantProducts = function(products) {
      var filtered = [];
      for (var i = 0; i < products.length; i++) {
        if (storeService.getProductMerchant(products[i].productnumber) == $scope.merchant.id) {
          filtered.push(storeService.productsByID[products[i].productnumber]);
        }
      }
      return filtered;
    }

    function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.orders = orders;
  	}

  	function onProfileLoaded (error, profile) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.merchant = profile;
  		storeService.getMerchantOrders($scope.merchant.id, onOrdersLoaded);
  	}

  	profileService.getMerchantProfile(onProfileLoaded);

}]);