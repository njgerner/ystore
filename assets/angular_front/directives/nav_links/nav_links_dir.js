appDirectives.directive('navLinksDir', [ 'authService', '$state',
	function(authService, $state) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/nav_links_template.html',
		link: function(scope, element) {

			scope.waiting = true;

			scope.$on('authorizationloaded', function (evt, auth) {
				scope.waiting = false;
				scope.isAdmin = authService.isAdmin;
				scope.isYLIFT = authService.isYLIFT;
				console.log('socpe isYLIFT', scope.isYLIFT);
			});
		}
	}
}]);