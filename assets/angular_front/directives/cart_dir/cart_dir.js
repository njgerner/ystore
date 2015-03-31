appDirectives.directive('cartDir', [ 'authService', '$state', '$rootScope', '$cookieStore', '$cookies', '$window', 'storeService',
	function(authService, $state, $rootScope, $cookieStore, $cookies, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			userid: '=',
			showCartRight: '='
		},
		templateUrl: 'directives/cart_template.html',
		link: function(scope, element) {
			// scope.cart = {};
			scope.productsInCart = [];
			scope.cartProductsLoading = true;
			scope.cartTotal = 0;

			scope.persistCartItems = function() {
				var productnumbers = [];
				var quantities = [];
				for (var i = 0; i < scope.productsInCart.length; i++) {
					productnumbers[i] = scope.productsInCart[i].productnumber;
					quantities[i] = scope.productsInCart[i].quantity;
				}
				storeService.updateCart(authService.userid, productnumbers, quantities, function(cart) {
					scope.productsInCart = cart.products;
					$cookieStore.put('pInCart', scope.productsInCart);
				});
			}
			
			scope.toggleShow = function() {
				$rootScope.toggleVisible(function(isVisible) {scope.showCartRight = isVisible;});
			}

			scope.removeItemFromCart = function(index) {
				scope.productsInCart.splice(index, 1);
	  			$cookieStore.put('pInCart', scope.productsInCart);
	  			scope.persistCartItems();
				scope.updateTotal();
			}

			scope.updateTotal = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  				scope.cartTotal += ( scope.products[scope.productsInCart[i].productnumber].price * scope.productsInCart[i].quantity );
  			}
			}

			scope.goToCheckout = function() {
				$state.go("checkout");
			}

	  		scope.onProductsLoaded = function() {
	  			scope.products = storeService.productsByID;
	  			if (scope.productsInCart.length > 0) {
	  				scope.updateTotal();
	  			}
	  			scope.cartProductsLoading = false;
	  		}

	  		scope.onProductsInCartReceived = function() {
	  			storeService.getAllProducts(function(products) {scope.onProductsLoaded();}); // as the store grows we may want to load only products currently in cart
	  		};

			storeService.getCartByUserID(authService.userid, function(cart) {
				scope.productsInCart = cart.products;
				scope.onProductsInCartReceived();
			});

			scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
					scope.onProductsInCartReceived();
				}
			});

		}
	}
}]);