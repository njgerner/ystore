superApp.controller('CheckoutShippingCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'profileService',
   'locationService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, profileService,
    locationService) {

    $scope.addAddressView = false;

  	$scope.toggleAddAddress = function() {
      $scope.addAddressView = !$scope.addAddressView;
    };

    $scope.selectAddress = function(index) {
      if ($scope.$parent.addressShipTo == $scope.$parent.addresses[index]) {
        $scope.$parent.addressShipTo = null;
      } else {
        $scope.$parent.addressShipTo = $scope.$parent.addresses[index];
      }
    };

    $scope.isAddressSelected = function(index) {
      return $scope.$parent.addressShipTo == $scope.$parent.addresses[index];
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
      $scope.updatingAddress = true;
      var address = {
        "name": $scope.name,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip
      };
      if ($scope.$parent.addresses.length == 0) {
        address.default = true;
        $scope.$parent.addressShipTo = address;
      }
      if (authService.authorized) {
        locationService.addAddressToProfile(address, onAddressAdded);
      } else {
        onAddressAdded(null, address);
      }
    };

    function onAddressAdded (error, address) {
      $scope.$parent.addresses.push(address);
      $scope.addAddressView = false;
      $scope.updatingAddress = false;
      $scope.clearAddress();
    }

    var addressWatch = null;
    addressWatch = $scope.$watch('addressesLoaded', function (newVal, oldVal) {
      if (newVal) {
        if ($scope.$parent.addresses.length > 0) {
          for (var i = 0; i < $scope.$parent.addresses.length; i++) {
            if ($scope.$parent.addresses[i].default) {
              $scope.$parent.addressShipTo = $scope.$parent.addresses[i];
            }
          }
        } else {
          $scope.addAddressView = true;
        }
      }
    });

    $scope.$on('$destroy', function () {
      addressWatch();
    });


}]);