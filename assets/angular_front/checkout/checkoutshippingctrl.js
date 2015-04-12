superApp.controller('CheckoutShippingCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'profileService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, profileService) {

  	$scope.toggleAddAddress = function() {
      $scope.addAddressView = !$scope.addAddressView;
    };

    $scope.selectAddress = function(index) {
      if ($scope.addressShipTo == $scope.addresses[index]) {
        $scope.addressShipTo = null;
      } else {
        $scope.addressShipTo = $scope.addresses[index];
      }
    };

    $scope.isAddressSelected = function(index) {
      return $scope.addressShipTo == $scope.addresses[index];
    };

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.currAddress = null;
      $scope.currAddressImg = null;
      $scope.addressInd = null;
    }

    $scope.addAddress = function() {
      var address = {
        "name": $scope.addressname,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip
      };
      if ($scope.addresses.length == 0) {
        address.default = true;
        $scope.addressShipTo = address;
      }
      $scope.addresses.push(address);
      $scope.profile.addresses = $scope.addresses;
      console.log('saving profile!', $scope.profile);
      $scope.updateProfile();
      $scope.addAddressView = false;
      $scope.clearAddress();
    }

    $scope.updateProfile = function(callback) {
      $scope.addingAddress = true;
      profileService.updateProfile($scope.profile, function (profile) {
        $scope.profile = profile;
        $scope.addingAddress = false;
      });
    };

    if (authService.authorized) {
      for (var i = 0; i < $scope.addresses.length; i++) {
        if ($scope.addresses[i].default) {
          $scope.addressShipTo == $scope.addresses[i];
        }
      }
    } else {
      $scope.toggleAddAddress();
    }

}]);