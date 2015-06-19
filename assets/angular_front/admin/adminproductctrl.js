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
      productService.updateProduct($scope.product, function(result) {
        if(result.err) {
          $scope.message = "Error updating product."
        }else {
          $scope.message = "Product successfully updated."
        }
      });
      $scope.updating = false;
      $scope.mode = 'view';
    };

    storeService.getProductByID($stateParams.productnumber, function (product) {
        $scope.product = product;
    });

}]);