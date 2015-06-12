module.exports = function(express, app, __dirname) {
	function AdminRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		fs 				= require('fs');

	// GET /admin/all_profiles
	AdminRoutes.all_profiles = function(req, res) {
		orchHelper.getAllProfiles()
		.then(function (data) {
			res.status(200).json({profiles:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// GET /admin/all_ylift_profiles
	AdminRoutes.all_ylift_profiles = function(req, res) {
		orchHelper.getAllYLIFTProfiles()
		.then(function (data) {
			res.status(200).json({profiles:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	return AdminRoutes;
};