superApp.controller('AdminVendorsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, $timeout, storeService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

}]);