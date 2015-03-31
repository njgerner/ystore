trdApp.factory('trdInterceptor', ['$cookieStore', function($cookieStore) {

    var trdInterceptor = {
    	request: function(config) {
    		if (trdInterceptor.getToken()) {
	    		config.headers["Authorization"] = "Bearer " + trdInterceptor.token;
	    	}
    		if (config.url.indexOf('html') == -1 && trdInterceptor.getAPIURL()) {
    			if (config.url.charAt(0) != "/") {
    				config.url = "/" + config.url;
    			}
	    		config.url = trdInterceptor.getAPIURL() + config.url;
	    	}
    		return config;
    	}
    };

    trdInterceptor.server = window.SERVER || '{{fill_in_server}}';
	trdInterceptor.apiURL = window.CORDOVA ? trdInterceptor.server : null;
	trdInterceptor.token = null;

	trdInterceptor.getAPIURL = function() {
		return trdInterceptor.apiURL || null;
	}

	trdInterceptor.getToken = function() {
		trdInterceptor.token = trdInterceptor.token || $cookieStore.get('trdTkn');
		return trdInterceptor.token;
	}

	trdInterceptor.setToken = function(tkn) {
		trdInterceptor.token = tkn;
		$cookieStore.put('trdTkn', tkn );
	};

    return trdInterceptor;
}]);