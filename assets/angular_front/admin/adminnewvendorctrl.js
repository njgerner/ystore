superApp.controller('AdminNewVendorCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, $timeout, storeService) {

    $scope.authorized = false;

    $scope.generateKey = function() {
      var result = '';
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-+=_/?;:<>,.~{}';
      for (var i = 20; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      $scope.regkey = result;
    };

    $scope.checkPassword = function() {
      console.log('checking');
      console.log('try', bcrypt.hashSync($scope.attempt, 8));
      console.log('hash', $scope.hash);
      console.log(bcrypt.compareSync($scope.attempt, $scope.hash));
    };

    adminService.getAvailableRegKeys(function (err, keys) {
      if(err) {
        $scope.error = err;
      }
      $scope.availableKeys = keys;
    });

}]);