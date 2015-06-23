superApp.controller('SettingsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'emailService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'FileUploader', '$window',
  function($rootScope, $scope, $state, authService, emailService, profileService, $location, $stateParams, $timeout, 
  	storeService, FileUploader, $window) {
  
    $scope.profile = angular.copy(authService.profile);
  	$scope.isYLIFT = authService.isYLIFT;
    $scope.addresses = $scope.profile.addresses;
    $scope.viewState = $state.current.name.split('.')[1];
    $scope.currOffice = {};
  	$scope.updating = "none";

    $scope.updateProfile = function(property) {
      console.log('ctrl update');
      console.log('auth', authService.profile);
      console.log('scope', $scope.profile);
      $scope.updating = property;
      if($scope.profile.email != authService.profile.email) {
        if(!confirm("Are you sure you want to change your login email address to " + $scope.profile.email + "?")) {
          $scope.updating = "none";
          return;
        } else {
          profileService.updateProfile($scope.profile, function (error, profile) {
            $scope.profile = profile;
            $scope.updating = "none";
            emailService.changeUserEmail(authService.profile.email, $scope.profile.email);
          });
        }
      }
      profileService.updateProfile($scope.profile, function (error, profile) {
        $scope.profile = profile;
        $scope.updating = "none";
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