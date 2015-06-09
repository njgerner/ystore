superApp.controller('BeforeAfterCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'testimonialService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, testimonialService) {
    
    testimonialService.getAllTestimonials(function (success, data) {
      if(success) {
        $scope.testimonials = data;
      }
    })

}]);