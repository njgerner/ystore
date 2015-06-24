appDirectives.directive('cartDir', [ 'authService', '$state', '$rootScope', '$cookieStore', '$cookies', '$window', 'storeService',
	function(authService, $state, $rootScope, $cookieStore, $cookies, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			userid: '=',
			showCart: '='
		},
		templateUrl: 'directives/cart_template.html',
		link: function(scope, element) {
			scope.productsInCart = [];
			scope.cartProductsLoading = true;
			scope.cartTotal = 0;
			if (authService.authorized) {
				scope.profileid = authService.profile.id;
			}

			scope.persistCartItems = function() {
				var productnumbers = [];
				var quantities = [];
				for (var i = 0; i < scope.productsInCart.length; i++) {
					productnumbers[i] = scope.productsInCart[i].productnumber;
					quantities[i] = scope.productsInCart[i].quantity;
				}
				storeService.updateCart(authService.profileid, productnumbers, quantities);
			}
			
			scope.hide = function() {
				$rootScope.hideCart(function() {});
			}

			scope.removeItemFromCart = function(index) {
				scope.productsInCart.splice(index, 1);
  				scope.persistCartItems();
				scope.updateTotal();
			}

			scope.updateTotal = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  				scope.cartTotal += ( scope.products[scope.productsInCart[i].productnumber].price * scope.productsInCart[i].quantity );
  			}
  			scope.persistCartItems();
			}

			scope.goToCheckout = function() {
				$state.go("checkout");
			}

	  		var productsInCartWatch = null;
			productsInCartWatch = scope.$watch('productsInCart', function(newValue, oldValue) {
				if (!newValue) {
					scope.updateTotal();
					scope.updatePInCartCookie();
					productsInCartWatch();
				}
			});

			var cartWatch = null;
			cartWatch = scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard
				if (newCart !== undefined) {
					onProductsInCartReceived(null, JSON.parse(newCart));
				} else {
					onProductsInCartReceived(null, []);
				}
			});

			function updatePInCartCookie () {
  				$cookieStore.put('pInCart', scope.productsInCart);
			}

	  		function onProductsLoaded (error, products) {
	  			scope.products = storeService.productsByID;
	  			if (scope.productsInCart.length > 0) {
	  				scope.updateTotal();
	  			}
	  			scope.cartProductsLoading = false;
	  		}

	  		function onProductsInCartReceived (error, products) {
	  			scope.productsInCart = products;
	  			scope.$on('productsloaded', function (evt, products) {
	  				onProductsLoaded(products);
	  			});
	  		};

			storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);

			scope.$on('$destroy', function () {
				productsInCartWatch();
				cartWatch();
			});

		}
	}
}]);