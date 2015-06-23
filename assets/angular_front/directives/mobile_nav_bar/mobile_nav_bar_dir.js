appDirectives.directive('mobileNavBarDir', [ 'authService', '$state', '$location', '$rootScope', '$window', '$cookieStore', '$cookies', 'storeService',
	function(authService, $state, $location, $rootScope, $window, $cookieStore, $cookies, storeService) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/mobile_nav_bar_template.html',
		link: function(scope, element) {
			scope.loggedIn = false;
			scope.name = "";
			scope.profileid = null;
			scope.isAdmin = false;
			scope.isMerchant = false;
			scope.query = null;
			scope.productsInCart = [];
			scope.itemCount = 0;
			scope.cart = {};
			scope.productNames = [];
			scope.productCategories = {};

			scope.goToPage = function(page) {
	  			$state.go(page);
			};

	  		scope.logoutNow = function() {
	  			scope.loggedIn = false;
	  			$state.go("logout");
	  		};

	  		scope.openCart = function() {
	  			$rootScope.showCart(function(isVisible) {scope.showCart = isVisible});
	  		};

	  		scope.search = function(query) {
	  			$state.go("search_results", {'query' : query});
	  		}

	  		scope.handleLoaded = function() {
	  			if (authService.authorized) {
	  				scope.loggedIn = true;
	  				scope.name = authService.profile.name;
	  				scope.profileid = authService.profile.id;
	  				scope.isAdmin = authService.isAdmin;
	  				scope.isMerchant = authService.isMerchant;
	  			} else {
	  				scope.loggedIn = false;
	  				scope.name =  null;
	  				scope.isAdmin = false;
	  				scope.isMerchant = false;
	  			}
	  		};

	  		function onProductsLoaded (products) {
				products.forEach(function(product, index) {
					if (scope.productCategories[product.category] === undefined) {
						scope.productCategories[product.category] = 0;
					}
					scope.productCategories[product.category]++;
		            scope.productNames.push(product.name);
		        });
			}

			if (authService.authorized) {
				scope.loggedIn = true;
				scope.name = authService.profile.name;
				scope.profileid = authService.profile.id;
				scope.isAdmin = authService.isAdmin;
	  			scope.isMerchant = authService.isMerchant;
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}

			scope.$on('productsloaded', function (evt, products) {
				onProductsLoaded(products);
			});

			var pInCartWatch = scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard ... me too
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
				}
				scope.itemCount = scope.productsInCart.length || 0;
			});

			scope.$on('$destroy', function () {
				pInCartWatch();
			});

		}
	}
}]);