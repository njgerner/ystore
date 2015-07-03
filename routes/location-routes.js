module.exports = function(express, app, __dirname) {
	function LocationRoutes() {}

	console.log('Loading Location Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		aws             = require('aws-sdk'),
		Office          = require('../models/office'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	// GET /profile/addresses/:profielid
	LocationRoutes.get_addresses = function(req, res, next) {
		orchHelper.getAddressesByProfile(req.params.profileid)
		.then(function (result) {
			if (result) {
	  			res.status(200).json({addresses:result});
			} else {
	  			errorHandler.logAndReturn('No addresses found for profile', 404, next, null, [req.params, req.user]);
			}
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error adding address', 500, next, err, req.body);
	  	});
	 };

	 // GET /ylift_locations
	LocationRoutes.get_ylift_locations = function(req, res, next) {
		orchHelper.getYLIFTLocations()
		.then(function (result) {
			if (result) {
	  			res.status(200).json({locations:result});
			} else {
	  			errorHandler.logAndReturn('No y lift locations found', 404, next, null);
			}
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error getting y lift locations', 500, next, err);
	  	});
	 };

	// POST /profile/add_address/:profielid
	LocationRoutes.add_address = function(req, res, next) {
		var address = req.body.address;
		if (!req.params.profileid || !address) {
			errorHandler.logAndReturn('Missing address request data', 400, next, null, [req.params, req.body]);
			return;
		}
		var addressDoc = Office.newOffice(address);
		addressDoc.profile = req.params.profileid;
		if (address.yliftInd) {
			addressDoc.yliftInd = address.yliftInd;
		}
		orchHelper.putDocToCollection('addresses', addressDoc.id, addressDoc)
		.then(function (result) {
	  		res.status(200).json({address:addressDoc});
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error adding address', 500, next, err, req.body);
	  	});
	 };

	 // POST /profile/remove_address/:profielid
	LocationRoutes.remove_address = function(req, res, next) {
		var address = req.body.address;
		if (!req.params.profileid || !address) {
			errorHandler.logAndReturn('Missing address request data', 400, next, null, [req.params, req.body]);
			return;
		}
		orchHelper.removeDocFromCollection('addresses', address.id)
		.then(function (result) {
	  		res.status(200).json({success:result});
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error removing address', 500, next, err, req.body);
	  	});
	};

	// POST /profile/update_address/:profielid
	LocationRoutes.update_address = function(req, res, next) {
		var address = req.body.address;
		if (!req.params.profileid || !address) {
			errorHandler.logAndReturn('Missing address request data', 400, next, null, [req.params, req.body]);
			return;
		}
		address.updatedAt = new Date();
		orchHelper.putDocToCollection('addresses', address.id, address)
		.then(function (result) {
	  		res.status(200).json({address:result});
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error updating address', 500, next, err, req.body);
	  	});
	};

	return LocationRoutes;
};