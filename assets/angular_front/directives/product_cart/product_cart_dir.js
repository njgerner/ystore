appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			ind: '=',
			pn: '=',
			edit: '='
		},
		templateUrl: 'directives/product_cart_template.html',
		link: function(scope, element) {

			scope.product = storeService.productsByID[scope.pn];
			scope.qty = scope.$parent.productsInCart[scope.ind].quantity;

			scope.updateQuantity = function(quantity) {
				scope.$parent.productsInCart[scope.ind].quantity = quantity;
				scope.$parent.updateTotal();
			}

			scope.addOne = function() {
				scope.$parent.productsInCart[scope.ind].quantity++;
				scope.$parent.updateTotal();
			} 

			scope.minusOne = function() {
				if (scope.$parent.productsInCart[scope.ind].quantity > 0) {
					scope.$parent.productsInCart[scope.ind].quantity--;
				} else {
					scope.removeItemFromCart();
				}
				scope.$parent.updateTotal();
			} 

			scope.removeItemFromCart = function() {
				scope.$parent.removeItemFromCart();
			}
		}
	}
}]);