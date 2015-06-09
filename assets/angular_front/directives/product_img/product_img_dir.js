appDirectives.directive('productImgDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			pn: '=',
			w: '=',
			h: '=',
			x: '=',
			click: '='
		},
		templateUrl: 'directives/product_img_template.html',
		// replace: true, // Replace with the template below
		// transclude: true, // we want to insert custom content inside the directive
		link: function(scope, element) {
			if (storeService.productsByID && storeService.productsByID[scope.pn] && storeService.productsByID[scope.pn].remote_img) {
				scope.src = storeService.productsByID[scope.pn].remote_img
			} else {
				scope.src = "/img/logo.png";
			}
		}
	}
}]);