superApp.controller('RegisterYLIFTPersonalInfoCtrl',
  ['$scope', '$state', 'authService',
  function($scope, $state, authService) {

    $scope.advance = function() {
    	if(validate()) {
        $scope.$parent.metadata.usertitle = $scope.usertitle;
        $scope.$parent.metadata.name = $scope.name;
        $scope.$parent.metadata.address1 = $scope.address1;
        $scope.$parent.metadata.address2 = $scope.address2;
        $scope.$parent.metadata.city = $scope.city;
        $scope.$parent.metadata.state = $scope.state;
        $scope.$parent.metadata.zip = $scope.zip;
        $scope.$parent.metadata.country = $scope.country;
        $scope.$parent.metadata.email = $scope.practiceemail;
        $scope.$parent.metadata.phone = $scope.practicephone;
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
        } else if (!$scope.practiceemail) {
          $scope.error = 'Please enter an email address';
        } else if (!$scope.practicephone) {
          $scope.error = 'Please enter a phone number';
        } else {
          $scope.validating = false;
          return true;
        }
        $scope.validating = false;
        return false;
    };

}]);