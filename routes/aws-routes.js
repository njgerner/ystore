module.exports = function(express, app, __dirname) {
	function AWSRoutes() {}

	console.log('Loading AWS Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		aws             = require('aws-sdk'),
		errorHandler    = require('../trd_modules/errorHandler.js'),
		AWS_ACCESS_KEY  = process.env.AWS_ACCESS,
		AWS_SECRET_KEY  = process.env.AWS_SECRET,
		S3_BUCKET  		= process.env.S3_BUCKET,
		fs 				= require('fs');

	AWSRoutes.sign_s3 = function(req, res, next) {
		aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	    var s3 = new aws.S3();
	    var s3_params = {
	        Bucket: S3_BUCKET,
	        Key: req.query.file_name,
	        Expires: 60,
	        ContentType: req.query.file_type,
	        ACL: 'public-read'
	    };
	    s3.getSignedUrl('putObject', s3_params, function(err, data){
	        if(err){
	            errorHandler.logAndReturn('Invalid s3 signing', 422, next, err);
	        }
	        else{
	            var return_data = {
	                signed_request: data,
	                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
	            };
	            res.write(JSON.stringify(return_data));
	            res.end();
	        }
	    });
	};

	AWSRoutes.get_object = function(req, res, next) {
		if (!req.body.file_name) {
			errorHandler.logAndReturn('Missing request data', 400, next, null, req.body);
			return;
		}
		aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	    var s3 = new aws.S3();
	    var s3_params = {
	        Bucket: S3_BUCKET,
	        Key: req.body.file_name
	    };
	    var file = fs.createWriteStream(process.env.TMPDIR + '/' + req.body.file_name);
	    s3.getObject(s3_params)
	    .on('httpData', function(chunk) { 
	    	file.write(chunk); 
	    })
	    .on('httpDone', function () { 
	    	file.end();
	    	res.download(process.env.TMPDIR + '/' + req.body.file_name, function (err) {
	    		if (err) {
	    			errorHandler.logAndReturn('Error downloading the object', 500, next, err, [req.body, req.user]);
	    		} else {
	    			res.status(200).json({success:true});
	    		}
	    	});
	    })
	    .send();
	};

	return AWSRoutes;
};