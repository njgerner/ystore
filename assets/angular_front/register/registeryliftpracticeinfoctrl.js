superApp.controller('RegisterYLIFTPracticeInfoCtrl',
  ['$scope', '$state', '$stateParams', 'authService',
  function($scope, $state, $stateParams, authService) {

    console.log('params',$stateParams);

    $scope.advance = function() {
    	if(validate()) {
        $scope.$parent.name = $scope.name;
        $scope.$parent.address1 = $scope.address1;
        $scope.$parent.address2 = $scope.address2;
        $scope.$parent.city = $scope.city;
    		$state.go('registerylift.account');
    	}
    };

    function validate() {
    	$scope.error = null;
    	$scope.validating = true;
    	if (!$scope.name) {
          $scope.error = 'Please enter your name';
        } else if (!$scope.address1) {
          $scope.error = 'Please enter an address';
        } else if (!$scope.city) {
          $scope.error = 'Please enter a city';
        } else if (!$scope.state || $scope.state.length != 2) {
          $scope.error = 'Please select a state';
        } else if (!$scope.zip || $scope.zip.length != 5) {
          $scope.error = 'Please enter a five digit zip code';
        } else if (!$scope.email) {
          $scope.error = 'Please enter an email address';
        } else if (!$scope.phone) {
          $scope.error = 'Please enter a phone number';
        } else {
          $scope.validating = false;
          return true;
        }
        $scope.validating = false;
        return false;
    };

    // if($stateParams.newuser) {
    //   $scope.notify = "Account successfully created!"
    // }

}]);