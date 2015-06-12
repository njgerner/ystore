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
	StoreRoutes.merchant_orders = function(req, res) {
		orchHelper.getMerchantOrders(req.params.merchantid)
		.then(function (data) {
			res.status(200).json({orders:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// GET /get_products_by_merchant/:merchantid
	StoreRoutes.get_products_by_merchant = function(req, res) {
		orchHelper.getMerchantProducts(req.params.merchantid)
		.then(function (data) {
			res.status(200).json({products:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// POST /update_order
	StoreRoutes.update_order = function(req, res) {
		orchHelper.updateOrder(req.body.order)
		.then(function (data) {
			res.status(200).json({order:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// POST /add_check_order
	StoreRoutes.create_check_order = function(req, res) {
		var order = Order.newOrder(req.body.total, req.body.customer);
		orchHelper.addOrder(order)
		.then(function (data) {
			res.status(200).json({order:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// POST /store
	StoreRoutes.get_storefront = function(req, res) {
		if (req.body.ylift) {
			orchHelper.getAllProducts()
			.then(function (data) {
				res.status(200).json({products:data});
			})
			.fail(function (err) {
				res.status(500).json({err:err});
			});
		} else {
			orchHelper.getPublicProducts()
			.then(function (data) {
				res.status(200).json({products:data});
			})
			.fail(function (err) {
				res.status(500).json({err:err});
			});			
		}
	};

	return StoreRoutes;
};