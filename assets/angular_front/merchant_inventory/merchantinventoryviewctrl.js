superApp.controller('MerchantInventoryViewCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'profileService', 'productService',
  function($rootScope, $scope, $state, storeService, profileService, productService) {

    $scope.goToProduct = function(id) {
      $state.go("merchant_inventory.product", {productnumber:id});
    }

    $scope.deactivateProduct = function(product) {
      if (confirm('Are you sure you want to deactivate this product?')) {
        product.active = "N";
        productService.updateProduct(product, onProductUpdated);
      }
    }

    $scope.activateProduct = function(product) {
      product.active = "Y";
      productService.updateProduct(product, onProductUpdated);
    }

    $scope.defaultImage = function(product) {
      console.log('default image', product);
      if (product.remote_img) {
        console.log('if', product.remote_img);
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

    function onProductUpdated (product) {
    }

}]);