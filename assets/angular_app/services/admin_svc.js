trdServices.service("adminService", ['$rootScope', '$http', '$cookieStore', '$log',
    function ($rootScope, $http, $cookieStore, $log) {

    	this.getProfileByID = function(id, callback) {
    		$http({method: 'POST', url: '/admin/profile', data: {id:id} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.profile);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting profile', data);
            	callback(data.message);
	        });
    	}

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

    	this.addProduct = function(product, callback) {
    		$http({method: 'POST', url: '/admin/add_product', data: {product:product} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.product);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting ylift profiles', data);
	            callback(data.message);
	        });
    	}

}]);