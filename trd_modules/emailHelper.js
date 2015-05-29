var Q 				= require('q'),
	orchHelper 		= require('./orchestrateHelper'),
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
		"from_email": "message." + process.env.DEFAULT_EMAIL_FROM,
		"from_name": "YLIFT Team",
		"to": [{
			"email": email,
			"name": name,
			"type": "to"
		}],
		"headers": {
			"Reply-To": "message." + process.env.DEFAULT_EMAIL_REPLY_TO
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

exports.sendOrdersToMerchants = function(order) {
	console.log('sending orders to merchants', order);
	var deferred = Q.defer();
	var productPromises = [];
	var products = [];

	order.products.forEach(function (product, index) {
		productPromises.push(orchHelper.getProductByID(product.productnumber));
	});

	Q.all(productPromises)
    .then(function (products) {
    	console.log('products that are included in said order', products);
		var promises = [];
		order.merchants.forEach(function (merchant, index) {
			var def = Q.defer();
			orchHelper.getMerhantProfile(merchant)
			.then(function (profile) {
				console.log('got merchant profile', profile);
				var template_content = [{
			        "name": "order",
			        "content": order
			    }];

				var message = {
					"subject": "YLIFT Store Order",
					"from_email": "message." + process.env.DEFAULT_EMAIL_FROM,
					"from_name": "YLIFT Team",
					"to": [{
						"email": profile.email,
						"name": profile.name,
						"type": "to"
					}],
					"headers": {
						"Reply-To": "message." + process.env.DEFAULT_EMAIL_REPLY_TO
					},
					"merge": true,
					"merge_language": "mailchimp",
					"tags": ["order", "orders", "merchant", profile.name, "ylift"]
				};

				mandrill_client.messages.sendTemplate({"template_name": "merchant_order_notification", "template_content": template_content, "message": message},
					function (result) {
						def.resolve(result);
					}, function (err) {
						console.log('error sending welcome email', err.name, err.message);
						def.reject(new Error(err.message));
					});

			}, function (err) {
				def.reject(new Error(err.message));
			});

			promises.push(def.promise);
		});
		return Q.all(promises)
    })
	.then(function (result) {
		console.log('result of sending orders to merchants', result);
		deferred.resolve(result);
	})
    .fail(function (err) {
    	console.log('there was an error!', err);
    	deferred.reject(err);
    });

    return deferred.promise;
};