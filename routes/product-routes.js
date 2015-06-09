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
	  		console.log('error from something', err);
	  		res.status(403).json({err:'profile not authorized to add product'});
	  	}).done();
	};

	// POST /deactivate_product
	ProductRoutes.deactivate_product = function(req, res) {
		orchHelper.findMerchantProfile(req.user.profile)
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
		var product = req.body.product;
		orchHelper.findMerchantProfile(req.user.profile)
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
	  		console.log('error updating product', err);
	  		res.status(403).json({err:'profile not authorized to edit product'});
	  	}).done();
	};

	return ProductRoutes;
};