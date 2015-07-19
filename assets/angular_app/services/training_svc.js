trdServices.service("trainingService", ['$rootScope', '$http', '$cookieStore', 'authService',
    function ($rootScope, $http, $cookieStore, authService) {

    	this.trainingsByProfile = {};

    	this.getAvailableDates = function(callback) {
			$http({method:'GET', url:'/training_dates'}).
				success(function(data, status, headers, config) {
					callback(data);
				}).
				error(function(data, status, headers, config) {
					$log.debug("getting training dates failed:", data);
					callback();
				});
	    }

	    this.getTrainingsByProfileID = function(callback) {
	    	var inThis = this;
	    	$http({method:'GET', url:'/training_dates/' + authService.profileid}).
				success(function(data, status, headers, config) {
    				inThis.trainingsByProfile[authService.profileid] = data.dates;
					callback(null, data.dates);
				}).
				error(function(data, status, headers, config) {
					$log.debug("getting profile training dates failed:", data);
					callback(data.message);
				});
	    }
}]);