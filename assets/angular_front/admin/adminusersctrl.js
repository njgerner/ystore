superApp.controller('AdminUsersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

  	$scope.getYLIFTUserCount = function() {
  		return $scope.users.filter(isYLIFTUser).length;
  	}

  	$scope.getActiveUserCount = function() {
  		return $scope.users.filter(isActiveUser).length;
  	}

  	$scope.getMonthlyUserCount = function() {

  		return $scope.users.filter(isMonthlyUser).length;
  	}

  	function isYLIFTUser(user) {
  		return user.isYLIFT;
  	}

	function isActiveUser(user) {
		return moment().diff(user.last_login, 'days') < 5;
	}

  	function isMonthlyUser(user) {
		return moment().diff(user.last_login, 'months') <= 1;
	}

  	function onUsersLoaded(users) {
  		$scope.users = users;
  	}

  	function onYLIFTsLoaded(yliftUsers) {
  		$scope.yliftUsers = yliftUsers;
  	}

  	adminService.getAllProfiles(onUsersLoaded);
  	adminService.getAllYLIFTUserDocs(onYLIFTsLoaded);
}]);