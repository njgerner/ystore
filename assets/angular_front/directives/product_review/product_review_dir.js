appDirectives.directive('productReviewDir', [ '$state',
	function($state) {
	return {
		restrict: 'E',
		scope: {
			review: '='
		},
		templateUrl: 'directives/product_review_template.html',
		link: function(scope, element) {
			scope.title = scope.review.title;
			scope.description = scope.review.review;
			scope.rating = scope.review.rating;
			scope.name = scope.review.name;

		}
	}
}]);