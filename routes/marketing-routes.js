module.exports = function(express, app, __dirname) {
	function MarketingRoutes() {}

	console.log('Loading Marketing Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	MarketingRoutes.get_all_testimonials = function(req, res, next) {
		params = { limit: 100 };
		orchHelper.listDocsFromCollection('testimonials', params)
		.then(function (data) {
			if (data) {
				res.status(200).json({testimonials:data});
			} else {
				errorHandler.logAndReturn('No testimonials found', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting testimonials', 500, next, err);
		});
	};

	return MarketingRoutes;
};