appDirectives.directive('navLinksDir', [ 'authService', '$state', '$rootScope',
	function(authService, $state, $rootScope) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/nav_links_template.html',
		link: function(scope, element) {

			scope.isAdmin = authService.isAdmin;
			scope.isYLIFT = authService.isYLIFT;
		}
	}
}]);