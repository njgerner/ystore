trdServices.service("productService", ['$rootScope', '$http', '$cookieStore', 'stripeService', 'profileService', 
    'authService', '$log',
    function ($rootScope, $http, $cookieStore, stripeService, profileService, 
        authService, $log) {

        this.initService = function() {
            this.mostViewedByProfile = {};
            this.reviewsByProduct = {};
        }

        this.initService();

    	this.submitReview = function(productnumber, review, callback) {
    		review.productnumber = productnumber;
    		$http({method: 'POST', url: "/submit_review",
    			   data:{review:review}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, {message:"success!"});
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error submitting review', data);
                if (callback) {
                    callback(data.message);
                }
            });
    	}

    	this.getRating = function(productnumber, callback) {
    		$http({method: 'GET', url: "/product_rating/" + productnumber})
            .success(function(data, status, headers, config) {
                callback(null, data.data);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error getting rating', data);
                callback(data.message);
            });
    	}

    	this.getReviews = function(productnumber, callback) {
            if (this.reviewsByProduct[productnumber] !== undefined) {
                callback(null, this.reviewsByProduct[productnumber]);
                return;
            }
            var inThis = this;
    		$http({method: 'GET', url: "/product_reviews/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.reviewsByProduct[productnumber] = data.data;
                callback(null, data.data);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error getting reviews', data);
                callback(data.message);
            });
    	}

        this.addPageView = function(productnumber, callback) {
            $http({method: 'POST', url: "/product_page_view/" + productnumber + '?profile=' + authService.profileid})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error adding page view', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

        this.addProduct = function(product, callback) {
            if (!profileService.merchant) {
                callback('Merchant not authorized to add product');
                return;
            }
            $http({method: 'POST', url: "/add_product",
                   data: {product:product, merchant:profileService.merchant}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error adding product', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

        this.updateProduct = function(product, callback) {
            $http({method: 'POST', url: "/update_product",
                   data: {product:product}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error updating product', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

        // this.getMostViewedProduct = function(profileid, callback) {
        //     if (this.mostViewedByProfile[profileid] !== undefined) {
        //         callback(this.mostViewedByProfile[profileid]);
        //         return;
        //     }
        //     var inThis = this;
        //     $http({method: 'GET', url: "/most_viewed_product/" + profileid})
        //     .success(function(data, status, headers, config) {
        //         inThis.mostViewedByProfile[profileid] = data;
        //         callback(data);
        //     })
        //     .error(function(data, status, headers, config) {
        //         callback({message:"error", err:data});
        //     });
        // }

}]);