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
		var query = 'value.merchants: ' + req.params.merchantid;
      	var params = { limit: 100 };
		orchHelper.searchDocsFromCollection('orders', query, params)
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


    // GET cart/:profileid
  	StoreRoutes.get_cart = function(req, res, next) {
  		orchHelper.getDocFromCollection('carts', req.params.profileid)
	    .then(function (result) {
	        if (result) {
	          res.send({cart: result});
	        } else {
	          errorHandler.logAndReturn('No cart for this user found', 404, next, null, req.params);
	        }
	    })
	    .fail(function (err) {
	        errorHandler.logAndReturn('Error retrieving account cart', 500, next, err, req.params);
	    });
  	};

	// GET get_all_orders/:profileid
	StoreRoutes.get_all_orders = function(req, res, next) {
		orchHelper.getDocFromCollection('user-orders', req.params.profileid)
		.then(function (result) {
			if (result) {
				res.send({orders: result});
			} else {
			  	errorHandler.logAndReturn('No orders for this user found', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving orders', 500, next, err, req.params);
		});
	};

	// GET /get_products_by_merchant/:merchantid
	StoreRoutes.get_products_by_merchant = function(req, res, next) {
		var query = 'value.attributes.vendor: ' + req.params.merchantid;
      	var params = { limit: 100 };
		orchHelper.searchDocsFromCollection('products', query, params)
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

	// GET get_related_products/:productnumber
    StoreRoutes.get_related_products = function(req, res, next) {
	    orchHelper.getDocFromCollection('products', req.params.productnumber)
	    .then(function (product) {
	      //// TODO: ADD GRAPH RELATIONSHIP BETWEEN PRODUCT PAGE VIEWS AND CATEGORY
	    	var query = 'value.category: ' + product.category + ' AND value.active: "Y"';
	      	var params = { limit: 4 };
			orchHelper.searchDocsFromCollection('products', query, params)
			.then(function (result) {
				if (result) {
					res.status(200).json({products: result});
				} else {
				  	errorHandler.logAndReturn('No products related to that product found', 404, next, null, req.params);
				}
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error retrieving related products', 500, next, err, req.params);
			});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving product to get reviews', 500, next, err, req.params);
		});
	};

	// GET get_order_by_id/:orderid
	StoreRoutes.get_order = function(req, res, next) {
		orchHelper.getDocFromCollection('orders', req.params.orderid)
		.then(function (result) {
			if (result) {
				res.send({order: result});
			} else {
			  	errorHandler.logAndReturn('Not a valid order id', 404, next, null, req.params);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error retrieving order by id', 500, next, err, req.params);
		});
	};

	// POST /update_order
	StoreRoutes.update_order = function(req, res, next) {
		if (!req.body.order) {
			errorHandler.logAndReturn('Missing update order request data', 400, next, null, req.body);
			return;
		}
		orchHelper.putDocToCollection('orders', req.body.order.id, req.body.order)
		.then(function (data) {
			res.status(200).json({order:req.body.order});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating order', 500, next, err, req.body);
		});
	};

	// POST /add_check_order
	StoreRoutes.create_check_order = function(req, res, next) {
		if (!req.body.total) {
			errorHandler.logAndReturn('Missing update order request data', 400, next, null, req.body);
			return;
		}
		var order = Order.newOrder(req.body.total, req.body.customer);
		orchHelper.putDocToCollection('orders', order.id, order)
		.then(function (data) {
			res.status(200).json({order:order});
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error creating check order', 500, next, err, req.body);
		});
	};

	// POST /store
	StoreRoutes.get_storefront = function(req, res, next) {
		var query = '';
		var params = {};
		if (req.body.ylift) {
			query = 'value.active: "Y"';
      		params = { limit: 100 };
			orchHelper.searchDocsFromCollection('products', query, params)
			.then(function (data) {
				res.status(200).json({products:data});
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error retrieving store front', 500, next, err, req.body);
			});
		} else {
			query = 'value.active: "Y" AND NOT value.isYLIFT: "Y"';
			params = { limit: 100 };
			orchHelper.searchDocsFromCollection('products', query, params)
			.then(function (data) {
				res.status(200).json({products:data});
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error retrieving public store front', 500, next, err, req.body);
			});			
		}
	};

	  // GET get_products_by_category
	StoreRoutes.get_products_by_category = function(req, res, next) {
		if (!req.body.category) {
			errorHandler.logAndReturn('Missing product category to filter by', 400, next, null, req.body);
			return;
		}
		var query = 'value.category: ' + req.body.category + ' AND value.active: "Y"';
		var params = { limit: 100 };
		orchHelper.searchDocsFromCollection('products', query, params)
		.then(function (result) {
			if (result) {
		    	res.status(200).json({products: result});
		    } else {
		      	errorHandler.logAndReturn('No products found for this category', 404, next, null, req.body);
		    }
		  })
		.fail(function (err) {
		  	errorHandler.logAndReturn('Error retrieving products by category', 500, next, err, req.body);
		});
	};

	// POST add_item_to_cart
	StoreRoutes.add_item_to_cart = function(req, res, next) {
		if (!req.body.productnumber || !req.body.quantity) {
			errorHandler.logAndReturn('Missing add to cart request data', 400, next, null, [req.body, req.user]);
			return;
		}
		orchHelper.getDocFromCollection('carts', req.body.profileid)
		.then(function (cart) {
			if (cart) {
				var duplicate = false;
				for (var i = 0; i < cart.products.length; i++) {
			        if (cart.products[i].productnumber == req.body.productnumber) {
						duplicate = true;
						cart.products[i].quantity = Number(cart.products[i].quantity) + Number(req.body.quantity); //if so just update quantity
			        }
			    }
			    if (!duplicate) {
			    	var productObj = {
			    		productnumber: req.body.productnumber,
          				quantity: req.body.quantity
			    	};
			    	cart.products.push(productObj);
			    }
				cart.status = "active";	
				return orchHelper.putDocToCollection('carts', req.body.profileid, cart).then(function (result) { return cart; });
			} else {
				errorHandler.logAndReturn('Could not find cart to update', 404, next, null, [req.body, req.user]);
			}
		})
		.then(function (cart) {
			if (cart) {
				res.status(201).json({cart:cart});
			} else {
				errorHandler.logAndReturn('Could not add item to cart', 400, next, null, [req.body, req.user]);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error adding item to cart', 500, next, err, [req.body, req.user]);
		});
	};

	// POST empty_cart
  	StoreRoutes.empty_cart = function(req, res) {
  		if (!req.body.profileid) {
			errorHandler.logAndReturn('Missing empty cart request data', 400, next, null, [req.body, req.user]);
			return;
		}
		orchHelper.getDocFromCollection('carts', req.body.profileid)
		.then(function (cart) {
			if (cart) {
				cart.products = [];
				cart.status = "empty";
				return orchHelper.putDocToCollection('carts', req.body.profileid, cart).then(function (result) { return cart; });
			} else {
				errorHandler.logAndReturn('Could not find cart to update', 404, next, null, [req.body, req.user]);
			}
		})
      	.then(function (cart) {
        	if (cart) {
          		res.status(200).json({cart:cart});
        	} else {
          		errorHandler.logAndReturn('Cart not empty cart', 400, next, null, req.body);
        	}
      	})
      	.fail(function (err) {
        	errorHandler.logAndReturn('Error emptying cart', 500, next, err, req.body);
      	});
  	};

  	// POST update_cart
	StoreRoutes.update_cart = function(req, res) {
		if (!req.body.profileid || !req.body.productnumbers || !req.body.quantities) {
			errorHandler.logAndReturn('Missing update cart request data', 400, next, null, [req.body, req.user]);
			return;
		}
		orchHelper.getDocFromCollection('carts', req.body.profileid)
		.then(function (cart) {
			if (cart) {
    			cart.products = [];
				productnumbers.forEach(function (product, index) {
					cart.products.push({
						productnumber: product.productnumber,
        				quantity: quantities[index]
					});
				});
				cart.status = "active";
				return orchHelper.putDocToCollection('carts', req.body.profileid, cart).then(function (result) { return cart; });
			} else {
				errorHandler.logAndReturn('Could not find cart to update', 404, next, null, [req.body, req.user]);
			}
		})
		.then(function (cart) {
			if (cart) {
				res.status(200).json({cart:cart});
			} else {
				errorHandler.logAndReturn('Cart not update cart', 400, next, null, req.body);
			}
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating cart', 500, next, err, req.body);
		});
	};

	return StoreRoutes;
};