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
    	stripeEnv		= process.env.STRIPE,
		stripe 			= require('stripe')(config[stripeEnv].SECRET);

	StripeRoutes.add_customer = function(req, res) {
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
				console.log('error creating stripe customer', err);
				throw new Error(err);
			} else {
				return orchHelper.addCustomer(customer);
			}
		})
		.then(function (customer) {
			customer = customer;
			return orchHelper.getProfile(profileid);
		})
		.then(function (profile) {
			profile.customerid = customer.id;
			profile.updatedAt = new Date();
			return orchHelper.updateProfile(profile.id, profile);
		})
		.then(function (result) {
			console.log('result from adding customer', result);
			res.status(201).json({customer:customer, message:"Customer created"});
		})
		.fail(function (err) {
			console.log('error adding customer', err);
			res.status(500).json({err:err, message:err.message});
		}).done();
	};

	StripeRoutes.add_guest_customer = function(req, res) {
		var card = req.body.card;
		stripe.customers.create({
			card: card.id,
			description: "ylift guest customer"
		}, function(err, customer) {
			if (err) {
				return Q.fcall(function () {
					console.log('error creating stripe customer', err);
				  throw new Error(err);
				});
			} else {
				return orchHelper.addCustomer(customer);
			}
		})
		.then(function (customer) {
			res.status(201).json({customer:customer, message:"Guest customer created"});
		}, function (err) {
			console.log('error creating stripe customer', err.message);
			res.status(500).json({err:err.body, message:"Charge create error"});
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
						// res.status(200).json({card:card, message:"Token associated to customer"});
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
						// res.status(200).json({card:card, message:"Token associated to customer"});
					});
				}
			}
		);
	};

	StripeRoutes.update_customer = function(req, res) {
		orchHelper.getProfile(req.params.profileid)
			.then(function (profile) {
				if (profile.customerid == req.body.customer.id) {
					return true;
				} else {
					return new Error('Profile account not authorized to update customer');
				}
			})
			.then(function (result) {
				orchHelper.updateCustomer(req.body.customer)
					.then(function (customer) {
						res.status(200).json({customer:customer});
					})
					.fail(function (err) {
						res.status(500).json({err:err.body, message:"Stripe customer update error"});
					});
			})
			.fail(function (err) {
				console.log('error updating customer', err);
				res.status(500).json({err:err, message:"Error retrieving customer information"});
			});
	};

	StripeRoutes.update_guest_customer = function(req, res) {	
		stripe.customers.update(req.body.customerid, req.body.props, function(err, result){
			orchHelper.updateCustomer(result)
			.then(function (customer) {
				res.status(200).json({customer:customer});
			})
			.fail(function (err) {
				res.status(500).json({err:err.body, message:"Stripe customer update error"});
			});
		});
	};

	StripeRoutes.get_customer = function(req, res) {
		orchHelper.getCustomer(req.params.customerid)
			.then(function (customer) {
				res.status(200).json({customer:customer});
			})
			.fail(function (err) {
				res.status(500).json({err:err, message:"Error retrieving customer information"});
			});
	};

	// POST /process_transaction?profile=
	StripeRoutes.process_transaction = function(req, res) {
		var transaction = req.body;
		var profileid = req.query.profile;
		var card = transaction.card;
		var productsInCart = transaction.productsInCart;
		var total = transaction.total;
		var shipping = transaction.shipping;
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
				res.status(500).json({err:err, message:"Stripe Charge Create Error"});
			} else {
				var order = {
					id: crypto.randomBytes(5).toString('hex'),
					charge: charge.id || charge,
					total: total,
					shipping: shipping,
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
							console.log('error adding user order', err);
							res.status(500).json({err:err, message:"Put User Order Error"});
						});
					// guest account purchase
					} else {
						res.status(200).json({order:order, success:result});
					}
				})
				.fail(function (err) {
					console.log('error adding single order', err);
					res.status(500).json({err:err, message:"Put Order Error"});
				});
			}
		});
	};

	return StripeRoutes;
};