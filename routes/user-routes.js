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
		orchHelper.getOrderByID(req.body.orderid)
		.then(function (order) {
			if (order.profile != req.user.profile) {
				throw new Error('Registration order not made by user');
			} else {
				req.user.isYLIFT = true;
				return orchHelper.updateUserDoc(req.user);
			}
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error converting user account to Y Lift type', 500, next, err, [req.user, req.body]);
	  	}).done();
	  
	};

	UserRoutes.validate_reset_token = function(req, res, next) {
    orchHelper.validateResetToken(req.body.token)
	    .then(function (valid) {
	    	if(valid) {
	    		res.send({valid:true});
	    	}else {
	    		res.send({valid:false});
	    	}
	    })
	    .fail(function (err) {
	    	errorHandler.logAndReturn('Error validating reset token', 500, next, err, req.body);
	    });
  	};

	return UserRoutes;
};