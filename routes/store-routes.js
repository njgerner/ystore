module.exports = function(express, app, __dirname) {
	function StoreRoutes() {}

	console.log('Loading Store Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Order 			= require('../models/order'),
		Q               = require('q'),
		fs 				= require('fs');

	// GET /merchant_orders/:merchantid
	StoreRoutes.merchant_orders = function(req, res, next) {
		orchHelper.getMerchantOrders(req.params.merchantid)
		.then(function (data) {
			if (data) {
				res.status(200).json({orders:data});
			} else {
				errorHandler.logAndReturn('No merchant orders found for this account', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving merchant orders for account', 500, next, err, req.params);
		});
	};

	// GET /get_products_by_merchant/:merchantid
	StoreRoutes.get_products_by_merchant = function(req, res, next) {
		orchHelper.getMerchantProducts(req.params.merchantid)
		.then(function (data) {
			if (data) {
				res.status(200).json({products:data});
			} else {
				errorHandler.logAndReturn('No merchant products found for this account', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving merchant products for account', 500, next, err, req.params);
		});
	};

	// POST /update_order
	StoreRoutes.update_order = function(req, res, next) {
		orchHelper.updateOrder(req.body.order)
		.then(function (data) {
			res.status(200).json({order:data});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating order', 500, next, err, req.body);
		});
	};

	// POST /add_check_order
	StoreRoutes.create_check_order = function(req, res, next) {
		var order = Order.newOrder(req.body.total, req.body.customer);
		orchHelper.addOrder(order)
		.then(function (data) {
			res.status(200).json({order:data});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error creating check order', 500, next, err, req.body);
		});
	};

	return StoreRoutes;
};