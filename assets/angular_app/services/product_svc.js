trdServices.service("productService", ['$rootScope', '$http', '$cookieStore', 'stripeService',
    function ($rootScope, $http, $cookieStore, stripeService) {

    	this.submitReview = function(productnumber, review, callback) {
    		review.productnumber = productnumber;
    		$http({method: 'POST', url: "/submit_review",
    			   data:{review:review}})
            .success(function(data, status, headers, config) {
                callback({message:"success!"});
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
    	}

    	this.getRating = function(productnumber, callback) {
    		$http({method: 'GET', url: "/product_rating/" + productnumber})
            .success(function(data, status, headers, config) {
                callback(data.data);
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
    	}

    	this.getReviews = function(productnumber, callback) {
    		$http({method: 'GET', url: "/product_reviews/" + productnumber})
            .success(function(data, status, headers, config) {
                callback(data.data);
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
    	}

}]);