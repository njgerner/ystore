appDirectives.directive('errorDir', ['$window',
	function($window) { 
	return {
		restrict: 'E',
		scope: {
			msg: '@'
		},
		templateUrl: 'directives/error_template.html',
		link: function(scope, element) {
			 
		}
	}
}]);