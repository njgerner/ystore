module.exports = function(express, app, __dirname) {
	function RegRoutes() {}

	console.log('Loading Registration Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	RegRoutes.verify_key = function(req, res) {
		if (!req.body.key) {
			errorHandler.logAndReturn('Missing verify key request data', 400, next, null, req.body);
			return;
		}
		orchHelper.getDocFromCollection('registration-keys', req.body.key)
	  	.then(function (key) {
	  		if (key && key.status == "verified" && !key.isActive) {
	  			res.status(200).json({status:"verified"});
	  		} else if (key && key.status == "verified" && key.isActive) {
	  			orchHelper.getDocFromCollection('merchant-profiles', key.owner)
	  			.then(function(result) {
	  				res.status(200).json({status:"can_add", merchant:result});
	  			}, function (err) {
	  				throw new Error(err.body);
	  			});
	  		} else {
	  			res.status(200).json({status:"unverified"});
	  		}
	  	})
	  	.fail(function (err) {
	  		res.status(405).json({status:"invalid"});
	  	});
	};

	return RegRoutes;
};