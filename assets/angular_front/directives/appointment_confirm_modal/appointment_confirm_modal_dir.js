appDirectives.directive('appointmentConfirmModalDir', ['profileService', 'authService', 'bookingService',
	function(profileService, authService, bookingService) { 
	return {
		restrict: 'E',
		scope: {
			appt: '=',
			close: '='
		},
		templateUrl: 'directives/appointment_confirm_modal_template.html',
		link: function(scope, element) {

			scope.patient = {};

			scope.toTitleCase = function(str) {
				if (!str) {
					return '';
				} else {
					return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
				}
			}

			scope.getDisplayDate = function(date) {
				return moment(date, 'X').format('LLLL')
			}

			scope.updateStatus = function(status) {
				scope.appt.status = status;
				bookingService.updateApptRequest(scope.appt, onApptUpdated);
			}

			function onApptUpdated (error, appt) {
				if (error) {
					scope.error = error;
					return;
				} else {
					scope.appt = appt;
					scope.close();
				}
			}

			function onProfileLoaded (error, profile) {
				scope.patient = profile;
			}

			var apptWatch = null;
			apptWatch = scope.$watch('appt', function (newVal, oldVal) {
				if (newVal) {
					profileService.getProfileByID(newVal.patient, onProfileLoaded);
				}
			});


			scope.$on('$destroy', function() {
				apptWatch();
			});
			
		}
	}
}]);