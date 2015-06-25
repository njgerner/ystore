superApp.controller('CheckoutReviewCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, stripeService) {

  	$scope.emailEntered = false;
	$scope.showItems = false;

	var customer = stripeService.customer;
	if (customer && customer.email) {
		$scope.confEmail = customer.email;
		$scope.emailEntered = true;
	} else if (authService.authorized) {
		$scope.confEmail = authService.profile.email;
		$scope.emailEntered = true;
	}

	$scope.formatValue = function (value) {
		if (value) {
      		return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
		} else {
			return "";
		}
    }

	$scope.addEmail = function() {
		if (!customer) {
			var customer = stripeService.customer;
		}
		customer.email = $scope.confEmail;
		stripeService.setCustomer(customer);
		$scope.emailEntered = true;
	}

	$scope.toggleItems = function() {
		$scope.showItems = !$scope.showItems;
	}    

}]);