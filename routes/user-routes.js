module.exports = function(express, app, __dirname) {
	function UserRoutes() {}

	console.log('Loading User Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	// POST /user/give_ylift
	UserRoutes.give_ylift = function(req, res, next) {
		if (!req.body.orderid) {
			errorHandler.logAndReturn('Missing switch to y lift request data', 400, next, null, req.body);
			return;
		}
		orchHelper.getDocFromCollection('orders', req.body.orderid)
		.then(function (order) {
			if (order.profile != req.user.profile) {
				throw new Error('Registration order not made by user');
			} else {
				req.user.isYLIFT = true;
				return orchHelper.putDocToCollection('local-users', req.user.id, req.user);
			}
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error converting user account to Y Lift type', 500, next, err, [req.user, req.body]);
	  	}).done();
	  
	};

	// POST /validate_reset_token
	UserRoutes.validate_reset_token = function(req, res, next) {
		if (!req.body.token) {
			errorHandler.logAndReturn('Missing validate reset token request data', 400, next, null, req.body);
			return;
		}
		orchHelper.getDocFromCollection('reset-tokens', req.body.token)
	    .then(function (token) {
    		var now = new Date();
    		if (Date.parse(token.createdAt) + 86400000 < Date.parse(now)) {
	    		res.send({valid:false});
    		} else {
	    		res.send({valid:true});
    		}
	    })
	    .fail(function (err) {
	    	errorHandler.logAndReturn('Error validating reset token', 500, next, err, req.body);
	    }).done();
  	};

	return UserRoutes;
};