appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService', '$timeout', 'merchantService',
	function($state, $rootScope, $window, storeService, $timeout, merchantService) {
	return {
		restrict: 'E',
		scope: {
			product: '=',
			item: '=',
			ind: '=',
			edit: '='
		},
		templateUrl: 'directives/product_cart_template.html',
		link: function(scope, element) {

			scope.recentChange = false;
			scope.vendornames = {};

			scope.updateQuantity = function(quantity) {
				scope.item.quantity = quantity;
				scope.$parent.updateTotalAndPersist();
			}

			scope.addOne = function() {
				scope.item.quantity++;
				scope.$parent.updateTotalAndPersist();
				scope.recentChange = true;
                $timeout(function() {
                    scope.recentChange = false;
                }, 1000);
			} 

			scope.minusOne = function() {
				if (scope.item.quantity > 0) {
					scope.item.quantity--;
					scope.recentChange = true;
	                $timeout(function() {
	                    scope.recentChange = false;
	                }, 1000);
				} else {
					scope.removeItemFromCart();
				}
				scope.$parent.updateTotalAndPersist();
			} 

			scope.removeItemFromCart = function() {
				scope.$parent.removeItemFromCart(scope.ind);
			} 

			scope.goToProduct = function() {
				$state.go('product', {productnumber: scope.product.productnumber});
				$rootScope.$broadcast('cartviewchange', {displayCart: false});
			}

			merchantService.getMerchantByID(scope.product.attributes.vendor, function (err, data) {
				if(!err) {
					scope.vendorname = data.name;
				}
			})
		}
	}
}]);