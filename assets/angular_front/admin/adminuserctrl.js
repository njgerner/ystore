superApp.controller('AdminUserCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $scope, $state, adminService, storeService, $stateParams, $http) {

    $scope.edit = false;

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
      if(err) {
        $scope.error = err;
      } 
      $scope.profile = profile;
      $scope.addresses = $scope.profile.addresses;
      $scope.userloaded = true;
    });

    storeService.getProductsInCart($stateParams.profileid, function (err, products) {
        if(err) {
          $scope.error = err;
        }
        $scope.cart = products;
    });

}]);