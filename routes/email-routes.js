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

	var transport = nodemailer.createTransport({
	      host:'smtp.office365.com',
	      secureConnection: true,
	      port: '587',
	      auth: {
	          user: "support@ylift.io",
	          pass: "yliftDEEZNUTS!"
	      }
	  });  

	//POST /email_support
	EmailRoutes.support = function(req, res, next) {
		var host = "http://" + req.get('host');
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
	        errorHandler.logAndReturn('Error sending support email', 500, next, err);
	      } else {
	        res.status(200).json({result:"success"});
	      }
	    });

	};

	return EmailRoutes;
};