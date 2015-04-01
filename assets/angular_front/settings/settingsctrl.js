superApp.controller('SettingsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'FileUploader', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, FileUploader, $window) {
  
  	$scope.profile = authService.profile;
    $scope.offices = $scope.profile.offices;
    $scope.viewState = $state.current.name.split('.')[1];
    $scope.currOffice = {};
  	$scope.updating = false;

    $scope.updateProfile = function(callback) {
      $scope.updating = true;
      profileService.updateProfile($scope.profile, function (profile) {
        $scope.profile = profile;
        $scope.updating = false;
        callback();
      });
    };

    $scope.isCurrOffice = function(ind) {
      return $scope.currOffice == $scope.offices[ind];
    }

  	$scope.goToState = function(viewState) {
  		$scope.viewState = viewState;
  		$state.go('settings.' + $scope.viewState);
  	};

  	$scope.isSettingsState = function(viewState) {
  		return $scope.viewState == viewState;
  	};   

}]);