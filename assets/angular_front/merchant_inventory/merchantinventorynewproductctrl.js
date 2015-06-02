superApp.controller('MerchantInventoryNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService', 'awsService',
  function($rootScope, $scope, $state, productService, awsService) {

  	$scope.product = {};
    $scope.product.tmpImg = {};

    $scope.onFileAdded = function(files, msg, flow) {
      $scope.file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      $scope.product.tmpImg.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      $scope.product.tmpImg.extension = typeSplit[1];
      $scope.product.tmpImg.name = $scope.file.name;
      awsService.getSignedRequest($scope.file, onSignedRequest);
    }

    $scope.addProduct = function() {
      if ($scope.updating) {
        return;
      }
      $scope.updating = true;
      productService.addProduct($scope.product, onProductAdded);
    }

    function onSignedRequest (file, signed_request, url) {
      awsService.uploadFile(file, signed_request, url, onRemoteFileUpload);
    }

    function onRemoteFileUpload (url) {
    }

    function onProductAdded (product) {
  		$state.go("merchant_inventory.product", {productnumber:product.productnumber});
  	}

}]);