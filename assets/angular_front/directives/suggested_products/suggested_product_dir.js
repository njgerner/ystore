appDirectives.directive('suggestedProductDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			pn: '=',
			detailed: '='
		},
		templateUrl: 'directives/suggested_product_template.html',
		link: function(scope, element) {
			scope.name = null;
			scope.price = null;

			scope.p = storeService.productsByID[scope.pn];
			console.log('suggestedproductsdir product', scope.p);

			scope.goToProduct = function() {
				$state.go("product", {productnumber:scope.pn});
			}

			if (scope.detailed == 'yes') {
				scope.name = p.name;
				scope.price = p.price;
			}
		}
	}
}]);