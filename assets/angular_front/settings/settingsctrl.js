superApp.controller('SettingsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'FileUploader', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, FileUploader, $window) {
  
    $scope.profile = authService.profile;
  	$scope.isYLIFT = authService.isYLIFT;
    $scope.addresses = $scope.profile.addresses;
    $scope.viewState = $state.current.name.split('.')[1];
    $scope.currOffice = {};
  	$scope.updating = false;

    $scope.updateProfile = function() {
      $scope.updating = true;
      profileService.updateProfile($scope.profile, function (profile) {
        $scope.profile = profile;
        $scope.updating = false;
      });
    };

    $scope.isCurrAddress = function(ind) {
      return $scope.currAddress == $scope.addresses[ind];
    }

  	$scope.goToState = function(viewState) {
  		$scope.viewState = viewState;
  		$state.go('settings.' + $scope.viewState);
  	};

  	$scope.isSettingsState = function(viewState) {
  		return $scope.viewState == viewState;
  	};   

}]);