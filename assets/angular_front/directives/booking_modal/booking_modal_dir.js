appDirectives.directive('bookingModalDir', ['$window',
	function($window) { 
	return {
		restrict: 'E',
		scope: {
			office: '=',
			close: '='
		},
		templateUrl: 'directives/booking_modal_template.html',
		link: function(scope, element) {

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
				}
			});

			scope.$on('$destroy', function() {
				officeWatch();
			});
			
		}
	}
}]);