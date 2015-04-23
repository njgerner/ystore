appDirectives.directive('navBarDir', [ 'authService', '$state', '$location', '$rootScope', '$window', '$cookieStore', '$cookies', 'storeService',
	function(authService, $state, $location, $rootScope, $window, $cookieStore, $cookies, storeService) {
	return {
		restrict: 'E',
		scope: {
			back: '=',
			close: '=',
			center: '='
		},
		templateUrl: 'directives/nav_bar_template.html',
		link: function(scope, element) {
			
			scope.loggedIn = false;
			scope.name = "";
			scope.profileid = null;
			scope.isAdmin = false;
			// scope.showCart = $rootScope.isVisible;
			scope.productsInCart = [];
			scope.itemCount = 0;
			scope.searchQuery = "balls";
			scope.cart = {};
			scope.productNames = [];

			scope.goToPage = function(page) {
	  			$state.go(page);
			};

	    	scope.isActive = function(route) {
	      		return route === $location.path();
	  		};

	  		scope.logoutNow = function() {
	  			scope.loggedIn = false;
	  			$state.go("logout");
	  		};

	  		scope.openCart = function() {
	  			// $rootScope.toggleVisible(function(isVisible) {scope.showCart = isVisible});
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
	  			} else {
	  				scope.loggedIn = false;
	  				scope.name =  null;
	  				scope.isAdmin = false;
	  			}
	  		};

			if (authService.authorized) {
				scope.loggedIn = true;
				scope.name = authService.profile.name;
				scope.profileid = authService.profile.id;
				scope.isAdmin = authService.isAdmin;
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}

			storeService.getAllProducts(function(products) {
				products.forEach(function(product, index) {
		            scope.productNames.push(product.name);
		        });
			})

			scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard ... me too
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
				}
				scope.itemCount = scope.productsInCart.length || 0;
			});

		}
	}
}]);