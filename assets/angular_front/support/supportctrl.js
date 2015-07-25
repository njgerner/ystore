superApp.controller('SupportCtrl',
  ['$rootScope', '$scope', 'emailService', 'authService', '$stateParams',
  function($rootScope, $scope, emailService, authService, $stateParams) {

  	$scope.submitted = false;

  	if (authService.authorized) {
  		$scope.email = authService.profile.email;
  	} 

    if ($stateParams.topic) {
      $scope.topic = $stateParams.topic;
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
  		emailService.sendSupportRequest($scope.email, $scope.data, function(result) {
  			$scope.submitted = true;
  			$scope.submitting = false;
  		});
  	}

}]);