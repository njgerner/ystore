module.exports = function(express, app, __dirname) {
	function AdminRoutes() {}

	console.log('Loading Admin Routes');

	var path            = require('path'),            						// http://nodejs.org/docs/v0.3.1/api/path.html
    	config 			= require('../trd_modules/config.json'), 			//config file contains all tokens and other private info
		orchHelper      = require('../trd_modules/orchestrateHelper'),
		Q               = require('q'),
		fs 				= require('fs');

	// //GET /training
	// AdminRoutes.training = function(req, res) {
	// 	console.log('in training route');
	// 	res.render('training');
	// };

	// // POST /upload_training_materials
	// AdminRoutes.upload_training_materials = function(req, res) {
	// 	console.log('in upload_training_materials POST route');
	// 	if(done===true){
	//     console.log('upload route, uploading file:');
	//     console.log('file =', req.files);
	//     res.redirect('/training');
	//   }
	// };

	return AdminRoutes;
};