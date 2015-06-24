appDirectives.directive('bookingModalDir', ['$window',
	function($window) { 
	return {
		restrict: 'E',
		scope: {
			office: '='
		},
		templateUrl: 'directives/booking_modal_template.html',
		link: function(scope, element) {

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
					console.log('new office in place', newVal, oldVal);
				}
			});

			scope.$on('$destroy', function() {
				locationWatch();
			});
			
		}
	}
}]);