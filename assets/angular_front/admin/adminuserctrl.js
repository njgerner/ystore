superApp.controller('AdminUserCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $scope, $state, adminService, storeService, $stateParams, $http) {

    $scope.edit = false;

    $scope.save = function () {
      var profile = angular.copy($scope.profile);
      profile.name = $scope.name;
      profile.email = $scope.email;
      adminService.updateUserProfile(profile, function (err, profile) {
        $scope.profile = profile;
        $scope.edit = false;
        $scope.notify = 'Successfully updated user profile';
      });
    };

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
      if(err) {
        $scope.error = err;
      } 
      $scope.profile = profile;
      $scope.addresses = $scope.profile.addresses;
      // so i can assign ng-models in an ng-repeat
      $scope.addressModels = [];
      for(var i = 0; i < $scope.addresses.length; i++) {
        $scope.addressModels.push('address' + i);
      }
      $scope.userloaded = true;
    });

    storeService.getProductsInCart($stateParams.profileid, function (err, products) {
        if(err) {
          $scope.error = err;
        }
        $scope.cart = products;
    });

}]);