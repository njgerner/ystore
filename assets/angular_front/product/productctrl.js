superApp.controller('ProductCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'productService', 
   'profileService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, productService,
    profileService) {

    $scope.loading = true;
    $scope.reviewsLoading = true;
    $scope.ratingLoading = true;
    $scope.relatedLoading = true;
    $scope.added = false;
    $scope.productnumber = $stateParams.productnumber;
    $scope.error = false;


    $scope.itemAdded = function() {
        $scope.added = true;
    }

    $scope.addToCart = function() {
        if ($scope.quantity <= 0) {
            $scope.error = 'Please select a quantity first';
            return;
        }
        if ($scope.quantity % $scope.product.attributes.increment != 0) {
            $scope.error = 'The quantity entered must be a multiple of ' + $scope.product.attributes.increment;
            return;
        }
        $scope.error = false;
        storeService.addItemToCart($scope.profileid, $scope.product.productnumber, $scope.quantity, function() {
            $scope.itemAdded();
            $rootScope.showCart(function() {}); // want cart to pop out when item is added
        });
    }

    $scope.reset = function() {
        $scope.added = false;
        $scope.error = false;
        $scope.quantity = 0;
    }

    $scope.goToLeaveReview = function() {
        $state.go("leave_review", {productnumber:$scope.productnumber});
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

    function onProductLoaded (error, product) {
        $scope.loading = false;
        if (error) {
            $scope.error = error;
        }
        $scope.product = product;
    }

    function onRelatedProductsLoaded (error, products) {
        for (var i = 0; i < products.length; i++) {
            if (products[i].productnumber == $scope.product.productnumber) {
                products.splice(i, 1);
            }
        }
        $scope.relatedProducts = products;
        $scope.relatedLoading = false;
    }

    function onMerchantLoaded (error, merchant) {
        if (merchant && merchant.yliftCanAcceptPayment == 'N') {
            $scope.note = "Note: This product will not be billed at checkout, purchase will result in a separate invoice from the vendor.";
        }
    }

    function onReviewsLoaded (error, reviews) {
        $scope.reviews = reviews;
        $scope.reviewsLoading = false;
    }

    function onRatingLoaded (error, data) {
        if (data) {
            $scope.rating = data.mean;
        }
        $scope.ratingLoading = false;
    }

    if (authService.authorized) {
        $scope.profileid = authService.profile.id;
    }

    storeService.getProductByID($scope.productnumber, onProductLoaded);
    storeService.getRelatedProducts($scope.productnumber, onRelatedProductsLoaded);
    productService.getMerchant($scope.productnumber, onMerchantLoaded);
    productService.getReviews($scope.productnumber, onReviewsLoaded);
    productService.getRating($scope.productnumber, onRatingLoaded);
    productService.addPageView($scope.productnumber);

}]);