superApp.controller('CheckoutCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, $timeout, storeService, authService, stripeService) {

    // address vars
    $scope.shippingCost = 5; // flat fee for now
    $scope.total = $scope.shippingCost;
    $scope.addAddressView = false;
    $scope.addresseshipTo = null;
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
      $scope.profile = authService.profile;
      $scope.profileid = authService.profile.id;
      $scope.addresses = authService.profile.addresses;
    } else {
      $scope.addresses = [];
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
        $scope.merchants = [];
        $scope.productsInCart = products;
        for (var i = 0; i < $scope.productsInCart.length; i++) {
          if ($scope.merchants.indexOf(storeService.getProductMerchant($scope.productsInCart[i].productnumber)) == -1) {
            $scope.merchants.push(storeService.getProductMerchant($scope.productsInCart[i].productnumber));
          }
          $scope.total += ( $scope.products[$scope.productsInCart[i].productnumber].price * $scope.productsInCart[i].quantity );
        }
      });
    }

    $scope.submitOrder = function() {
      if ($scope.orderSubmitted == true) {
        return;
      }
      $scope.orderSubmitted = true;
      stripeService.submitOrder($scope.addressShipTo, $scope.productsInCart, $scope.merchants, $scope.shippingCost, $scope.total, function(err, result) {
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