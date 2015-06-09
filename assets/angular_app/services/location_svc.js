trdServices.service("locationService", ['$rootScope', '$http', '$cookieStore', '$q',
    function ($rootScope, $http, $cookieStore, $q) {
    	this.locationsRetrieved = false;
    	this.locations = [];

    	this.addressToLatLong = function(lookup, address) {

    		var deferred = $q.defer();
    		var geocoder = new google.maps.Geocoder();
  			geocoder.geocode({address:lookup}, function (results, status) {
  				if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
  					address.location = results[0].geometry.location;
  					address.formattedaddress = results[0].formatted_address;
  					deferred.resolve(address);
  				} else {
  					deferred.reject(new Error({message:"bad address"}));
  				}
  			});
  			return deferred.promise;
    	};

    	this.getAllLocations = function(callback) {
    		if (this.locationsRetrieved) {
    			callback(this.locations);
    			return;
    		}
    		var inThis = this;
    		$http({method: 'GET', url: '/all_profiles'}).
			    success(function(data, status, headers, config) {
			    	var profiles = data.profiles;
			    	var promises = [];
			    	profiles.forEach(function (profile, index) {
			    		profile.addresses.forEach(function (address, index) {
			    			var deferred = $q.defer();
			    			if (address && address.address1 && address.city && address.state && address.zip && (address.yliftInd == "YES")) {
			    				var lookup = address.address1 + ', ' + address.city + ', ' + address.state + ' ' + address.zip;
			    				inThis.addressToLatLong(lookup, address)
			    					.then(function (result) {
			    						result.doctorname = profile.name;
				    					result.profileid = profile.id;
				    					deferred.resolve(result);
			    					}, function (err) {
				    					deferred.resolve(null); // for locations that don't map to a geocode, just don't show them (for now)
			    					});
			    			} else {
			    				deferred.resolve(null);
			    			}
			    			promises.push(deferred.promise);
			    		});
			    		if (index == profiles.length-1) {
			    			$q.all(promises)
			    				.then(function (result) {
				    				var locations = result.filter(function(n) { return n != null });
				    				inThis.locationsRetrieved = true;
				    				inThis.locations = locations;
				    				callback(inThis.locations);
				    			}, function (reason) {
				    				callback();
				    			});
			    		}
			    	});
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data);
			    });
    	}

}]);

