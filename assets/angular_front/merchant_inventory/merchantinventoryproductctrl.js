superApp.controller('MerchantInventoryProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', '$stateParams', 'productService', 'awsService',
  function($rootScope, $scope, $state, storeService, $stateParams, productService, awsService) {

    $scope.onFileAdded = function(files, msg, flow) {
      // files[0].file.name = $scope.product.productnumber + "." + files[0].file.type.split("/").pop();
      // console.log('files name', files);
      $scope.file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      $scope.product.tmpImg.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      $scope.product.tmpImg.extension = typeSplit[1];
      $scope.product.tmpImg.name = $scope.file.name;
      awsService.getSignedRequest($scope.file, onSignedRequest);
    }

  	$scope.updateProduct = function() {
  		if ($scope.updating) {
  			return;
  		}
  		$scope.updating = true;
  		productService.updateProduct($scope.product, onProductLoaded);
  	}

    function onSignedRequest (file, signed_request, url) {
      awsService.uploadFile(file, signed_request, url, onRemoteFileUpload);
    }

    function onRemoteFileUpload (url) {
    }

  	function onProductLoaded (error, product) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.mode = 'view';
  		$scope.updating = false;
  		$scope.product = product;
  	}

  	storeService.getProductByID($stateParams.productnumber, onProductLoaded);

}]);