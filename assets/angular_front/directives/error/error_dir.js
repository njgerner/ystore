appDirectives.directive('errorDir', ['$window', '$log',
	function($window, $log) { 
	return {
		restrict: 'E',
		scope: {
			msg: '@'
		},
		templateUrl: 'directives/error_template.html',
		link: function(scope, element) {
			$log.info('displaying client error', scope.msg); 
		}
	}
}]);