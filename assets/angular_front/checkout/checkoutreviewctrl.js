superApp.controller('CheckoutReviewCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService) {

	$scope.showItems = false;

	$scope.toggleItems = function() {
		$scope.showItems = !$scope.showItems;
	}    

}]);