trdServices.service("adminService", ['$rootScope', '$http', '$cookieStore',
    function ($rootScope, $http, $cookieStore) {

    	this.getAllProfiles = function(callback) {
	        $http({method: 'GET', url: '/admin/all_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            console.log('error getting all profiles', data);
	            callback();
	        });
    	}

    	this.getAllYLIFTProfiles = function(callback) {
    		$http({method: 'GET', url: '/admin/all_ylift_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            console.log('error getting ylift profiles', data);
	            callback();
	        });
    	}

    	this.getAllOrders = function(callback) {
    		$http({method: 'GET', url: '/admin/all_orders'})
	        .success(function (data, status, headers, config) {
	            callback(data.orders);
	        })
	        .error(function (data, status, headers, config) {
	            console.log('error getting orders', data);
	            callback();
	        });
    	}

}]);