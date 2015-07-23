module.exports = function(express, app, __dirname) {
	function AdminRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		Address         = require('../models/address'),
		fs 				= require('fs'),
		crypto        	= require('crypto');

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

	AdminRoutes.update_user_profile = function(req, res, next) {
		if(!req.body.profile) {
			errorHandler.logAndReturn('Missing data admin update user profile', 400, next, {}, req.body);
		}
		var profile = req.body.profile;
		profile.updatedAt = new Date();
		orchHelper.putDocToCollection('local-profiles', profile.id, profile)
		.then(function (data) {
			res.status(200).json({profile:data});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating user profile from admin', 500, next, err, req.body);
		});
	};

	AdminRoutes.addresses = function(req, res, next) {
		var query = "value.profile: " + req.params.profileid;
		var params = {limit:20};
		orchHelper.searchDocsFromCollection('addresses', query, params)
		.then(function (data) {
			res.status(200).json({addresses:data});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting addresses from admin', 500, next, err, req.params);
		});
	};

	AdminRoutes.add_address = function(req, res, next) {
		if(!req.body.address) {
			errorHandler.logAndReturn('Missing data admin add address', 400, next, null, req.body);
		}
		var addressDoc = Address.newAddress(req.body.address);
		orchHelper.putDocToCollection('addresses', addressDoc.id, addressDoc)
		.then(function (data) {
			res.status(200).json({address:addressDoc});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error adding address from admin', 500, next, err, req.body);
		});
	};

	AdminRoutes.update_address = function(req, res, next) {
		if(!req.body.address.id) {
			errorHandler.logAndReturn('Missing data update address', 400, next, {}, req.body);
			return;
		}
		var address = req.body.address;
		orchHelper.putDocToCollection('addresses', address.id, address)
		.then(function (data) {
			res.status(200).json({address:data});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating address from admin', 500, next, err, req.body);
		});
	};

	AdminRoutes.delete_address = function(req, res, next) {
		if(!req.body.address) {
			errorHandler.logAndReturn('Missing data admin delete address', 400, next, {}, req.body);
		}
		var address = req.body.address;
		orchHelper.removeDocFromCollection('addresses', address.id, address)
		.then(function (data) {
			res.status(200).json({success:true});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error deleting address from admin', 500, next, err, req.body);
		});
	};

	// GET /admin/all_profiles
	AdminRoutes.all_products = function(req, res, next) {
		orchHelper.getAllProducts()
		.then(function (data) {
			if (data) {
				res.status(200).json({products:data});
			} else {
				errorHandler.logAndReturn('No products found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting all products from admin', 500, next, err);
		});
	};

	AdminRoutes.get_product = function(req, res, next) {
		orchHelper.getDocFromCollection('products', req.params.productnumber)
		.then(function (data) {
			if (data) {
				res.status(200).json({product:data});
			} else {
				errorHandler.logAndReturn('No product found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting product from admin', 500, next, err, req.params);
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

	AdminRoutes.all_merchants = function(req, res, next) {
		orchHelper.getAllMerchantProfiles()
		.then(function (data) {
			if (data) {
				res.status(200).json({profiles:data});				
			} else {
				errorHandler.logAndReturn('No merchant profiles found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting merchant profiles from admin', 500, next, err, [req.user]);
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
			errorHandler.logAndReturn('Error getting promo codes from admin', 500, next, err, [req.user]);
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
			errorHandler.logAndReturn('Error adding promo code from admin', 500, next, err, [req.user, req.body]);
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
			errorHandler.logAndReturn('Error deleting promo code from admin', 500, next, err, [req.user, req.body]);
		});
	};

	AdminRoutes.get_available_keys = function(req, res, next) {
		orchHelper.getAvailableRegKeys()
		.then(function (keys) {
			if (keys) {
				res.status(200).json({keys:keys});				
			} else {
				errorHandler.logAndReturn('No available keys found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting available keys from admin', 500, next, err, [req.user]);
		});
	};

	AdminRoutes.get_hash = function(req, res, next) {
		orchHelper.getUserHashByProfileID(req.body.profileid)
		.then(function (hash) {
			if (hash) {
				res.status(200).json({hash:hash});				
			} else {
				errorHandler.logAndReturn('No hash found from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error getting user hash from admin', 500, next, err, [req.user, req.body]);
		});
	};

	AdminRoutes.add_regkey = function(req, res, next) {
		orchHelper.addRegKey(req.body.regkey)
		.then(function (regkey) {
			if (regkey) {
				res.status(200).json({regkey:regkey});				
			} else {
				errorHandler.logAndReturn('Reg key not added from admin', 404, next);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error adding regkey from admin', 500, next, err, [req.user, req.body]);
		});
	};

	AdminRoutes.email_availability = function(req, res, next) {
		if(!req.body.email) {
			errorHandler.logAndReturn('Missing data from admin email availability', 404, next);
		}
		var query = 'value.email: ' + req.body.email;
		var params = {
			limit: 1
		};
		orchHelper.searchDocsFromCollection('local-users', query, params)
		.then(function (result) {
			if(result.length > 0) {
				res.status(200).json({available:false});
			} else {
				res.status(200).json({available:true});
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error finding email from admin', 500, next, err, req.body);
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