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
				storeService.updateCart(authService.profileid, productnumbers, quantities, function(cart) {});
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
				console.log('updating total');
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  				scope.cartTotal += ( scope.products[scope.productsInCart[i].productnumber].price * scope.productsInCart[i].quantity );
  			}
  			scope.persistCartItems();
			}

			scope.goToCheckout = function() {
				$state.go("checkout");
			}

			function updatePInCartCookie () {
  			$cookieStore.put('pInCart', scope.productsInCart);
			}

  		function onProductsLoaded (products) {
  			scope.products = storeService.productsByID;
  			if (scope.productsInCart.length > 0) {
  				scope.updateTotal();
  			}
  			scope.cartProductsLoading = false;
  		}

  		function onProductsInCartReceived (products) {
  			scope.productsInCart = products;
  			storeService.getAllProducts(onProductsLoaded); // as the store grows we may want to load only products currently in cart
  		};

  		var productsInCartWatch = null;
			productsInCartWatch = scope.$watch('productsInCart', function(newValue, oldValue) {
				console.log('watching productsInCart', newValue, oldValue);
				if (!newValue) {
					scope.updateTotal();
					scope.updatePInCartCookie();
					productsInCartWatch();
				}
			});

			storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);

			scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard
					onProductsInCartReceived(JSON.parse(newCart));
			});

		}
	}
}]);