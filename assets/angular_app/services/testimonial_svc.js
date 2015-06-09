trdServices.service("testimonialService", ['$rootScope', '$http', '$cookieStore', 'profileService',
    function ($rootScope, $http, $cookieStore, profileService) {

    	this.getAllTestimonials = function(callback) {
    		$http({method: 'GET', url: "/get_all_testimonials"})
            .success(function(data, status, headers, config) {
                callback(true, data.testimonials);
            })
            .error(function(data, status, headers, config) {
                callback(false, data.error);
            });
    	}

}]);