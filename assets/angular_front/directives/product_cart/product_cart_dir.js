appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			ind: '=',
			pn: '=',
			qty: '=',
			cb: '&',
			t: '&'
		},
		templateUrl: 'directives/product_cart_template.html',
		// replace: true, // Replace with the template below
		// transclude: true, // we want to insert custom content inside the directive
		link: function(scope, element) {

			scope.product = storeService.productsByID[scope.pn];
			scope.total = scope.product.price * scope.qty;

			scope.updateQuantity = function(quantity) {
				scope.qty = quantity;
				scope.$apply();
				scope.total = scope.product.price * scope.qty;
				scope.t();
			}

			scope.addTen = function() {
				scope.qty = parseInt(scope.qty) + 10;
				scope.$apply();
				scope.total = scope.product.price * scope.qty;
				scope.t();
			} 

			scope.minusTen = function() {
				scope.qty = parseInt(scope.qty) - 10;
				scope.$apply();
				scope.total = scope.product.price * scope.qty;
				scope.t();
			} 

			scope.removeItemFromCart = function() {
				scope.cb(scope.ind);
				scope.t();
				scope.updateQuantity(0);
			}
		}
	}
}]);