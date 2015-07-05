trdServices.service("locationService", ['$rootScope', '$http', '$cookieStore', '$q', 'authService', '$log',
    function ($rootScope, $http, $cookieStore, $q, authService, $log) {
    	this.locationsRetrieved = false;
    	this.locations = [];
    	this.locationsByDoctor = {};
    	this.locationsByProfile = {};

    	this.addressToLatLong = function(address) {

    		var deferred = $q.defer();
    		var geocoder = new google.maps.Geocoder();
    		var lookup = address.address1 + ', ' + address.city + ', ' + address.state + ' ' + address.zip;
  			geocoder.geocode({address:lookup}, function (results, status) {
  				if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
  					address.location = results[0].geometry.location;
  					address.formattedaddress = results[0].formatted_address;
  					deferred.resolve(address);
  				} else {
  					deferred.reject(new Error("bad address"));
  				}
  			});
  			return deferred.promise;
    	};

    	this.getYLiftLocations = function(callback) {
    		if (this.locationsRetrieved) {
    			callback(this.locations);
    			return;
    		}
    		var inThis = this;
    		$http({method: 'GET', url: '/ylift_locations'}).
    		success(function(data, status, headers, config) {
    			var promises = [];
    			data.locations.forEach(function (location, index) {
    				var deferred = $q.defer();
    				inThis.addressToLatLong(location)
    				.then(function (result) {
    					deferred.resolve(result);
    				}, function (err) {
    					deferred.resolve(null);
    				});
    				promises.push(deferred.promise);
    			});
    			$q.all(promises)
    			.then(function (result) {
    				var locations = result.filter(function(n) { return n != null });
    				inThis.locationsRetrieved = true;
    				inThis.locations = locations;
    				for (var i = 0; i < locations.length; i++) {
    					inThis.locationsByDoctor[locations[i].profileid] = locations[i];
    				}
    				callback(null, inThis.locations);
    			}, function (reasons) {
    				$log.debug('error retrieving y lift locations', reasons);
    				callback('There was an error retrieving Y Lift Network locations');
    			});
		    }).
		    error(function(data, status, headers, config) {
		    	callback(data.message);
		    });
    	}

    	this.getProfileAddresses = function (callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		if (this.locationsByProfile[authService.profileid] !== undefined) {
    			callback(null, this.locationsByProfile[authService.profileid]);
    			return;
    		}
    		inThis = this;
    		$http({method: 'GET', url: '/profile/addresses/' + authService.profileid})
	        .success(function (data, status, headers, config) {
	        	inThis.locationsByProfile[authService.profileid] = data.addresses;
	            callback(null, data.addresses);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting addresses', data);
	            callback(data.message);
	        });
    	}

    	this.addAddressToProfile = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		var inThis = this;
    		$http({method: 'POST', url: '/profile/add_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
                inThis.locationsByProfile[authService.profileid] = inThis.locationsByProfile[authService.profileid] || [];
	        	inThis.locationsByProfile[authService.profileid].push(data.address);
	            if (callback) {
	                callback(null, data.address);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

    	this.updateAddress = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		var inThis = this;
    		$http({method: 'POST', url: '/profile/update_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
	        	for (var i = 0; i < inThis.locationsByProfile[authService.profileid].length; i++) {
	        		if (inThis.locationsByProfile[authService.profileid].id == data.address.id) {
	        			inThis.locationsByProfile[authService.profileid] = data.address;
	        		}
	        	}
	            if (callback) {
	                callback(null, data.address);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

    	this.removeAddress = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		$http({method: 'POST', url: '/profile/remove_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
	        	for (var i = 0; i < inThis.locationsByProfile[authService.profileid].length; i++) {
	        		if (inThis.locationsByProfile[authService.profileid].id == address.id) {
	        			inThis.locationsByProfile[authService.profileid].splice(i, 1);
	        		}
	        	}
	            if (callback) {
	                callback(null, data.success);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error removing address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

}]);

