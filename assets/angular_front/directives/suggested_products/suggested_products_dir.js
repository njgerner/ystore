appDirectives.directive('suggestedProductsDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			pn: '='
			detailed: '='
		},
		templateUrl: 'directives/suggested_products_template.html',
		link: function(scope, element) {

			scope.p = storeService.productsByID[scope.pn];

			scope.goToProduct = function() {
				state.go("product", {productnumber:scope.pn});
			}

			if (scope.detailed == 'yes') {
				scope.name = p.name;
				scope.price = p.price;
			}
		}
	}
}]);