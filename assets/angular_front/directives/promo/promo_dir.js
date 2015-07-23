appDirectives.directive('promoDir', ['$window', 'promoService',
	function($window, promoService) { 
	return {
		restrict: 'E',
		scope: {
			total: '=',
			shipping: '=',
			domain: '@',
			error: '=',
			showLabel: '='
		},
		templateUrl: 'directives/promo_template.html',
		link: function(scope, element) {

			scope.validating = false;
			scope.success = false;
			scope.code = null;

			if (!scope.domain) {
				$log.debug('no domain set in promo dir');
			}

			scope.applyCode = function() {
				if (scope.validating) {
					return;
				}
				scope.validating = true;
				promoService.getPromoCode(scope.code, scope.domain, onCodeLoaded);
			}

			function onCodeLoaded(error, code) {
				if (error) {
					scope.error = error;
				} else {
					scope.code = code;
					if (code.type == "money_off") {
						scope.total -= parseInt(code.value);
					} else if (code.type == "percent_off") {
						scope.total -= (scope.total * parseFloat(code.value));
					} else if (code.type == "new_price") {
						scope.total = code.value;
					} else if (code.type == "free_shipping") {
						scope.shipping = 0;
					}
					scope.total = parseFloat(scope.total).toFixed(2); // ensure we have 2 decimal places
					scope.success = true;
					scope.error = null;
				}
				scope.validating = false;
			}
			
		}
	}
}]);