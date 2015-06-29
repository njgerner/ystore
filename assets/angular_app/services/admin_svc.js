trdServices.service("adminService", ['$rootScope', '$http', '$cookieStore', '$log',
    function ($rootScope, $http, $cookieStore, $log) {

    	this.getAllProfiles = function(callback) {
	        $http({method: 'GET', url: '/admin/all_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting all profiles', data);
            	callback(data.message);
	        });
    	}

    	this.getAllMerchantProfiles = function(callback) {
    		$http({method: 'GET', url: '/admin/all_merchants'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting all merchant profiles', data);
            	callback(data.message);
	        });
    	}

    	this.getAllYLIFTProfiles = function(callback) {
    		$http({method: 'GET', url: '/admin/all_ylift_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting ylift profiles', data);
	            callback(data.message);
	        });
    	}

    	this.getAllOrders = function(callback) {
    		$http({method: 'GET', url: '/admin/all_orders'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.orders);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting orders', data);
	            callback(data.message);
	        });
    	}

    	this.getAvailableRegKeys = function(callback) {
    		$http({method: 'POST', url: '/admin/regkeys'})
	        .success(function (data, status, headers, config) {
	        	var keys = [];
	        	for(var i = 0; i < data.keys.length; i++) {
	        		keys.push(data.keys[i].key);
	        	}
	            callback(null, keys);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting available keys', data);
	            callback(data.message);
	        });
    	}

    	this.getHash = function(profileid, callback) {
    		$http({method: 'POST', url: '/admin/hash', data: {profileid:profileid} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.hash);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting hash', data);
	            callback(data.message);
	        });
    	}

    	this.addRegKey = function(regkey, callback) {
    		$http({method: 'POST', url: '/admin/add_regkey', data: {regkey:regkey} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.regkey);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding key', data);
	            callback(data.message);
	        });
    	}

}]);