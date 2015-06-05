appDirectives.directive('navBarDir', [ 'authService', '$state', '$location', '$rootScope', '$window', 
		'$cookieStore', '$cookies', 'storeService', 'profileService',
	function(authService, $state, $location, $rootScope, $window, 
		$cookieStore, $cookies, storeService, profileService) {
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
			scope.isMerchant = false;
			scope.query = null;
			scope.productsInCart = [];
			scope.productCategories = {};
			scope.itemCount = 0;
			scope.cart = {};
			scope.productNames = [];

			scope.goToPage = function(page) {
	  			$state.go(page);
			};

			scope.toTitleCase = function(str) {
				return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			}

	    	scope.isActive = function(route) {
	      		return route === $location.path();
	  		};

	  		scope.logoutNow = function() {
	  			scope.loggedIn = false;
	  			$state.go("logout");
	  		};

	  		scope.openCart = function() {
	  			if (scope.itemCount == 0) {
	  				return;
	  			}
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
	  				onProfileLoaded();
	  			} else {
	  				scope.loggedIn = false;
	  				scope.name =  null;
	  				scope.isAdmin = false;
	  			}
	  		};

	  		function onProfileLoaded () {
	  			profileService.getMerchantProfile(function (profile) {
	  				if (profile && profile.name) {
	  					scope.merchantName = profile.name;
	  					scope.isMerchant = true;
	  				}
	  			});
	  		}

			if (authService.authorized) {
				scope.loggedIn = true;
				scope.name = authService.profile.name;
				scope.profileid = authService.profile.id;
				scope.isAdmin = authService.isAdmin;
				onProfileLoaded();
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}

			storeService.getAllProducts(function(products) {
				products.forEach(function(product, index) {
					if (scope.productCategories[product.category] === undefined) {
						scope.productCategories[product.category] = 0;
					}
					scope.productCategories[product.category]++;
		            scope.productNames.push(product.name);
		        });
			});

			scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard ... me too
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
				}
				scope.itemCount = scope.productsInCart.length || 0;
			});

			$rootScope.$on('merchantcreated', function(evt, args) {
				onProfileLoaded();
			});

		}
	}
}]);