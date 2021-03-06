module.exports = function(express, app, __dirname) {
	function ProfileRoutes() {}

	console.log('Loading Profile Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Merchant 		= require('../models/merchant-profile'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		Q               = require('q');

	// GET /profile/get_merchant/:profileid
	ProfileRoutes.get_merchant = function(req, res, next) {
		var query = 'value.owner: ' + req.params.profile + ' OR value.members: ' + req.params.profile;
		var params = { limit: 1 };
		orchHelper.searchDocsFromCollection('merchant-profiles', query, params)
	  	.then(function (result) {
	  		var profile = result[0];
	  		if (profile) {
		  		var isAdmin = false;
		  		if (profile.owner == req.params.profileid) {
		  			isAdmin = true;
		  		}
		  		res.status(200).json({profile:profile, admin:isAdmin});
	  		} else {
	  			errorHandler.logAndReturn('No profile found for account', 404, next, null, [req.params, req.user]);
	  		}
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error retrieving profile for account', 500, next, err, [req.params, req.user]);
	  	});
	};

	// GET /profile/:profileid
	ProfileRoutes.get_profile = function(req, res, next) {
		orchHelper.getDocFromCollection('local-profile', req.params.profileid)
	  	.then(function (result) {
	  		if (result) {
		  		res.status(200).json({profile:result});
	  		} else {
	  			errorHandler.logAndReturn('No profile found for account', 404, next, null, [req.params, req.user]);
	  		}
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error retrieving profile for account', 500, next, err, [req.params, req.user]);
	  	});
	};
	
	// POST /profile/update_profile/:profileid
	ProfileRoutes.update_profile = function(req, res, next) {
		if (!req.body.profile) {
			errorHandler.logAndReturn('Missing update profile request data', 400, next, null, req.body);
			return;
		} 
		if (req.user.profile != req.params.profileid) {
			errorHandler.logAndReturn('Not authorized to update this profile', 401, next, null, req.body);
			return;
		}
		orchHelper.putDocToCollection('local-profiles', req.params.profileid, req.body.profile)
	  	.then(function (result) {
	  		res.status(200).json(req.body.profile);
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error updating account profile', 500, next, err, [req.params, req.body]);
	  	});
	};

	// POST /profile/add_merchant/:profileid
	ProfileRoutes.add_merchant = function(req, res, next) {
		var merchant = Merchant.newProfile(req.params.profileid, req.body.category);
		merchant.name = req.body.name;
		merchant.regkey = req.body.regkey;
		orchHelper.addMerchantProfile(merchant)
	  	.then(function (result) {
	  		return orchHelper.activateRegKey(req.body.regkey, merchant.id);
	  	})
	  	.then(function (result) {
	  		res.status(200).json(merchant);
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error adding merchant to account profile', 500, next, err, [req.params, req.body]);
	  	});
	};

	// POST /profile/update_merchant
	// POST admin/profile/update_merchant
	ProfileRoutes.update_merchant = function(req, res, next) {
		if (!req.body.profile) {
			errorHandler.logAndReturn('Missing update merchant request data', 400, next, null, req.body);
			return;
		} 
		orchHelper.putDocToCollection('merchant-profiles', req.body.profile.id, req.body.profile)
	  	.then(function (result) {
	  		res.status(200).json({profile:req.body.profile});
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error updating merchant profile', 500, next, err, req.body);
	  	});
	};

	// TODO: Add this route functionality
	// // POST /profile/delete_merchant/:profileid
	// ProfileRoutes.delete_merchant = function(req, res, next) {
	// 	orchHelper.getDocFromCollection('merchant-profiles', req.params.profileid)
	// 	.then(function (result) {
	// 		if (result) {
	// 			if (result.id == req.body.merchantid && result.owner == req.params.profileid) {
	// 				orchHelper.removeDocFromCollection('merchant-profiles', req.body.merchantid)
	// 				orchHelper.deleteMerchantProfile(req.body.merchantid)
	// 			  	.then(function (result) {
	// 			  		res.status(200).json({result:"deleted"});
	// 			  	})
	// 			  	.fail(function (err) {
	// 			  		errorHandler.logAndReturn('Error deleting merchant profile', 500, next, err, [req.params, req.body]);
	// 			  	});
	// 			} else {
	// 		  		errorHandler.logAndReturn('Unauthorized to delete merchant account', 401, next, null, [req.params, req.body]);
	// 			}
	// 		} else {
	// 			errorHandler.logAndReturn('No merchant account found to delete', 401, next, null, [req.params, req.body]);
	// 		}
	// 	})
	// 	.fail(function (err) {
	// 		errorHandler.logAndReturn('Error deleting merchant profile', 500, next, err, [req.params, req.body]);
	// 	});
	// };

	return ProfileRoutes;
};

