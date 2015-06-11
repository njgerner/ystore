superApp.controller('RegisterCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$window', '$timeout', 
  		'stripeService', 'storeService', 'trainingService',
  function($rootScope, $scope, $state, authService, $location, $window, $timeout, 
  		stripeService, storeService, trainingService) {

  	$scope.staff = [];
  	$scope.viewState = 'start';
    $scope.total = 5995;

  	$scope.$watch('billingsame', function(newValue, oldValue) {
		if (newValue && $scope.billingsame) {
			// apply mailing address to billing fields
			$scope.billingname = $scope.name;
			$scope.billingaddress1 = $scope.address1;
			$scope.billingaddress2 = $scope.address2;
			$scope.billingcity = $scope.city;
			$scope.billingstate = $scope.state;
			$scope.billingzip = $scope.zip;
			$scope.billingcountry = $scope.country;
		}
	});

  	$scope.getNumber = function(num) {
  		var arr = [];
  		for (var i = 0; i < num; i++) {
  			arr.push(i);
  		}
  		return arr;
	}

  	$scope.goTo = function(state) {
  		if (validate(state)) {
  			$scope.viewState = state;
  		} 
  	}

    $scope.backTo = function(state) {
      $scope.viewState = state;
      $scope.error = null;
    }

  	$scope.submit = function() {
  		$scope.validating = true;
  		if ($scope.cctype == 'check') {
  			var customer = {
	        	name: $scope.name,
	        	address1: $scope.address1,
	        	address2: $scope.address2,
	        	city: $scope.city,
	        	state: $scope.state,
	        	zip: $scope.zip,
	        	country: $scope.country,
	        	phone: $scope.phone,
	        	fax: $scope.fax,
            specialty: $scope.specialty,
	        	uses_filler: $scope.uses_filler,
	        	medlicense: $scope.medlicensenum,
	        	filler_revenue_pct: $scope.filler_revenue_pct,
	        	filler_procedures: $scope.filler_procedures,
            training_location: $scope.location,
	        	training_date: $scope.training_date,
	        	certname: $scope.certname,
	        	staff: $scope.staff
	        };
  			storeService.submitCheckOrder(customer, $scope.total, function (err, result) {
  				$scope.validating = false;
  				if (err) {
	  				$scope.error = err;
	  			} else {
	  				$scope.viewState = 'success';
	  			}
  			});
  		} else {
	  		stripeService.submitOrder(undefined, undefined, undefined, undefined, $scope.total, function (err, result) {
          if (err) {
            $scope.error = err;
          } else {
            authService.addUserYLIFT(result.id, function (error) {
              $scope.validating = false;
              if (error) {
                $scope.error = error;
              } else {
                $scope.viewState = 'success';
              }
            });
          }
	  		});
  		}
  	}

  	$scope.resetScope = function() {
  		$state.go($state.current, {}, {reload: true});
  	}

    $scope.registerIndividual = function() {
      $scope.failedMessage = null;
      if ($scope.password !== $scope.confirmpassword) {
        $scope.failedMessage = "Passwords must match!";
        return;
      }
      $scope.registering = true;
      authService.register($scope.email, $scope.password, function(err, status) {
        if (err) {
          $scope.registering = false;
          $scope.failedMessage = status;
        } else {
          $state.go(status);
        }
      });
    }

    function onTrainingDatesLoaded(dates) {
      $scope.dates = dates;
    }

// START VALIDATION
  	function validate(state) {
  		$scope.validating = true;
  		$scope.error = null;
  		if (state == 'form2') {
  			if (!$scope.name) {
  				$scope.error = 'Please enter your name to register';
  			} else if (!$scope.address1) {
  				$scope.error = 'Please enter an address';
  			} else if (!$scope.city) {
  				$scope.error = 'Please enter a city';
  			} else if (!$scope.state || $scope.state.length != 2) {
  				$scope.error = 'Please enter a two letter state identifier';
  			} else if (!$scope.zip || $scope.zip.length != 5) {
  				$scope.error = 'Please enter a five digit zip';
  			} else if (!$scope.email) {
  				$scope.error = 'Please enter an email address';
  			} else if (!$scope.phone) {
  				$scope.error = 'Please enter a phone number';
        } else {
  				$scope.validating = false;
  				return true;
  			}
  			$scope.validating = false;
  			return false;
  		} else if (state == 'form3') {
        $scope.validating = true;
        if (!$scope.medlicensenum) {
          $scope.error = 'Please enter your medical license number';
        } else {
          $scope.validating = false;
          return true;
        }
        $scope.validating = false;
  			return false; // no validations for now
  		} else if (state == 'form4') {
  			if (!$scope.certname) {
  				$scope.error = 'Please enter the name you\'d like to appear on your YLIFT certificate';
        } else if (!$scope.location) {
          $scope.error = 'Please select a training location';
  			} else {
  				$scope.validating = false;
  				return true;
  			}
  			$scope.validating = false;
  			return false;
  		} else if (state == 'form5') {
  			if ($scope.cctype == 'check') {
  				$scope.validating = false;
  				return true;
  			}
        if (!$scope.cardname) {
          $scope.error = 'Please enter your name as it appears on your card';
        }
  			if (!Stripe.card.validateCardNumber($scope.ccnum)) {
  				$scope.error = 'Please enter a valid credit card number';
  			}
  			if (!Stripe.card.validateCVC($scope.cvc)) {
  				$scope.error = 'Please enter a valid CVC code';
  			}
  			if (!Stripe.card.validateExpiry($scope.expmonth, $scope.expyear)) {
  				$scope.error = 'Please enter a valid expiration date';
  			} 
  			if ($scope.error) {
  				$scope.validating = false;
  				return false;
  			} else {
  				var card = {
		          number: $scope.ccnum,
		          cvc: $scope.cvc,
		          exp_month: $scope.expmonth,
		          exp_year: $scope.expyear
		        };
		        var billing = {
		          name: $scope.cardname,
		          address_line1: $scope.billingaddress1,
		          address_line2: $scope.billingaddress2,
		          address_city: $scope.billingcity,
		          address_state: $scope.billingstate,
		          address_zip: $scope.billingzip,
		          country: $scope.billingcountry
		        };
		        var meta = {
		        	name: $scope.name,
		        	address1: $scope.address1,
		        	address2: $scope.address2,
		        	city: $scope.city,
		        	state: $scope.state,
		        	zip: $scope.zip,
		        	country: $scope.country,
		        	phone: $scope.phone,
		        	fax: $scope.fax,
              uses_filler: $scope.uses_filler,
		        	specialty: $scope.specialty,
		        	medlicense: $scope.medlicensenum,
		        	filler_revenue_pct: $scope.filler_revenue_pct,
		        	filler_procedures: $scope.filler_procedures,
              training_location: $scope.location,
		        	training_date: $scope.training_date,
		        	certname: $scope.certname,
		        	staff: JSON.stringify($scope.staff)
		        };
  				stripeService.addCard(card, billing, function(result, error) {
  					if (error) {
  						$scope.error = error.message || error;
  						$scope.validating = false;
  						return false;
  					}
  					var props = {
  						email: $scope.email,
  						metadata: meta
  					};            
  					stripeService.updateGuestCustomer(props, function(customer) {
  						$scope.validating = false;
  						$scope.viewState = state;
  						return true;
  					});
  				});
        }

      } else if (state == 'review') {
        $scope.validating = true;
        if ($scope.password !== $scope.confirmpassword) {
          $scope.error = 'Passwords need to match';
          $scope.validating = false;
          return false;
        } else if (!$scope.password || !$scope.confirmpassword) {
          $scope.error = 'Please enter a password';
          $scope.validating = false;
          return false;
        } else if ($scope.password.length < 6) {
          $scope.error = 'Password must be at least 6 characters long';
          $scope.validating = false;
          return false;
        } else if (!$scope.loginemail) {
          $scope.error = 'Please enter an account login email';
          $scope.validating = false;
          return false;
        } else {
          $scope.profile = {};
          return authService.register($scope.loginemail, $scope.password, function (error, status) {
            $scope.validating = false;
            if (error) {
              $scope.error = status;
              return false;
            } else {
              return authService.getAuthorization(function (authorized) {
                if (authorized) {
                  $scope.profile = authService.profile;
                }
                $scope.viewState = state;
                return true;
              });
            }
          });
        }
      }
  	}
// END VALIDATION

  trainingService.getAvailableDates(onTrainingDatesLoaded);

}]);