appDirectives.directive('bookingModalDir', ['$window', 'authService', 'bookingService',
	function($window, authService, bookingService) { 
	return {
		restrict: 'E',
		scope: {
			office: '=',
			close: '='
		},
		templateUrl: 'directives/booking_modal_template.html',
		link: function(scope, element) {

			scope.dateOffset = 0;
			scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
			scope.error = null;
			scope.success = null;
			scope.disabled = false;
			if (!authService.authorized) {
				scope.error = 'Please login to request an appointment';
				scope.disabled = true;
			}

			scope.getUnix = function (offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('X-');
			}

			scope.getDisplayDay = function(offset) {
				console.log('date offset', offset);
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('ddd');
			}

			scope.getDisplayDate = function(offset) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('MMM Do YYYY');
			}

			scope.getDisplayTime = function(offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('LT');
			}

			scope.selectSlot = function(offset, hour, $event) {
				if (scope.disabled) {
					return;
				}
				scope.error = null;
				bookingService.sendApptRequest($event.target.id, scope.office.id, scope.procedure, onApptRequested);
			}

			scope.previous = function() {
				if (scope.dateOffset > 0) {
					scope.dateOffset -= 7;
				};
			}

			scope.next = function() {
				scope.dateOffset += 7;
			}

			function onApptRequest (error, success) {
				if (error) {
					scope.error = error;
				} else {
					scope.success = success;
				}
			}

			function onApptsLoaded (error, appts) {
				scope.appts = appts;
				for (var i = 0; i < appts.length; i++) {
					var apptElement = angular.element(document.querySelector('#' + appts[i].date));
					apptElement.addClass(appts[i].status); // may need to compile this
				}
			}

			bookingService.getPatientAppts(onApptsLoaded);

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
					// logic to get office specific availability
				}
			});

			scope.$on('$destroy', function() {
				officeWatch();
			});
			
		}
	}
}]);