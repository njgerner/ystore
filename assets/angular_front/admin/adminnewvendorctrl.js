superApp.controller('AdminNewVendorCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', 'bcrypt', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, bcrypt, storeService) {

    $scope.authorized = false;

    $scope.generateKey = function() {
      var result = '';
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-+=_/?;:<>,.~{}';
      for (var i = 20; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      $scope.regkey = result;
    };

    $scope.activate = function() {
      $scope.notify = null;
      if($scope.authorized = false) {
        return;
      }
      adminService.addRegKey($scope.regkey, function (err, data) {
        console.log('added regkey', $scope.regkey, err, data.key);
        if(err) {
          $scope.error = err;
          return;
        }
        $scope.regkey = null;
        $scope.notify = "Reg key '" + data.key + "' was successfully added.";        
        $scope.availableKeys.push(data.key);
      });
    };

    $scope.checkPassword = function() {
      if(bcrypt.compareSync($scope.attempt, $scope.hash)) {
        $scope.authorized = true;
      }else {
        $scope.authorized = false;
      }
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