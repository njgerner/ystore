trdServices.service('emailService', ['$http',
	function($http) {

	this.sendSupportRequest = function(email, body, callback) {
		$http({method:'POST', url:'/email_support',
			   data: {email:email, body:body}}).
			success(function(data, status, headers, config) {
				callback(data.result);
			}).
			error(function(data, status, headers, config) {
				console.log("getting profile failed:");
				console.log(data);
				callback();
			});
	};
}]);
