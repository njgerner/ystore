superApp.controller('LogoutCtrl',
  ['$rootScope', '$scope', '$state', '$cookies', 'authService', 'yliftInterceptor',
  function($rootScope, $scope, $state, $cookies, authService, yliftInterceptor) {

		$scope.clearCookies = function() {
		  delete $cookies.yliftTkn; // logout token
		  delete $cookies.pInCart; // products in cart
		  delete $cookies.profileUserProfile;
		  delete $cookies.selectedUser;
		  delete $cookies.statusUser;
		  delete $cookies.task;
		  delete $cookies.trackingUser;
		};

	  yliftInterceptor.setToken(null);
	  $scope.clearCookies();
	  authService.clearAuthorization();
	  authService.loggedin = false;
	  $rootScope.$broadcast('loggedout');
	  $state.go("login");

}]);