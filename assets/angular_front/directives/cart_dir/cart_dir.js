appDirectives.directive('cartDir', [ 'authService', '$state', '$rootScope', '$cookieStore', '$cookies', '$window', 
	    'storeService', '$timeout',
	function(authService, $state, $rootScope, $cookieStore, $cookies, $window, 
		storeService, $timeout) {
	return {
		restrict: 'E',
		scope: {
			close: '='
		},
		templateUrl: 'directives/cart_template.html',
		link: function(scope, element) {

			scope.products = {};
			scope.productsInCart = [];
			scope.profileid = null;
			scope.cartTotal = 0;
			scope.cartProductsLoading = true;
			scope.cartWatch = null;

			if (authService.authorized) {
				scope.profileid = authService.profileid;
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

			scope.removeItemFromCart = function(index) {
				scope.productsInCart.splice(index, 1);
				scope.updateTotal();
  				scope.persistCartItems();
			}

			scope.updateTotal = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  					scope.cartTotal += parseInt(scope.products[scope.productsInCart[i].productnumber].price) * parseInt(scope.productsInCart[i].quantity);
  				}
  				scope.cartTotal = parseInt(scope.cartTotal).toFixed(2);
			}

			scope.updateTotalAndPersist = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  					scope.cartTotal += parseInt(scope.products[scope.productsInCart[i].productnumber].price) * parseInt(scope.productsInCart[i].quantity);
  				}
  				scope.cartTotal = parseInt(scope.cartTotal).toFixed(2);
  				scope.persistCartItems();
			}

			scope.goToCheckout = function() {
				$state.go("checkout");
				$rootScope.$broadcast('cartviewchange', {displayCart: false});
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
				if (storeService.productsReceived) {
					onProductsLoaded(null, storeService.products);
				} else {
					storeService.getStoreFront(onProductsLoaded);
				}
	  		};

	  		cartWatch = scope.$watch(function() { return $cookies.pInCart; },
	  			function (newValue, oldValue) {
	  				if (newValue && newValue != oldValue) {
	  					scope.productsInCart = $cookieStore.get('pInCart');
	  					scope.updateTotal();
	  				}
	  			}
	  		);

			storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);

			scope.$on('loggedout', function() {
  				cartWatch();
  				$cookieStore.put('pInCart', []);
			});

		}
	}
}]);