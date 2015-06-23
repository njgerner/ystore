superApp.controller('AdminUsersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'productService', '$http',
  function($rootScope, $scope, $state, adminService, productService, $http) {

    $scope.error = null;

  	$scope.getActiveUserCount = function() {
  		return $scope.users.filter(isActiveUser).length;
  	}

  	$scope.getMonthlyUserCount = function() {

  		return $scope.users.filter(isMonthlyUser).length;
  	}

  	$scope.getDisplayDate = function(date) {
  		return moment(date).format("MMM Do YYYY");
  	}

  	function isActiveUser(user) {
  		return moment().diff(user.last_login, 'days') < 5;
  	}

    	function isMonthlyUser(user) {
  		return moment().diff(user.last_login, 'months') <= 1;
  	}

  	function onUsersLoaded(error, users) {
      if (error) {
        $scope.error = error;
      }
  		$scope.users = users;
  	}

  	function onYLIFTsLoaded(error, yliftUsers) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.yliftUsers = yliftUsers;
  	}

  	adminService.getAllProfiles(onUsersLoaded);
  	adminService.getAllYLIFTProfiles(onYLIFTsLoaded);
}]);