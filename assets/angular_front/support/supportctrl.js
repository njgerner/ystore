superApp.controller('SupportCtrl',
  ['$rootScope', '$scope', 'emailService', 'authService',
  function($rootScope, $scope, emailService, authService) {

  	$scope.submitted = false;

  	if (authService.authorized) {
  		$scope.email = authService.profile.email;
  	} 
  	
  	$scope.sendRequest = function() {
  		if ($scope.email == null) {
  			$scope.error = 'Please provide an email address for us to contact.';
  			return;
  		}
  		$scope.submitting = true;
  		$scope.data = {
  			topic: $scope.topic,
  			subject: $scope.subject,
  			orderid: $scope.orderid,
  			message: $scope.message
  		};
  		emailService.sendSupportRequest($scope.email, $scope.data, function(error, result) {
  			$scope.submitted = true;
  			$scope.submitting = false;
  		});
  	}

}]);