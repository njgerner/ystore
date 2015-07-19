superApp.controller('AdminUsersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'productService', '$http',
  function($rootScope, $scope, $state, adminService, productService, $http) {

    $scope.error = null;

  	$scope.getActiveUserCount = function() {
  		return $scope.profiles.filter(isActiveUser).length;
  	}

  	$scope.getMonthlyUserCount = function() {
  		return $scope.profiles.filter(isMonthlyUser).length;
  	}

  	function isActiveUser(user) {
  		return moment().diff(user.last_login, 'days') < 5;
  	}

    function isMonthlyUser(user) {
  		return moment().diff(user.last_login, 'months') <= 1;
  	}

  	function onProfilesLoaded(error, profiles) {
      if (error) {
        $scope.error = error;
      }
  		$scope.profiles = profiles;
  	}

  	function onYLIFTsLoaded(error, yliftProfiles) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.yliftProfiles = yliftProfiles;
  	}

  	adminService.getAllProfiles(onProfilesLoaded);
  	adminService.getAllYLIFTProfiles(onYLIFTsLoaded);
}]);