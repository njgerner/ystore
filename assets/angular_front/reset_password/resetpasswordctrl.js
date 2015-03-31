superApp.controller('ResetPasswordCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {

    $scope.updatePassword = function() {
          authService.updatePassword($stateParams.resettoken, $scope.password, function(failedMessage, successMessage) {
            if (successMessage) {
              $state.go('login');
            } else {
              $scope.failedMessage = failedMessage;
            }
          })
      }
}]);