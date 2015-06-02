trdServices.service('awsService', ['$http',
	function($http) {

	this.getSignedRequest = function(file, callback) {
		$http({method:'GET', url:'/sign_s3?file_name=' + file.name + '&file_type=' + file.type}).
			success(function(data, status, headers, config) {
				console.log('getSignedRequest', file, data);
				callback(file, data.signed_request, data.url);
			}).
			error(function(data, status, headers, config) {
				console.log("getting profile failed:");
				console.log(data);
				callback();
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
