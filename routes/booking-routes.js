module.exports = function(express, app, __dirname) {
	function BookingRoutes() {}

	console.log('Loading Booking Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		emailHelper     = require('../trd_modules/emailHelper'),
		fs 				= require('fs');

	BookingRoutes.request_appt = function(req, res, next) {
		if (!req.params.providerid || !req.body.patient.id || !req.body.date || !req.body.office) {
			errorHandler.logAndReturn('Missing appointment request data', 400, next, null, [req.params, req.body]);
			return;
		}
		var apptDoc = {
			id: req.body.patient.id + "_" + req.body.date + "_" + req.params.providerid,
			patient: req.body.patient.id,
			date: req.body.date,
			office: req.body.office.id,
			provider: req.params.providerid,
			procedure: req.body.procedure,
			status: "requested",
			createdAt: new Date(),
			updatedAt: new Date()
		};
		orchHelper.putDocToCollection('appointments', apptDoc.id, apptDoc)
		.then(function (result) {
			apptDoc.id = result.key;
			res.status(201).json({appt:apptDoc});
			orchHelper.getDocFromCollection('local-profiles', req.params.providerid)
			.then(function (profile) {
				emailHelper.sendApptUpdateToPatient(apptDoc, req.body.patient, profile, req.body.office).done();
				emailHelper.sendApptNoticeToProvider(apptDoc, req.body.patient, req.body.office).done();
			});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error requesting appointment', 500, next, err, [req.params, req.body]);
		});
	};

	BookingRoutes.update_appt = function(req, res, next) {
		if (!req.body.appt) {
			errorHandler.logAndReturn('Missing appointment update data', 400, next, null, [req.user, req.body]);
			return;
		}

		if ((req.body.appt.patient != req.user.profile) && (req.body.appt.provider != req.user.profile)) {
			errorHandler.logAndReturn('User not authorized to update this appointment', 400, next, null, [req.user, req.body]);
			return;
		}
		req.body.appt.updatedAt = new Date();
		orchHelper.putDocToCollection('appointments', req.body.appt.id, req.body.appt)
		.then(function (result) {
			res.status(201).json({appt:req.body.appt});
			orchHelper.getDocFromCollection('addresses', req.body.appt.office)
			.then(function (office) { emailHelper.sendApptUpdateToPatient(req.body.appt, req.body.patient, office).done(); });
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating appointment', 500, next, err, [req.params, req.body]);
		});
	};

	BookingRoutes.get_patient_appts = function(req, res, next) {
		var query = 'value.patient: ' + req.params.profileid + ' AND NOT value.status: \'rejected\'';
		var params = { limit: 100 };
		orchHelper.searchDocsFromCollection('appointments', query, params)
		.then(function (result) {
			res.status(200).json({appts:result});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error fetching patient appointments', 500, next, err, req.params);
		});
	};

	BookingRoutes.get_provider_appts = function(req, res, next) {
		if (!req.body.office) {
			errorHandler.logAndReturn('Missing appointment request data', 400, next, null, [req.user, req.body]);
			return;
		}
		orchHelper.findProviderAppts(req.params.providerid, req.body.office, req.body.start, req.body.end)
		.then(function (result) {
			res.status(200).json({appts:result});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error fetching patient appointments', 500, next, err, [req.params, req.body]);
		});
	};

	return BookingRoutes;
};