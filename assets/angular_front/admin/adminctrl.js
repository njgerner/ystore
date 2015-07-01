superApp.controller('AdminCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 'adminService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, adminService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

  	$scope.profile = angular.copy(authService.profile);

    $scope.displayDate = function(date) {
  		return moment(date).format("MMM Do YYYY");
    };

    adminService.getHash($scope.profile.id, function (err, hash) {
    	if(err) {
    		$scope.error = err;
    	}
    	$scope.hash = hash;
    })

}]);