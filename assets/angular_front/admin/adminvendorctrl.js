superApp.controller('AdminVendorCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'adminService', '$stateParams',
  function($rootScope, $scope, $state, storeService, adminService, $stateParams) {

    if (!$stateParams.merchantid) {
      $state.go("admin.vendors");
    }

    adminService.getMerchantProfile($stateParams.merchantid, function (merchant) {
      $scope.vendor = merchant;
      if($scope.vendor.members && $scope.vendor.members.length > 0) {
        $scope.members = [];
        for(var i = 0; i < $scope.vendor.members.length; i++) {
          adminService.getProfile($scope.vendor.members[i], function (err, profile) {
            if(err) {
              $scope.error = err;
            }
            $scope.members.push(profile);
          })
        };
      }
    });

    storeService.getProductsByMerchant($stateParams.merchantid, function (err, products) {
      if(err) {
        $scope.error = err;
      }
      $scope.merchantProducts = products;
    });

}]);