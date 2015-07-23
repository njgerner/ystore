appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService', 'merchantService',
	function($state, $rootScope, $window, storeService, merchantService) {
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
			scope.vendornames = {};

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

			scope.goToProduct = function() {
				$state.go('product', {productnumber: scope.product.productnumber});
				$rootScope.hideCart(function() {});
			}

			merchantService.getMerchantByID(scope.product.attributes.vendor, function (err, data) {
				if(!err) {
					scope.vendorname = data.name;
				}
			})
		}
	}
}]);