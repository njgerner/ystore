superApp.controller('AdminUserCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $scope, $state, adminService, storeService, $stateParams, $http) {

    $scope.edit = false;

    $scope.updateInfo = function () {
      $scope.updating = true;
      var profile = angular.copy($scope.profile);
      profile.name = $scope.name;
      profile.email = $scope.email;
      adminService.updateUserProfile(profile, function (err, profile) {
        $scope.profile = profile;
        $scope.edit = false;
        $scope.updating = false;
        $scope.notify = 'Successfully updated user profile';
      });
    };

    $scope.updateAddress = function (index) {

    };

    function loadAddresses(ids) {
      adminService.getAddresses(ids, function (err, addresses) {

      });
    };

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
      if(err) {
        $scope.error = err;
      } 
      $scope.profile = profile;

      if($scope.profile.addresses.length) {
        loadAddresses($scope.profile.addresses);
      } else {
        $scope.addresses = [];
      }

      // so i can assign ng-models in an ng-repeat
      $scope.addressModels = [];
      for(var i = 0; i < $scope.addresses.length; i++) {
        $scope.addressModels.push('address' + i);
      }
      $scope.userloaded = true;
    });

    storeService.getProductsInCart($stateParams.profileid, function (err, cart) {
        if(!err) {
          $scope.cart = cart;
        }
    });

}]);