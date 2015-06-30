module.exports = function(express, app, __dirname) {
	function AdminRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	// GET /admin/all_profiles
	AdminRoutes.all_profiles = function(req, res, next) {
		orchHelper.getAllProfiles()
		.then(function (data) {
			if (data) {
				res.status(200).json({profiles:data});
			} else {
				errorHandler.logAndReturn('No profiles found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting all profiles from admin', 500, next, err);
		});
	};

	// GET /admin/profile
	AdminRoutes.get_profile = function(req, res, next) {
		orchHelper.getProfile(req.params.profileid)
		.then(function (data) {
			if (data) {
				res.status(200).json({profile:data});
			} else {
				errorHandler.logAndReturn('No profile found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting profile from admin', 500, next, err);
		});
	};

	// GET /admin/all_orders
	AdminRoutes.all_orders = function(req, res, next) {
		orchHelper.getAllOrders()
		.then(function (data) {
			if (data) {
				res.status(200).json({orders:data});
			} else {
				errorHandler.logAndReturn('No orders found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting all orders from admin', 500, next, err);
		});
	};

	// GET /admin/all_ylift_profiles
	AdminRoutes.all_ylift_profiles = function(req, res, next) {
		orchHelper.getAllYLIFTProfiles()
		.then(function (data) {
			if (data) {
				res.status(200).json({profiles:data});				
			} else {
				errorHandler.logAndReturn('No Y Lift profiles found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting Y Lift profiles from admin', 500, next, err);
		});
	};

	AdminRoutes.get_merchant_name = function(req, res) {
		orchHelper.getMerchantByID(req.body.id)
		.then(function (merchant) {
			res.send({merchant:merchant});
		})
		.fail(function (err) {
			res.send({error:err});
		});
	};

	AdminRoutes.get_promos = function(req, res, next) {
		orchHelper.getAllPromoCodes()
		.then(function (data) {
			if (data) {
				res.status(200).json({promos:data});
			} else {
				errorHandler.logAndReturn('No promo codes found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting promo codes from admin', 500, next, err);
		});
	};

	AdminRoutes.add_promo = function(req, res, next) {
		orchHelper.addPromo(req.body.promo)
		.then(function (data) {
			if (data) {
				res.status(200).json({promo:data});
			} else {
				errorHandler.logAndReturn('Error adding promo code from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error adding promo code from admin', 500, next, err);
		});
	};

	AdminRoutes.delete_promo = function(req, res, next) {
		orchHelper.deletePromo(req.body.promo)
		.then(function (data) {
			if (data) {
				res.status(200).json({success:true});
			} else {
				errorHandler.logAndReturn('Error deleting promo code from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error deleting promo code from admin', 500, next, err);
		});
	};

	AdminRoutes.add_product = function(req, res, next) {
		// orchHelper.getAllOrders()
		// .then(function (data) {
		// 	if (data) {
		// 		res.status(200).json({orders:data});
		// 	} else {
		// 		errorHandler.logAndReturn('No orders found from admin', 404, next);
		// 	}
		// })
		// .fail(function (err) {
		// 	errorHandler.logAndReturn('Error getting all orders from admin', 500, next, err);
		// });
	};

	return AdminRoutes;
};