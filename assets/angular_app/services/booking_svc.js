trdServices.service("bookingService", ['$rootScope', '$http', '$cookieStore', '$log', 'authService',
    function ($rootScope, $http, $cookieStore, $log, authService) {

    	this.patientAppts = [];
    	this.apptsByProvider = {};

    	this.sendApptRequest = function(date, office, providerid, procedure, callback) {
    		if (!authService.profileid) {
    			callback('Please login to request an appointment');
    			return;
    		}
    		var inThis = this;
	        $http({method: 'POST', url: '/booking/request_appt/' + providerid, 
	    		   data: {office:office, patientid: authService.profileid, date:date, procedure:procedure}})
	        .success(function (data, status, headers, config) {
	            callback(null, data.appt);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding appointment request', data);
            	callback(data.message);
	        });
    	}

    	this.updateApptRequest = function(appt, callback) {
    		var inThis = this;
	        $http({method: 'POST', url: '/booking/update_appt', 
	    		   data: {appt:appt}})
	        .success(function (data, status, headers, config) {
	        	if (callback) {
	            	callback(null, data.appt);
	        	}
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding appointment request', data);
	            if (callback) {
            		callback(data.message);
	            }
	        });
    	}

    	this.getPatientAppts = function(callback) {
    		if (!authService.profileid) {
    			callback('Please login to request an appointment');
    			return;
    		}
    		var inThis = this;
    		$http({method: 'GET', url: '/booking/patient_appts/' + authService.profileid})
	        .success(function (data, status, headers, config) {
	            callback(null, data.appts);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error fetching patient appointments', data);
            	callback(data.message);
	        });
    	}

    	this.getProviderAppts = function(startdate, enddate, officeid, providerid, callback) {
    		var inThis = this;
    		$http({method: 'POST', url: '/booking/provider_appts/' + providerid,
    			   data: {start:startdate, end:enddate, office:officeid}})
	        .success(function (data, status, headers, config) {
	            callback(null, data.appts);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error fetching provider appointments', data);
            	callback(data.message);
	        });
    	}

}]);