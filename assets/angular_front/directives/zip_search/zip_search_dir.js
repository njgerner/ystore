appDirectives.directive('zipSearchDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			onSubmit: '=',
		},
		templateUrl: 'directives/zip_search_template.html',
		link: function(scope, element) {

			element.bind("keydown keypress", function(event) {
            	if (event.which === 13) {
            		scope.onSubmit(scope.zip);
            	}
            });

		}
	}
}]);