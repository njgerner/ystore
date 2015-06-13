appDirectives.directive('navLinksDir', [ 'authService', '$state', '$rootScope',
	function(authService, $state, $rootScope) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/nav_links_template.html',
		link: function(scope, element) {

			scope.handleLoaded = function() {
	  			if (authService.authorized) {
	  				scope.isAdmin = authService.isAdmin;
	  				scope.isYLIFT = authService.isYLIFT;
	  			} else {
	  				scope.isAdmin = false;
	  				scope.isYLIFT = false;
	  			}
	  		};

			if (authService.authorized) {
				scope.handleLoaded();
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}
		}
	}
}]);