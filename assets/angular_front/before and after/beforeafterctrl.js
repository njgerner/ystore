superApp.controller('BeforeAfterCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'testimonialService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, testimonialService) {
    
  	$scope.procedures = [];
  	$scope.displayTestimonials = [];

  	$scope.filter = function(procedure) {
    	$scope.displayTestimonials = [];
    	for(var i = 0; i < $scope.testimonials.length; i++) {
    		if($scope.testimonials[i].procedure == procedure) {
    			$scope.displayTestimonials.push($scope.testimonials[i]);
    		}
    	}
    };

    testimonialService.getAllTestimonials(function (success, data) {
      if(success) {
        $scope.testimonials = data;
        $scope.displayTestimonials = data;
        $scope.testimonials.forEach(function (testimonial) {
        	if($scope.procedures.indexOf(testimonial.procedure) < 0) {
        		$scope.procedures.push(testimonial.procedure);
        	}
        });
        if($stateParams.procedure) {
  			$scope.filter($stateParams.procedure);
  		}
      }
    });

}]);