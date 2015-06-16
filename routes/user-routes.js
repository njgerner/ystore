module.exports = function(express, app, __dirname) {
	function UserRoutes() {}

	console.log('Loading User Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		fs 				= require('fs');

	// POST /user/give_ylift
	UserRoutes.give_ylift = function(req, res) {
		orchHelper.getOrderByID(req.body.orderid)
		.then(function (order) {
			if (order.profile != req.user.profile) {
				return new Error('Registration order not made by user');
			} else {
				req.user.isYLIFT = true;
				return orchHelper.updateUserDoc(req.user);
			}
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		res.status(403).json({err:err});
	  	}).done();
	  
	};

	UserRoutes.validate_reset_token = function(req, res) {
    orchHelper.validateResetToken(req.body.token)
	    .then(function (valid) {
	    	if(valid) {
	    		res.send({valid:true});
	    	}else {
	    		res.send({valid:false});
	    	}
	    })
	    .fail(function (err) {
	    	res.send({error:err});
	    });
  	};

	return UserRoutes;
};