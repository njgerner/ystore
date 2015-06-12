trdServices.service("adminService", ['$rootScope', '$http', '$cookieStore',
    function ($rootScope, $http, $cookieStore) {

    	this.getAllProfiles = function(callback) {
	        $http({method: 'GET', url: '/admin/all_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            console.log('error updating profile', data);
	            callback();
	        });
    	}

    	this.getAllYLIFTUserDocs = function(callback) {
    		$http({method: 'GET', url: '/admin/all_ylift_users'})
	        .success(function (data, status, headers, config) {
	            callback(data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            console.log('error updating profile', data);
	            callback();
	        });
    	}

}]);