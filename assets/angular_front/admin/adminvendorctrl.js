superApp.controller('AdminVendorCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'adminService', '$stateParams',
  function($rootScope, $scope, $state, storeService, adminService, $stateParams) {

    $scope.error = null;
    $scope.updating = false;

    if (!$stateParams.merchantid) {
      $state.go("admin.vendors");
    }

    $scope.updateMerchant = function() {
      if ($scope.updating) {
        return;
      }
      $scope.error = null;
      $scope.updating = true;
      adminService.updateMerchantProfile($scope.vendor, onMerchantUpdated);
    }

    function onMerchantUpdated (error, merchant) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
        return;
      }
    }

    adminService.getMerchantProfile($stateParams.merchantid, function (merchant) {
      $scope.vendor = merchant;
      if($scope.vendor.members && $scope.vendor.members.length > 0) {
        $scope.members = [];
        $scope.vendor.members.forEach(function (member) {
          adminService.getProfileByID(member, function (err, profile) {
            if(err) {
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