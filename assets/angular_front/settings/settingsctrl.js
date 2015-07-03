superApp.controller('SettingsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'emailService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'FileUploader', '$window', 'locationService',
  function($rootScope, $scope, $state, authService, emailService, profileService, $location, $stateParams, $timeout, 
  	storeService, FileUploader, $window, locationService) {
  
    $scope.profile = angular.copy(authService.profile);
  	$scope.isYLIFT = authService.isYLIFT;
    $scope.addresses = $scope.profile.addresses;
    $scope.viewState = $state.current.name.split('.')[1];
    $scope.currOffice = {};
  	$scope.updating = "none";

    $scope.updateProfile = function(property) {
      $scope.emailchange = false;
      $scope.updating = property;
      if($scope.profile.email != authService.profile.email) {
        if(!confirm("Are you sure you want to change your login email address to " + $scope.profile.email + "?")) {
          $scope.updating = "none";
          return;
        } else {
          profileService.updateProfile($scope.profile, function (error, profile) {
            $scope.profile = profile;
            $scope.updating = "none";
            $scope.emailchange = true;
            emailService.changeUserEmail(authService.profile.email, $scope.profile.email);
          });
        }
      }
      profileService.updateProfile($scope.profile, function (error, profile) {
        $scope.profile = profile;
        $scope.updating = "none";
      });
    };

    $scope.updateAddress = function(address) {
      locationService.updateAddress(address);
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