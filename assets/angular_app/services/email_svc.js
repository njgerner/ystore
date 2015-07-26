trdServices.service('emailService', ['$http', '$log', 
	function($http, $log) {

	this.sendSupportRequest = function(email, props, callback) {
		$http({method:'POST', url:'/email_support',
			   data: {email:email, props:props}}).
			success(function(data, status, headers, config) {
				callback(null, data.result);
			}).
			error(function(data, status, headers, config) {
				$log.debug('error sending support request', data);
				callback(data.message);
			});
	};

	this.changeUserEmail = function(oldemail, newemail, callback) {
		$http({method:'POST', url:'/change_email',
			   data: {oldemail:oldemail, newemail:newemail}}).
			success(function(data, status, headers, config) {
				if(callback) {
					callback(null);
				}
			}).
			error(function(data, status, headers, config) {
				$log.debug('error sending email', data);
				if(callback) {
					callback(data.message);
				}
			});
	};

}]);
