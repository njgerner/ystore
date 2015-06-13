superApp.controller('NetworkCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', 'authService',
  function($rootScope, $scope, $window, $location, $state, authService) {
    
    $scope.loggedin = authService.profile ? true:false;

}]);