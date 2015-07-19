superApp.controller('LocationsCtrl',
  ['$rootScope', '$scope', '$state', '$location', 'locationService',
  function($rootScope, $scope, $state, $location, locationService) {
    $rootScope.pageTitle = 'Locations';
    $scope.locationsLoaded = false;
    $scope.showLocationsRight = true;
    $scope.selectedLocation = null;
    $scope.showSearch = false;
    $scope.viewBooking = false;
    $scope.mapLoaded = false;
    $scope.locations = [];
    $scope.locationFocused = {};
    $scope.map = {};
    $scope.markers = [];

    $scope.toggleFocus = function(index) {
      $scope.locations[index].focused = !$scope.locations[index].focused;
      if ($scope.locations[index].focused) {
        $scope.map.panTo(new google.maps.LatLng($scope.locations[index].location.A, $scope.locations[index].location.F));
      }
    }

    $scope.toggleSearch = function() {
      $scope.showSearch = !$scope.showSearch;
    }

    $scope.focusLocation = function(index) {
      $scope.locations[index].focused = true;
    }

    $scope.unFocusLocation = function() {
      $scope.locations[index].focused = false;
    }

    $scope.searchZip = function(zip) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({address:zip}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
          var latlng = new google.maps.LatLng(results[0].geometry.location.A, results[0].geometry.location.F);
          $scope.map.setCenter(latlng);
          $scope.zip = null;
        } else {
          $scope.zipError = "Enter a valid zip code";
        }
      });
    }

  	$scope.onMapLoaded = function(map) {
      $scope.mapLoaded = true;
  		$scope.map = map;
		  locationService.getYLiftLocations(onLocationsLoaded);
  	}

    $scope.toggleLocationPanel = function() {
      $scope.showLocationsRight = !$scope.showLocationsRight;
    }

    $scope.openBooking = function(location, $event) {
      $event.stopPropagation();
      $scope.selectedLocation = location;
      $scope.viewBooking = true;
    }

    $scope.closeBooking = function($event) {
      $scope.selectedLocation = null;
      $scope.viewBooking = false;
    }

    function onLocationsLoaded (error, locations) {
      var img = {
        url: '/img/logo_md.png' // look into more props
      };
      $scope.locations = locations;
      $scope.locationsLoaded = true;
      $scope.locations.forEach(function (location, index) {
        location.focused = false;
        $scope.markers[index] = new google.maps.Marker({
          position: new google.maps.LatLng(location.location.A, location.location.F),
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          title: location.name,
          icon: img
        });
        google.maps.event.addListener($scope.markers[index], 'click', function(e) {
          $scope.toggleFocus(index);
          $scope.map.panTo(e.latLng);
        });
      });
    }

	  navigator.geolocation.getCurrentPosition(function (position) {
	  	var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		  var map = new google.maps.Map(document.getElementById("map-canvas"), { 
        center: latlng, 
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
      });
		  $scope.onMapLoaded(map);
		}, function (error) {
      if (error.code == error.PERMISSION_DENIED) {
        var latlng = new google.maps.LatLng(39, -95);
        var map = new google.maps.Map(document.getElementById("map-canvas"), { 
          center: latlng, 
          zoom: 4,
          mapTypeControl: false,
          streetViewControl: false
        });
        $scope.onMapLoaded(map);
      }
    });
}]);