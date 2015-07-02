superApp.controller('OfficeSchedulingCtrl',
  ['$scope', '$state', 'profileService', 'bookingService', 'authService',
  function($scope, $state, profileService, bookingService, authService) {
    $scope.appts = [];
    $scope.apptsByTimestamp = {};
    $scope.startDate = moment().startOf('week'); // always want this weeks monday
    $scope.endDate = moment().endOf('week'); // always want this weeks monday
    $scope.viewState = 'Week';
    $scope.apptsLoaded = false;
    $scope.selectedAppt = null;

    $scope.closeConfirm = function($event) {
      $scope.selectedAppt = null;
      if ($event) {
        $event.stopPropagation();
      }
    }

    $scope.getNavDisplay = function() {
      if ($scope.viewState == 'Week') {
        return $scope.startDate.format('MMM Do') + ' - ' + $scope.endDate.format('MMM Do');
      } else {
        return $scope.startDate.format('MMMM');
      }
    }

    $scope.prev = function() {
      if ($scope.viewState == 'Week') {
        $scope.endDate.subtract(1, 'weeks');
        $scope.startDate = angular.copy($scope.endDate).subtract(1, 'weeks').startOf('week');
      } else if ($scope.viewState == 'Month') {
        $scope.endDate.subtract(1, 'months').endOf('month');
        $scope.startDate = angular.copy($scope.startDate).subtract(1, 'months').startOf('month');
      }
    }

    $scope.next = function() {
      if ($scope.viewState == 'Week') {
        $scope.startDate.add(1, 'weeks').startOf('week');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'weeks');
      } else if ($scope.viewState == 'Month') {
        $scope.startDate.add(1, 'months').startOf('month');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'months');
      }
    }

    $scope.getSlotClass = function(offset, hour) {
        var appt = $scope.apptsByTimestamp[$scope.getUnix(offset, hour)];
        if (appt && appt.status) {
          return appt.status;
        } else {
          return '';
        }
      }

    $scope.getUnix = function (offset, hour) {
      return angular.copy($scope.startDate).add(offset, 'days').hours(hour).format('X');
    }

    $scope.getDisplayDay = function(offset) {
      return angular.copy($scope.startDate).add(offset, 'days').format('ddd');
    }

    $scope.getDisplayDate = function(offset) {
      return angular.copy($scope.startDate).add(offset, 'days').format('MMM Do YYYY');
    }

    $scope.getDisplayTime = function(offset, hour) {
      return angular.copy($scope.startDate).add(offset, 'days').hours(hour).format('LT');
    }

    $scope.closeConfirm = function() {
      $scope.selectedAppt = null;
    }

    $scope.selectAppt = function(offset, hour, $event) {
      $scope.selectedAppt = $scope.apptsByTimestamp[$scope.getUnix(offset, hour)];
      $event.stopPropagation();
    }

    $scope.loadApptsInRange = function(startDate, endDate) {
      bookingService.getProviderAppts(startDate, endDate, authService.profileid, onApptsLoaded);
    }

    function onApptsLoaded (error, appts) {
      $scope.apptsLoaded = true;
      $scope.appts = appts || [];
    }

    var apptsWatch = null;
    apptsWatch = $scope.$watch('appts', function (newVal, oldVal) {
      if (newVal && newVal.length) {
        for (var i = 0; i < newVal.length; i++) {
          $scope.apptsByTimestamp[newVal[i].date] = newVal[i];
        }
      }
    });

    $scope.$on('$destroy', function() {
      officeWatch();
      apptsWatch();
    });

    bookingService.getProviderAppts($scope.getUnix(0, 0), $scope.getUnix(30, 0), authService.profileid, onApptsLoaded);

}]);