superApp.controller('SettingsStoreCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'stripeService', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, stripeService, $window) {

    $scope.loadingOrders = true;
    $scope.loadingCustomer = true;
    $scope.customerUpdating = false;
    $scope.addPaymentView = false;
    $scope.orders = {};
  	$scope.customer = {};

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

    $scope.makeDefaultShipTo = function(ind) {
      $scope.updatingShipTo = true;
      for (var i = 0; i < $scope.addresses.length; i++) {
        if ($scope.addresses[i].default) {
          $scope.addresses[i].default = false;
        }
      }
      $scope.addresses[ind].default = true;
      $scope.profile.addresses = $scope.addresses;
      $scope.updateProfile(function () {
        $scope.updatingShipTo = false;
        console.log('done updating', $scope.addresses);
      });
    }

    $scope.onPaymentAdded = function(customer, error) {
      if (error) {
        $scope.error = error;
      } else {
        $scope.onCustomerLoaded(customer);
        $scope.customerUpdating = false;
        $scope.toggleAddPayment();
      }
    }

    $scope.onPaymentRemoved = function(customer, error) {
      if (error) {
        $scope.error = error;
      } else {
        $scope.onCustomerLoaded(customer);
        $scope.removingCard = false;
      }
    }

  	$scope.goToOrder = function (id) {
  		$state.go("order", {orderid:id});
  	}

    $scope.toggleAddPayment = function() {
      $scope.addPaymentView = !$scope.addPaymentView;
    }

    $scope.addPayment = function() {
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
        stripeService.addCard($scope.card, $scope.billing, $scope.onPaymentAdded);
      } else {
        $scope.error = "Please fill out all credit card information";
        $scope.customerUpdating = false;
      }
    }

    $scope.removePayment = function(cardid) {
      if ($window.confirm('Are you sure? This will remove your credit card information from our database.')) {
        $scope.removingCard = true;
        stripeService.removeCard(cardid, $scope.onPaymentRemoved);
      }
    }

    $scope.selectShipTo = function(ind) {
      if ($scope.shipTo == $scope.addresses[ind]) {
        $scope.shipTo = null;
        $scope.showShipToView = false;
        return;
      }
      $scope.shipTo = $scope.addresses[ind];
      $scope.addressname = $scope.shipTo.name;
      $scope.address1 = $scope.shipTo.address1;
      $scope.address2 = $scope.shipTo.address2;
      $scope.city = $scope.shipTo.city;
      $scope.state = $scope.shipTo.state;
      $scope.zip = $scope.shipTo.zip;  
      $scope.showShipToView = true;
    };

    $scope.onCustomerLoaded = function (customer) {
      console.log('customer loaded', customer, authService.profile);
      $scope.customer = customer;
      $scope.cards = $scope.customer.sources.data;
      $scope.loadingCustomer = false;
    }

  	$scope.onOrdersLoaded = function (orders) {
  		$scope.orders = orders;
      $scope.loadingOrders = false;
  	}

  	storeService.getOrdersByUserID(authService.profile.id, $scope.onOrdersLoaded);
    stripeService.getCustomer(authService.profile.customerid, $scope.onCustomerLoaded);
}]);