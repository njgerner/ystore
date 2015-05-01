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

	return ProductRoutes;
};