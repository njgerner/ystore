superApp.controller('SettingsProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, $window) {

    $scope.uploading = false;
    $scope.addAddressView = false;
    $scope.editAddressView = false;
    $scope.addresses = $scope.profile.addresses;

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
      $scope.buttonText = "Update";
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
      if($scope.buttonText == "Add") {  //in add mode
         $scope.buttonText = "Adding";
      }else {                           //in edit mode
        $scope.buttonText = "Updating";
      }
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
        $scope.addresses[$scope.addressInd] = address;
        $scope.profile.addresses = $scope.addresses;
        $scope.updateProfile("address");
        $scope.buttonText = "Update";
        $scope.editAddressView = false;
        $scope.clearAddress();
      }
      if ($scope.addAddressView) { // address needs to be added
        $scope.addresses.push(address);
        $scope.profile.addresses = $scope.addresses;
        $scope.updateProfile("address");
        $scope.buttonText = "Add";
        $scope.addAddressView = false;
        $scope.clearAddress();
      }
      
    };

    $scope.removeAddress = function(ind) {
      if ($window.confirm('Are you sure?')) {
        $scope.addresses.splice(ind, 1);
        $scope.profile.addresses = $scope.addresses;
        $scope.updateProfile();
      }
    };

    $scope.makeDefault = function(ind) {
      if ($window.confirm('Make this address the default?')) {
        for (var i = 0; i < $scope.addresses.length; i++) {
          if ($scope.addresses[i].default) {
            $scope.addresses[i].default = false;
          }
          if (i == ind) {
            $scope.addresses[i].default = true;
          }
        }
        $scope.profile.addresses = $scope.addresses;
        $scope.updateProfile();
      }
    };

    $scope.enableAddAddress = function() {
      $scope.buttonText = "Add";
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

}]);