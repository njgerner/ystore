superApp.controller('CheckoutReviewCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, stripeService) {

	$scope.showItems = false;
	var customer = stripeService.customer;
	if (customer) {
		$scope.confEmail = customer.email;
	}

	$scope.addEmail = function() {
		if (!customer) {
			var customer = stripeService.customer;
		}
		customer.email = $scope.confEmail;
		console.log('setting customer', customer);
		stripeService.setCustomer(customer);
	}

	$scope.toggleItems = function() {
		$scope.showItems = !$scope.showItems;
	}    

}]);