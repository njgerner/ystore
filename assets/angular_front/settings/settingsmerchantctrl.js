superApp.controller('SettingsMerchantCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'registrationService', '$window',
  function($rootScope, $scope, $state, authService, profileService, registrationService, $window) {

    $scope.showSignUp = false;
    $scope.verifying = false;
    $scope.registering = false;
    $scope.updating = false;
    $scope.deleting = false;
    $scope.merchantLoading = true;
    $scope.merchantLoaded = false;
    $scope.keyStatus = null;

    $scope.addMerchantAccount = function() {
      $scope.error = null;
      $scope.registering = true;
      profileService.addMerchantProfile($scope.merchantname, $scope.category, $scope.regkey, onMerchantReceived);
    }

    $scope.updateMerchantAccount = function() {
      $scope.error = null;
      $scope.updating = true;
      profileService.updateMerchantProfile($scope.merchantProfile, onMerchantUpdated);
    }
    
    // leaving this functionality out for now
    // $scope.deleteMerchantAccount = function() {
    //   $scope.error = null;
    //   if ($window.confirm('Are you sure you want to remove this account?')) {
    //     $scope.deleting = true;
    //     profileService.deleteMerchantProfile(onMerchantDeleted);
    //   }
    // }

    $scope.cancel = function() {
      $scope.showSignUp = false;
      $scope.verifying = false;
      $scope.registering = false;
      $scope.updating = false;
      $scope.deleting = false;
      $scope.merchantLoading = false;
      $scope.merchantLoaded = false;
      $scope.keyStatus = null;
    }

    $scope.addProfileToMerchant = function() {
      $scope.adding = true;
      $scope.merchantProfile.members.push(authService.profile.id);
      $scope.updateMerchantAccount($scope.merchantProfile, onMerchantUpdated);
    }

    $scope.verifyRegKey = function() {
      $scope.verifying = true;
      registrationService.verifyKey($scope.regkey, onVerification);
    }

    function onVerification(status, merchant) {
      $scope.verifying = false;
      if (status == "verified") {
        $scope.keyStatus = status;
        $scope.showSignUp = true;
      } else if (status == "unverified") {
        $scope.keyStatus = status;
      } else if (status == "invalid") {
        $scope.keyStatus = status;
      }

      if (merchant && status == "can_add") {
        $scope.keyStatus = status;
        $scope.merchantProfile = merchant;
      }
    }

  	function onMerchantReceived (profile) {
      $scope.merchantLoading = false;
      $scope.registering = false;
      if (profile && profile.id) {
  		  $scope.merchantProfile = profile;
        $scope.admin = profileService.isAdminOfMerchant(profile.id);
        $scope.merchantLoaded = true;
      }
      $rootScope.$broadcast('merchantcreated', profile);
    }

    function onMerchantUpdated (profile, error) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchantLoaded = true;
    }

    function onMerchantDeleted (error) {
      $scope.deleting = false;
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchantProfile = {};
      $scope.admin = false;
      $scope.merchantLoaded = false;
    }

    profileService.getMerchantProfile(onMerchantReceived);

}]);