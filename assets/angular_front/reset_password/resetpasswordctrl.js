superApp.controller('ResetPasswordCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {

    authService.validateResetToken($stateParams.resettoken, function(valid, message) {
      if(valid) {
        $scope.valid = true;
      }else {
        $scope.valid = false;
        $scope.message = message;
      }
    });

    $scope.updatePassword = function() {
      if(typeof $scope.password == "undefined" || $scope.password.length < 6) {
        $scope.failedMessage = "Password must be at least 6 characters";
        return;
      }else if(typeof $scope.confirm == "undefined" || $scope.confirm.length == 0) {
        $scope.failedMessage = "Please confirm your password";
        return;
      }else if($scope.password != $scope.confirm) {
        $scope.failedMessage = "Passwords do not match";
        return;
      } else {
      authService.updatePassword($stateParams.resettoken, $scope.password, function(failedMessage, successMessage) {
          if (successMessage) {
            $state.go('login');
          } else {
            $scope.failedMessage = failedMessage;
          }
        });
      }
    };
    
}]);