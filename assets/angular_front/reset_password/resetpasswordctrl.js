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
      authService.updatePassword($stateParams.resettoken, $scope.password, function(successMessage, failedMessage) {
        if (successMessage) {
          $state.go('login');
        } else {
          $scope.failedMessage = failedMessage;
        }
      })
    };
    
}]);