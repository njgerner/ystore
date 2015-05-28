var Q 				= require('q'),
	mandrill 		= require('mandrill-api/mandrill'),
	mandrill_client = new mandrill.Mandrill(process.env.MANDRILL);

exports.sendWelcome = function(name, email) {
	var deferred = Q.defer();
	var template_content = [{
        "name": "example name",
        "content": "example content"
    }];
	var message = {
		"subject": "Welcome to the YLIFT Network",
		"from_email": "message.support@ylift.io",
		"from_name": "YLIFT Team",
		"to": [{
			"email": email,
			"name": name,
			"type": "to"
		}],
		"headers": {
			"Reply-To": "message.mitch@ylift.io"
		},
		"tags": ["welcome", "ylift"]
	};
	mandrill_client.messages.sendTemplate({"template_name": "welcome", "template_content": template_content, "message": message},
		function (result) {
			deferred.resolve(result);
		}, function (err) {
			console.log('error sending welcome email', err.name, err.message);
			deferred.reject(new Error(err.message));
		});

	return deferred.promise;
};