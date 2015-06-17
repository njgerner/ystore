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

exports.newUserTeamNotification = function(user) {
	console.log('newUserTeamNotification', user);
	var toArr = process.env.DEFAULT_NOTIFY_LIST.toString().split(';');
    var to = [];
    console.log('to arr', toArr);
    for (var i = 0; i < toArr.length; i++) {
        var emailSplit = toArr[i].split("@");
        to[i] = {};
        to[i].email = toArr[i];
        to[i].name = emailSplit[0];
        to[i].type = "to";
    }
    console.log('to result', to);
	var type = "Individual";
	if(user.isYLIFT) {
		type = "YLift";
	}
	var name = user.name;
	if(name === null) {
		name = "N/A";
	}
	var deferred = Q.defer();
	var template_content = [{
        "name": "example name",
        "content": "example content"
    }];
	var message = {
		"subject": "We have a new user!",
		"from_email": "message." + process.env.DEFAULT_EMAIL_FROM,
		"from_name": "YLIFT Team",
		"to": to,
		"headers": {
			"Reply-To": "message." + process.env.DEFAULT_EMAIL_REPLY_TO
		},
		"merge": true,
		"merge_language": "handlebars",
		"global_merge_vars": [
			{
				"name": "type",
				"content": type
			}, {
				"name": "name",
				"content": name
			}, {
				"name": "email",
				"content": user.email
			}],
		"tags": ["welcome", "ylift"]
	};
	console.log('about to send new user notification', template_content, message);
	mandrill_client.messages.sendTemplate({"template_name": "new_user_notification", "template_content": template_content, "message": message},
		function (result) {
			console.log('result', result);
			deferred.resolve(result);
		}, function (err) {
			console.log('error sending welcome email', err.name, err.message);
			deferred.reject(new Error(err.message));
		});

	return deferred.promise;
};

exports.sendOrdersToMerchants = function(order) {
	var deferred = Q.defer();
	var productPromises = [];
	var products = [];

	order.products.forEach(function (product, index) {
		productPromises.push(orchHelper.getProductByID(product.productnumber));
	});

	Q.all(productPromises)
    .then(function (products) {
		var promises = [];
		var productContent = {};
		for (var i = 0; i < products.length; i++) {
			if (productContent[products[i].attributes.vendor] === undefined) {
				productContent[products[i].attributes.vendor] = [];
			}
			for (var j = 0; j < order.products.length; j++) {
				if (order.products[j].productnumber == products[i].productnumber) {
					products[i].quantity = order.products[j].quantity;
					products[i].total = order.products[j].quantity * products[i].price;
				}
			}
			productContent[products[i].attributes.vendor].push(products[i]);
		}
		order.merchants.forEach(function (merchant, index) {
			var def = Q.defer();
			orchHelper.getMerchantProfile(merchant)
			.then(function (profile) {
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
					"merge_language": "handlebars",
					"global_merge_vars": [
						{
							"name": "orderid",
							"content": order.id
						}, {
							"name": "total",
							"content": order.total
						}, {
							"name": "count",
							"content": order.products.length
						}, {
							"name": "shipTo",
							"content": order.shipTo
						}, {
							"name": "products",
							"content": productContent[merchant]
						}
					],
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
		return Q.all(promises);
    })
	.then(function (result) {
		deferred.resolve(result);
	})
    .fail(function (err) {
    	console.log('there was an error!', err);
    	deferred.reject(err);
    });

    return deferred.promise;
};

exports.sendOrdersToTeam = function(order) {
	var productPromises = [];

	order.products.forEach(function (product, index) {
		productPromises.push(orchHelper.getProductByID(product.productnumber));
	});

	return Q.all(productPromises)
    .then(function (products) {
    	var toArr = process.env.DEFAULT_NOTIFY_LIST.toString().split(';');
    	var to = [];
    	for (var i = 0; i < toArr.length; i++) {
    		var emailSplit = toArr[i].split("@");
    		to[i] = {};
    		to[i].email = toArr[i];
    		to[i].name = emailSplit[0];
    		to[i].type = "to";
    	}
		var template_content = [{
	        "name": "order",
	        "content": order
	    }];

		var message = {
			"subject": "YLIFT Store Order",
			"from_email": "message." + process.env.DEFAULT_EMAIL_FROM,
			"from_name": "YLIFT Team",
			"to": to,
			"headers": {
				"Reply-To": "message." + process.env.DEFAULT_EMAIL_REPLY_TO
			},
			"merge": true,
			"merge_language": "handlebars",
			"global_merge_vars": [
				{
					"name": "orderid",
					"content": order.id
				}, {
					"name": "total",
					"content": order.total
				}, {
					"name": "count",
					"content": order.products.length
				}, {
					"name": "shipTo",
					"content": order.shipTo
				}, {
					"name": "products",
					"content": products
				}, {
					"name": "merchant_count",
					"content": order.merchants.length
				}, {
					"name": "profileid",
					"content": order.profile || 'guest'
				}
			],
			"tags": ["order", "orders", "team", "ylift"]
		};

		return mandrill_client.messages.sendTemplate({"template_name": "team_order_notification", "template_content": template_content, "message": message});
    });
};