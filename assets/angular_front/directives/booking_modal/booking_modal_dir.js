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
			scope.appts = [];
			scope.dateOffset = 0;
			scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
			scope.error = null;
			scope.success = null;

			scope.getUnix = function (offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('X-');
			}

			scope.getDisplayDay = function(offset) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('ddd');
			}

			scope.getDisplayDate = function(offset) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('MMM Do YYYY');
			}

			scope.getDisplayTime = function(offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('LT');
			}

			scope.selectSlot = function(offset, hour, $event) {
				scope.error = null;
				scope.success = null;
				bookingService.sendApptRequest($event.target.id, scope.office.profileid, scope.procedure, onApptRequested);
			}

			scope.previous = function() {
				if (scope.dateOffset > 0) {
					scope.dateOffset -= 7;
				};
			}

			scope.next = function() {
				scope.dateOffset += 7;
			}

			function onApptRequested (error, appt) {
				console.log('appt requested', error, appt);
				if (error) {
					scope.error = error;
				} else {
					scope.success = true;
					scope.appts.push(appt);
					var apptElement = angular.element(document.getElementById(appt.date));
					apptElement.addClass(appt.status); // may need to compile this
				}
			}

			function onApptsLoaded (error, appts) {
				scope.appts = appts || [];
			}

			bookingService.getPatientAppts(onApptsLoaded);

			var apptsWatch = null;
			apptsWatch = scope.$watch('appts', function (newVal, oldVal) {
				if (newVal && newVal.length) {
					for (var i = 0; i < newVal.length; i++) {
						var apptElement = angular.element(document.getElementById(newVal[i].date));
						apptElement.addClass(newVal[i].status); // may need to compile this
					}
				}
			});

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
					// logic to get office specific availability
				}
			});

			scope.$on('$destroy', function() {
				officeWatch();
				apptsWatch();
			});
			
		}
	}
}]);