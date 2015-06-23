trdServices.service("promoService", ['$http', '$log',
    function ($http, $log) {

    	this.getPromoCode = function(code, domain, callback) {
	        $http({method: 'POST', url: '/promo/' + code, data: {domain:domain}})
	        .success(function (data, status, headers, config) {
	            callback(null, data.code);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting promo code', data);
            	callback(data.message);
	        });
    	}

}]);