superApp.controller('CheckoutReviewCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, stripeService) {

  	$scope.emailEntered = false;
	$scope.showItems = false;

	var customer = stripeService.customer;
	if (customer && customer.email) {
		$scope.confEmail = customer.email;
	} else if (authService.authorized) {
		$scope.confEmail = authService.profile.email;
	}

	$scope.addEmail = function() {
		if (!customer) {
			var customer = stripeService.customer;
		}
		customer.email = $scope.confEmail;
		console.log('setting customer', customer);
		stripeService.setCustomer(customer);
		$scope.emailEntered = true;
	}

	$scope.toggleItems = function() {
		$scope.showItems = !$scope.showItems;
	}    

}]);