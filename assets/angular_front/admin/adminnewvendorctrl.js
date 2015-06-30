superApp.controller('AdminNewVendorCtrl',
  ['$rootScope', '$scope', '$state', 'bcrypt', 'authService', 'profileService', 'adminService', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, bcrypt, authService, profileService, adminService, $stateParams, $timeout, storeService) {

    $scope.authorized = false;

    $scope.generateKey = function() {
      var result = '';
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-+=_/?;:<>,.~{}';
      for (var i = 20; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      $scope.regkey = result;
    };

    $scope.checkPassword = function() {
      if(bcrypt.compareSync($scope.attempt, $scope.hash)) {
        $scope.authorized = true;
      }else {
        $scope.authorized = false;
      }
    };

    $scope.activate = function() {
      adminService.addRegKey($scope.regkey, function (err, data) {
        if(err) {
          $scope.error = err;
          return;
        }
        $state.go('admin.new_vendor');
      });
    };

    adminService.getAvailableRegKeys(function (err, keys) {
      if(err) {
        $scope.error = err;
      }
      $scope.availableKeys = [];
      for(var i = 0; i < keys.length; i++) {
        $scope.availableKeys.push(keys[i].key);
      }
    });

}]);