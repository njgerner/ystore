module.exports = function(express, app, __dirname) {
	function ProductRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.js'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		fs 				= require('fs');

	// GET /product_rating/:productnumber
	ProductRoutes.get_rating = function(req, res) {
		var pn = req.params.productnumber;
		orchHelper.getProductRating(pn)
		.then(function (data) {
			res.status(200).json({data:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// GET /product_reviews/:productnumber
	ProductRoutes.get_reviews = function(req, res) {
		var pn = req.params.productnumber;
		orchHelper.getProductReviews(pn)
		.then(function (data) {
			res.status(200).json({data:data});
		})
		.fail(function (err) {
			res.status(500).json({err:err});
		});
	};

	// POST /submit_review
	ProductRoutes.submit_review = function(req, res) {
		var review = req.body.review;
		orchHelper.submitReview(review)
		.then(function (result) {
	  		res.status(201).json(result);
	  	})
	  	.fail(function (err) {
	  		res.status(500).json({err:err});
	  	});
	};

	// POST /add_product
	ProductRoutes.add_product = function(req, res) {
		var merchant = req.body.merchant;
		var key = merchant.name.substr(0, 1).toLowerCase();
		var product = req.body.product;
		orchHelper.getMerchantProductCount(merchant.id)
		.then(function (count) {
			count++;
			while (count.toString().length < 2) {
				count = "0" + count.toString();
			}
			return merchant.productKey + "-" + count;
		})
		.then(function (pn) {
			console.log('pn', pn);
			product.currency = "USD";
			product.productnumber = pn;
			// TODO: should eventually move increment setting to client
			product.attributes = {
				"increment": "1",
				"vendor": merchant.id
			};
			return orchHelper.addProduct(product, req.user.profile);
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		console.log('error from something', err);
	  		res.status(403).json({err:'profile not authorized to add product'});
	  	}).done();
	};

	// POST /deactivate_product
	ProductRoutes.deactivate_product = function(req, res) {
		orchHelper.getMerchantProfile(req.user.profile)
		.then(function (res) {
			return orchHelper.deactivateProduct(req.body.productid);
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		res.status(403).json({err:'profile not authorized to delete product'});
	  	}).done();
	};

	// POST /update_product
	ProductRoutes.update_product = function(req, res) {
		orchHelper.getMerchantProfile(req.user.profile)
		.then(function (res) {
			return orchHelper.updateProduct(req.body.product, req.user.profile);
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		res.status(403).json({err:'profile not authorized to edit product'});
	  	}).done();
	};

	return ProductRoutes;
};