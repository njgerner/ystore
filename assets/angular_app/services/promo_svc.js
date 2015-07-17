trdServices.service("promoService", ['$http', '$log', '$rootScope',
    function ($http, $log, $rootScope) {


    	this.initService = function() {
    		this.currentPromo = null;
    	}

    	this.getPromoCode = function(code, domain, callback) {
    		inThis = this;
	        $http({method: 'POST', url: '/promo/' + code, data: {domain:domain}})
	        .success(function (data, status, headers, config) {
	        	inThis.currentPromo = data.key;
	            callback(null, data.key);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting promo code', data);
	            inThis.currentPromo = null;
            	callback(data.message);
	        });
    	}

    	this.initService();

	    $rootScope.$on('loggedout', function(evt, args) {
	        this.initService;
	    });


}]);