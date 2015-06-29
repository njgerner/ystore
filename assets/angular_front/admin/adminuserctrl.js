superApp.controller('AdminUserCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $scope, $state, adminService, storeService, $stateParams, $http) {

    $scope.profile = {};

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
      if(err) {
        $scope.error = err;
      } 
      $scope.profile = profile;
      $scope.userloaded = true;
      $scope.addresses = $scope.profile.addresses;
    });

    storeService.getProductsInCart($stateParams.profileid, function (err, products) {
        if(err) {
          $scope.error = err;
        }
        $scope.cart = products;
    });

}]);