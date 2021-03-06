trdServices.service("authService", ['$rootScope', '$http', '$cookieStore', 'trdInterceptor', '$log',
    function ($rootScope, $http, $cookieStore, trdInterceptor, $log) {
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
			this.isYLIFT = null;
		};

		this.getAuthorization = function(callback) {
			if (!trdInterceptor.getToken()) {
				// if there's no token, then it can't be authorized
				this.authorizationReceived = true;
				this.authorized = false;
				callback(this.authorized);
				$rootScope.$broadcast('authorizationloaded', this.authorized);
			} else {
				// if auth has not been received, and we have a token, check authorization
				var internalThis = this;
				$http({method: 'GET', url: "/authorized"}).
				    success(function(data, status, headers, config) {
				    	if (!data || !data.user || !data.profile) {
				    		// something's wrong, not authorized
				    		internalThis.authorizationReceived = true;
				    		internalThis.authorized = false;
				      		$rootScope.$broadcast('authorizationloaded', internalThis.authorized);
				    		callback(internalThis.authorized);
				    	} else {
					      	internalThis.email = data.profile.email;
					      	internalThis.isAdmin = data.isAdmin;
					      	internalThis.isYLIFT = data.isYLIFT;
					      	internalThis.profile = data.profile;
					      	internalThis.profileid = data.profile.id;
					      	internalThis.authorizationReceived = true;
					      	internalThis.authorized = true;
					      	internalThis.loggedin = true;
				      		$rootScope.$broadcast('authorizationloaded', internalThis.authorized);
					      	callback(internalThis.authorized);
				    	}
				    }).
				    error(function(data, status, headers, config) {
				      	internalThis.authorizationReceived = true;
				      	internalThis.authorized = false;
				      	$rootScope.$broadcast('authorizationloaded', internalThis.authorized);
				      	callback(internalThis.authorized);
				    });
				}
		};

		this.loginWithToken = function(token, callback) {
			this.clearAuthorization();
			var internalThis = this;
			$http({method: 'GET', url: '/login?token=' + token})
			    .success(function (data, status, headers, config) {
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
			    	if (data.tkn) {
			    		trdInterceptor.setToken(data.tkn);
			    		callback(null, "success!");
			    	}
			    	else {
			    		$log.debug('error login in', data);
			    		callback(data.message, null);
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	$log.debug('error login in', data);
			    	callback(data.message, null);
			    });
		};

		this.register = function(email, password, callback, metadata) {
			this.clearAuthorization();
			var internalThis = this;
			$http({method: 'POST', url: '/register',
					headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
					data:$.param({email:email, password:password, metadata:metadata})}).
			    success(function(data, status, headers, config) {
			 			if(data.tkn) {
			 				trdInterceptor.setToken(data.tkn);
			 			}
			    	callback(data.error, data.status);
			    }).
			    error(function(data, status, headers, config) {
			    	$log.debug('error registering user', data);
			    	callback(data.error, data.message);
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
			    		callback(data, null);
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data, null);
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
			    		callback(data.message || "FAILED TO UPDATE PASSWORD.", null);
			    	}
			    }).
			    error(function(data, status, headers, config) {
			    	callback(data.error || "FAILED TO UPDATE PASSWORD", null);
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

		this.addUserYLIFT = function(orderid, callback) {
			$http({method: 'POST', url:"/user/give_ylift", data:{orderid:orderid}}).
			success(function (data, status, headers, config) {
				callback(null);
			}).
			error(function(data, status, headers, config) {
		    	callback('There was an error associating your order with a YLIFT account, please reach out to YLIFT support.');
			});
		};

		this.validateResetToken = function(tokenid, callback) {
			$http({method: 'POST', url:"/validate_reset_token", data:{token:tokenid}}).
			success(function (data, status, headers, config) {
				if(data.valid) {
					callback(true);
				}else {
					callback(false, "Your reset token has expired. Please return to the login page to request another.");
				}
			}).
			error(function(data, status, headers, config) {
		    	callback(false, data);
			});
		};

}]);