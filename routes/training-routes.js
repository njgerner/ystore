module.exports = function(express, app, __dirname) {
	function TrainingRoutes() {}

	console.log('Loading Training Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		fs 				= require('fs');

	// POST /training_dates
	TrainingRoutes.get_dates = function(req, res) {
		orchHelper.getTrainingDates()
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		res.status(403).json({err:'could not get training dates'});
	  	}).done();
	  
	};

	return TrainingRoutes;
};