superApp.controller('LogoutCtrl',
  ['$rootScope', '$scope', '$state', '$cookies', 'authService', 'trdInterceptor',
  function($rootScope, $scope, $state, $cookies, authService, trdInterceptor) {

		$scope.clearCookies = function() {
		  delete $cookies.trdTkn; // logout token
		  delete $cookies.pInCart; // products in cart
		};

	  trdInterceptor.setToken(null);
	  $scope.clearCookies();
	  authService.clearAuthorization();
	  authService.loggedin = false;
	  $rootScope.$broadcast('loggedout');
	  $state.go("login");

}]);