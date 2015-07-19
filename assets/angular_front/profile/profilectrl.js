superApp.controller('ProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
   'storeService', 'trainingService', 'toolbelt',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
    storeService, trainingService, toolbelt) {
  	
  	$scope.profile = authService.profile; // this call should be alright as we will never make it to /profile w/o being authorized
    $scope.ordersLoaded = false;
    $scope.orders = [];
    $scope.trainings = [];
    $scope.createdAt = moment($scope.profile.createdAt).format("MMMM Do, YYYY");

    $scope.getDisplayDate = function(date) {
      return toolbelt.displayDate(date, 'LLL', {type: 'X'});
    }

    $scope.formatAddress = function(address) {
      return toolbelt.displayAddress(address);
    }

    $scope.getDisplayTotal = function(value) {
      if (!value) {
        return "";
      } else {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }
    }

    $scope.logoutNow = function() {
      $state.go("logout");
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

    $scope.download = function(file) {
      
    }

    function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
      }
      $scope.orders = orders;
      $scope.ordersLoaded = true;
    }

    function onTrainingsLoaded (error, trainings) {
      if (trainings) {
        console.log('trainings loaded', trainings);
        $scope.trainings = trainings;
      }
    }

    storeService.getOrdersByUserID(authService.profile.id, onOrdersLoaded);
    trainingService.getTrainingsByProfileID(onTrainingsLoaded);


}]);