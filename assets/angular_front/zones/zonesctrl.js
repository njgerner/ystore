superApp.controller('ZonesCtrl',
  ['$rootScope', '$scope', '$stateParams',
  function($rootScope, $scope, $stateParams) {

  	$scope.viewState = $stateParams.procedure;

  	$scope.changeView = function(viewstate) {
  		$scope.viewState = viewstate;
  	}

}]);