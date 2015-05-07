module.exports = function(express, app, __dirname) {
	function ProfileRoutes() {}

	console.log('Loading Profile Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.js'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Merchant 		= require('../models/merchant-profile'),
		Q               = require('q');

	// GET /profile/get_merchant/:profileid
	ProfileRoutes.get_merchant = function(req, res) {
	  orchHelper.getMerchantProfile(req.params.profileid)
	  	.then(function (result) {
	  		var isAdmin = false;
	  		if (result.owner == req.params.profileid) {
	  			console.log('profile-routes result', result);
	  			isAdmin = true;
	  		}
	  		res.status(200).json({profile:result, admin:isAdmin});
	  	})
	  	.fail(function (err) {
	  		res.status(500).json({err:err});
	  	});
	};

	// POST /profile/update_profile/:profileid
	ProfileRoutes.update_profile = function(req, res) {
	  orchHelper.updateProfile(req.params.profileid, req.body.profile)
	  	.then(function (result) {
	  		res.status(200).json(result);
	  	})
	  	.fail(function (err) {
	  		res.status(500).json({err:err});
	  	});
	};

	// POST /profile/add_merchant/:profileid
	ProfileRoutes.add_merchant = function(req, res) {
	  var merchant = Merchant.newProfile(req.params.profileid, req.body.category);
	  merchant.name = req.body.name;
	  merchant.regkey = req.body.regkey;
	  orchHelper.addMerchantProfile(merchant)
	  	.then(function (result) {
	  		res.status(200).json(merchant);
	  	})
	  	.fail(function (err) {
	  		res.status(500).json({err:err});
	  	});
	};

	// POST /profile/update_merchant/:profileid
	ProfileRoutes.update_merchant = function(req, res) {
	  orchHelper.updateMerchantProfile(req.body.profile)
	  	.then(function (result) {
	  		res.status(200).json(result);
	  	})
	  	.fail(function (err) {
	  		res.status(500).json({err:err});
	  	});
	};

	// POST /profile/delete_merchant/:profileid
	ProfileRoutes.delete_merchant = function(req, res) {
		orchHelper.getMerchantProfile(req.params.profileid)
		.then(function (result) {
			if (result.id == req.body.merchantid && result.owner == req.params.profileid) {
			  orchHelper.deleteMerchantProfile(req.body.merchantid)
		  	.then(function (result) {
		  		res.status(200).json({result:"deleted"});
		  	})
		  	.fail(function (err) {
		  		res.status(500).json({err:err});
		  	});
			} else {
		  	res.status(200).json({result:"unauthorized"});
			}
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	return ProfileRoutes;
};

