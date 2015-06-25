module.exports = function(express, app, __dirname) {
	function StripeRoutes() {}

	console.log('Loading Stripe Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
    	Customer 		= require('../models/customer.js'),
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		emailHelper     = require('../trd_modules/emailHelper'),
		crypto 			= require('crypto'),
		Q               = require('q'),
		routes 			= require('./routes.js'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
    	stripeEnv		= process.env.STRIPE,
		stripe 			= require('stripe')(config[stripeEnv].SECRET);

	StripeRoutes.add_customer = function(req, res, next) {
		var profileid = req.params.profileid;
		var transaction = req.body;
		var card = transaction.card;
		var email = transaction.email;
		var customer = {};
		stripe.customers.create({
			card: card,
			description: "ylift customer",
			email: email
		}, function(err, customer) {
			if (err) {
				return Q.fcall(function () {
				  return new Error(err);
				});
			} else {
				return orchHelper.addCustomer(customer);
			}
		})
		.then(function (customer) {
			return orchHelper.getProfile(profileid)
			.then(function (profile) {
				profile.customerid = customer.id;
				profile.updatedAt = new Date();
				return orchHelper.updateProfile(profile.id, profile)
				.then(function (result) {
					return customer;
				})
				.fail(function (err) {
					throw new Error(err.body.message);
				});
			})
			.fail(function (err) {
				throw new Error(err.body.message);
			});
		})
		.then(function (result) {
			res.status(201).json({customer:result, message:"Customer created"});
		}, function (err) {
			errorHandler.logAndReturn(err.message || 'Error adding new customer', 422, next, err, [req.params, req.body]);
		});
	};

	StripeRoutes.add_guest_customer = function(req, res, next) {
		var card = req.body.card;
		stripe.customers.create({
			card: card.id,
			description: "ylift guest customer"
		}, function(err, customer) {
			if (err) {
				return Q.fcall(function () {
				  throw new Error(err);
				});
			} else {
				return orchHelper.addCustomer(customer);
			}
		})
		.then(function (customer) {
			res.status(201).json({customer:customer, message:"Guest customer created"});
		}, function (err) {
			errorHandler.logAndReturn(err.message || 'Error adding guest customer', 500, next, err, req.body);
		});
	};

	StripeRoutes.add_token_to_customer = function(req, res, next) {
		stripe.customers.createCard(
			req.params.customerid,
			{card: req.body.token},
			function (err, card) {
				if (err) {
					res.status(500).json({err:err, message:"Token customer error"});
				} else {
					stripe.customers.retrieve(req.params.customerid, function (err, customer) {
						req.body.customer = customer;
						next();
					});
				}
			}
		);
	};

	StripeRoutes.remove_card_from_customer = function(req, res, next) {
		stripe.customers.deleteCard(
			req.params.customerid,
			req.body.cardid,
			function (err, card) {
				if (err) {
					res.status(500).json({err:err, message:"Card delete error"});
				} else {
					stripe.customers.retrieve(req.params.customerid, function (err, customer) {
						req.body.customer = customer;
						next();
					});
				}
			}
		);
	};

	StripeRoutes.update_customer = function(req, res, next) {
		orchHelper.getProfile(req.params.profileid)
			.then(function (profile) {
				if (profile.customerid == req.body.customer.id) {
					return true;
				} else {
					return new Error('Profile account not authorized to update customer');
				}
			})
			.then(function (result) {
				return orchHelper.updateCustomer(req.body.customer);
			})
			.then(function (customer) {
				res.status(200).json({customer:customer});
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error updating customer', 500, next, err, [req.params, req.body]);
			});
	};

	StripeRoutes.update_guest_customer = function(req, res, next) {	
		if (!req.body.customerid) {
			errorHandler.logAndReturn('Error updating customer, missing id', 400, next, null, req.body);
			return;
		}
		stripe.customers.update(req.body.customerid, req.body.props, function(err, result) {
			if (err) {
				errorHandler.logAndReturn('Error updating guest customer, please contact support@ylift.io', 500, next, err);
				return;
			}
			orchHelper.updateCustomer(result)
			.then(function (customer) {
				res.status(200).json({customer:customer});
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error updating guest customer', 500, next, err, req.body);
			});
		});
	};

	StripeRoutes.get_customer = function(req, res, next) {
		orchHelper.getCustomer(req.params.customerid)
			.then(function (customer) {
				if (customer) {
					res.status(200).json({customer:customer});
				} else {
					errorHandler.logAndReturn('No customer data found', 404, next);
				}
			})
			.fail(function (err) {
				errorHandler.logAndReturn('Error retrieving customer information', 500, next, err, req.params);
			});
	};

	// POST /process_transaction?profile=
	StripeRoutes.process_transaction = function(req, res, next) {
		var transaction = req.body;
		var profileid = req.query.profile;
		var card = transaction.card;
		var productsInCart = transaction.productsInCart;
		var total = transaction.total;
		var shipping = transaction.shipping;
		var promo = transaction.promo;
		var shipTo = transaction.addressShipTo;
		var merchants = transaction.merchants;
		var customer = transaction.customer;
		var charge = {
			amount: total * 100, // stripe processes in the smallest denomination so for USD it is cents!!! <-- why was i so excited about this?
			source: card.id || card,
			currency: "USD",
			customer: transaction.customer.id,
			receipt_email: transaction.customer.email,
			description: 'Y LIFT Network registration fee, thank you for your order!'
		};

		stripe.charges.create(charge, function(err, charge) {
			if(err) {
				errorHandler.logAndReturn(err.message || 'Error processing transaction, please contact support@ylift.io', 500, next, err, charge);
			} else {
				var order = {
					id: crypto.randomBytes(5).toString('hex'),
					charge: charge.id || charge,
					total: total,
					shipping: shipping,
					promo: promo,
					products: productsInCart,
					shipTo: shipTo,
					merchants: merchants,
					profile: profileid,
					customer: customer.id || customer,
					createdAt: new Date(),
					updatedAt: new Date(),
					status: 'PROCESSING',
					trackingNum: null
				};
				orchHelper.addOrder(order)
				.then(function (result) {
					// trying to keep this route universal and not all purchases will have a merchant (e.g. ylift registration)
					if (merchants && merchants.length > 0) {
						emailHelper.sendOrdersToMerchants(order).done();
					}
					if (order.products && order.merchants) {
						emailHelper.sendOrdersToTeam(order).done();
					}
					// user account purchase
					if (profileid !== undefined) {
						orchHelper.addOrderToUser(profileid, order)
						.then(function (result) {
							res.status(201).json({order:order, success:result});
						})
						.fail(function (err) {
							errorHandler.logAndReturn('Transaction complete but there was an error processing the order on our end, please contact support@ylift.io', 500, next, err, [req.query, req.body]);
						});
					// guest account purchase
					} else {
						res.status(200).json({order:order, success:result});
					}
				})
				.fail(function (err) {
					errorHandler.logAndReturn('Transaction complete but there was an error processing the order on our end, please contact support@ylift.io', 500, next, err, [req.query, req.body]);
				});
			}
		});
	};

	return StripeRoutes;
};