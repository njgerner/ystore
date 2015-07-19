trdServices.service('awsService', ['$http', '$log',
	function($http, $log) {

	this.getSignedRequest = function(file, callback) {
		$http({method:'GET', url:'/sign_s3?file_name=' + file.name + '&file_type=' + file.type}).
			success(function(data, status, headers, config) {
				callback(file, data.signed_request, data.url);
			}).
			error(function(data, status, headers, config) {
				$log.debug("getting signed request failed:", data);
				callback();
			});
	};

	this.getObject = function(file, callback) {
		$http({method:'POST', url:'/get_object', data: {file_name: file}}).
			success(function(data, status, headers, config) {
				callback(null, data.success);
			}).
			error(function(data, status, headers, config) {
				$log.debug("getting object failed:", data);
				callback(true);
			});
	};

	this.uploadFile = function(file, signed_request, url, callback) {
		var xhr = new XMLHttpRequest();
	    xhr.open("PUT", signed_request);
	    xhr.setRequestHeader('x-amz-acl', 'public-read');
	    xhr.onload = function() {
	        callback(url);
	    };
	    xhr.onerror = function() {
	        alert("Could not upload file.");
	    };
	    xhr.send(file);
	};

}]);
