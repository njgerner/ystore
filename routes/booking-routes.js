module.exports = function(express, app, __dirname) {
	function BookingRoutes() {}

	console.log('Loading Booking Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	BookingRoutes.request_appt = function(req, res, next) {
		if (!req.params.providerid || !req.body.patientid || !req.body.date) {
			errorHandler.logAndReturn('Missing appointment request data', 400, next, null, [req.params, req.body]);
		}
		var apptDoc = {
			patient: req.body.patientid,
			date: req.body.date,
			provider: req.params.providerid,
			procedure: req.body.procedure,
			status: "requested",
			createdAt: new Date(),
			updatedAt: new Date()
		};
		orchHelper.postDocToCollection('appointments', apptDoc)
		.then(function (result) {
			apptDoc.id = result.key;
			res.status(201).json({appt:apptDoc});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error requesting appointment', 500, next, err, [req.params, req.body]);
		});
	};

	BookingRoutes.get_patient_appts = function(req, res, next) {
		orchHelper.findPatientAppts(req.params.patientid)
		.then(function (result) {
			res.status(200).json({appts:result});
		})
		.fail(function (err) {
			console.log('error getting patient appts', err);
			errorHandler.logAndReturn('Error fetching patient appointments', 500, next, err, req.params);
		});
	};

	BookingRoutes.get_provider_appts = function(req, res, next) {
		orchHelper.findProviderAppts(req.params.providerid, req.body.start, req.body.end)
		.then(function (result) {
			res.status(200).json({appts:result});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error fetching patient appointments', 500, next, err, req.params);
		});
	};

	return BookingRoutes;
};