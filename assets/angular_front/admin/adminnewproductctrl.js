superApp.controller('AdminNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService', 'awsService',
  function($rootScope, $scope, $state, productService, awsService) {

    $scope.fileCount = 0;
  	$scope.product = {};
    $scope.product.tmpImg = {};
    $scope.product.tmpAltImg = [];

    $scope.onFileAdded = function(files, msg, flow) {
      var file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      var image = {};
      image.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      image.extension = typeSplit[1];
      image.name = file.name;
      if($scope.fileCount == 0 ) {  //main image
        $scope.product.tmpImg = image;
      }else {   //alt image
        $scope.product.tmpAltImg.push(image);
      }
      awsService.getSignedRequest(file, onSignedRequest);
      $scope.fileCount ++;
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

    function onProductAdded (error, product) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$state.go("admin.products");
  	}

}]);