appDirectives.directive('footerDir', [ 'authService', 'awsService', '$state', '$location', '$rootScope', '$window', '$cookieStore', '$cookies', 'yliftInterceptor', 'storeService',
	function(authService, awsService, $state, $location, $rootScope, $window, $cookieStore, $cookies, yliftInterceptor, storeService) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/footer_template.html',
		link: function(scope, element) {



		}
	}
}]);