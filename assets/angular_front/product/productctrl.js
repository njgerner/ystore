superApp.controller('ProductCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'productService', 
  function($rootScope, $scope, $state, $stateParams, storeService, authService, productService) {

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
        console.log('ngerror');
        $state.go("leave_review", {productnumber:$scope.productnumber});
    }

    $scope.defaultImage = function(productnumber) {
        $scope.product.img = "http://placehold.it/475x475&text=[img]";
    }

    function onProductLoaded (product) {
        $scope.product = product;
        $scope.loading = false;
    }

    function onRelatedProductsLoaded (products) {
        $scope.relatedProducts = products;
        $scope.relatedLoading = false;
    }

    function onReviewsLoaded (reviews) {
        $scope.reviews = reviews;
        $scope.reviewsLoading = false;
    }

    function onRatingLoaded (data) {
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
    productService.getReviews($scope.productnumber, onReviewsLoaded);
    productService.getRating($scope.productnumber, onRatingLoaded);

}]);