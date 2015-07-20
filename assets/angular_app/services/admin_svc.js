trdServices.service("adminService", ['$rootScope', '$http', 'authService', 'merchantService', 'profileService', '$cookieStore', '$log',
    function ($rootScope, $http, authService, merchantService, profileService, $cookieStore, $log) {

    	this.merchantProfilesByID = {};
    	this.profilesByID = {};
    	this.productsByProductnumber = {};
    	this.productsByVendor = {};

    	this.getProfileByID = function(id, callback) {
    		if(this.profilesByID[id] !== undefined) {
    			callback(null, this.profilesByID[id]);
    		}else {
    			var inThis = this;
    			$http({method: 'GET', url: '/admin/profile/' + id})
		        .success(function (data, status, headers, config) {
		            callback(null, data.profile);
		            inThis.profilesByID[data.profile.id] = data.profile;
		        })
		        .error(function (data, status, headers, config) {
		            $log.debug('error getting profile', data);
	            	callback(data.message);
		        });
    		}
    	};

    	this.getAllProducts = function(callback) {
    		var inThis = this;
	        $http({method: 'GET', url: '/admin/all_products'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.products);
	            for(var i = 0; i < data.products.length; i++) {
	            	inThis.productsByProductnumber[data.products[i].productnumber] = data.products[i];
	            	inThis.productsByVendor[data.products[i].attributes.vendor] = data.products[i];
	            } 
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting all products', data);
            	callback(data.message);
	        });
    	};

    	this.getProduct = function(productnumber, callback) {
    		if(this.productsByProductnumber[productnumber]) {
    			callback(this.productsByProductnumber[productnumber]);
    		} else {
    			var inThis = this;
    			$http({method: 'GET', url: '/admin/product/' + productnumber})
		        .success(function (data, status, headers, config) {
		            callback(null, data.product);
		            inThis.productsByProductnumber[data.product.productnumber] = data.product;
		        })
		        .error(function (data, status, headers, config) {
		            $log.debug('error getting product', data);
	            	callback(data.message);
		        });
    		}
    	};

    	this.getAllProfiles = function(callback) {
    		var inThis = this;
	        $http({method: 'GET', url: '/admin/all_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	            for(var i = 0; i < data.profiles.length; i++) {
	            	inThis.profilesByID[data.profiles[i].id] = data.profiles[i];
	            } 
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting all profiles', data);
            	callback(data.message);
	        });
    	};

    	this.getAddresses = function(profileid, callback) {
    		$http({method: 'GET', url: '/admin/addresses/' + profileid})
	        .success(function (data, status, headers, config) {
	            callback(null, data.addresses);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting addresses', data);
            	callback(data.message);
	        });
    	};

    	this.addAddress = function(address, callback) {
    		$http({method: 'POST', url: '/admin/add_address/', data: {address:address} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.address);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating address', data);
            	callback(data.message);
	        });
    	};

    	this.updateAddress = function(address, callback) {
    		$http({method: 'POST', url: '/admin/update_address/', data: {address:address} })
	        .success(function (data, status, headers, config) {
	            if(callback) {
	            	callback(null, data.address);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating address', data);
            	if(callback) {
            		callback(data.message);
            	}
	        });
    	};

    	this.deleteAddress = function(address, callback) {
    		$http({method: 'POST', url: '/admin/delete_address/', data: {address:address} })
	        .success(function (data, status, headers, config) {
	            if(callback) {
	            	callback(null, data.success);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error deleting address', data);
            	if(callback) {
            		callback(data.message);
            	}
	        });
    	};

    	this.getAllMerchantProfiles = function(callback) {
    		var inThis = this;
    		$http({method: 'GET', url: '/admin/all_merchants'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	            for(var i = 0; i < data.profiles.length; i++) {
	            	inThis.merchantProfilesByID[data.profiles[i].id] = data.profiles[i];
	            } 
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting all merchant profiles', data);
            	callback(data.message);
	        });
    	}

    	this.getMerchantProfile = function(id, callback) {
    		if(this.merchantProfilesByID[id] !== undefined) {
    			callback(null, this.merchantProfilesByID[id]);
    		}else{
    			merchantService.getMerchantByID(id, callback);
    		}
    	}

    	this.getAllYLIFTProfiles = function(callback) {
    		$http({method: 'GET', url: '/admin/all_ylift_profiles'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.profiles);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting ylift profiles', data);
	            callback(data.message);
	        });
    	}

    	this.getAllOrders = function(callback) {
    		$http({method: 'GET', url: '/admin/all_orders'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.orders);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting orders', data);
	            callback(data.message);
	        });
    	}

    	this.getAvailableRegKeys = function(callback) {
    		$http({method: 'POST', url: '/admin/regkeys'})
	        .success(function (data, status, headers, config) {
	        	callback(null, data.keys);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting available keys', data);
	            callback(data.message);
	        });
    	}

    	this.getHash = function(profileid, callback) {
    		$http({method: 'POST', url: '/admin/hash', data: {profileid:profileid} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.hash);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting hash', data);
	            callback(data.message);
	        });
    	}

    	this.addRegKey = function(regkey, callback) {
    		$http({method: 'POST', url: '/admin/add_regkey', data: {regkey:regkey} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.regkey);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding key', data);
	            callback(data.message);
	        });
	    };

    	this.addProduct = function(product, callback) {
    		$http({method: 'POST', url: '/admin/add_product', data: {product:product} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.product);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting ylift profiles', data);
	            callback(data.message);
	        });
    	};

    	this.updateMerchantProfile = function(profile, callback) {
	        var inThis = this;
	        $http({method: 'POST', url: '/admin/profile/update_merchant', 
	               data:{profile:profile}})
	        .success(function (data, status, headers, config) {
	            inThis.merchant = data.profile;
	            callback(null, data.profile);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating merchant profile', data);
	            callback(data.message);
	        });
	    }

	    this.updateUserProfile = function(profile, callback) {
	    	$http({method: 'POST', url: '/admin/update_user_profile', 
	               data:{profile:profile}})
	        .success(function (data, status, headers, config) {
	            if(callback) {
	            	callback(null, data.profile);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating user profile', data);
	            if(callback) {
	            	callback(data.message);
	            }
	        });
	    }

    	this.addPromoCode = function(promo, callback) {
    		$http({method: 'POST', url: '/admin/add_promo', data: {promo:promo} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.promo);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding promo', data);
	            callback(data.message);
	        });
    	}

    	this.deletePromo = function(promo, callback) {
    		$http({method: 'POST', url: '/admin/delete_promo', data: {promo:promo} })
	        .success(function (data, status, headers, config) {
	            callback(null, data.success);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error deleting promo', data);
	            callback(data.message);
	        });
    	};

    	this.getAllPromoCodes = function(callback) {
    		$http({method: 'GET', url: '/admin/promos'})
	        .success(function (data, status, headers, config) {
	            callback(null, data.promos);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting promo codes', data);
	            callback(data.message);
	        });
    	};

    	this.addProduct = function(product, merchant, callback) {
            $http({method: 'POST', url: "/add_product",
                   data: {product:product, merchant:merchant}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error adding product', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

}]);