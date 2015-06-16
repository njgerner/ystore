exports.logAndReturn = function(message, status, next) {
	var err = new Error(message || 'Unknown server error');
	err.status = status;
	if (process.env.LOG_ERRORS == 'true') {
		console.log('LOGGING ERROR');
		console.error(message || 'Unknown server error');
	}
	return next(err);
};