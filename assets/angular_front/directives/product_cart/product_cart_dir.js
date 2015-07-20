appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			product: '=',
			quantity: '=',
			edit: '='
		},
		templateUrl: 'directives/product_cart_template.html',
		link: function(scope, element) {

			scope.recentChange = false;

			scope.updateQuantity = function(quantity) {
				scope.quantity = quantity;
				scope.$parent.updateTotal();
			}

			scope.addOne = function() {
				console.log('adding one pre', scope.ind, scope.$parent.productsInCart, scope.$parent.productsInCart[scope.ind]);
				scope.quantity++;
				scope.$parent.updateTotal();
				scope.recentChange = true;
                $timeout(function() {
                    scope.recentChange = false;
                }, 1000);
				console.log('adding one post', scope.ind, scope.$parent.productsInCart, scope.$parent.productsInCart[scope.ind]);
			} 

			scope.minusOne = function() {
				if (scope.quantity > 0) {
					scope.quantity--;
					scope.recentChange = true;
	                $timeout(function() {
	                    scope.recentChange = false;
	                }, 1000);
				} else {
					scope.removeItemFromCart();
				}
				scope.$parent.updateTotal();
			} 

			scope.removeItemFromCart = function() {
				scope.$parent.removeItemFromCart(scope.ind);
			}

			scope.goToProduct = function() {
				$state.go('product', {productnumber: scope.product.productnumber});
				$rootScope.hideCart(function() {});
			}
		}
	}
}]);