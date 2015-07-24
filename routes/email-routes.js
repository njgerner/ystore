module.exports = function(express, app, __dirname) {
	function EmailRoutes() {}

	console.log('Loading Email Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		nodemailer      = require('nodemailer'),
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

	//POST /email_support
	EmailRoutes.support = function(req, res, next) {
		var props = req.body.props;
	    var options = {
	      from: 'support@ylift.io',
	      subject: "YLIFT Store Customer Inquiry",
	      to: "mitch@ylift.io",
	      html: '<h3>Email: ' + req.body.email + '</h3>' + 
	            '<h4>Topic: ' + props.topic + '</p>' +
	            '<p>Subject: ' + props.subject + '</p>' +
	            '<p>Message:' + props.message + '</p>' +
	            '<p>Order ID (if applicable): ' + props.orderid + '</p>'
	    };
	    transport.sendMail(options, function(err, response) {
	      if (err) {
	        errorHandler.logAndReturn('Error sending support email', 500, next, err, req.body);
	      } else {
	        res.status(200).json({result:"success"});
	      }
	    });
	};

	//POST /change_email
	EmailRoutes.change_email = function(req, res, next) {
		if(!req.body.newemail) {
			errorHandler.logAndReturn('Invalid email address', 500, next, err, req.body);
			return;
		}
		var options = {
			from: 'support@ylift.io',
			subject: 'Y Lift Account Email Change',
			to: req.body.oldemail,
			text: 'This is a confirmation that the ylift.io account associated with ' + req.body.oldemail + ' now belongs to ' + req.body.newemail + '\n\n' + 
				  'Please check ' + req.body.newemail + ' for a confirmation. If this change was made in error, please contact support@ylift.io'
		};
		transport.sendMail(options, function(err, response) {
			if (err) {
	        errorHandler.logAndReturn('Error sending notifcation of email address change to old email', 500, next, err, req.body);
		    } else {
		      options.to = req.body.newemail;
		      options.text = 'This is a confirmation that the ylift.io account previosuly associated with ' + req.body.oldemail + ' now belongs to this address.' + '\n\n' + 
				  'If this change was made in error, please contact support@ylift.io';
		    }
		    transport.sendMail(options, function(err, response) {
		    	if (err) {
	        		errorHandler.logAndReturn('Error sending notifcation of email address change to new email', 500, next, err, req.body);
		    	} else {
		    		res.status(200).json({result:"success"});
		    	}
		    });
		});
	};

	return EmailRoutes;
};