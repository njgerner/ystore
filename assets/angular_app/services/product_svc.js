trdServices.service("productService", ['$rootScope', '$http', '$cookieStore', 'stripeService', 'profileService', 'authService',
    function ($rootScope, $http, $cookieStore, stripeService, profileService, authService) {

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

        this.addPageView = function(productnumber, callback) {
            $http({method: 'POST', url: "/product_page_view/" + productnumber + '?profile=' + authService.profileid})
            .success(function(data, status, headers, config) {
                callback(data);
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
        }

        this.addProduct = function(product, callback) {
            if (!profileService.merchant) {
                callback({message:"error", err:'merchant not authorized'});
                return;
            }
            $http({method: 'POST', url: "/add_product",
                   data: {product:product, merchant:profileService.merchant}})
            .success(function(data, status, headers, config) {
                callback(data);
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
        }

        this.updateProduct = function(product, callback) {
            $http({method: 'POST', url: "/update_product",
                   data: {product:product}})
            .success(function(data, status, headers, config) {
                callback(data);
            })
            .error(function(data, status, headers, config) {
                callback({message:"error", err:data});
            });
        }

}]);