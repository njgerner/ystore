module.exports = function(express, app, __dirname) {
	function StoreRoutes() {}

	console.log('Loading Store Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.js'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
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

	return StoreRoutes;
};