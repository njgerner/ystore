superApp.controller('RegisterYLIFTAccountCtrl',
  ['$scope', '$state', 'authService',
  function($scope, $state, authService) {

    $scope.verifyAccount = function() {
      $scope.error = null;
    	if(validate()) {
        $scope.$parent.loginemail = $scope.loginemail;
        $scope.$parent.password = $scope.password;
    		$state.go('registerylift.practiceinfo');
    	}
    };

    $scope.createAccount = function() {
      $scope.error = null;
      $scope.validating = true;
      if(!$scope.loginemail) {
        $scope.error = "Please choose a login email.";
      } else if(!$scope.password) {
        $scope.error = "Please choose a password."
      } else if($scope.password.length < 6) {
        $scope.error = "Password must be at least 6 characters."
      } else if ($scope.password != $scope.confirmpassword) {
        $scope.error = "Passwords must match";
      } else {
        $scope.validating = false;
        authService.register($scope.loginemail, $scope.password, function (err, data) {
          if(err) {
            $scope.error = err;
          } else {
            $state.go('registerylift.practiceinfo', {newuser: true});
          }
        }, $scope.$parent.metadata);
      }
      $scope.validating = false;
    };

}]);