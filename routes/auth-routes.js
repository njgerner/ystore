module.exports = function(express, app, __dirname) {
	function AuthRoutes() {}

	console.log('Loading Auth Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		emailHelper     = require('../trd_modules/emailHelper'),
		rawDogger       = require('../trd_modules/rawDogger'),
		User 			= require('../models/user'),
		Profile 		= require('../models/profile'),
		Cart 			= require('../models/cart'),
      	nodemailer      = require('nodemailer'),
      	passport        = require('passport'),        // https://npmjs.org/package/passport
      	bcrypt 			= require('bcryptjs'),
      	moment 			= require('moment'),
      	jwt 			= require('jwt-simple'),
		Q               = require('q'),
      	LocalStrategy   = require('passport-local').Strategy,  // See above
		errorHandler    = require('../trd_modules/errorHandler.js'),
		fs 				= require('fs');

	var mailOptions = {
    	from: process.env.DEFAULT_EMAIL_REPLY_TO
  	};

	// create reusable transport method (opens pool of SMTP connections)
	var transport = nodemailer.createTransport({
		host:'smtp.office365.com',
		secureConnection: true,
		port: '587',
		auth: {
			user: process.env.DEFAULT_SUPPORT_EMAIL,
		  	pass: process.env.SUPPORT_EMAIL_PASSWORD
		}
	}); 

	// Use the LocalStrategy within Passport to login/”signin” users.
	passport.use('local-signin', new LocalStrategy(
	  { usernameField: 'email',
	    passwordField: 'password',
	    passReqToCallback : true }, //allows us to pass back the request to the callback
	  function(req, username, password, done) {
	  	query = 'value.email: ' + username;
	  	params = { limit: 1 };
	  	orchHelper.searchDocsFromCollection('local-users', query, params)
	    .then(function (result) {
	    	var user = result[0];
	    	var err = null;
	    	if (!user) {
	    		err = 'That email is not associated with an account in our system, please register.';
	        	done(err, false);
	    	} else if (!bcrypt.compareSync(password, user.hash)) {
	    		err = 'Invalid email or password. Please try again.';
	        	done(err, false);
	    	} else {
		    	if (user.tempPwd) {
		            req.cookies.tempPwdRedirect = true; //if so update cookie so they will be redirected to update password
		        }
		        done(err, user);
	    	} 
	    })
	    .fail(function (err){
	      done('There was an error on the server, please try again.', false);
	    });
	  }
	));
	// Use the LocalStrategy within Passport to register/"signup" users.
	passport.use('local-signup', new LocalStrategy(
	  { usernameField: 'email',
	    passwordField: 'password',
	    passReqToCallback : true }, //allows us to pass back the request to the callback
	  function(req, username, password, done) {
	  	var user = User.newUser(req.body.email, req.body.password);
		var profile = Profile.newProfile(req.body.email);
		if (req.body.metadata) {
			rawDogger.addMetaToProfile(profile, JSON.parse(req.body.metadata));
		}
		var cart = Cart.newCart();
	  	var query = 'value.email: ' + username;
	  	var params = { limit: 1 };
	  	orchHelper.searchDocsFromCollection('local-users', query, params)
	  	.then(function (result) {
	  		if (result.length > 0) {
	  			done(null, false, { message: 'That email is already registered to an account, please login.' });
	  		} else {
				user.profile = profile.id;
				return orchHelper.putDocToCollection('local-users', user.id, user)
				.then(function (result) {
					return user;
				})
				.fail(function (err) {
					throw new Error(err);
				});
	  		}
	  	})
	  	.then(function (user) {
	  		profile.cart = cart.id;
	  		return orchHelper.putDocToCollection('local-profiles', profile.id, profile)
	  		.then(function (result) {
	  			return profile;
	  		})
	  		.fail(function (err) {
	  			throw new Error(err);
	  		});
	  	})
	  	.then(function (profile) {
	  		orchHelper.putDocToCollection('carts', profile.id, cart)
	  		.then(function (result) {
	  			emailHelper.sendWelcome(user.name, user.email).done();
	         	emailHelper.newUserTeamNotification(user).done();
	  			done(null, user);
	  		})
	  		.fail(function (err) {
	  			throw new Error(err);
	  		});
	  	})
	  	.fail(function (err) {
	  		done(err, false);
	  	});
	  }
	));

	AuthRoutes.authorized = function(req, res, next) {
	    delete req.user.hash;
	    delete req.user.salt;
	    orchHelper.getDocFromCollection('local-profiles', req.user.profile)
		.then(function (profile) {
	    	orchHelper.getDocFromCollection('local-users', req.user.id)
			.then(function (user) {
			    res.status(200).json({user:user, profile:profile, isAdmin:user.isAdmin, isYLIFT:user.isYLIFT});
			    profile.last_login = new Date();
			    return orchHelper.putDocToCollection('local-profiles', profile.id, profile);
			})
			.fail(function (err) {
			    errorHandler.logAndReturn('Error authorizing', 500, next, err, req.user);
			}).done();
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error authorizing', 500, next, err, req.user);
		});
	};

	//GET /request_pass_reset
  	//an email has been sent to user asking if they want to reset password
	AuthRoutes.request_pass_reset = function(req, res) {
		// TODO: Make an abstract patchDocFromCollection method in orchelper to do the functionality below
		// TODO: Add proper error handling to this route
		orchHelper.generateResetToken(req.params.email)
		  .then(function (user) {
		    mailOptions.to = user.email;
		    mailOptions.subject = 'Password Reset';
		    mailOptions.text = 'A request for a password reset has been made for the account linked to this email address\n\n' +
		        'Please click on the following link, or paste into your browser to complete the process' + '\n\n' + 
		        'http://' + req.get('host') + '/home#/reset_password/' + user.resetToken.token + '\n\n' +
		        'If you did not request this, please ignore this email and your password will remain unchanged.';

		    transport.sendMail(mailOptions, function(error, info){
		        if(error){
		            res.send('An error occurred. If this persists, please contact support@ylift.io');
		        }else{
		            res.send('success');
		        }
		    });
		  })
		  .fail(function (err) {
		    res.send('No account was found with this email');
		  });
	};

	//GET /reset_password
  	//user has received email and confirmed they want to reset password
	AuthRoutes.reset_password = function(req, res) {
		// TODO: Remove ths route
		console.log('reset pw route');
		res.render('reset_password', {resettoken: req.params.resettoken});
	};

  	// POST /login
	AuthRoutes.loginHelper = function(req, res, next) {
		return passport.authenticate('local-signin', function(err, user, info) {
		if (err) { return errorHandler.logAndReturn(err, 422, next, null, [req.params, req.body]); }
		if (!user) { return errorHandler.logAndReturn(info.message, 422, next, null, [req.params, req.body]); }
		// no sessions, don't bother logging in...
		var payload = { user: user.id, expires: moment().add(4, 'days') };
		var secret = app.get("jwtTokenSecret");

		// encode
		var token = jwt.encode(payload, secret);
		return res.json({tkn:token});
		})(req, res, next);
	};

	//POST /request_pass_reset
  	//an email has been sent to user asking if they want to reset password
	AuthRoutes.request_pass_reset = function(req, res) {
		orchHelper.generateResetToken(req.params.email)
		.then(function (user) {
			mailOptions.to = user.email;
			mailOptions.subject = 'Password Reset';
			mailOptions.text = 'A request for a password reset has been made for the account linked to this email address\n\n' +
			    'Please click on the following link, or paste into your browser to complete the process' + '\n\n' + 
			    'http://' + req.get('host') + '/home#!/reset_password/' + user.resetToken.token + '\n\n' +
			    'If you did not request this, please ignore this email and your password will remain unchanged.';

			transport.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log('pw reset email error', error);
			        res.send('An error occurred. If this persists, please contact support@ylift.io');
			    }else{
			        res.send('success');
			    }
			});
		})
		.fail(function (err) {
			res.send('No account was found with this email');
		});
	};

	//POST /register
	///////////////////////////////////////////////////////////////
	AuthRoutes.register = function(req, res, next) {
		return passport.authenticate('local-signup', function(err, user, info) { 
			if (err) { return errorHandler.logAndReturn(err.message || 'Error registering, please try again. If this issue continues, please contact support@ylift.io.', 422, next, err, null, req.params); }
			if (!user) { return errorHandler.logAndReturn(info.message || 'Registration successful but there was an error on the server, please contact support@ylift.io if you have any issues with your account.', 500, next, req.params); }
			var payload = { user: user.id, expires: moment().add(4, 'days') };
			var secret = app.get("jwtTokenSecret");
			var token = jwt.encode(payload, secret);
			return res.json({tkn:token, status:"store"});
		})(req, res);
	};

	AuthRoutes.update_password = function(req, res, next) {
		if (!req.body.resettoken || !req.body.password) {
			errorHandler.logAndReturn('Missing update password request data', 400, next, null, [req.body, req.user]);
			return;
		}
		var query = 'value.resetToken.token: ' + req.body.resettoken;
		var params = { limit: 1 };
		orchHelper.searchDocsFromCollection('local-users', query, params)
		.then(function (result) {
			if (result) {
				var user = result[0];
				user.hash = bcrypt.hashSync(req.body.password, 8); 
				delete user.resetToken;
				return orchHelper.putDocToCollection('local-users', user.id, user);
			} else {
				errorHandler.logAndReturn('Unable to update password, account not found', 404, next, null, req.body);
			}
		})
		.then(function (result) {
			res.status(201).json({success:true});
			orchHelper.removeDocFromCollection('reset-tokens', req.body.resettoken).done();
		})
		.fail(function (err) {
			errorHandler.logAndReturn('Error updating account password', 500, next, err, req.body);
		});
	};

	return AuthRoutes;
};