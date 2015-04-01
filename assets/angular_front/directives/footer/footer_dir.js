appDirectives.directive('footerDir', [ 'authService', '$state',
	function(authService, $state) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/footer_template.html',
		link: function(scope, element) {



		}
	}
}]);