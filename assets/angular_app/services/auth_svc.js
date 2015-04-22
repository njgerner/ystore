trdServices.service("authService", ['$rootScope', '$http', '$cookieStore', 'trdInterceptor',
    function ($rootScope, $http, $cookieStore, trdInterceptor) {
	    this.authorizationReceived = false;
		this.authorized = false;

		this.clearAuthorization = function() {
			this.authorizationReceived = false;
			this.authorized = false;
			this.stripePubKey = null;
			this.userid = null;
			this.profile = null;
			this.profileid = null;
			this.isAdmin = null;
		};

		this.getAuthorization = function(callback) {
			if (!trdInterceptor.getToken()) {
				// if there's no token, then it can't be authorized
				this.authorizationReceived = true;
				this.authorized = false;
				callback(this.authorized);
			} else {
				// if auth has not been received, and we have a token, check authorization
				var internalThis = this;
				$http({method: 'GET', url: "/authorized"}).
				    success(function(data, status, headers, config) {
				    	console.log("AUTH DATA", data);
				    	if (!data || !data.user || !data.profile) {
				    		// something's wrong, not authorized
				    		internalThis.authorizationReceived = true;
				    		internalThis.authorized = false;
				    		callback(internalThis.authorized);
				    	} else {
					      	internalThis.email = data.profile.email;
					      	internalThis.isAdmin = data.isAdmin;
					      	internalThis.profile = data.profile;
					      	internalThis.profileid = data.profile.id;
					      	internalThis.authorizationReceived = true;
					      	internalThis.authorized = true;
					      	internalThis.loggedin = true;
					      	callback(internalThis.authorized);
					      	$rootScope.$broadcast('authorizationloaded', internalThis.authorized);
				    	}
				    }).
				    error(function(data, status, headers, config) {
				    	console.log("AUTH ERROR", data, status);
				      	internalThis.authorizationReceived = true;
				      	internalThis.authorized = false;
				      	callback(internalThis.authorized);
				    });
				}
		};

		this.loginWithToken = function(token, callback) {
			this.clearAuthorization();
			var internalThis = this;
			$http({method: 'GET', url: '/login?token=' + token})
			    .success(function (data, status, headers, config) {
			    	console.log('loginwithtoken data', data, status);
			    	if (data.tkn) {
			    		trdInterceptor.setToken(data.tkn);
			    		callback(null, data.message);
			    	} else {
			    		callback(data.message || "FAILED TO LOGIN.");
			    	}
			    })
			    .error(function (data, status, headers, config) {
			    	callback("FAILED TO LOGIN");
			    });
		};

		this.login = function(email, password, callback) {
			this.clearAuthorization();
			var internalThis = this;
			$http({method: 'POST', url: "/login",
					headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
					data:$.param({email:email, password:password})}).
			    success(function (data, status, headers, config) {
			    	console.log('login data', data, status);
			    	if (data.tempPwd && data.tkn) {
			    		trdInterceptor.setToken(data.tkn);
			    		callback(null, "temp_password");
			    	} else if (data.tkn) {
			    		trdInterceptor.setToken(data.tkn);
			    		// internalThis.authorizationReceived = true;
					    // internalThis.authorized = true;
			    		callback(null, "success!");
			    	}
			    	else {
			    		callback(data.message, null);
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data, null);
			    });
		};

		this.register = function(email, password, callback) {
			this.clearAuthorization();
			var internalThis = this;
			$http({method: 'POST', url: '/register',
					headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
					data:$.param({email:email, password:password})}).
			    success(function(data, status, headers, config) {
			 			if(data.tkn) {
			 				trdInterceptor.setToken(data.tkn);
			 			}
			 			// console.log("return from server", data);
			    	callback(data.err, data.status);
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data);
			    });
		};

		this.resendEmail = function(email, callback) {
			$http({method: 'POST', url: '/resend_email?email=' + email}).
			    success(function(data, status, headers, config) {
			    	callback(data);
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data);
			    });
		};

		this.requestPasswordReset = function(email, callback) {
			$http({method: 'GET', 
					url: '/request_pass_reset/' + email, 
					headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
				 }).
			    success(function(data, status, headers, config) {
			    	if (data == 'success') {
			    		callback(null, "Please check your email for instructions on resetting your password.");
			    	} else {
			    		callback(data);
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	callback("FAILED TO RESET");
			    });
		};

		this.updatePassword = function(resettoken, password, callback) {
			$http({method: 'POST', url: '/update_password',
					headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
					data:$.param({resettoken:resettoken, password:password})
				}).
			    success(function(data, status, headers, config) {
			    	if(data.success) {
			    		callback(null, "Password has been successfully updated.");
			    	}else {
			    		callback(data.message || "FAILED TO UPDATE PASSWORD.");
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	callback("FAILED TO UPDATE PASSWORD");
			    });
			}; 

		this.unsubscribe = function(email, callback) {
			$http({method: 'POST', url:"/unsubscribe", data:{email:email}}).
				success(function (data, status, headers, config) {
					if (data && data.success) {
						callback(null, data.success);
					} else {
			    		callback(data.message || "FAILED TO UNSUBSCRIBE.");
					}
				}).
				error(function(data, status, headers, config) {
			    	callback("FAILED TO UNSUBSCRIBE");
				});
		};	

}]);