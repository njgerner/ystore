trdServices.service("bookingService", ['$rootScope', '$http', '$cookieStore', '$log', 'authService',
    function ($rootScope, $http, $cookieStore, $log, authService) {

    	this.patientAppts = [];
    	this.apptsByProvider = {};

    	this.sendApptRequest = function(date, providerid, procedure, callback) {
    		var inThis = this;
	        $http({method: 'POST', url: '/booking/request_appt/' + providerid, 
	    		   data: {patientid: authService.profileid, date:date, procedure:procedure}})
	        .success(function (data, status, headers, config) {
	        	inThis.patientAppts.push(data.appt);
	        	inThis.apptsByProvider[providerid] = inThis.apptsByProvider[providerid] || [];
	        	inThis.apptsByProvider[providerid].push(data.appt);
	            callback(null, data.appt);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding appointment request', data);
            	callback(data.message);
	        });
    	}

    	this.getPatientAppts = function(callback) {
    		var inThis = this;
    		$http({method: 'GET', url: '/booking/patient_appts/' + authService.profileid})
	        .success(function (data, status, headers, config) {
	        	inThis.patientAppts = data.appts;
	        	for (var i = 0; i < inThis.patientAppts.length; i++) {
	        		inThis.apptsByProvider[inThis.patientAppts[i].provider] = inThis.apptsByProvider[inThis.patientAppts[i].provider] || [];
	        		inThis.apptsByProvider[inThis.patientAppts[i].provider].push(inThis.patientAppts[i]);
	        	}
	            callback(null, data.appts);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error fetching patient appointments', data);
            	callback(data.message);
	        });
    	}

    	this.getProviderAppts = function(startdate, enddate, providerid, callback) {
    		var inThis = this;
    		$http({method: 'POST', url: '/booking/provider_appts/' + providerid,
    			   data: {start:startdate, end:enddate}})
	        .success(function (data, status, headers, config) {
        		inThis.apptsByProvider[providerid] = inThis.apptsByProvider[providerid] || [];
        		inThis.apptsByProvider[providerid].push(data.appts);
	            callback(null, data.appts);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error fetching provider appointments', data);
            	callback(data.message);
	        });
    	}

}]);