appDirectives.directive('learnMoreModalDir', ['$window', 'authService', 'emailService',
	function($window, authService, emailService) { 
	return {
		restrict: 'E',
		scope: {
			close: '='
		},
		templateUrl: 'directives/learn_more_modal_template.html',
		link: function(scope, element) {
		  	scope.submitted = false;
			scope.submitting = false;

			scope.submit = function() {
				if (scope.submitting) {
					return;
				}

		  		if (scope.email == null) {
		  			scope.error = 'Please provide an email address for us to contact.';
		  			return;
		  		}
		  		scope.submitting = true;
		  		scope.data = {
		  			topic: 'Learn More',
		  			subject: 'Learn More Inquiry',
		  			orderid: 'N/A',
		  			message: 'This user submitted their email for more information, please reach out to them in a timely manner'
		  		};
		  		emailService.sendSupportRequest(scope.email, scope.data, function(error, result) {
		  			if (error) {
		  				scope.error = 'Error submitting request, please try again.';
		  			} else {
		  				scope.submitted = true;
		  			}
		  			scope.submitting = false;
		  		});
		  	}
			
		}
	}
}]);