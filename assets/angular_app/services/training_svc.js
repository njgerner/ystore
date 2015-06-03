trdServices.service("trainingService", ['$rootScope', '$http', '$cookieStore',
    function ($rootScope, $http, $cookieStore) {

    	this.getAvailableDates = function(callback) {
			$http({method:'GET', url:'/training_dates'}).
				success(function(data, status, headers, config) {
					callback(data);
				}).
				error(function(data, status, headers, config) {
					console.log("getting training dates failed:");
					console.log(data);
					callback();
				});
	    }
}]);