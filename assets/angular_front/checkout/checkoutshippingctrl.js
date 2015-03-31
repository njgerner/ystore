superApp.controller('CheckoutShippingCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'profileService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, profileService) {

  	$scope.toggleAddOffice = function() {
      $scope.addOfficeView = !$scope.addOfficeView;
    };

    for (var i = 0; i < $scope.offices.length; i++) {
    	if ($scope.offices[i].default) {
    		$scope.officeShipTo == $scope.offices[i];
    	}
    }

    $scope.selectOffice = function(index) {
      if ($scope.officeShipTo == $scope.offices[index]) {
        $scope.officeShipTo = null;
      } else {
        $scope.officeShipTo = $scope.offices[index];
      }
    };

    $scope.isOfficeSelected = function(index) {
      return $scope.officeShipTo == $scope.offices[index];
    };

    $scope.clearOffice = function() {
      $scope.officename = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.isYlift = false;
      $scope.currOffice = null;
      $scope.currOfficeImg = null;
      $scope.officeInd = null;
    }

    $scope.addOffice = function() {
      var office = {
        "name": $scope.officename,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip,
        "yliftProvider": $scope.isYlift
      };
      if ($scope.offices.length == 0) {
        office.default = true;
        $scope.officeShipTo = office;
      }
      $scope.offices.push(office);
      $scope.profile.offices = $scope.offices;
      console.log('saving profile!', $scope.profile);
      $scope.updateProfile();
      $scope.addOfficeView = false;
      $scope.clearOffice();
    }

    $scope.updateProfile = function(callback) {
      $scope.addingOffice = true;
      profileService.updateProfile($scope.profile, function (profile) {
        $scope.profile = profile;
        $scope.addingOffice = false;
      });
    };

}]);