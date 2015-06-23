superApp.controller('CheckoutBillingCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, stripeService) {
    $scope.processingBillingInfo = false;
    $scope.addPaymentView = false;
  	$scope.ccnum = null;
    $scope.cvc = null;
    $scope.exp = null;
    $scope.namecard = null;
    $scope.billingname = null;
    $scope.billingaddress1 = null;
    $scope.billingaddress2 = null;
    $scope.billingcity = null;
    $scope.billingstate = null;
    $scope.billingzip = null;
    $scope.error = null;

    $scope.toggleAddPayment = function() {
      $scope.addPaymentView = !$scope.addPaymentView;
    };

    $scope.selectPayment = function(index) {
      if ($scope.paymentMethod == $scope.cards[index]) {
        $scope.paymentMethod = null;
        stripeService.setCard(null);
      } else {
        $scope.paymentMethod = $scope.cards[index];
        stripeService.setCard($scope.paymentMethod);
      }
    };

    $scope.isCardSelected = function(index) {
      return $scope.paymentMethod == $scope.cards[index];
    }
    
   	$scope.creditCardFieldsComplete = function() {
   		return $scope.validCCNum() && $scope.namecard && $scope.validCVC() && $scope.validExpDate();
   	}

   	$scope.billingFieldsComplete = function() {
   		return $scope.billingname && $scope.billingaddress1 && $scope.billingcity && $scope.billingstate && $scope.billingzip;
   	}

   	$scope.validCCNum = function() {
   		return Stripe.card.validateCardNumber($scope.ccnum);
   	}

   	$scope.validCVC = function() {
   		return Stripe.card.validateCVC($scope.cvc);
   	}

   	$scope.validExpDate = function() {
      if ($scope.exp == undefined) {
        return false;
      } else {
        var exp = $scope.exp.split("/");
   		 return Stripe.card.validateExpiry(exp[0], exp[1]);
      }
   	}

    $scope.formatExp = function(exp1) {
      if ($scope.exp && $scope.exp.length == 2 && $scope.exp.slice(-1) != "/") {
        $scope.exp = $scope.exp + "/";  
      }
    }

   	$scope.goToSummary = function() {
      stripeService.setCard($scope.paymentMethod);
      $scope.nextState();
   	}

    $scope.addPayment = function() {
      if ($scope.customerUpdating) {
        return;
      }
      $scope.customerUpdating = true;
      if ($scope.creditCardFieldsComplete) {
        var exp = $scope.exp.split("/");
        $scope.card = {
          number: $scope.ccnum,
          cvc: $scope.cvc,
          exp_month: exp[0],
          exp_year: exp[1]
        };
        $scope.billing = {
          name: $scope.billingname,
          address_line1: $scope.billingaddress1,
          address_line2: $scope.billingaddress2,
          address_city: $scope.billingcity,
          address_state: $scope.billingstate,
          address_zip: $scope.billingzip
        };
        stripeService.addCard($scope.card, $scope.billing, onPaymentAdded);
      } else {
        $scope.error = "Please fill out all credit card information";
        $scope.customerUpdating = false;
      }
    }

    function onPaymentAdded (customer, error) {
      $scope.customerUpdating = false;
      if (error) {
        $scope.error = error;
      } else {
        onCustomerLoaded(customer);
        $scope.toggleAddPayment();
      }
    }

    function onCustomerLoaded (customer) {
      $scope.customer = customer;
      $scope.cards = $scope.customer.sources.data;
      $scope.loadingCustomer = false;
    }

    if ($scope.profile && $scope.profile.customerid) {
      stripeService.getCustomer($scope.profile.customerid, onCustomerLoaded);
    } else {
      $scope.loadingCustomer = false;
      $scope.toggleAddPayment();
    }

}]);