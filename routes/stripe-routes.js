module.exports = function(express, app, __dirname) {
	function StripeRoutes() {}

	console.log('Loading Stripe Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 					= require('../trd_modules/config.js'), 							//config file contains all tokens and other private info
    	Customer 				= require('../models/customer.js'),
			orchHelper      = require('../trd_modules/orchestrateHelper'),
			crypto 					= require('crypto'),
			Q               = require('q'),
			routes 					= require('./routes.js'),
    	stripeEnv				= process.env.STRIPE,
			stripe 					= require('stripe')(config[stripeEnv].SECRET);

	StripeRoutes.add_customer = function(req, res) {
		var profileid = req.params.profileid;
		console.log('profileid', profileid);
		var transaction = req.body;
		var card = transaction.card;
		var email = transaction.email;
		stripe.customers.create({
			card: card,
			description: "trd customer",
			email: email
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
			console.log('created customer', customer);
			return orchHelper.getProfile(profileid)
				.then(function (profile) {
					console.log('got profile', profile);
					profile.customerid = customer.id;
					profile.updatedAt = new Date();
					return orchHelper.updateProfile(profile.id, profile)
						.then(function (result) {
							console.log('profile updated', result);
							return customer;
						})
						.fail(function (err) {
							console.log('errorrrrrrrrrrr', err);
							return new Error(err.body);
						});
				})
				.fail(function (err) {
					console.log('error getting profile', err);
					return new Error(err);
				});
		}, function (err) {
			console.log('random error', err);
			return new Error(err);
		})
		.then(function (customer) {
			console.log('sending customer back', customer);
			res.status(201).json({customer:customer, message:"Customer created"});
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
				console.log('updating customer/profileid', req.body.customer, req.params.profileid);
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

	StripeRoutes.get_customer = function(req, res) {
		console.log('getting customer', req.params.customerid);
		orchHelper.getCustomer(req.params.customerid)
			.then(function (customer) {
				res.status(200).json({customer:customer});
			})
			.fail(function (err) {
			});
	};

	// POST /stripe
	StripeRoutes.process_transaction = function(req, res) {

		var transaction = req.body;
		var profileid = req.params.profileid;
		var card = transaction.card;
		var cart = transaction.cart;
		var shipTo = transaction.officeShipTo;
		var customer = transaction.customer;
		var charge = {
			amount: cart.total * 100, // stripe processes in the smallest denomination so for USD it is cents!!! <-- why was i so excited about this?
			source: card.id,
			currency: "USD",
			customer: transaction.customer.id,
			receipt_email: transaction.customer.email,
			description: 'Thank you for your order from YLift. You will be notified of any changes in your order status.'
		};

		stripe.charges.create(charge, function(err, charge) {
			if(err) {
				res.status(500).json({err:err, message:"Stripe Charge Create Error"});
			} else {
				var order = {
					id: crypto.randomBytes(5).toString('hex'),
					charge: charge,
					total: cart.total,
					shipping: cart.shipping,
					products: cart.products,
					shipTo: shipTo,
					profile: profileid,
					createdAt: new Date(),
					updatedAt: new Date(),
					status: 'PROCESSING',
					trackingNum: null
				};
				orchHelper.addOrder(order)
					.then(function (result) {
						console.log('single order successfully added! Moving to add order.');
						orchHelper.addOrderToUser(profileid, order)
							.then(function (result) {
								console.log('added order to user', result);
								res.status(201).json({order:order, success:result});
							})
							.fail(function (err) {
								console.log('error adding user order', err);
								res.status(500).json({err:err, message:"Put User Order Error"});
							});
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