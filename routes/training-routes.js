module.exports = function(express, app, __dirname) {
	function TrainingRoutes() {}

	console.log('Loading Training Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	// GET /training_dates
	TrainingRoutes.get_dates = function(req, res, next) {
		var query = 'value.available:true';
      	var params = { limit: 100 };
		orchHelper.searchDocsFromCollection('training-dates', query, params)
		.then(function (result) {
			if (result) {
				res.status(200).json(result);
			} else {
				errorHandler.logAndReturn('No training dates found', 404, next);
			}
		})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error getting training dates', 500, next, err);
	  	}).done();
	  
	};

	// GET /training_dates/:profileid
	TrainingRoutes.get_dates_by_profile = function(req, res, next) {
		var query = 'value.profile:' + req.params.profileid;
      	var params = { limit: 20 };
		orchHelper.searchDocsFromCollection('training-dates', query, params)
		.then(function (result) {
			if (result) {
				res.status(200).json({dates:result});
			} else {
				errorHandler.logAndReturn('No training dates found', 404, next);
			}
		})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error getting training dates', 500, next, err);
	  	}).done();
	  
	};

	// POST /training_materials
	TrainingRoutes.get_materials = function(req, res, next) {
		// var query = 'value.profile:' + req.params.profileid;
  //     	var params = { limit: 20 };
		// orchHelper.searchDocsFromCollection('training-dates', query, params)
		// .then(function (result) {
		// 	if (result) {
		// 		res.status(200).json({dates:result});
		// 	} else {
		// 		errorHandler.logAndReturn('No training dates found', 404, next);
		// 	}
		// })
	 //  	.fail(function (err) {
	 //  		errorHandler.logAndReturn('Error getting training dates', 500, next, err);
	 //  	}).done();
	  
	};

	return TrainingRoutes;
};