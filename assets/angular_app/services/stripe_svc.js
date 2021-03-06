trdServices.service('stripeService', ['$rootScope', '$http', '$cookieStore', 'authService', 'PUBLISH', 
  '$log', 'promoService',
    function ($rootScope, $http, $cookieStore, authService, stripePubKey, 
      $log, promoService) {

      Stripe.setPublishableKey(stripePubKey);

      this.initService = function() {
        this.token = null;
        this.card = null;
        this.customer = {};
        this.customerReceived = false;
      }

      this.initService();

    	this.setToken = function(token) {
    		this.token = token;
    	}

      this.setCard = function(card) {
        this.card = card;
      }

      this.setCustomer = function(customer) {
        this.customer = customer;
      }

    	this.getToken = function() {
    		return this.token;
    	}

      this.getCard = function() {
        return this.card;
      }

    	this.addCard = function(data, billing, callback, meta) {
        var inThis = this;
        Stripe.card.createToken({
          number: data.number,
          cvc: data.cvc,
          exp_month: data.exp_month,
          exp_year: data.exp_year,
          name: billing.name,
          address_line1: billing.address_line1,
          address_line2: billing.address_line2,
          address_city: billing.address_city,
          address_state: billing.address_state,
          address_zip: billing.address_zip,
          metadata: meta
				}, function (status, response) {
          if (status.error) {
            callback(status.error);
          } else if (!authService.authorized) {
            inThis.addGuestCustomer(response, callback);
          } else if (!authService.profile.customerid) {
            $http({method: 'POST', url: "/add_customer/" + authService.profile.id, data: {card:response.id,email:authService.profile.email}})
            .success(function(data, status, headers, config) {
              inThis.customerReceived = true;
              inThis.customer = data.customer;
              inThis.card = data.customer.default_source;
              callback(inThis.customer);
            })
            .error(function(data, status, headers, config) {
              $log.debug('error adding card', data);
              callback(null, data.message);
            });
          } else {
            $http({method: 'POST', url: "/add_token_to_customer/" + authService.profile.id + "/" + authService.profile.customerid, data: {token:response.id}})
            .success(function(data, status, headers, config) {
              inThis.customerReceived = true;
              inThis.customer = data.customer;
              callback(inThis.customer);
            })
            .error(function(data, status, headers, config) {
              $log.debug('error adding token to customer', data);
              callback(null, data.message);
            });
          }
        });
    	};

      this.removeCard = function(cardid, callback) {
        var inThis = this;
        $http({method: 'POST', url: "/remove_card_from_customer/" + authService.profile.id + "/" + inThis.customer.id, data: {cardid:cardid}})
        .success(function(data, status, headers, config) {
          inThis.customerReceived = true;
          inThis.customer = data.customer;
          callback(inThis.customer);
        })
        .error(function(data, status, headers, config) {
          callback(null, data.err);
        });
      }

      this.getCustomer = function(customerid, callback) {
        if (this.customerReceived) {
          callback(this.customer);
          return;
        }
        var inThis = this;
        $http({method: 'GET', url: "/get_customer/" + customerid})
          .success(function(data, status, headers, config) {
            inThis.customerReceived = true;
            inThis.customer = data.customer;
            callback(data.customer);
          })
          .error(function(data, status, headers, config) {
            inThis.customerReceived = false;
            callback();
          });

      };

    	this.addCustomer = function(card, callback) {
    		var internalThis = this;
    		$http({method: 'POST', url: "/add_customer/" + authService.profile.id,
          data:{card:card, email:authService.profile.email}})
    			.success(function(data, status, headers, config) {
            internalThis.customerReceived = true;
            internalThis.customer = data.customer;
            callback(data.customer);
          })
          .error(function(data, status, headers, config) {
            console.log('error adding customer', data.err);
            callback(mull, data.message);
          });
    	};

      this.addGuestCustomer = function(card, callback) {
        var internalThis = this;
        $http({method: 'POST', url: "/add_guest_customer",
          data:{card:card}})
          .success(function(data, status, headers, config) {
            internalThis.customerReceived = true;
            internalThis.customer = data.customer;
            internalThis.card = data.customer.default_source;
            callback(data.customer);
          })
          .error(function(data, status, headers, config) {
            callback(null, data.message);
          });
      };

      this.updateCustomer = function(props, callback) {
        var inThis = this;
        Stripe.customers.update(this.customer.id, props, function(err, customer) { 
          if (err) {
            callback();
            return;
          }       
          $http({method: 'POST', url: "/update_customer/" + authService.profile.id,
            data:{customer:customer}})
            .success(function(data, status, headers, config) {
              internalThis.customerReceived = true;
              internalThis.customer = data.customer;
              callback(data.customer);
            })
            .error(function(data, status, headers, config) {
              callback();
            });
        })
      };

      this.updateGuestCustomer = function(props, callback) {
        var inThis = this;      
        $http({method: 'POST', url: "/update_guest_customer",
          data:{customerid:inThis.customer.id, props:props}})
          .success(function(data, status, headers, config) {
            inThis.customerReceived = true;
            inThis.customer = data.customer;
            callback(data.customer);
          })
          .error(function(data, status, headers, config) {
            callback(null, data.message);
          });
      };

    	this.submitOrder = function(addressShipTo, productsInCart, merchants, shipping, total, callback) {
        if (!this.card) {
           callback("Invalid credit card info, please check that the information provided is correct and try again.", null);
        } else { // i need a dolla dolla, a dolla is all i neeeeeeed
          var inThis = this;
          $http({method: 'POST', url: "/process_transaction?profile=" + (authService.profileid || ""),
        		data:{card:inThis.card, customer:inThis.customer, addressShipTo:addressShipTo, productsInCart:productsInCart,
                  total:total, shipping:shipping, merchants:merchants, promo:promoService.currentPromo}})
            .success(function(data, status, headers, config) {
                callback(null, {id: data.order.id, success: data.success});
            })
            .error(function(data, status, headers, config) {
              callback(data.message || "There was an error processing your order, please try again. If this issue persists, please contact YLift Support (support@ylift.io).");
            });
        }
      }

      $rootScope.$on('loggedout', function(evt, args) {
        this.initService;
      });

}]);