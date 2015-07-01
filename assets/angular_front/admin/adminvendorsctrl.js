superApp.controller('AdminVendorsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, $timeout, storeService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

    adminService.getAllMerchantProfiles(function (err, profiles) {
    	if(err) {
    		$scope.error = err;
    	}else {
        $scope.merchantsLoaded = true;
      }
    	$scope.merchantProfiles = profiles;
    });

}]);