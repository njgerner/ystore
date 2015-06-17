var bunyan = require('bunyan');
var path = require('path');
var logPath = path.join(__dirname, '../logs/ylift-prod-error.log');
if (process.env.ENV == 'DEV') {
  logPath = path.join(__dirname, '../logs/ylift-dev-error.log');
}
var mitch = bunyan.createLogger({
  name: 'Y Lift',
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'error',
      path: logPath  // log ERROR and above to a file
    }
  ]
});

exports.logAndReturn = function(message, status, next, errObj) {
	var err = new Error(message || 'Unknown server error');
	err.status = status;
	if (process.env.LOG_ERRORS == 'true') {
		mitch.error(errObj || message || 'Unknown server error');
	} else {
		mitch.info(errObj || message || 'Unknown server error');
	}
	return next(err);
};