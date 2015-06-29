superApp.controller('AdminCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, storeService) {

  	$scope.profile = authService.profile;

    if (!authService.isAdmin) {
      $state.go("store");
    }

    $scope.displayDate = function(date) {
      return moment(date).format("MMM Do YYYY");
    }

}]);