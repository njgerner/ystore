superApp.controller('CheckoutCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, $timeout, storeService, authService, stripeService) {

    // office vars
    $scope.profile = authService.profile;
    $scope.offices = $scope.profile.offices;
    $scope.shippingCost = 10; // flat fee for now
    $scope.total = $scope.shippingCost;
    $scope.addOfficeView = false;
    $scope.officeShipTo = null;
    $scope.cart = {};
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
      $scope.cart = storeService.cart;
      for (var i = 0; i < $scope.cart.products.length; i++) {
        $scope.total += ( $scope.products[$scope.cart.products[i].productnumber].price * $scope.cart.products[i].quantity );
      }
    }

    $scope.submitOrder = function() {
      $scope.orderSubmitted = true;
      $scope.cart.shipping = $scope.shippingCost;
      $scope.cart.total = $scope.total;
      stripeService.submitOrder($scope.officeShipTo, $scope.cart, function(err, result) {
        if (err) {
          $scope.orderError = err.message;
          $scope.orderSubmitted = false;
        } else {
          $state.go("order", {orderid: result.id});
          storeService.emptyCart(authService.userid, function(cart) {});
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