superApp.controller('CheckoutCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, $timeout, storeService, authService, stripeService) {

    // office vars
    $scope.shippingCost = 10; // flat fee for now
    $scope.total = $scope.shippingCost;
    $scope.addOfficeView = false;
    $scope.officeShipTo = null;
    $scope.productsInCart = [];
    $scope.products = [];
    $scope.checkoutState = 'shipping';
    $scope.orderError = null;
    $scope.orderSubmitted = false;
    $scope.states = {
      shipping: {
        editable: true,
        next: 'billing'
      },
      billing: {
        editable: false,
        next: 'review'
      },
      review: {
        editable: false
      }
    };

    if (authService.authorized) {
      $scope.profileid = authService.profile.id;
      $scope.offices = $scope.profile.offices;
    }

    $scope.nextState = function() {
      var nextState = $scope.states[$scope.checkoutState].next;
      $scope.states[nextState].editable = true;
      $scope.goToState(nextState);
    }

    $scope.goToState = function(state) {
      if ($scope.states[state].editable) {
        $timeout(function() {
          $scope.checkoutState = state;
        }, 0);
      }
    }

    $scope.isCheckoutState = function(state) {
      return $scope.checkoutState == state;
    };

    $scope.isEditable = function(state) {
      return $scope.states[state].editable;
    }

    $scope.onProductsLoaded = function() {
      $scope.products = storeService.productsByID;
      storeService.getProductsInCart($scope.profileid, function (products) { 
        $scope.productsInCart = products;
        for (var i = 0; i < $scope.productsInCart.length; i++) {
          $scope.total += ( $scope.products[$scope.productsInCart[i].productnumber].price * $scope.productsInCart[i].quantity );
        }
        console.log('products loaded cart/total', $scope.productsInCart, $scope.total);
      });
    }

    $scope.submitOrder = function() {
      $scope.orderSubmitted = true;
      // NEED TO CHANGE THIS SO THAT IT USES PRODUCTS IN CART
      stripeService.submitOrder($scope.officeShipTo, $scope.productsInCart, $scope.shipping, $scope.total, function(err, result) {
        if (err) {
          $scope.orderError = err.message;
          $scope.orderSubmitted = false;
        } else {
          $state.go("order", {orderid: result.id});
          storeService.emptyCart($scope.profileid, function(cart) {});
        }
      });
    }

    $rootScope.hideCart(function() {}); // want cart to hide when checkout page is brought up

    if (storeService.productsRetrieved) {
      $scope.onProductsLoaded();
    } else {
      storeService.getAllProducts(function() { $scope.onProductsLoaded(); })
    }

}]);