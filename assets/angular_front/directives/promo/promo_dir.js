appDirectives.directive('promoDir', ['$window', 'promoService',
	function($window, promoService) { 
	return {
		restrict: 'E',
		scope: {
			total: '=',
			shipping: '=',
			domain: '@',
			error: '='
		},
		templateUrl: 'directives/promo_template.html',
		link: function(scope, element) {

			scope.validating = false;

			if (!scope.domain) {
				$log.debug('no domain set in promo dir');
			}

			scope.applyCode = function() {
				scope.validating = true;
				promoService.getPromoCode(scope.code, scope.domain, onCodeLoaded);
			}

			function onCodeLoaded(error, code) {
				// handle code here
				if (error) {
					scope.error = error;
				} else {
					if (code.type == "money_off") {
						scope.total -= parseInt(code.value);
					} else if (code.type == "percent_off") {
						scope.total -= (scope.total * parseFloat(code.value));
					} else if (code.type == "free_shipping") {
						scope.shipping = 0;
					}
					scope.success = true;
					scope.message = code.message;
				}

				scope.validating = false;


			}
			
		}
	}
}]);