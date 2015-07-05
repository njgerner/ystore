superApp.controller('AdminNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService', 'awsService',
  function($rootScope, $scope, $state, productService, awsService) {

    $scope.fileCount = 0;
  	$scope.product = {};
    $scope.product.tmpImg = {};
    $scope.product.tmpAltImg = [];

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
    };

    $scope.addProduct = function() {
      if($scope.updating) {
        return;
      }
      if(!$scope.product.tmpImg.name) {
        $scope.error = "Please upload an image for the product";
        return;
      }
      return;
      if(!$scope.product.name) {
        $scope.error = "Missing product name";
        return;
      }
      if(!$scope.vendor) {
        $scope.error = "Choose a vendor";
        return;
      }
      if(!$scope.product.category) {
        $scope.error = "Choose a category";
        return;
      }
      if(!$scope.product.description) {
        $scope.error = "Enter a description for the product";
        return;
      }
      if(!$scope.product.price) {
        $scope.error = "Enter a price";
        return;
      }
      $scope.updating = true;
      $scope.product.attributes = {};
      $scope.product.attributes.vendor = $scope.vendor;
      $scope.makeactive == 'yes' ? $scope.product.active = 'Y' : $scope.product.active = 'Y';

      productService.addProduct($scope.product, $scope.vendor, onProductAdded);
    };

}]);