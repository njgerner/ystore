module.exports = function(express, app, __dirname) {
	function ProductRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		aws 			= require('aws-sdk'),
		AWS_ACCESS_KEY  = process.env.AWS_ACCESS,
		AWS_SECRET_KEY  = process.env.AWS_SECRET,
		S3_BUCKET  		= process.env.S3_BUCKET,
		Q               = require('q'),
		flow            = require('../assets/js/flow-node')(process.env.TMPDIR),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fsExtra 		= require('fs.extra');
		fs 				= require('fs');

	function updateAWSImageLocation (from, to) {
		aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
		var s3 = new aws.S3();
		var s3_params = {
			Bucket: S3_BUCKET,
			Key: to,
			CopySource: S3_BUCKET + "/" + from,
	        ACL: 'public-read'
		};
		s3.copyObject(s3_params, function (err, data) {
			if (err) console.log('error s3 copyObject', err, err.stack);
			else 	 console.log('data s3 copyObject', data);
		});
	}

	  // GET get_product_by_id/:productnumber
	ProductRoutes.get_product = function(req, res, next) {
		orchHelper.getDocFromCollection('products', req.params.productnumber)
	  	.then(function (result) {
	    	if (result) {
	      		res.status(200).json({product: result});
	    	} else {
	      		errorHandler.logAndReturn('Not a valid product id', 404, next, null, req.params);
	    	}
	  	})
	  	.fail(function (err) {
	    	errorHandler.logAndReturn('Error retrieving product by id', 500, next, err, req.params);
	  	});
	};

	// GET /product_rating/:productnumber
	ProductRoutes.get_rating = function(req, res, next) {
		var pn = req.params.productnumber;
		orchHelper.getProductRating(pn)
		.then(function (data) {
			if (data) {
				res.status(200).json({data:data});
			} else {
				errorHandler.logAndReturn('No product rating found', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving product rating', 500, next, err, req.params);
		});
	};

	// GET /product_reviews/:productnumber
	ProductRoutes.get_reviews = function(req, res, next) {
		var pn = req.params.productnumber;
		orchHelper.getProductReviews(pn)
		.then(function (data) {
			if (data) {
				res.status(200).json({data:data});
			} else {
				errorHandler.logAndReturn('No product reviews found', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving product reviews', 500, next, err, req.params);
		});
	};

	// GET /product_merchant/:productnumber
	ProductRoutes.get_merchant = function(req, res, next) {
		var pn = req.params.productnumber;
		orchHelper.getDocFromCollection('products', pn)
		.then(function (data) {
			if (data) {
				return orchHelper.getDocFromCollection('merchant-profiles', data.attributes.vendor)
				.then(function (result) {
					return result;
				})
				.fail(function (err) {
					throw new Error(err.body.message);
				});
			} else {
				errorHandler.logAndReturn('No product found', 404, next, null, req.params);
			}
		})
		.then(function (result) {
			if (result) {
				res.status(200).json({merchant:result});
			} else {
				errorHandler.logAndReturn('No product merchant found', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving product merchant', 500, next, err, req.params);
		});
	};

	// GET /most_viewed_product/:profileid
	ProductRoutes.most_viewed_product = function(req, res, next) {
		orchHelper.getMostFrequentEvent('products', 'page-view', req.params.profileid)
		.then(function (data) {
			if (data) {
				res.status(200).json(data);
			} else {
				errorHandler.logAndReturn('No most viewed product found', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error finding most view product for user', 500, next, err, req.params);
		});
	};

	// POST /submit_review
	ProductRoutes.submit_review = function(req, res, next) {
		if (!req.body.review) {
			errorHandler.logAndReturn('Missing submit review request data', 400, next, null, req.body);
			return;
		}
		orchHelper.postDocToCollection('product-reviews', req.body.review)
		.then(function (result) {
	  		res.status(201).json({success:true});
	  	})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('Error submitting review for product', 500, next, err, req.body);
	  	});
	};

	// POST /add_product
	ProductRoutes.add_product = function(req, res, next) {
		// TODO: This bitch needs a make over, can't believe all those lines execute and a product is actually added
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
			if(product.tmpImg) {
				var name = pn + "." + product.tmpImg.extension;
				var img = "img/products/" + name;
				updateAWSImageLocation(product.tmpImg.name, name);
				flow.move(product.tmpImg.identifier, 'public/', img, function (err) {
				if (err) {
						console.error('error moving file to ' + '/public/products/' + img, err);
						throw err;
					}
				});
				delete product.tmpImg;
				product.img = img;
				product.remote_img = 'https://s3.amazonaws.com/'+S3_BUCKET+ '/' + name;
			}
			if(product.tmpAltImg) {
				product.altImg = [];	//define this to be filled below
				product.tmpAltImg.forEach(function (alt, i) {
					name = pn +  "-a" + (i+1) + "." + alt.extension;
					img = "img/products/" + name;
					updateAWSImageLocation(alt.name, name);
					flow.move(alt.identifier, 'public/', img, function (err) {
						if (err) {
							console.error('error moving file to ' + '/public/products/' + img, err);
							throw err;
						}
					});
					product.altImg.push({img: img, remote_img: 'https://s3.amazonaws.com/'+S3_BUCKET+ '/' + name});
				});
			}
			delete product.tmpAltImg;
			product.currency = "USD";
			product.productnumber = pn;
			//TODO : merchant should set increment
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
	  		errorHandler.logAndReturn('There was an error adding the product, view the logs for more information', 500, next, err, req.body);
	  	}).done();
	};

	// POST /update_product
	ProductRoutes.update_product = function(req, res, next) {
		if (!req.body.product) {
			errorHandler.logAndReturn('Missing update product request data', 400, next, null, req.body);
			return;
		}
		var product = req.body.product;
		var query = 'value.owner: ' + req.user.profile + ' OR value.members: ' + req.user.profile;
		var params = { limit: 1 };
		orchHelper.searchDocsFromCollection('merchant-profiles', query, params)
		.then(function (res) {
			if (product.tmpImg) {
				var name = product.productnumber + "." + product.tmpImg.extension;
				var img = "img/products/" + name;
				updateAWSImageLocation(product.tmpImg.name, name);
				flow.move(product.tmpImg.identifier, 'public/', img, function (err) {
					if (err) {
						console.error('error moving file to ' + '/public/products/' + img, err);
						throw err;
					}
				});
				delete product.tmpImg;
				product.img = img;
				product.remote_img = 'https://s3.amazonaws.com/'+S3_BUCKET+ '/' + name;
			}
			return orchHelper.updateProduct(product, req.user.profile);
		})
		.then(function (result) {
			res.status(201).json(result);
		})
	  	.fail(function (err) {
	  		errorHandler.logAndReturn('There was an error adding updating the product, view the logs for more information', 500, next, err, [req.user, req.body]);
	  	}).done();
	};

	// POST //product_page_view/:productnumber?profile=
	ProductRoutes.page_view = function(req, res, next) {
		var profile = 'guest';
		if (req.params.productnumber !== 'undefined') {
			profile = req.params.productnumber;
		}
		var pn = req.params.productnumber;
		orchHelper.addPageView('products', pn, profile)
		.then(function (result) {
			res.status(201).json(true);
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error adding page view event for product', 500, next, err, [req.params, req.query]);
		}).done();
	};

	return ProductRoutes;
};