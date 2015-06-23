trdServices.service('emailService', ['$http', '$log', 
	function($http, $log) {

	this.sendSupportRequest = function(email, props, callback) {
		$http({method:'POST', url:'/email_support',
			   data: {email:email, props:props}}).
			success(function(data, status, headers, config) {
				callback(data.result);
			}).
			error(function(data, status, headers, config) {
				$log.debug('error sending support request', data);
				callback(data.message);
			});
	};
}]);
