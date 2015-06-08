appDirectives.directive('navLinksDir', [ 'authService', '$state',
	function(authService, $state) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/nav_links_template.html',
		link: function(scope, element) {

		}
	}
}]);