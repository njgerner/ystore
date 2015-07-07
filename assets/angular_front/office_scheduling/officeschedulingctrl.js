superApp.controller('OfficeSchedulingCtrl',
  ['$scope', '$state', 'profileService', 'bookingService', 'authService', 'locationService',
  function($scope, $state, profileService, bookingService, authService, locationService) {
    $scope.appts = [];
    $scope.addresses = [];
    $scope.apptsByOfficeAndTimestamp = {};
    $scope.startDate = moment().startOf('week'); // always want this weeks monday
    $scope.endDate = moment().endOf('week'); // always want this weeks monday
    $scope.viewState = 'Week';
    $scope.apptsLoaded = false;
    $scope.officesLoaded = false;
    $scope.selectedAppt = null;
    $scope.selectedOffice = null;

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
      $scope.loadApptsInRange($scope.startDate.format('X'), $scope.endDate.format('X'));
    }

    $scope.next = function() {
      if ($scope.viewState == 'Week') {
        $scope.startDate.add(1, 'weeks').startOf('week');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'weeks');
      } else if ($scope.viewState == 'Month') {
        $scope.startDate.add(1, 'months').startOf('month');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'months');
      }
      $scope.loadApptsInRange($scope.startDate.format('X'), $scope.endDate.format('X'));
    }

    $scope.getSlotClass = function(offset, hour) {
      $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice.id] = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice.id] || [];
      var appt = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice.id][$scope.getUnix(offset, hour)];
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
      $scope.selectedAppt = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice.id][$scope.getUnix(offset, hour)];
      $event.stopPropagation();
    }

    $scope.loadApptsInRange = function(startDate, endDate) {
      bookingService.getProviderAppts(startDate, endDate, $scope.selectedOffice.id, authService.profileid, onApptsLoaded);
    }

    function onApptsLoaded (error, appts) {
      $scope.apptsLoaded = true;
      $scope.appts = appts || [];
    }

    function onAddressesLoaded (error, addresses) {
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i].yliftInd) {
          $scope.addresses.push(addresses[i]);
          $scope.selectedOffice = $scope.selectedOffice || addresses[i];
        }
      }

      $scope.officesLoaded = true;
      if (!$scope.selectedOffice) {
        $scope.error = 'Please add a Y Lift Network office in your <a href="#!/settings/profile">settings</a> to access appointment scheduling.';
      }
    }

    var apptsWatch = null;
    apptsWatch = $scope.$watch('appts', function (newVal, oldVal) {
      if (newVal && newVal.length) {
        for (var i = 0; i < newVal.length; i++) {
          $scope.apptsByOfficeAndTimestamp[newVal[i].office] = $scope.apptsByOfficeAndTimestamp[newVal[i].office] || [];
          $scope.apptsByOfficeAndTimestamp[newVal[i].office][newVal[i].date] = newVal[i];
        }
      }
    });

    var officeWatch = null;
    officeWatch = $scope.$watch('selectedOffice', function (newVal, oldVal) {
      if (newVal) {
        bookingService.getProviderAppts($scope.getUnix(0, 0), $scope.getUnix(30, 0), $scope.selectedOffice.id, authService.profileid, onApptsLoaded);
        
      }
    });

    $scope.$on('$destroy', function() {
      officeWatch();
      apptsWatch();
    });

    locationService.getProfileAddresses(onAddressesLoaded);

}]);