appDirectives.directive('productCardDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			product: '='
		},
		templateUrl: 'directives/product_card_template.html',
		link: function(scope, element) {
			scope.defaultImage = function(product) {
		      if (product.remote_img) {
		        product.img = product.remote_img;
		      } else {
		        product.img = "http://placehold.it/475x475&text=[img]";
		      }
		    }
		}
	}
}]);