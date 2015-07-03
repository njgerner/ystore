superApp.controller('SettingsProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', '$window', 'locationService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, $window, locationService) {

    $scope.uploading = false;
    $scope.addAddressView = false;
    $scope.editAddressView = false;
    $scope.loadingAddresses = true;
    $scope.adding = false;
    $scope.updating = false;
    $scope.addresses = [];

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.currAddress = null;
      $scope.addressInd = null;
      $scope.yliftInd = null;
    }

    $scope.selectAddress = function(ind) {
      $scope.addAddressView = false;
      if ($scope.currAddress == $scope.addresses[ind]) {
        $scope.currAddress = null;
        $scope.currAddressImg = null;
        $scope.editAddressView = false;
        return;
      }
      $scope.currAddress = $scope.addresses[ind];
      $scope.addressname = $scope.currAddress.name;
      $scope.address1 = $scope.currAddress.address1;
      $scope.address2 = $scope.currAddress.address2;
      $scope.city = $scope.currAddress.city;
      $scope.state = $scope.currAddress.state;
      $scope.zip = $scope.currAddress.zip;  
      $scope.yliftInd = $scope.currAddress.yliftInd;
      $scope.addressInd = ind;
      $scope.editAddressView = true;
    };

    $scope.submitAddress = function() {
      var address = {
        "name": $scope.addressname,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip,
        "default": $scope.default
      };
      if ($scope.addresses.length == 0) {
        address.default = true;
      }
      if ($scope.isYLIFT) {
        address.yliftInd = $scope.yliftInd;
      }
      if ($scope.editAddressView) {  // update the address
        $scope.updating = true;
        locationService.updateAddress(address, onAddressUpdated);
      }
      if ($scope.addAddressView) { // address needs to be added
        $scope.adding = true;
        locationService.addAddressToProfile(address, onAddressAdded);
      }
      
    };

    $scope.removeAddress = function(ind) {
      if ($window.confirm('Are you sure?')) {
        var remove = $scope.addresses.splice(ind, 1);
        locationService.removeAddress(remove[0]);
      }
    };

    $scope.makeDefault = function(ind) {
      if ($window.confirm('Make this address the default?')) {
        for (var i = 0; i < $scope.addresses.length; i++) {
          if ($scope.addresses[i].default) {
            $scope.addresses[i].default = false;
            locationService.updateAddress($scope.addresses[i]);
          }
          if (i == ind) {
            $scope.addresses[i].default = true;
            locationService.updateAddress($scope.addresses[i]);
          }
        }
      }
    };

    $scope.enableAddAddress = function() {
      $scope.clearAddress();
      $scope.editAddressView = false;
      $scope.addAddressView = true;
    };

    $scope.toggleShowAddress = function() {
      $scope.editAddressView = !$scope.editAddressView;
    };

    $scope.cancel = function() {
      $scope.editAddressView = false;
      $scope.addAddressView = false;
    }

    function onAddressAdded (error, address) {
      $scope.adding = false;
      if (error) {
        $scope.error = error;
      } else {
        $scope.addresses.push(address);
        $scope.addAddressView = false;
        $scope.clearAddress();
      }
    }

    function onAddressUpdated (error, address) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
      } else {
        $scope.editAddressView = false;
        $scope.clearAddress();
        for (var i = 0; i < $scope.addresses.length; i++) {
          if (address.id == $scope.addresses[i].id) {
            $scope.addresses[i] = address;
          }
        }
      }
    }

    function onAddressesLoaded (error, addresses) {
      $scope.loadingAddresses = false;
      $scope.addresses = addresses || [];
    }

    locationService.getProfileAddresses(onAddressesLoaded);

}]);