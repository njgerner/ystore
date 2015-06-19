trdServices.service("merchantService", ['$http',
    function ($http) {	

    this.merchants = [];

    this.getMerchantByID = function(merchantid, callback) {
    	var internalThis = this;
        $http({method: 'POST', url: "/get_merchant_name",
            data:{id:merchantid}})
        .success(function(data, status, headers, config) {
        	internalThis.merchants[data.merchant.id] = data.merchant;
            callback(data.merchant);
        })
        .error(function(data, status, headers, config) {
            callback("Merchant not found");
        });
      };

     this.getMerchantName = function(id, callback) {
     	if(this.merchants[id]) {	// merchant is already cached
     		callback(this.merchants[id]);
     	}else {						// else need to grab it
     		this.getMerchantByID(id, function(result) {
     			if(result.name) {	// merchant was found
     				callback(result.name);
     			}else{
     				callback("No merchant found");
     			}
     		});
     	}
     };

}]);