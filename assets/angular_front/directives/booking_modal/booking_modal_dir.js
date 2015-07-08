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
			scope.apptsByOfficeAndTimestamp = {};
			scope.dateOffset = 0;
			scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
			scope.error = null;
			scope.success = null;

			scope.reset = function () {
				scope.appts = [];
				scope.apptsByOfficeAndTimestamp = {};
				scope.dateOffset = 0;
				scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
				scope.error = null;
				scope.success = null;
			}

			scope.getUnix = function (offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('X');
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

			scope.getSlotClass = function(offset, hour) {
				var appt = scope.apptsByOfficeAndTimestamp[scope.office.id][scope.getUnix(offset, hour)];
				if (appt && appt.status) {
					return appt.status;
				} else {
					return '';
				}
			}

			scope.selectSlot = function(offset, hour, $event) {
				scope.error = null;
				scope.success = null;	
				bookingService.sendApptRequest(scope.getUnix(offset, hour), scope.office, scope.office.profile, scope.procedure, onApptRequested);
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
				if (error) {
					scope.error = error;
				} else {
					scope.success = true;
					scope.appts.push(appt);
					scope.apptsByOfficeAndTimestamp[appt.office] = scope.apptsByOfficeAndTimestamp[appt.office] || {};
					scope.apptsByOfficeAndTimestamp[appt.office][appt.date] = appt;
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
						scope.apptsByOfficeAndTimestamp[newVal[i].office] = scope.apptsByOfficeAndTimestamp[newVal[i].office] || {};
						scope.apptsByOfficeAndTimestamp[newVal[i].office][newVal[i].date] = newVal[i];
					}
				}
			});

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
					scope.reset();
					bookingService.getPatientAppts(onApptsLoaded);
				}
			});

			scope.$on('$destroy', function() {
				officeWatch();
				apptsWatch();
			});
			
		}
	}
}]);