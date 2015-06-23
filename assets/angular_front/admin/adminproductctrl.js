superApp.controller('AdminProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'productService', '$stateParams',
  function($rootScope, $scope, $state, storeService, productService, $stateParams) {

    if (!$stateParams.productnumber) {
      $state.go("admin.products");
    }

  	$scope.mode = "view";
    $scope.message = "";

    $scope.updateProduct = function() {
      if ($scope.updating) {
        return;
      }
      $scope.updating = true;
      productService.updateProduct($scope.product, function(error, result) {
        if(error) {
          $scope.error = error;
        }
      });
      $scope.updating = false;
      $scope.mode = 'view';
    };

    storeService.getProductByID($stateParams.productnumber, function (error, product) {
        $scope.product = product;
    });

}]);