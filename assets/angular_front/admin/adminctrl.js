superApp.controller('AdminCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$stateParams', 'adminService',
  function($rootScope, $scope, $state, authService, profileService, $stateParams, adminService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

  	$scope.profile = angular.copy(authService.profile);

    $scope.displayDate = function(date) {
  		return moment(date).format("MMM Do YYYY");
    };

    $scope.toTitleCase = function(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    adminService.getHash($scope.profile.id, function (err, hash) {
    	if(err) {
    		$scope.error = err;
    	}
    	$scope.hash = hash;
    });

    adminService.getAllMerchantProfiles(function (err, profiles) {
      if(err) {
        $scope.error = err;
      }else {
        $scope.merchantsLoaded = true;
      }
      $scope.merchantProfiles = profiles;
    });



}]);