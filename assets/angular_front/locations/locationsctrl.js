superApp.controller('LocationsCtrl',
  ['$rootScope', '$scope', '$state', '$location', 'locationService',
  function($rootScope, $scope, $state, $location, locationService) {
		$scope.locationsLoaded = false;
    $scope.showLocationsRight = true;
    $scope.showSearch = false;
		$scope.mapLoaded = false;
  	$scope.locations = [];
    $scope.locationFocused = {};
  	$scope.map = {};
  	$scope.markers = [];

    $scope.toggleFocus = function(index) {
      $scope.locations[index].focused = !$scope.locations[index].focused;
      $scope.$apply();
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

    $scope.searchZip = function() {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({address:$scope.zip}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
          var latlng = new google.maps.LatLng(results[0].geometry.location.A, results[0].geometry.location.F);
          $scope.map.setCenter(latlng);
          $scope.showSearch = false;
        } else {
          console.log('bad zip');
        }
      });
    }

  	$scope.onLocationsLoaded = function() {
  		var img = {
  			url: '/img/logo_md.png' // look into more props
  		};
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
        google.maps.event.addListener($scope.markers[index], 'click', function() {
          $scope.toggleFocus(index);
        });
      });
  	}

  	$scope.onMapLoaded = function(map) {
      $scope.mapLoaded = true;
  		$scope.map = map;
		  locationService.getAllLocations(function (locations) {
				$scope.locations = locations;
				$scope.onLocationsLoaded();
			});
  	}

    $scope.toggleLocationPanel = function() {
      $scope.showLocationsRight = !$scope.showLocationsRight;
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
		});
}]);