module.exports = function(express, app, __dirname) {
	function PromoRoutes() {}

	console.log('Loading Promo Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	PromoRoutes.get_promo_code = function(req, res, next) {
		if (!req.body.domain) {
			errorHandler.logAndReturn('Missing promo code domain data', 422, next);
			return;
		}
		orchHelper.getDocFromCollection('promo-codes', req.params.code)
		.then(function (result) {
			if (result) {
				if (result.active && (result.domain == req.body.domain)) {
					res.status(200).json(result);
				} else if (result.domain != req.body.domain) {
					errorHandler.logAndReturn('The entered code is applicable to this order', 400, next);
				} else {
					errorHandler.logAndReturn('The entered code has expired', 400, next);
				}
			} else {
				errorHandler.logAndReturn('Not a valid promo code', 404, next);
			}

		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving promo code information', 500, next, err, [req.params, req.body]);
		});
	};

	return PromoRoutes;
};