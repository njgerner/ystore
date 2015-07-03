superApp.controller('AdminVendorCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'adminService', '$stateParams',
  function($rootScope, $scope, $state, storeService, adminService, $stateParams) {

    if (!$stateParams.merchantid) {
      $state.go("admin.vendors");
    }

    adminService.getMerchantProfile($stateParams.merchantid, function (err, merchant) {
      if(err) {
        $scope.error = err;
      }
      $scope.vendor = merchant;
      if($scope.vendor.members && $scope.vendor.members.length > 0) {
        $scope.members = [];
        $scope.vendor.members.forEach(function (member) {
          adminService.getProfileByID(member, function (err, profile) {
            if(!err == 'No profile found from admin') { //stray profile id in vendor.members
              $scope.error = err;
            }else {
              $scope.members.push(profile);
            }
          });
        });
      }
    });

    storeService.getProductsByMerchant($stateParams.merchantid, function (err, products) {
      if(err) {
        $scope.error = err;
      }
      $scope.merchantProducts = products;
    });

}]);