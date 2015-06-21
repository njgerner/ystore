superApp.controller('LeaveReviewCtrl',
  ['$rootScope', '$state', '$scope', '$stateParams', 'authService', 'storeService', 'productService',
  function($rootScope, $state, $scope, $stateParams, authService, storeService, productService) {

  	$scope.submitted = false;
    $scope.pn = $stateParams.productnumber;
    
    $scope.sendReview = function() {
      $scope.submitting = true;
      $scope.review = {
        title: $scope.title,
        review: $scope.review,
        name: authService.profile.name,
        rating: parseInt($scope.rating)
      };
      productService.submitReview($scope.pn, $scope.review, function(result) {
        $scope.submitted = true;
        $scope.submitting = false;
      });
    }

    $scope.backToProduct = function() {
      $state.go("product", {productnumber:$scope.pn});
    }
    
    function onProductLoaded (error, product) {
      if (error) {
        $scope.error = error;
      }
      $scope.productLoaded = true;
      $scope.product = product;
    }

    storeService.getProductByID($scope.pn, onProductLoaded);

}]);