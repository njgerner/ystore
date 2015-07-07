appDirectives.directive('errorDir', ['$window', '$log',
	function($window, $log) { 
	return {
		restrict: 'E',
		scope: {
			msg: '@',
			htmlMsg: '=',
			level: '='
		},
		templateUrl: 'directives/error_template.html',
		link: function(scope, element) {
		}
	}
}]);