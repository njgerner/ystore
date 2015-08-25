//===============ANGULAR==================//
var trdApp = angular.module('trdApp', [
  'ngRoute',
  'ngAnimate',
  'infinite-scroll',
  'ui.router',
  'trdApp.services',
  'trdApp.directives',
  'trdApp.controllers',
  'trdApp.factories',
  'trdApp.filters',
  'ui.slider',
  'dtrw.bcrypt',
  'ngTagsInput',
  'ngError',
  'flow',
  'env.config',
  'mm.foundation',
  'angulartics',
  'angulartics.google.analytics',
  'angularFileUpload'
]);

trdApp.run(['$rootScope', '$state', '$stateParams', '$cookies', '$location', 'authService', '$log',// watch these params in bin/www
    function ($rootScope, $state, $stateParams, $cookies, $location, authService, $log) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.isVisible = false;

      $rootScope.$on('$stateChangeStart', 
        function(event, toState, toParams, fromState, fromParams){
          $log.debug('to:: ' + toState.name, 'from:: ' + fromState.name);
          $log.debug('authorized / received', authService.authorized, authService.authorizationReceived);

          var isExceptionalState = function() {
            var exceptionalState = ["terms", "store", "checkout", "order", "support", "locations"];
            return exceptionalState.indexOf(toState.name) >= 0;
          }

          var isAuthorizedState = function() {
            var authStates = ["profile", "settings", "settings.profile", "settings.store", "settings.notifications", "orders", "leave_review", "merchant_orders", 
            "merchant_inventory", "office_scheduling"];
            return authStates.indexOf(toState.name) >= 0;
          }

          var isUnauthorizedState = function () {
            var unauthedStates = ["login", "login_by_token", "email_sent", "email_taken", "resend_email", "new_password", "reset_password", "register", "learn_more"];
            return unauthedStates.indexOf(toState.name) >= 0;
          };

          if (toState.name == "authorizing") {
            
          } else if (authService.authorizationReceived) {

            if (isExceptionalState()) {
              return;
            } else if (!authService.authorized && isAuthorizedState()) { // don't want non signed in people going to profile, settings, etc...
              event.preventDefault();
              $state.go("login");
            } else if (authService.authorized && isUnauthorizedState()) { // don't want signed in people going to login, pass reset, etc....
              event.preventDefault();
              $state.go("profile");
            } else { // non authorized can go to non authorized states
              return;
            }

          } else {
            event.preventDefault();
            $state.go("authorizing");
            authService.getAuthorization(function(authorized) {

              if (isExceptionalState()) {
                $state.go(toState.name, toParams);
              } else if (!authService.authorized && isAuthorizedState()) { // don't want non signed in people going to profile, settings, etc...
                $state.go("login");
              } else if (authService.authorized && isUnauthorizedState()) { // don't want signed in people going to login, pass reset, etc....
                $state.go("profile");
              } else { // non authorized can go to non authorized states
                $state.go(toState.name, toParams);
              }
            });
          }
      });

      $rootScope.$on('$stateChangeSuccess', 
        function(currentRoute, previousRoute) {
          $rootScope.title = $state.current.title;
      });

      // $rootScope.hideCart = function(callback) {
      //   // $('#cart').foundation('reveal', 'close');
      //   this.isVisible = false;
      //   callback(this.isVisible);
      // }

      // $rootScope.showCart = function(callback) {
      //   console.log('showing cart');
      //   // $('#cart').foundation('reveal', 'open');
      //   this.isVisible = true;
      //   callback(this.isVisible);
      // }

}]);

trdApp.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$analyticsProvider', '$locationProvider',
  '$logProvider', 'ENV',
  function($httpProvider, $stateProvider, $urlRouterProvider, $analyticsProvider, $locationProvider,
    $logProvider, ENV) {
    $httpProvider.interceptors.push('trdInterceptor');
    $urlRouterProvider.otherwise("/store");
    $locationProvider.hashPrefix('!'); // makes site crawlable 
    $logProvider.debugEnabled(ENV == 'DEV');
    
    $stateProvider
    .state('authorizing', {
      url: "/authorizing",
      templateUrl: "partials/authorizing.html",
    })
    .state('admin', {
      abstract: true,
      url: "/admin",
      templateUrl: "/partials/admin.html",
      controller: "AdminCtrl",
    })
    .state('admin.users', {
      url: "/users",
      templateUrl: "/partials/admin_users.html",
      controller: "AdminUsersCtrl",
      title: "Admin Users"
    })
    .state('admin.user', {
      url: "/user/:profileid",
      templateUrl: "/partials/admin_user.html",
      controller: "AdminUserCtrl",
      title: "Inspect User"
    })
    .state('admin.promo', {
      url: "/promo",
      templateUrl: "/partials/admin_promo.html",
      controller: "AdminPromoCtrl",
      title: "Promo Codes"
    })
    .state('admin.orders', {
      url: "/orders",
      templateUrl: "/partials/admin_orders.html",
      controller: "AdminOrdersCtrl",
      title: "Admin Orders"
    })
    .state('admin.order', {
      url: "/order/:orderid",
      templateUrl: "/partials/admin_order.html",
      controller: "AdminOrderCtrl",
      title: "Admin Order"
    })
    .state('admin.vendors', {
      url: "/vendors",
      templateUrl: "/partials/admin_vendors.html",
      controller: "AdminVendorsCtrl",
      title: "Admin Vendors"
    })
    .state('admin.vendor', {
      url: "/vendor/:merchantid",
      templateUrl: "/partials/admin_vendor.html",
      controller: "AdminVendorCtrl",
      title: "Admin Vendor"
    })
    .state('admin.new_vendor', {
      url: "/vendors/add",
      templateUrl: "/partials/admin_new_vendor.html",
      controller: "AdminNewVendorCtrl",
      title: "New Vendor"
    })
    .state('admin.products', {
      url: "/products/",
      templateUrl: "/partials/admin_products.html",
      controller: "AdminProductsCtrl",
      title: "Admin Products"
    })
    .state('admin.product', {
      url: "/product/:productnumber",
      templateUrl: "/partials/admin_product.html",
      controller: "AdminProductCtrl",
      title: "Admin Product"
    })
    .state('admin.addproduct', {
      url: "/add-product",
      templateUrl: "/partials/admin_new_product.html",
      controller: "AdminNewProductCtrl",
      title: "Add Product"
    })
    .state('admin.metrics', {
      url: "/metrics",
      templateUrl: "/partials/admin_metrics.html",
      controller: "AdminMetricsCtrl",
      title: "Admin Metrics"
    })
    .state('login', {
      url: "/login",
      templateUrl: "/partials/login.html",
      controller: "LoginCtrl",
      title: "Login"
    })
    .state('register', {
      url: "/register?view",
      templateUrl: "/partials/register.html",
      controller: "RegisterCtrl",
      title: "Register"
    })
    .state('register.home', {
      url: "/intro",
      templateUrl: "/partials/register_home.html",
      controller: "RegisterHomeCtrl",
      title: "Register"
    })
    .state('register.form', {
      url: "/form",
      templateUrl: "/partials/register_form.html",
      controller: "RegisterFormCtrl"
    })
    .state('logout', {
      url: "/logout",
      templateUrl: "/partials/logout.html",
      controller: "LogoutCtrl"
    })
    .state('order', {
      url: "/order/:orderid",
      templateUrl: "/partials/order.html",
      controller: "OrderCtrl",
      title: function ($stateParams) {
        return 'Order #' + $stateParams.orderid;
      }
    })
    .state('orders', {
      url: "/orders/:orderid",
      templateUrl: "/partials/orders.html",
      controller: "OrdersCtrl",
      title: "Account Orders"
    })
    .state('locations', {
      url: "/locations",
      templateUrl: "/partials/locations.html",
      controller: "LocationsCtrl",
      title: "Provider Locations"
    })
    .state('network', {
      url: "/network",
      templateUrl: "/partials/network.html",
      controller: "NetworkCtrl",
      title: "Network Information"
    })
    .state('office-scheduling', {
      url: "/scheduling",
      templateUrl: "/partials/office_scheduling.html",
      controller: "OfficeSchedulingCtrl",
      title: "Scheduling"
    })
    .state('merchant_inventory', {
      abstract: true,
      url: "/merchant-inventory",
      templateUrl: "/partials/merchant_inventory.html",
      controller: "MerchantInventoryCtrl"
    })
    .state('merchant_inventory.view', {
      url: "/view",
      templateUrl: "/partials/merchant_inventory_view.html",
      controller: "MerchantInventoryViewCtrl"
    })
    .state('merchant_inventory.product', {
      url: "/product/:productnumber",
      templateUrl: "/partials/merchant_inventory_product.html",
      controller: "MerchantInventoryProductCtrl"
    })
    .state('merchant_inventory.new_product', {
      url: "/new-product",
      templateUrl: "/partials/merchant_inventory_new_product.html",
      controller: "MerchantInventoryNewProductCtrl"
    })
    .state('merchant_orders', {
      url: "/merchant-orders",
      templateUrl: "/partials/merchant_orders.html",
      controller: "MerchantOrdersCtrl"
    })
    .state('limit_orders', {
      url: "/orders/:orderid/:limit",
      templateUrl: "/partials/limit_orders.html",
      controller: "OrdersCtrl"
    })
    .state('store', {
      url:"/store",
      templateUrl:"/partials/store.html",
      controller: "StoreCtrl",
      title: "Store"
    })
    .state('product', {
      url:"/product/:productnumber",
      templateUrl:"/partials/product.html",
      controller: "ProductCtrl"
    })
    .state('leave_review', {
      url:"/leave-review/:productnumber",
      templateUrl:"/partials/leave_review.html",
      controller: "LeaveReviewCtrl"
    })
    .state('search_results', {
      url:"/search-results?query",
      templateUrl:"/partials/search_results.html",
      controller:"SearchResultsCtrl"
    })
    .state('profile', {
      url:"/profile",
      templateUrl: "/partials/profile.html",
      controller: "ProfileCtrl",
      title: "Profile"
    })
    .state('reset_password', {
      url:"/reset-password/:resettoken",
      templateUrl: "/partials/reset_password.html",
      controller: "ResetPasswordCtrl",
      title: "Password Assistance"
    })
    .state('sell_info', {
      url:"/sell-info",
      templateUrl: "/partials/sell_with_us.html",
      controller: "SellInfoCtrl",
      title: "Sell with Y LIFT"
    })
    .state('about', {
      url:"/about",
      templateUrl: "/partials/about.html",
      controller: "AboutCtrl",
      title: "About"
    })
    .state('techniques', {
      url:"/techniques",
      templateUrl: "/partials/techniques.html",
      controller: "TechniquesCtrl"
    })
    .state('techniques.ylift', {
      parent: 'techniques',
      url:"/y-lift",
      templateUrl: "/partials/techniques_ylift.html",
      title: "Techniques: Y LIFT"
    })
    .state('techniques.yeye', {
      parent: 'techniques',
      url:"/y-eye",
      templateUrl: "/partials/techniques_yeye.html",
      title: "Techniques: Y EYE"
    })
    .state('techniques.botox', {
      parent: 'techniques',
      url:"/botox",
      templateUrl: "/partials/techniques_botox.html",
      title: "Techniques: Botox"
    })
    .state('techniques.skynjection', {
      parent: 'techniques',
      url:"/skynjection",
      templateUrl: "/partials/techniques_skynjection.html",
      title: "Techniques: skYnjection"
    })
    .state('techniques.chynjection', {
      parent: 'techniques',
      url:"/chynjection",
      templateUrl: "/partials/techniques_chynjection.html",
      title: "Techniques: chYnjection"
    })
    .state('techniques.hands', {
      parent: 'techniques',
      url:"/hands",
      templateUrl: "/partials/techniques_hands.html",
      title: "Techniques: Hands"
    })
    .state('techniques.injectables', {
      parent: 'techniques',
      url:"/injectables",
      templateUrl: "/partials/techniques_injectables.html",
      title: "Techniques: Injectables"
    })
    .state('techniques.laser', {
      parent: 'techniques',
      url:"/laser",
      templateUrl: "/partials/techniques_laser.html",
      title: "Techniques: Laser"
    })
    .state('techniques.veins', {
      parent: 'techniques',
      url:"/veins",
      templateUrl: "/partials/techniques_veins.html",
      title: "Techniques: Veins"
    })
    .state('zones', {
      url:"/zones/:zone/:procedure",
      templateUrl: "/partials/zones.html",
      controller: "ZonesCtrl"
    })
    .state('zones.eyes', {
      parent: 'zones',
      templateUrl: "/partials/zones_eyes.html",
      title: "Zones: Eyes"
    })
    .state('zones.face', {
      parent: 'zones',
      templateUrl: "/partials/zones_face.html",
      title: "Zones: Face"
    })
    .state('zones.hair', {
      parent: 'zones',
      templateUrl: "/partials/zones_hair.html",
      title: "Zones: Hair"
    })
    .state('zones.hands', {
      parent: 'zones',
      templateUrl: "/partials/zones_hands.html",
      title: "Zones: Hands"
    })
    .state('zones.lips', {
      parent: 'zones',
      templateUrl: "/partials/zones_lips.html",
      title: "Zones: Lips"
    })
    .state('zones.skin', {
      parent: 'zones',
      templateUrl: "/partials/zones_skin.html",
      title: "Zones: Skin"
    })
    .state('before_after', {
      url:"/before-after/:procedure",
      templateUrl: "/partials/before_after.html",
      controller: "BeforeAfterCtrl",
      title: "Before & After"
    })
    .state('settings', {
      abstract: true,
      url:"/settings",
      templateUrl: "/partials/settings.html",
      controller: "SettingsCtrl",
      title: "Settings"
    })
    .state('settings.profile', {
      url:"/profile",
      templateUrl: "/partials/settings_profile.html",
      controller: "SettingsProfileCtrl",
      title: "Profile Settings"
    })
    .state('settings.store', {
      url:"/store",
      templateUrl: "/partials/settings_store.html",
      controller: "SettingsStoreCtrl",
      title: "Store Settings"
    })
    .state('settings.notifications', {
      url:"/notifications",
      templateUrl: "/partials/settings_notifications.html",
      controller: "SettingsNotificationsCtrl",
      title: "Notification Settings"
    })
    .state('settings.merchant', {
      url:"/merchant",
      templateUrl: "/partials/settings_merchant.html",
      controller: "SettingsMerchantCtrl"
    })
    .state('support', {
      url:"/support?topic&orderid",
      templateUrl: "/partials/support.html",
      controller: "SupportCtrl",
      title: "Support"
    })
    .state('terms', {
      url:"/terms",
      templateUrl: "/partials/terms.html",
      controller: "TermsCtrl",
      title: "Terms & Conditions"
    })
    .state('checkout', {
      url: "/checkout",
      views: {
        '': {
          templateUrl: "/partials/checkout.html",
          controller: "CheckoutCtrl",
          title: "Checkout"
        },
        'shipping@checkout': {
          templateUrl: "/partials/checkout_shipping.html",
          controller: "CheckoutShippingCtrl"
        }, 
        'billing@checkout': {
          templateUrl: "/partials/checkout_billing.html",
          controller: "CheckoutBillingCtrl"
        },
        'review@checkout': {
          templateUrl: "/partials/checkout_review.html",
          controller: "CheckoutReviewCtrl"
        }
      }
    });
}]);
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
'use strict';

/* Controllers */

var superApp = angular.module('trdApp.controllers', ['ui.sortable', 'ui.slider']);

superApp.controller('MainCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$cookies', '$state', 'authService', 'trdInterceptor', 
  'stripeService', 'ENV',
  function($rootScope, $scope, $window, $location, $cookies, $state, authService, trdInterceptor, 
    stripeService, ENV) {

    $scope.cartAnimation = '';
    $scope.displayIntro = false;
    $scope.displayCart = false;

    $scope.handleLoaded = function() {
      $scope.loaded = true;
      $scope.authorized = authService.authorized;
      $scope.isAdmin = authService.isAdmin;
      $scope.loggedin = authService.loggedin;
      if (!$scope.loggedin) {
        $scope.displayIntro = true;
      }
    };

    $scope.handleViewClick = function() {
      $scope.closeModal();
    }
      
    $scope.closeCart = function() {
      $scope.displayCart = false;
      $scope.cartAnimation = 'fadeOutUp';
    };

    $scope.closeModal = function() {
      $scope.displayIntro = false;
    }

    $scope.handleViewClick = function() {
      if ($scope.displayCart) {
        $scope.displayCart = false;
        $scope.cartAnimation = 'fadeOutUp';
      }
    }

    $scope.getCartAnimateClass = function() {
      return $scope.cartAnimation;
    }

    $rootScope.$on('cartviewchange', function(evt, args) { // this is really important don't delete
      $scope.displayCart = args.displayCart;
      if ($scope.displayCart) {
        $scope.cartAnimation = 'fadeInDown';
      } else {
        $scope.cartAnimation = 'fadeOutUp';
      }
    });

    $scope.$on('loggedin', function(evt, args) {
      $scope.loggedin = true;
    });

    $scope.$on('loggedout', function(evt, args) {
      $scope.loggedin = false;
    });

    if (authService.authorizationReceived) {
      $scope.handleLoaded();
    } else {
      $scope.loadedFun = null;
      $scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
        $scope.handleLoaded();
        $scope.loadedFun();
      });
    }
}]);
'use strict';

/* Services */
var trdServices = angular.module('trdApp.services', ['ngCookies']).
  value('version', '0.1');
'use strict';

/* Filters */
var trdFilters = angular.module('trdApp.filters', []);
'use strict';

/* Factories */
var trdFactories = angular.module('trdApp.factories', []);
'use strict';

/* Directives */


var appDirectives = angular.module('trdApp.directives', []);

appDirectives.directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
}]);
trdFilters.filter("range", [
    function () {
	  	return function(input, total) {

	  		total = parseInt(total);

	    	for (var i = 0; i < total; i++) {
	      		input.push(i);
	    	}
	    	
	    	return input;
		};
}]);
trdFilters.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
trdFactories.factory("toolbelt", ['$rootScope',
    function ($rootScope) {

    	var toolbelt = {};

    	toolbelt.displayLocalTime = function (date) {
    		if (!date) {
    			return "";
    		} else {
    			return moment(date).format('LT');
    		}
    	}

    	toolbelt.displayDate = function (date, format, options) {
    		if (!date) {
    			return "";
    		} else {
    			if (options.type) {
    				return moment(date, options.type).format(format);
    			} else {
    				return moment(date).format(format);
    			}
    		}
    	}

    	toolbelt.displayAddress = function (address) {
    		if (!address) {
		        return "No address information provided";
		      } else {
		        return  "<strong>" + address.name + "</strong>" + "<br>" + 
		                address.address1 + " " + (address.address2 || "") + "<br>" + 
		                address.city + ", " + address.state + " " + address.zip;
		      }
    	}

    	toolbelt.insertCommasIntoNumber = function (number) {
    		return number.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
    	}

    	return toolbelt;

}]);
superApp.controller('AboutCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {

}]);
superApp.controller('AdminCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$stateParams', 'adminService',
  function($rootScope, $scope, $state, authService, profileService, $stateParams, adminService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

  	$scope.profile = angular.copy(authService.profile);

    $scope.displayDate = function(date) {
  		return moment(date).format("MMM Do YYYY");
    };

    $scope.toTitleCase = function(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    adminService.getHash($scope.profile.id, function (err, hash) {
    	if(err) {
    		$scope.error = err;
    	}
    	$scope.hash = hash;
    });

    adminService.getAllMerchantProfiles(function (err, profiles) {
      if(err) {
        $scope.error = err;
      }else {
        $scope.merchantsLoaded = true;
      }
      $scope.merchantProfiles = profiles;
    });



}]);

superApp.controller('AdminNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService', 'awsService',
  function($rootScope, $scope, $state, productService, awsService) {

    $scope.fileCount = 0;
  	$scope.product = {};
    $scope.product.tmpImg = {};
    $scope.product.tmpAltImg = [];

    function onSignedRequest (file, signed_request, url) {
      awsService.uploadFile(file, signed_request, url, onRemoteFileUpload);
    }

    function onRemoteFileUpload (url) {
    }

    function onProductAdded (error, product) {
      if (error) {
        $scope.error = error;
        return;
      }
      $state.go("admin.products");
    }

    $scope.onFileAdded = function(files, msg, flow) {
      var file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      var image = {};
      image.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      image.extension = typeSplit[1];
      image.name = file.name;
      if($scope.fileCount == 0 ) {  //main image
        $scope.product.tmpImg = image;
      }else {   //alt image
        $scope.product.tmpAltImg.push(image);
      }
      awsService.getSignedRequest(file, onSignedRequest);
      $scope.fileCount ++;
    };

    $scope.addProduct = function() {
      if($scope.updating) {
        return;
      }
      if(!$scope.product.tmpImg.name) {
        $scope.error = "Please upload an image for the product";
        return;
      }
      return;
      if(!$scope.product.name) {
        $scope.error = "Missing product name";
        return;
      }
      if(!$scope.vendor) {
        $scope.error = "Choose a vendor";
        return;
      }
      if(!$scope.product.category) {
        $scope.error = "Choose a category";
        return;
      }
      if(!$scope.product.description) {
        $scope.error = "Enter a description for the product";
        return;
      }
      if(!$scope.product.price) {
        $scope.error = "Enter a price";
        return;
      }
      $scope.updating = true;
      $scope.product.attributes = {};
      $scope.product.attributes.vendor = $scope.vendor;
      $scope.makeactive == 'yes' ? $scope.product.active = 'Y' : $scope.product.active = 'Y';

      productService.addProduct($scope.product, $scope.vendor, onProductAdded);
    };

}]);
superApp.controller('AdminNewVendorCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', 'bcrypt', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, bcrypt, storeService) {

    $scope.authorized = false;

    $scope.generateKey = function() {
      var result = '';
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-+=_/?;:<>,.~{}';
      for (var i = 20; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      $scope.regkey = result;
    };

    $scope.activate = function() {
      $scope.notify = null;
      if($scope.authorized = false) {
        return;
      }
      adminService.addRegKey($scope.regkey, function (err, data) {
        if(err) {
          $scope.error = err;
          return;
        }
        $scope.regkey = null;
        $scope.notify = "Reg key '" + data.key + "' was successfully added.";        
        $scope.availableKeys.push(data.key);
      });
    };

    $scope.checkPassword = function() {
      if(bcrypt.compareSync($scope.attempt, $scope.hash)) {
        $scope.authorized = true;
      }else {
        $scope.authorized = false;
      }
    };

    adminService.getAvailableRegKeys(function (err, keys) {
      if(err) {
        $scope.error = err;
      }
      $scope.availableKeys = [];
      for(var i = 0; i < keys.length; i++) {
        $scope.availableKeys.push(keys[i].key);
      }
    });

}]);
superApp.controller('AdminOrderCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', '$stateParams', 'storeService',
  function($rootScope, $scope, $state, adminService, $stateParams, storeService) { 

    $scope.error = null;
  	$scope.orderid = $stateParams.orderid;
  	if (!$scope.orderid) {
  		$state.go("admin.orders");
  	}

  	$scope.getDisplayDate = function (date) {
      return moment(date).format('LL');
    }

  	$scope.formatValue = function (value) {
      if (!value) {
        return "";
      } else {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

  	function onOrderLoaded (error, order) {
      if (error) {
        $scope.error = error;
      } else {
        $scope.products = [];
        $scope.order = order;
        if ($scope.order.products && $scope.order.products.length) {
          $scope.order.products.forEach(function (p) {
            storeService.getProductByID(p.productnumber, function (error, product) {
              if (error) {
                $scope.error = error;
              }
              $scope.products.push(product);
            });
          });
        }
      }
  	}

  	storeService.getOrderByID($scope.orderid, onOrderLoaded);

}]);
superApp.controller('AdminOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

    $scope.totalOrderVolume = 0;
    $scope.monthOrderVolume = 0;
    $scope.dailyOrderVolume = 0;
    $scope.error = null;

    $scope.getDisplayDate = function (date) {
      return moment(date).format('LL');
    }

    $scope.formatShipTo = function(shipTo) {
      if (!shipTo) {
        return "No shipping information provided";
      } else {
        return  "<strong>" + shipTo.name + "</strong>" + "<br>" + 
                shipTo.address1 + " " + (shipTo.address2 || "") + "<br>" + 
                shipTo.city + ", " + shipTo.state + " " + shipTo.zip;
      }
    }

    $scope.formatValue = function (value) {
      return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
    }

    function buildChart (ordersByDate) {
      var data = [];
      for (date in ordersByDate) {     
        data.push(ordersByDate[date]);   
      }
      $('#orders-chart').highcharts({
        chart: {
          zoomType: 'x'
        },
        title: {
          text: 'Daily Sales Totals'
        },
        xAxis: {
          type: 'datetime',
          minRange: 14 * 24 * 3600000 // fourteen days
        },
        yAxis: {
          title: {
            text: 'Total Sales in USD'
          }
        },
        legend: {
            enabled: false
        },
        series: [{
          type: 'line',
          name: 'Total',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.UTC(2015, 6, 11),
          data: data
        }]
      });
    }

  	function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
      } else {
        var ordersByDate = {};
        for (var i = 0; i < orders.length; i++) {
          if (ordersByDate[moment(orders[i].createdAt).format("M/D")] === undefined) {
            ordersByDate[moment(orders[i].createdAt).format("M/D")] = 0;
          }
          ordersByDate[moment(orders[i].createdAt).format("M/D")] += parseInt(orders[i].total);
          $scope.totalOrderVolume += parseInt(orders[i].total);
          if (moment(orders[i].createdAt).isAfter(moment().subtract(1, 'months'))) {
            $scope.monthOrderVolume += parseInt(orders[i].total);
          }
          if (moment(orders[i].createdAt).isAfter(moment().subtract(1, 'days'))) {
            $scope.dailyOrderVolume += parseInt(orders[i].total);
          }
        }
        $scope.orders = orders;
        buildChart(ordersByDate);
      }
  	}

  	adminService.getAllOrders(onOrdersLoaded);
}]);
superApp.controller('AdminProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'productService', '$stateParams',
  function($rootScope, $scope, $state, storeService, productService, $stateParams) {

    if (!$stateParams.productnumber) {
      $state.go("admin.products");
    }

  	$scope.mode = "view";
    $scope.message = "";

    $scope.updateProduct = function() {
      if ($scope.updating) {
        return;
      }
      $scope.updating = true;
      productService.updateProduct($scope.product, function(error, result) {
        if(error) {
          $scope.error = error;
        }
      });
      $scope.updating = false;
      $scope.mode = 'view';
    };

    storeService.getProductByID($stateParams.productnumber, function (error, product) {
        $scope.product = product;
    });

}]);
superApp.controller('AdminProductsCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'merchantService', 'productService', 'storeService',
  function($rootScope, $scope, $state, adminService, merchantService, productService, storeService) {

    $scope.vendornames = {};

    adminService.getAllProducts(function (err, products) {
      if(err) {
        $scope.error = err;
        return;
      }
      $scope.products = products;
      $scope.vendorIDs = [];
      for(var i = 0; i < products.length; i++) {
        if($scope.vendorIDs.indexOf(products[i].attributes.vendor) < 0) {
          $scope.vendorIDs.push(products[i].attributes.vendor);
          adminService.getMerchantProfile(products[i].attributes.vendor, function (err, profile) {
            if(err) {
              $scope.error = err;
            }else{
              $scope.vendornames[profile.id] = profile.name;
            }
          });
        }
      }
      $scope.$parent.vendornames = $scope.vendornames;
    });

    $scope.editProduct = function(productnumber, attribute) {
      $scope.products.forEach(function (product) {
        if (product.productnumber == productnumber) {
          if (attribute == 'featured') {
              product.featured ? product.featured = false : product.featured = true;
          } else if (attribute == 'active' || attribute == 'isYLIFT') {
              product[attribute] == 'Y' ? product[attribute] = 'N' : product[attribute] = 'Y';
          }
          productService.updateProduct(product);
        }
      });
    };

  	$scope.viewProduct = function(productnumber) {
  		$scope.message = "";
  		storeService.getProductByID(productnumber, function(error, product) {
        if (error) {
          $scope.error = error;
          return;
        }
  			$scope.view_product = product;
  		});
  		$scope.mode = 'view';
  	};

}]);
superApp.controller('AdminPromoCtrl',
  ['$rootScope', '$scope', '$state', 'bcrypt', 'adminService',
  function($rootScope, $scope, $state, bcrypt, adminService) {

    $scope.displayPromo = function(value, type) {
      if(type == 'percent_off') {
        return Number(value)*100 + "% off";
      }else if(type == 'new_price') {
        return "New price: $" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }else if(type == 'money_off') {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," ) + " off";
      }
    };

    $scope.promptDelete = function(promo) {
      if(confirm('Are you sure you want to delete ' + promo + '?')) {
        adminService.deletePromo(promo, function (err, success) {
          if(err) {
            $scope.error = err;
          }
          if(success) {
            $scope.notify = "Promo code '" + promo + "'' was successfully deleted.";
            for(var i = 0; i < $scope.promos.length; i++) {
              if($scope.promos[i].key == promo) {
                $scope.promos.splice(i,1);
                return;
              }
            }
          }
        });
      }
    };

    $scope.activate = function() {
      $scope.error = null;
      if($scope.activating) {
        $scope.error = "Please wait";
        return;
      }
      if(!$scope.newcode) {
        $scope.error = "Please enter a promo code";
        return;
      }else if(!$scope.promotype) {
        $scope.error = "Please select a promo type";
        return;
      }else if(!$scope.value) {
        $scope.error = "Enter a value for the promo code";
        return;
      }else if(!$scope.makeactive) {
        $scope.error = "Choose whether to make the promo code active upon submission";
        return;
      }else if(!$scope.message) {
        $scope.error = "Please provide a message to display upon use of code";
        return;
      }else if(!$scope.domain) {
        $scope.error = "Please indicate how the code can be used";
        return;
      }
      else{
        if($scope.promotype == 'percent_off') {
          if(isNaN($scope.value) || $scope.value <= 0 || $scope.value > 100 || $scope.value.length > 2) {
            $scope.error = "Enter a valid percent";
            return;
          }
        }else if($scope.promotype == 'new_price') {
          if(isNaN($scope.value) || $scope.value <= 0) {
            $scope.error = "Enter a valid price";
            return;
          }
        }else if($scope.promotype == 'money_off') {
          if(isNaN($scope.value)) {
            $scope.error = "Enter a valid discount";
            return;
          }
        }
        var promo = {};
        promo.key = $scope.newcode;
        promo.type = $scope.promotype;
        if($scope.promotype == 'percent_off') {
          promo.value = Number($scope.value)*.01;
        }else {
          promo.value = $scope.value;
        }
        promo.active = $scope.makeactive;
        promo.message = $scope.message;
        promo.domain = $scope.domain;
        $scope.activating = true;
        adminService.addPromoCode(promo, function (err, code) {
          if(err) {
            $scope.error = err;
            return;
          }
          $scope.notify = "Promo code '" + code + "' was successfully activated";
          $scope.activating = false;
          $scope.promos.push(promo);
        });
      }
    };

    adminService.getAllPromoCodes(function (err, codes) {
      if(err) {
        $scope.error = err;
      }
      $scope.promos = codes;
    });

}]);
superApp.controller('AdminUserCtrl',
  ['$rootScope', '$window', '$scope', '$state', 'toolbelt', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $window, $scope, $state, toolbelt, adminService, storeService, $stateParams, $http) {

    $scope.edit = false;

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.addressphone = null;
      $scope.addressemail = null;
      $scope.currAddress = null;
      $scope.addressInd = null;
      $scope.yliftInd = null;
    }

    $scope.updateInfo = function () {
      $scope.error = null;
      $scope.notify = null;
      $scope.updating = true;
      var profile = angular.copy($scope.profile);
      profile.name = $scope.name;
      profile.email = $scope.email;
      adminService.checkEmailAvailability($scope.email, function (err, data) {
        if(err) {
          $scope.error = err;
          return;
        } else if (!data.available) {
          $scope.error = "Email is already in use.";
          return;
        } else {
          adminService.updateUserProfile(profile, function (err, profile) {
            $scope.profile = profile;
            $scope.edit = false;
            $scope.updating = false;
            $scope.notify = 'Successfully updated user profile';
            $scope.edit = false;
          });
        }
      });
    };

    $scope.submitAddress = function() {
      $scope.error = null;
      $scope.notify = null;
      if (validate()) {    
          var address = {
          "name": $scope.addressname,
          "address1": $scope.address1,
          "address2": $scope.address2,
          "city": $scope.city,
          "state": $scope.state,
          "zip": $scope.zip,
          "phone": $scope.addressphone,
          "email": $scope.addressemail,
          "profile": $scope.profile.id,
          "default": $scope.default
          };
          if ($scope.addresses.length == 0) {
             address.default = true;
          }
          if ($scope.isYLIFT) {
              address.yliftInd = $scope.yliftInd;
          }
          if ($scope.currAddress) {
              address.id = $scope.currAddress.id;
              address.createdAt = $scope.currAddress.createdAt;
          }
          if ($scope.editAddressView) {
              $scope.updating = true;
              adminService.updateAddress(address, function (err, data) {
                if(err) {
                  $scope.error = err;
                } else {
                  $scope.updating = false;
                  $scope.clearAddress();
                  $scope.addAddressView = false;
                  $scope.editAddressView = false;
                  $scope.notify = 'Successfully updated user address';
                }
              });
          }
          if ($scope.addAddressView) {
              $scope.adding = true;
              adminService.addAddress(address, function (err, data) {
                if(err) {
                  $scope.error = err;
                } else {
                  $scope.updating = false;
                  $scope.clearAddress();
                  $scope.addAddressView = false;
                  $scope.editAddressView = false;
                  $scope.notify = "Successfully added user address";
                  $scope.addresses.push(data);
                }
              });
          }
      }
    };

    $scope.selectAddress = function(ind) {
        $scope.addAddressView = false;
        if ($scope.currAddress == $scope.addresses[ind]) {
          $scope.currAddress = null;
          $scope.currAddressImg = null;
          $scope.editAddressView = false;
          return;
        }
        $scope.currAddress = $scope.addresses[ind];
        $scope.addressname = $scope.currAddress.name;
        $scope.address1 = $scope.currAddress.address1;
        $scope.address2 = $scope.currAddress.address2;
        $scope.city = $scope.currAddress.city;
        $scope.state = $scope.currAddress.state;
        $scope.zip = $scope.currAddress.zip;  
        $scope.addressphone = $scope.currAddress.phone;  
        $scope.addressemail = $scope.currAddress.email;  
        $scope.yliftInd = $scope.currAddress.yliftInd;
        $scope.addressInd = ind;
        $scope.editAddressView = true;
    };

    $scope.enableAddAddress = function() {
        $scope.clearAddress();
        $scope.editAddressView = false;
        $scope.addAddressView = true;
    };

    $scope.cancel = function() {
      $scope.editAddressView = false;
      $scope.addAddressView = false;
    };

    $scope.makeDefault = function(ind) {
      if ($window.confirm('Make this address the default?')) {
        for (var i = 0; i < $scope.addresses.length; i++) {
          if ($scope.addresses[i].default) {
            $scope.addresses[i].default = false;
            adminService.updateAddress($scope.addresses[i], function (err, data) {
              if(err) {
                $scope.error = err;
              }
            });
          }
          if (i == ind) {
            $scope.addresses[i].default = true;
            adminService.addAddress($scope.addresses[i], function (err, data) {
              if(err) {
                $scope.error = err;
              }
            });
          }
        }
      }
    };

    $scope.removeAddress = function(index) {
      $scope.error = null;
      $scope.notify = null;
      if ($window.confirm('Are you sure?')) {
        $scope.clearAddress();
        $scope.addAddressView = false;
        $scope.editAddressView = false;
        var address = $scope.addresses[index];
        adminService.deleteAddress(address, function (err, data) {
          if(err) {
            $scope.error = err;
          } else {
            $scope.addresses.splice(index, 1);
            $scope.notify = "Address successfully removed";
          }
        });
      }
    };

    function validate () {
      $scope.error = null;
      if (!$scope.addressname) {
        $scope.error = 'Please name this address';
        return false;
      }
      if (!$scope.address1) {
        $scope.error = 'Please add the street address';
        return false;
      }
      if (!$scope.city) {
        $scope.error = 'Please add the address city';
        return false;
      }
      if (!$scope.state) {
        $scope.error = 'Please add the address state';
        return false;
      }
      if (!$scope.zip) {
        $scope.error = 'Please add the address zip';
        return false;
      }
      if (!$scope.addressphone) {
        $scope.error = 'Please add a contact phone number for this address';
        return false;
      }
      if (!$scope.addressemail) {
        $scope.error = 'Please add a contact email address';
        return false;
      }
      return true;
    }

    $scope.formatPrice = function(price) {
      return "$" + toolbelt.insertCommasIntoNumber(price);
    };

    function onAddressesLoaded(err, data) {
          $scope.loadingAddresses = false;
          if(err) {
            $scope.error = err;
          }
          $scope.addresses = data;
          $scope.userloaded = true;
      };

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
        if(err) {
          $scope.error = err;
        } 
        $scope.profile = profile;

        adminService.getAddresses($scope.profile.id, onAddressesLoaded);
        $scope.loadingAddresses = true;

        storeService.getProductsInCart($stateParams.profileid, function (err, data) {
          if(!err) {
            $scope.cartProducts = {};
            $scope.total = 0;
            $scope.quantities = {};
            for(var i = 0; i < data.length; i++) {
              $scope.quantities[data[i].productnumber] = data[i].quantity;
              adminService.getProduct(data[i].productnumber, function (err, product) {
                if(err) {
                  $scope.error = err;
                } else { 
                  $scope.cartProducts[product.productnumber] = product;
                  $scope.total += (product.price * $scope.quantities[product.productnumber]);
                }
              })
            }
          }
        });
      });

}]);
superApp.controller('AdminUsersCtrl',
  ['$rootScope', '$scope', '$state', 'adminService', 'productService', '$http',
  function($rootScope, $scope, $state, adminService, productService, $http) {

    $scope.error = null;

  	$scope.getActiveUserCount = function() {
  		return $scope.profiles.filter(isActiveUser).length;
  	}

  	$scope.getMonthlyUserCount = function() {
  		return $scope.profiles.filter(isMonthlyUser).length;
  	}

  	function isActiveUser(user) {
  		return moment().diff(user.last_login, 'days') < 5;
  	}

    function isMonthlyUser(user) {
  		return moment().diff(user.last_login, 'months') <= 1;
  	}

  	function onProfilesLoaded(error, profiles) {
      if (error) {
        $scope.error = error;
      }
  		$scope.profiles = profiles;
  	}

  	function onYLIFTsLoaded(error, yliftProfiles) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.yliftProfiles = yliftProfiles;
  	}

  	adminService.getAllProfiles(onProfilesLoaded);
  	adminService.getAllYLIFTProfiles(onYLIFTsLoaded);
}]);
superApp.controller('AdminVendorCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'adminService', '$stateParams',
  function($rootScope, $scope, $state, storeService, adminService, $stateParams) {

    $scope.error = null;
    $scope.updating = false;

    if (!$stateParams.merchantid) {
      $state.go("admin.vendors");
    }

    $scope.updateMerchant = function() {
      if ($scope.updating) {
        return;
      }
      $scope.error = null;
      $scope.updating = true;
      adminService.updateMerchantProfile($scope.vendor, onMerchantUpdated);
    }

    function onMerchantUpdated (error, merchant) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
        return;
      }
    }

    adminService.getMerchantProfile($stateParams.merchantid, function (err, merchant) {
      if(err) {
        $scope.error = err;
      }
      $scope.vendor = merchant;
      if($scope.vendor.members && $scope.vendor.members.length > 0) {
        $scope.members = [];
        $scope.vendor.members.forEach(function (member) {
          adminService.getProfileByID(member, function (err, profile) {
            if(profile) {
              $scope.members.push(profile);
            }
          });
        });
      }
    });

    storeService.getProductsByMerchant($stateParams.merchantid, function (err, products) {
      if(err) {
        $scope.error = err;
      }
      $scope.merchantProducts = products;
    });

}]);
superApp.controller('AdminVendorsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'adminService', '$stateParams', '$timeout', 'storeService',
  function($rootScope, $scope, $state, authService, profileService, adminService, $stateParams, $timeout, storeService) {

    if (!authService.isAdmin) {
      $state.go("store");
    }

}]);
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
      if (customer.sources) {
        $scope.cards = customer.sources.data;
      } else {
        $scope.cards = [];
      }
      $scope.loadingCustomer = false;
    }

    if ($scope.profile && $scope.profile.customerid) {
      stripeService.getCustomer($scope.profile.customerid, onCustomerLoaded);
    } else {
      $scope.loadingCustomer = false;
      $scope.toggleAddPayment();
    }

}]);
superApp.controller('CheckoutCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'storeService', 'authService', 
   'stripeService', 'locationService', 'productService',
  function($rootScope, $scope, $state, $stateParams, $timeout, storeService, authService, 
    stripeService, locationService, productService) {

    // address vars
    $scope.shippingCost = 5; // flat fee for now
    $scope.total = $scope.shippingCost;
    $scope.addAddressView = false;
    $scope.addresseshipTo = null;
    $scope.productsInCart = [];
    $scope.products = [];
    $scope.addresses = [];
    $scope.checkoutState = 'shipping';
    $scope.orderError = null;
    $scope.addressesLoaded = false;
    $scope.orderSubmitted = false;
    $scope.states = {
      shipping: {
        editable: true,
        next: 'billing'
      },
      billing: {
        editable: false,
        next: 'review'
      },
      review: {
        editable: false
      }
    };

    if (authService.authorized) {
      $scope.profile = authService.profile;
      $scope.profileid = authService.profile.id;
      locationService.getProfileAddresses(onAddressesLoaded);
    } else {
      $scope.addresses = [];
      $scope.addressesLoaded = true;
    }

    $scope.nextState = function() {
      var nextState = $scope.states[$scope.checkoutState].next;
      $scope.states[nextState].editable = true;
      $scope.goToState(nextState);
    }

    $scope.goToState = function(state) {
      if ($scope.states[state].editable) {
        $timeout(function() {
          $scope.checkoutState = state;
        }, 0);
      }
    }

    $scope.isCheckoutState = function(state) {
      return $scope.checkoutState == state;
    };

    $scope.isEditable = function(state) {
      return $scope.states[state].editable;
    }

    $scope.onProductsLoaded = function() {
      $scope.products = storeService.productsByID;
      storeService.getProductsInCart($scope.profileid, function (error, products) { 
        $scope.merchants = [];
        $scope.productsInCart = products;
        for (var i = 0; i < $scope.productsInCart.length; i++) {
          if ($scope.merchants.indexOf(storeService.getProductMerchant($scope.productsInCart[i].productnumber)) == -1) {
            $scope.merchants.push(storeService.getProductMerchant($scope.productsInCart[i].productnumber));
          }
          $scope.total += parseInt($scope.products[$scope.productsInCart[i].productnumber].price) * parseInt($scope.productsInCart[i].quantity);
        }
        onProductsInCartLoaded();
      });
    }

    $scope.submitOrder = function(shipping, total) {
      if ($scope.orderSubmitted == true) {
        return;
      }
      $scope.orderSubmitted = true;
      stripeService.submitOrder($scope.addressShipTo, $scope.productsInCart, $scope.merchants, $scope.shippingCost, $scope.total, function(err, result) {
        if (err) {
          $scope.orderError = err.message;
          $scope.orderSubmitted = false;
        } else {
          $state.go("order", {orderid: result.id});
          storeService.emptyCart($scope.profileid, function(cart) {});
        }
      });
    }

    function onAddressesLoaded (error, addresses) {
      if (addresses) {
        $scope.addresses = addresses;
        $scope.addressesLoaded = true;
      }
    }

    function onProductsInCartLoaded () {
      $scope.productsInCart.forEach(function (product, index) {
        productService.getMerchant(product.productnumber, function (error, merchant) {
          if (merchant.yliftCanAcceptPayment == 'N') {
            $scope.total -= parseInt($scope.products[product.productnumber].price) * parseInt(product.quantity);
            $scope.note = "Note: You will receive a separate invoice in your inbox for some items in your cart due to the terms of the Y Lift Network.";
          }
        });
      });

    }

    if (storeService.productsRetrieved) {
      $scope.onProductsLoaded();
    } else {
      storeService.getStoreFront($scope.onProductsLoaded);
    }

}]);
superApp.controller('CheckoutReviewCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'toolbelt', 'storeService', 'authService', 'stripeService',
  function($rootScope, $scope, $state, $stateParams, toolbelt, storeService, authService, stripeService) {

  	$scope.emailEntered = false;
	$scope.showItems = false;

	var customer = stripeService.customer;
	if (customer && customer.email) {
		$scope.confEmail = customer.email;
		$scope.emailEntered = true;
	} else if (authService.authorized) {
		$scope.confEmail = authService.profile.email;
		$scope.emailEntered = true;
	}

	$scope.formatValue = function (value) {
		if (value) {
			var fixed = parseInt(value).toFixed(2);
      		return "$" + toolbelt.insertCommasIntoNumber(fixed);
		} else {
			return "";
		}
  }

	$scope.addEmail = function() {
		if (!customer) {
			var customer = stripeService.customer;
		}
		customer.email = $scope.confEmail;
		stripeService.setCustomer(customer);
		$scope.emailEntered = true;
	}

	$scope.toggleItems = function() {
		$scope.showItems = !$scope.showItems;
	}    

}]);
superApp.controller('CheckoutShippingCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'profileService',
   'locationService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, profileService,
    locationService) {

    $scope.addAddressView = false;

  	$scope.toggleAddAddress = function() {
      $scope.addAddressView = !$scope.addAddressView;
    };

    $scope.selectAddress = function(index) {
      if ($scope.$parent.addressShipTo == $scope.$parent.addresses[index]) {
        $scope.$parent.addressShipTo = null;
      } else {
        $scope.$parent.addressShipTo = $scope.$parent.addresses[index];
      }
    };

    $scope.isAddressSelected = function(index) {
      return $scope.$parent.addressShipTo == $scope.$parent.addresses[index];
    };

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.currAddress = null;
      $scope.currAddressImg = null;
      $scope.addressInd = null;
    }

    $scope.addAddress = function() {
      $scope.updatingAddress = true;
      var address = {
        "name": $scope.name,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip
      };
      if (authService.authorized) {
        locationService.addAddressToProfile(address, onAddressAdded);
      } else {
        onAddressAdded(null, address);
      }
    };

    function onAddressAdded (error, address) {
      if ($scope.$parent.addresses.length == 0) {
        address.default = true;
        $scope.$parent.addressShipTo = address;
      }
      $scope.addAddressView = false;
      $scope.updatingAddress = false;
      $scope.clearAddress();
    }

    var addressWatch = null;
    addressWatch = $scope.$watch('addressesLoaded', function (newVal, oldVal) {
      if (newVal) {
        if ($scope.$parent.addresses.length > 0) {
          for (var i = 0; i < $scope.$parent.addresses.length; i++) {
            if ($scope.$parent.addresses[i].default) {
              $scope.$parent.addressShipTo = $scope.$parent.addresses[i];
            }
          }
        } else {
          $scope.addAddressView = true;
        }
      }
    });

    $scope.$on('$destroy', function () {
      addressWatch();
    });


}]);
superApp.controller('BeforeAfterCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'testimonialService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, testimonialService) {
    
  	$scope.procedures = [];
  	$scope.displayTestimonials = [];

  	$scope.filter = function(procedure) {
    	$scope.displayTestimonials = [];
    	for(var i = 0; i < $scope.testimonials.length; i++) {
    		if($scope.testimonials[i].procedure == procedure) {
    			$scope.displayTestimonials.push($scope.testimonials[i]);
    		}
    	}
    };

    testimonialService.getAllTestimonials(function (success, data) {
      if(success) {
        $scope.testimonials = data;
        $scope.displayTestimonials = data;
        $scope.testimonials.forEach(function (testimonial) {
        	if($scope.procedures.indexOf(testimonial.procedure) < 0) {
        		$scope.procedures.push(testimonial.procedure);
        	}
        });
        if($stateParams.procedure) {
  			$scope.filter($stateParams.procedure);
  		}
      }
    });

}]);
superApp.controller('LeaveReviewCtrl',
  ['$rootScope', '$state', '$scope', '$stateParams', 'authService', 'storeService', 'productService',
  function($rootScope, $state, $scope, $stateParams, authService, storeService, productService) {

  	$scope.submitted = false;
    $scope.pn = $stateParams.productnumber;
    
    $scope.sendReview = function() {
      $scope.submitting = true;
      $scope.review = {
        title: $scope.title,
        review: $scope.review,
        name: authService.profile.name,
        rating: parseInt($scope.rating)
      };
      productService.submitReview($scope.pn, $scope.review, function(result) {
        $scope.submitted = true;
        $scope.submitting = false;
      });
    }

    $scope.backToProduct = function() {
      $state.go("product", {productnumber:$scope.pn});
    }
    
    function onProductLoaded (error, product) {
      if (error) {
        $scope.error = error;
      }
      $scope.productLoaded = true;
      $scope.product = product;
    }

    storeService.getProductByID($scope.pn, onProductLoaded);

}]);
superApp.controller('LocationsCtrl',
  ['$rootScope', '$scope', '$state', '$location', 'locationService',
  function($rootScope, $scope, $state, $location, locationService) {
    $rootScope.pageTitle = 'Locations';
    $scope.locationsLoaded = false;
    $scope.showLocationsRight = true;
    $scope.selectedLocation = null;
    $scope.showSearch = false;
    $scope.viewBooking = false;
    $scope.mapLoaded = false;
    $scope.locations = [];
    $scope.locationFocused = {};
    $scope.map = {};
    $scope.markers = [];

    $scope.toggleFocus = function(index) {
      $scope.locations[index].focused = !$scope.locations[index].focused;
      if ($scope.locations[index].focused) {
        $scope.map.panTo(new google.maps.LatLng($scope.locations[index].location.A, $scope.locations[index].location.F));
      }
    }

    $scope.toggleSearch = function() {
      $scope.showSearch = !$scope.showSearch;
    }

    $scope.focusLocation = function(index) {
      $scope.locations[index].focused = true;
    }

    $scope.unFocusLocation = function() {
      $scope.locations[index].focused = false;
    }

    $scope.searchZip = function(zip) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({address:zip}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
          var latlng = new google.maps.LatLng(results[0].geometry.location.A, results[0].geometry.location.F);
          $scope.map.setCenter(latlng);
          $scope.zip = null;
        } else {
          $scope.zipError = "Enter a valid zip code";
        }
      });
    }

  	$scope.onMapLoaded = function(map) {
      $scope.mapLoaded = true;
  		$scope.map = map;
		  locationService.getYLiftLocations(onLocationsLoaded);
  	}

    $scope.toggleLocationPanel = function() {
      $scope.showLocationsRight = !$scope.showLocationsRight;
    }

    $scope.openBooking = function(location, $event) {
      $event.stopPropagation();
      $scope.selectedLocation = location;
      $scope.viewBooking = true;
    }

    $scope.closeBooking = function($event) {
      $scope.selectedLocation = null;
      $scope.viewBooking = false;
    }

    function onLocationsLoaded (error, locations) {
      var img = {
        url: '/img/logo_md.png' // look into more props
      };
      $scope.locations = locations;
      $scope.locationsLoaded = true;
      $scope.locations.forEach(function (location, index) {
        location.focused = false;
        $scope.markers[index] = new google.maps.Marker({
          position: new google.maps.LatLng(location.location.A, location.location.F),
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          title: location.name,
          icon: img
        });
        google.maps.event.addListener($scope.markers[index], 'click', function(e) {
          $scope.toggleFocus(index);
          $scope.map.panTo(e.latLng);
        });
      });
    }

	  navigator.geolocation.getCurrentPosition(function (position) {
	  	var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		  var map = new google.maps.Map(document.getElementById("map-canvas"), { 
        center: latlng, 
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
      });
		  $scope.onMapLoaded(map);
		}, function (error) {
      if (error.code == error.PERMISSION_DENIED) {
        var latlng = new google.maps.LatLng(39, -95);
        var map = new google.maps.Map(document.getElementById("map-canvas"), { 
          center: latlng, 
          zoom: 4,
          mapTypeControl: false,
          streetViewControl: false
        });
        $scope.onMapLoaded(map);
      }
    });
}]);
superApp.controller('LoginCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {
    $scope.name = "";
  	$scope.loginState = "signin";
    $scope.loginToken = $stateParams.token;
    $scope.failedMessage = '';
    $scope.loggedin = authService.loggedin;
    $scope.signingIn = false;
    $scope.requestingReset = false;
    $scope.registering = false;

    if ($scope.loginToken) {
      authService.loginWithToken($scope.loginToken, function(failedMessage, successMessage) {
        if (successMessage) {
          $state.go("profile");
        } else {
          console.log(failedMessage);
          $scope.failedMessage = "Invalid/missing token.";
        }
      });
    }

    $scope.showOptions = function() {
      if ($scope.loginState == "signin" || $scope.loginState == "register") {
        return true;
      } else {
        return false;
      }
    }

    $scope.showSignin = function() {
      $scope.failedMessage = '';
      $scope.loginState = "signin";
    }

    $scope.showForgotPass = function() {
      $scope.failedMessage = '';
      $scope.loginState = "forgot_password";
    }

  	$scope.login = function() {
      $scope.signingIn = true;
  		authService.login($scope.email, $scope.password, function(failedMessage, successMessage) {
  			if (successMessage) {
  				$scope.loggedin = true;
          if (successMessage == "temp_password") {
            $state.go('pass_reset');
          } else {
            $state.go("store");
          }
  			} else {
          $scope.signingIn = false;
          $scope.failedMessage = failedMessage;
        }

  		});
  	}

    $scope.requestPasswordReset = function() {
      $scope.requestingReset = true;
      authService.requestPasswordReset($scope.email, function(failedMessage, successMessage) {
        if (successMessage) {
          $scope.failedMessage = null;
          $scope.loginState = "signin";
          $scope.email = "";
          $scope.pass_reset = true;
          $scope.requestingReset = false;
        } else {
          $scope.requestingReset = false;
          $scope.failedMessage = failedMessage;
        }
      });
    };

    $scope.changeState = function(state) {
      $scope.loginState = state;
      $scope.failedMessage = "";
      $timeout(function() {
        var element = document.getElementById("focus_" + state);
        if(element) {
          element.focus();
        }
      });
    }
}]);
superApp.controller('LogoutCtrl',
  ['$rootScope', '$scope', '$state', '$cookies', 'authService', 'trdInterceptor',
  function($rootScope, $scope, $state, $cookies, authService, trdInterceptor) {

		$scope.clearCookies = function() {
		  delete $cookies.trdTkn; // logout token
		  delete $cookies.pInCart; // products in cart
		};

	  trdInterceptor.setToken(null);
	  $scope.clearCookies();
	  authService.clearAuthorization();
	  authService.loggedin = false;
	  $rootScope.$broadcast('loggedout');
	  $state.go("login");

}]);
superApp.controller('MerchantInventoryCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {

    $scope.profileLoading = true;
    $scope.productNames = [];
    $scope.filteredProducts = [];

    $scope.goToOrders = function() {
      $state.go("merchant_orders");
    }

    $scope.filter = function(query) {
      if(query == '') {    //for when user clicks 'all inventory'
        $scope.query = '';
        $scope.filteredProducts = $scope.products;
      }else {
        $scope.filteredProducts = [];
        $scope.products.forEach(function(product, index) {
            if(product.name.toUpperCase().indexOf(query.toUpperCase()) > -1) {
              $scope.filteredProducts.push(product);
            }
        });
      }
    }

    function onProductsLoaded (error, products) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.products = products;
      $scope.filteredProducts = products;
      products.forEach(function(product, index) {
                $scope.productNames.push(product.name);
            });
      $scope.productsLoading = false;
    }

  	function onProfileLoaded (error, profile) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchant = profile;
      $scope.profileLoading = false;
      storeService.getProductsByMerchant($scope.merchant.id, onProductsLoaded);
    }

  	profileService.getMerchantProfile(onProfileLoaded);

}]);
superApp.controller('MerchantInventoryNewProductCtrl',
  ['$rootScope', '$scope', '$state', 'productService', 'awsService',
  function($rootScope, $scope, $state, productService, awsService) {

    $scope.fileCount = 0;
  	$scope.product = {};
    $scope.product.tmpImg = {};
    $scope.product.tmpAltImg = [];

    $scope.onFileAdded = function(files, msg, flow) {
      var file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      var image = {};
      image.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      image.extension = typeSplit[1];
      image.name = file.name;
      if($scope.fileCount == 0 ) {  //main image
        $scope.product.tmpImg = image;
      }else {   //alt image
        $scope.product.tmpAltImg.push(image);
      }
      awsService.getSignedRequest(file, onSignedRequest);
      $scope.fileCount ++;
    }

    $scope.addProduct = function() {
      if ($scope.updating) {
        return;
      }
      $scope.updating = true;
      productService.addProduct($scope.product, onProductAdded);
    }

    function onSignedRequest (file, signed_request, url) {
      awsService.uploadFile(file, signed_request, url, onRemoteFileUpload);
    }

    function onRemoteFileUpload (url) {
    }

    function onProductAdded (error, product) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$state.go("merchant_inventory.product", {productnumber:product.productnumber});
  	}

}]);
superApp.controller('MerchantInventoryProductCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', '$stateParams', 'productService', 'awsService',
  function($rootScope, $scope, $state, storeService, $stateParams, productService, awsService) {

    $scope.onFileAdded = function(files, msg, flow) {
      // files[0].file.name = $scope.product.productnumber + "." + files[0].file.type.split("/").pop();
      // console.log('files name', files);
      $scope.file = files[0].file;
      var typeSplit = files[0].file.type.split("/");
      $scope.product.tmpImg.identifier = files[0].uniqueIdentifier + "." + files[0].chunks.length;
      $scope.product.tmpImg.extension = typeSplit[1];
      $scope.product.tmpImg.name = $scope.file.name;
      awsService.getSignedRequest($scope.file, onSignedRequest);
    }

  	$scope.updateProduct = function() {
  		if ($scope.updating) {
  			return;
  		}
  		$scope.updating = true;
  		productService.updateProduct($scope.product, onProductLoaded);
  	}

    function onSignedRequest (file, signed_request, url) {
      awsService.uploadFile(file, signed_request, url, onRemoteFileUpload);
    }

    function onRemoteFileUpload (url) {
    }

  	function onProductLoaded (error, product) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.mode = 'view';
  		$scope.updating = false;
  		$scope.product = product;
  	}

  	storeService.getProductByID($stateParams.productnumber, onProductLoaded);

}]);
superApp.controller('MerchantInventoryViewCtrl',
  ['$rootScope', '$scope', '$state', 'storeService', 'profileService', 'productService',
  function($rootScope, $scope, $state, storeService, profileService, productService) {

    $scope.goToProduct = function(id) {
      $state.go("merchant_inventory.product", {productnumber:id});
    }

    $scope.deactivateProduct = function(product) {
      if (confirm('Are you sure you want to deactivate this product?')) {
        product.active = "N";
        productService.updateProduct(product);
      }
    }

    $scope.activateProduct = function(product) {
      product.active = "Y";
      productService.updateProduct(product);
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

}]);
superApp.controller('NetworkCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', 'authService',
  function($rootScope, $scope, $window, $location, $state, authService) {
    
    $scope.loggedin = authService.profile ? true:false;

}]);
superApp.controller('MerchantOrdersCtrl',
  ['$rootScope', '$scope', '$state', 'profileService', 'storeService',
  function($rootScope, $scope, $state, profileService, storeService) {


    $scope.displayDate = function(date) {
      return moment(date).format("MMMM Do, YYYY");
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

    $scope.updateOrder = function(order) {
      storeService.updateOrder(order);
    }

    $scope.getMerchantProducts = function(products) {
      var filtered = [];
      for (var i = 0; i < products.length; i++) {
        if (storeService.getProductMerchant(products[i].productnumber) == $scope.merchant.id) {
          filtered.push(storeService.productsByID[products[i].productnumber]);
        }
      }
      return filtered;
    }

    function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.orders = orders;
  	}

  	function onProfileLoaded (error, profile) {
      if (error) {
        $scope.error = error;
        return;
      }
  		$scope.merchant = profile;
  		storeService.getMerchantOrders($scope.merchant.id, onOrdersLoaded);
  	}

  	profileService.getMerchantProfile(onProfileLoaded);

}]);
superApp.controller('OfficeSchedulingCtrl',
  ['$scope', '$state', 'profileService', 'bookingService', 'authService', 'locationService',
  function($scope, $state, profileService, bookingService, authService, locationService) {
    $scope.appts = [];
    $scope.addresses = [];
    $scope.apptsByOfficeAndTimestamp = {};
    $scope.startDate = moment().startOf('week'); // always want this weeks monday
    $scope.endDate = moment().endOf('week'); // always want this weeks monday
    $scope.viewState = 'Week';
    $scope.apptsLoaded = false;
    $scope.officesLoaded = false;
    $scope.selectedAppt = null;
    $scope.selectedOffice = null;

    $scope.closeConfirm = function($event) {
      $scope.selectedAppt = null;
      if ($event) {
        $event.stopPropagation();
      }
    }

    $scope.getNavDisplay = function() {
      if ($scope.viewState == 'Week') {
        return $scope.startDate.format('MMM Do') + ' - ' + $scope.endDate.format('MMM Do');
      } else {
        return $scope.startDate.format('MMMM');
      }
    }

    $scope.prev = function() {
      if ($scope.viewState == 'Week') {
        $scope.endDate.subtract(1, 'weeks');
        $scope.startDate = angular.copy($scope.endDate).subtract(1, 'weeks').startOf('week');
      } else if ($scope.viewState == 'Month') {
        $scope.endDate.subtract(1, 'months').endOf('month');
        $scope.startDate = angular.copy($scope.startDate).subtract(1, 'months').startOf('month');
      }
      $scope.loadApptsInRange($scope.startDate.format('X'), $scope.endDate.format('X'));
    }

    $scope.next = function() {
      if ($scope.viewState == 'Week') {
        $scope.startDate.add(1, 'weeks').startOf('week');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'weeks');
      } else if ($scope.viewState == 'Month') {
        $scope.startDate.add(1, 'months').startOf('month');
        $scope.endDate = angular.copy($scope.startDate).add(1, 'months');
      }
      $scope.loadApptsInRange($scope.startDate.format('X'), $scope.endDate.format('X'));
    }

    $scope.getSlotClass = function(offset, hour) {
      $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice] = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice] || [];
      var appt = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice][$scope.getUnix(offset, hour)];
      if (appt && appt.status) {
        return appt.status;
      } else {
        return '';
      }
    }

    $scope.getUnix = function (offset, hour) {
      return angular.copy($scope.startDate).add(offset, 'days').hours(hour).format('X');
    }

    $scope.getDisplayDay = function(offset) {
      return angular.copy($scope.startDate).add(offset, 'days').format('ddd');
    }

    $scope.getDisplayDate = function(offset) {
      return angular.copy($scope.startDate).add(offset, 'days').format('MMM Do YYYY');
    }

    $scope.getDisplayTime = function(offset, hour) {
      return angular.copy($scope.startDate).add(offset, 'days').hours(hour).format('LT');
    }

    $scope.selectAppt = function(offset, hour, $event) {
      $scope.selectedAppt = $scope.apptsByOfficeAndTimestamp[$scope.selectedOffice][$scope.getUnix(offset, hour)];
      $event.stopPropagation();
    }

    $scope.loadApptsInRange = function(startDate, endDate) {
      bookingService.getProviderAppts(startDate, endDate, $scope.selectedOffice, authService.profileid, onApptsLoaded);
    }

    function onApptsLoaded (error, appts) {
      $scope.apptsLoaded = true;
      $scope.appts = appts || [];
    }

    function onAddressesLoaded (error, addresses) {
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i].yliftInd) {
          $scope.addresses.push(addresses[i]);
          $scope.selectedOffice = $scope.selectedOffice || addresses[i].id;
        }
      }

      $scope.officesLoaded = true;
      if (!$scope.selectedOffice) {
        $scope.error = 'Please add a Y Lift Network office in your <a href="#!/settings/profile">settings</a> to access appointment scheduling.';
      }
    }

    var apptsWatch = null;
    apptsWatch = $scope.$watch('appts', function (newVal, oldVal) {
      if (newVal && newVal.length) {
        for (var i = 0; i < newVal.length; i++) {
          $scope.apptsByOfficeAndTimestamp[newVal[i].office] = $scope.apptsByOfficeAndTimestamp[newVal[i].office] || [];
          $scope.apptsByOfficeAndTimestamp[newVal[i].office][newVal[i].date] = newVal[i];
        }
      }
    });

    var officeWatch = null;
    officeWatch = $scope.$watch('selectedOffice', function (newVal, oldVal) {
      if (newVal) {
        bookingService.getProviderAppts($scope.getUnix(0, 0), $scope.getUnix(30, 0), $scope.selectedOffice, authService.profileid, onApptsLoaded);
        
      }
    });

    $scope.$on('$destroy', function() {
      officeWatch();
      apptsWatch();
    });

    locationService.getProfileAddresses(onAddressesLoaded);

}]);
superApp.controller('OrderCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
    $scope.orderid = $stateParams.orderid;
    $scope.loading = true;

    $scope.goToProfile = function() {
      $state.go("profile");
    }

    $scope.displayCreatedAt = function(time) {
      return moment(time).format("MMMM Do, YYYY");
    }
    
    storeService.getOrderByID($scope.orderid, function(error, order) {
      if (error) {
        $scope.error = error;
        $scope.loading = false;
        return;
      }
      $scope.order = order;
      $scope.createdAt = $scope.displayCreatedAt($scope.order.createdAt);
      $scope.loading = false;
    });
}]);
superApp.controller('ProductCtrl',
  ['$rootScope', '$scope', '$state', '$stateParams', 'storeService', 'authService', 'productService', 
   'profileService',
  function($rootScope, $scope, $state, $stateParams, storeService, authService, productService,
    profileService) {

    $scope.loading = true;
    $scope.reviewsLoading = true;
    $scope.ratingLoading = true;
    $scope.relatedLoading = true;
    $scope.adding = false;
    $scope.added = false;
    $scope.productnumber = $stateParams.productnumber;
    $scope.error = false;


    $scope.addToCart = function() {
        console.log('adding to cart', $scope.product, $scope.quantity);
        if ($scope.quantity <= 0) {
            $scope.error = 'Please select a quantity first';
            return;
        }
        if ($scope.quantity % $scope.product.attributes.increment != 0) {
            $scope.error = 'The quantity entered must be a multiple of ' + $scope.product.attributes.increment;
            return;
        }
        if ($scope.adding) {
            return;
        }
        $scope.error = false;
        $scope.adding = true;
        storeService.addItemToCart($scope.profileid, $scope.product.productnumber, $scope.quantity, onItemAdded);
    }

    $scope.reset = function() {
        $scope.added = false;
        $scope.error = false;
        $scope.quantity = 0;
    }

    $scope.goToLeaveReview = function() {
        $state.go("leave_review", {productnumber:$scope.productnumber});
    }

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

    function onItemAdded (error, cart) {
        if (error) {
            $scope.error = error;
        } else {
            $rootScope.$broadcast('cartviewchange', {displayCart: true}); // want cart to pop out when item is added
            $scope.adding = false;
            $scope.added = true;
        }
    }

    function onProductLoaded (error, product) {
        $scope.loading = false;
        if (error) {
            $scope.error = error;
        }
        $scope.product = product;
    }

    function onRelatedProductsLoaded (error, products) {
        for (var i = 0; i < products.length; i++) {
            if (products[i].productnumber == $scope.product.productnumber) {
                products.splice(i, 1);
            }
        }
        $scope.relatedProducts = products;
        $scope.relatedLoading = false;
    }

    function onMerchantLoaded (error, merchant) {
        if (merchant && merchant.yliftCanAcceptPayment == 'N') {
            $scope.note = "Note: This product will not be billed at checkout, purchase will result in a separate invoice from the vendor.";
        }
    }

    function onReviewsLoaded (error, reviews) {
        $scope.reviews = reviews;
        $scope.reviewsLoading = false;
    }

    function onRatingLoaded (error, data) {
        if (data) {
            $scope.rating = data.mean;
        }
        $scope.ratingLoading = false;
    }

    if (authService.authorized) {
        $scope.profileid = authService.profile.id;
    }

    storeService.getProductByID($scope.productnumber, onProductLoaded);
    storeService.getRelatedProducts($scope.productnumber, onRelatedProductsLoaded);
    productService.getMerchant($scope.productnumber, onMerchantLoaded);
    productService.getReviews($scope.productnumber, onReviewsLoaded);
    productService.getRating($scope.productnumber, onRatingLoaded);
    productService.addPageView($scope.productnumber);

}]);
superApp.controller('ProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'awsService', '$location', '$stateParams', '$timeout', 
   'storeService', 'trainingService', 'toolbelt',
  function($rootScope, $scope, $state, authService, awsService, $location, $stateParams, $timeout, 
    storeService, trainingService, toolbelt) {
  	
  	$scope.profile = authService.profile; // this call should be alright as we will never make it to /profile w/o being authorized
    $scope.ordersLoaded = false;
    $scope.downloading = false;
    $scope.orders = [];
    $scope.trainings = [];
    $scope.createdAt = moment($scope.profile.createdAt).format("MMMM Do, YYYY");

    $scope.getDisplayDate = function(date) {
      return toolbelt.displayDate(date, 'LLL', {type: 'X'});
    }

    $scope.formatAddress = function(address) {
      return toolbelt.displayAddress(address);
    }

    $scope.getDisplayTotal = function(value) {
      if (!value) {
        return "";
      } else {
        return "$" + value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
      }
    }

    $scope.logoutNow = function() {
      $state.go("logout");
    }

    $scope.goToOrder = function(orderid) {
      $state.go("order", {orderid:orderid});
    }

    $scope.download = function(file) {
      $scope.error = null;
      $scope.downloading = true;
      awsService.getObject(file, function (err, success) {
        if (err) {
          $scope.error = 'There was an issue downloading the materials, please reach out to support@ylift.io if this problem persists.';
        }
        $scope.downloading = false;
      });
    }

    function onOrdersLoaded (error, orders) {
      if (error) {
        $scope.error = error;
      }
      $scope.orders = orders;
      $scope.ordersLoaded = true;
    }

    function onTrainingsLoaded (error, trainings) {
      if (trainings) {
        $scope.trainings = trainings;
      }
    }

    storeService.getOrdersByUserID(authService.profile.id, onOrdersLoaded);
    trainingService.getTrainingsByProfileID(onTrainingsLoaded);


}]);
superApp.controller('RegisterCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$window', '$timeout', 
  		'stripeService', 'storeService', 'trainingService', 'REG_FEE', 'profileService',
      'locationService', '$stateParams',
  function($rootScope, $scope, $state, authService, $location, $window, $timeout, 
  		stripeService, storeService, trainingService, REG_FEE, profileService,
      locationService, $stateParams) {

  	$scope.staff = [];
  	$scope.viewState = $stateParams.view || 'start';
    $scope.total = REG_FEE;

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
      if ($scope.registering) {
        $scope.failedMessage = "Processing your registration, please wait...";
        return;
      }
      $scope.failedMessage = null;
      if ($scope.password !== $scope.confirmpassword) {
        $scope.failedMessage = "Passwords do not match";
        return;
      } else if ($scope.password.length < 6) {
        $scope.failedMessage = "Password must be at least 6 characters";
        return
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

    function addContactInfoToProfile() {
      var address = {
        "name": 'Y Lift ' + $scope.city,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip,
        "country": $scope.country,
        "phone": $scope.phone,
        "email": $scope.profile.email,
        "default": true
      };
      $scope.profile.name = $scope.name;
      $scope.profile.phone = $scope.phone;
      profileService.updateProfile($scope.profile);
      locationService.addAddressToProfile(address);
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
                  $scope.profile = angular.copy(authService.profile);
                  addContactInfoToProfile();
                }
                $scope.viewState = state;
                return true;
              });
            }
          }, JSON.stringify($scope.meta));
        }
      } else if (state == 'review') {
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
          $scope.meta = {
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
              metadata: $scope.meta
            };            
            stripeService.updateGuestCustomer(props, function(customer, error) {
              if (error) {
                $scope.error = error.message || error;
                $scope.validating = false;
                return false;
              }
              $scope.validating = false;
              $scope.viewState = state;
              return true;
            });
          });
        }
      }

  	}
// END VALIDATION

  trainingService.getAvailableDates(onTrainingDatesLoaded);

}]);
superApp.controller('ResetPasswordCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {

    authService.validateResetToken($stateParams.resettoken, function(valid, message) {
      if(valid) {
        $scope.valid = true;
      }else {
        $scope.valid = false;
        $scope.message = message;
      }
    });

    $scope.updatePassword = function() {
      if(typeof $scope.password == "undefined" || $scope.password.length < 6) {
        $scope.failedMessage = "Password must be at least 6 characters";
        return;
      }else if(typeof $scope.confirm == "undefined" || $scope.confirm.length == 0) {
        $scope.failedMessage = "Please confirm your password";
        return;
      }else if($scope.password != $scope.confirm) {
        $scope.failedMessage = "Passwords do not match";
        return;
      } else {
      authService.updatePassword($stateParams.resettoken, $scope.password, function (err, data) {
          if (err) {
            $scope.error = err;
          } else {
            $state.go('login');
          }
        });
      }
    };
    
}]);
superApp.controller('SearchResultsCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService) {
  	$scope.query = $stateParams.query;

    $scope.displayProducts = function(products) {
    	$scope.products = products;
      $scope.displayedProducts = $scope.products.slice(0,15);
    }

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

    //i think this will work but i can't test it with so few products.... guess we'll find out in a few months!
    $scope.loadMore = function() {
      var last = $scope.products[$scope.displayedProducts.length - 1];
      for(var i = 1; i <= 6; i++) {
        $scope.products.push(last + i);
      }
    }

    if($scope.query) {
       storeService.getFilteredProducts($scope.query.toLowerCase(), function(products) { $scope.displayProducts(products); });
    } else {
      $scope.allProducts = [];
      $scope.dispayedProducts = [];
    }

}]);
superApp.controller('SellInfoCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {

}]);
superApp.controller('SettingsCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'emailService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'FileUploader', '$window', 'locationService',
  function($rootScope, $scope, $state, authService, emailService, profileService, $location, $stateParams, $timeout, 
  	storeService, FileUploader, $window, locationService) {
  
    $scope.profile = angular.copy(authService.profile);
  	$scope.isYLIFT = authService.isYLIFT;
    $scope.viewState = $state.current.name.split('.')[1];
    $scope.currOffice = {};
  	$scope.updating = "none";

    $scope.updateProfile = function(property) {
      $scope.emailchange = false;
      $scope.updating = property;
      if($scope.profile.email != authService.profile.email) {
        if(!confirm("Are you sure you want to change your login email address to " + $scope.profile.email + "?")) {
          $scope.updating = "none";
          return;
        } else {
          profileService.updateProfile($scope.profile, function (error, profile) {
            $scope.profile = profile;
            $scope.updating = "none";
            $scope.emailchange = true;
            emailService.changeUserEmail(authService.profile.email, $scope.profile.email);
          });
        }
      }
      profileService.updateProfile($scope.profile, function (error, profile) {
        $scope.profile = profile;
        $scope.updating = "none";
      });
    };

    $scope.updateAddress = function(address) {
      locationService.updateAddress(address);
    };

    $scope.isCurrAddress = function(ind) {
      return $scope.currAddress == $scope.addresses[ind];
    }

  	$scope.goToState = function(viewState) {
  		$scope.viewState = viewState;
  		$state.go('settings.' + $scope.viewState);
  	};

  	$scope.isSettingsState = function(viewState) {
  		return $scope.viewState == viewState;
  	};   

}]);
superApp.controller('SettingsMerchantCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', 'registrationService', '$window',
  function($rootScope, $scope, $state, authService, profileService, registrationService, $window) {

    $scope.showSignUp = false;
    $scope.verifying = false;
    $scope.registering = false;
    $scope.updating = false;
    $scope.deleting = false;
    $scope.merchantLoading = true;
    $scope.merchantLoaded = false;
    $scope.keyStatus = null;

    $scope.addMerchantAccount = function() {
      $scope.error = null;
      $scope.registering = true;
      profileService.addMerchantProfile($scope.merchantname, $scope.category, $scope.regkey, onMerchantReceived);
    }

    $scope.updateMerchantAccount = function() {
      $scope.error = null;
      $scope.updating = true;
      profileService.updateMerchantProfile($scope.merchantProfile, onMerchantUpdated);
    }
    
    // leaving this functionality out for now
    // $scope.deleteMerchantAccount = function() {
    //   $scope.error = null;
    //   if ($window.confirm('Are you sure you want to remove this account?')) {
    //     $scope.deleting = true;
    //     profileService.deleteMerchantProfile(onMerchantDeleted);
    //   }
    // }

    $scope.cancel = function() {
      $scope.showSignUp = false;
      $scope.verifying = false;
      $scope.registering = false;
      $scope.updating = false;
      $scope.deleting = false;
      $scope.merchantLoading = false;
      $scope.merchantLoaded = false;
      $scope.keyStatus = null;
    }

    $scope.addProfileToMerchant = function() {
      $scope.adding = true;
      $scope.merchantProfile.members.push(authService.profile.id);
      $scope.updateMerchantAccount($scope.merchantProfile, onMerchantUpdated);
    }

    $scope.verifyRegKey = function() {
      $scope.verifying = true;
      registrationService.verifyKey($scope.regkey, onVerification);
    }

    function onVerification(status, merchant) {
      $scope.verifying = false;
      if (status == "verified") {
        $scope.keyStatus = status;
        $scope.showSignUp = true;
      } else if (status == "unverified") {
        $scope.keyStatus = status;
      } else if (status == "invalid") {
        $scope.keyStatus = status;
      }

      if (merchant && status == "can_add") {
        $scope.keyStatus = status;
        $scope.merchantProfile = merchant;
      }
    }

  	function onMerchantReceived (error, profile) {
      $scope.merchantLoading = false;
      $scope.registering = false;
      if (profile && profile.id) {
  		  $scope.merchantProfile = profile;
        $scope.admin = profileService.isAdminOfMerchant(profile.id);
        $scope.merchantLoaded = true;
      }
      $rootScope.$broadcast('merchantcreated', profile);
    }

    function onMerchantUpdated (error, profile) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchantLoaded = true;
    }

    function onMerchantDeleted (error) {
      $scope.deleting = false;
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.merchantProfile = {};
      $scope.admin = false;
      $scope.merchantLoaded = false;
    }

    profileService.getMerchantProfile(onMerchantReceived);

}]);
superApp.controller('SettingsNotificationsCtrl',
  [,
  function() {

}]);
superApp.controller('SettingsProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', '$window', 'locationService',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, $window, locationService) {

    $scope.uploading = false;
    $scope.addAddressView = false;
    $scope.editAddressView = false;
    $scope.loadingAddresses = true;
    $scope.adding = false;
    $scope.updating = false;
    $scope.addresses = [];

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.addressphone = null;
      $scope.addressemail = null;
      $scope.currAddress = null;
      $scope.addressInd = null;
      $scope.yliftInd = null;
    }

    $scope.selectAddress = function(ind) {
      $scope.addAddressView = false;
      if ($scope.currAddress == $scope.addresses[ind]) {
        $scope.currAddress = null;
        $scope.currAddressImg = null;
        $scope.editAddressView = false;
        return;
      }
      $scope.currAddress = $scope.addresses[ind];
      $scope.addressname = $scope.currAddress.name;
      $scope.address1 = $scope.currAddress.address1;
      $scope.address2 = $scope.currAddress.address2;
      $scope.city = $scope.currAddress.city;
      $scope.state = $scope.currAddress.state;
      $scope.zip = $scope.currAddress.zip;  
      $scope.addressphone = $scope.currAddress.phone;  
      $scope.addressemail = $scope.currAddress.email;  
      $scope.yliftInd = $scope.currAddress.yliftInd;
      $scope.addressInd = ind;
      $scope.editAddressView = true;
    };

    $scope.submitAddress = function() {
      if (validate()) {      
        var address = {
          "name": $scope.addressname,
          "address1": $scope.address1,
          "address2": $scope.address2,
          "city": $scope.city,
          "state": $scope.state,
          "zip": $scope.zip,
          "phone": $scope.addressphone,
          "email": $scope.addressemail,
          "default": $scope.default
        };
        if ($scope.addresses.length == 0) {
          address.default = true;
        }
        if ($scope.isYLIFT) {
          address.yliftInd = $scope.yliftInd;
        }
        if ($scope.currAddress) {
          address.id = $scope.currAddress.id;
          address.createdAt = $scope.currAddress.createdAt;
          address.profile = authService.profileid;
        }
        if ($scope.editAddressView) {  // update the address
          $scope.updating = true;
          locationService.updateAddress(address, onAddressUpdated);
        }
        if ($scope.addAddressView) { // address needs to be added
          $scope.adding = true;
          locationService.addAddressToProfile(address, onAddressAdded);
        }
      }
      
    };

    $scope.removeAddress = function(ind) {
      if ($window.confirm('Are you sure?')) {
        $scope.clearAddress();
        $scope.addAddressView = false;
        $scope.editAddressView = false;
        var remove = $scope.addresses[ind];
        locationService.removeAddress(remove, onAddressRemoved);
      }
    };

    $scope.makeDefault = function(ind) {
      if ($window.confirm('Make this address the default?')) {
        for (var i = 0; i < $scope.addresses.length; i++) {
          if ($scope.addresses[i].default) {
            $scope.addresses[i].default = false;
            locationService.updateAddress($scope.addresses[i]);
          }
          if (i == ind) {
            $scope.addresses[i].default = true;
            locationService.updateAddress($scope.addresses[i]);
          }
        }
      }
    };

    $scope.enableAddAddress = function() {
      $scope.clearAddress();
      $scope.editAddressView = false;
      $scope.addAddressView = true;
    };

    $scope.cancel = function() {
      $scope.editAddressView = false;
      $scope.addAddressView = false;
    }

    function validate () {
      $scope.error = null;
      if (!$scope.addressname) {
        $scope.error = 'Please name this address';
        return false;
      }
      if (!$scope.address1) {
        $scope.error = 'Please add the street address';
        return false;
      }
      if (!$scope.city) {
        $scope.error = 'Please add the address city';
        return false;
      }
      if (!$scope.state) {
        $scope.error = 'Please add the address state';
        return false;
      }
      if (!$scope.zip) {
        $scope.error = 'Please add the address zip';
        return false;
      }
      if (!$scope.addressphone) {
        $scope.error = 'Please add a contact phone number for this address';
        return false;
      }
      if (!$scope.addressemail) {
        $scope.error = 'Please add a contact email address';
        return false;
      }
      return true;
    }

    function onAddressAdded (error, address) {
      $scope.adding = false;
      if (error) {
        $scope.error = error;
      } else {
        $scope.addAddressView = false;
        $scope.clearAddress();
        $scope.addresses = locationService.locationsByProfile[authService.profileid];
      }
    }

    function onAddressUpdated (error, address) {
      $scope.updating = false;
      if (error) {
        $scope.error = error;
      } else {
        $scope.editAddressView = false;
        $scope.clearAddress();
        $scope.addresses = locationService.locationsByProfile[authService.profileid];
        console.log('address updated', error, address, $scope.addresses);
      }
    }

    function onAddressRemoved (error, address) {
      $scope.addresses = locationService.locationsByProfile[authService.profileid];
    }

    function onAddressesLoaded (error, addresses) {
      $scope.loadingAddresses = false;
      $scope.addresses = locationService.locationsByProfile[authService.profileid];
    }

    locationService.getProfileAddresses(onAddressesLoaded);

}]);
superApp.controller('SettingsSchedulingCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, $window) {

}]);
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

    // $scope.makeDefault = function(ind) {
    //   if ($window.confirm('Make this card the default?')) {
    //     for (var i = 0; i < $scope.addresses.length; i++) {
    //       if ($scope.addresses[i].default) {
    //         $scope.addresses[i].default = false;
    //       }
    //       if (i == ind) {
    //         $scope.addresses[i].default = true;
    //       }
    //     }
    //     $scope.profile.addresses = $scope.addresses;
    //     $scope.updateProfile();
    //   }
    // }

    $scope.removePayment = function(cardid) {
      if ($window.confirm('Are you sure? This will remove your credit card information from our database.')) {
        $scope.removingCard = true;
        stripeService.removeCard(cardid, $scope.onPaymentRemoved);
      }
    }

    $scope.onCustomerLoaded = function (customer) {
      $scope.customer = customer;
      $scope.loadingCustomer = false;
      if ($scope.customer && $scope.customer.sources) {
        $scope.cards = $scope.customer.sources.data;
      }
    }

  	$scope.onOrdersLoaded = function (orders) {
  		$scope.orders = orders;
      $scope.loadingOrders = false;
  	}

  	storeService.getOrdersByUserID(authService.profile.id, $scope.onOrdersLoaded);
    stripeService.getCustomer(authService.profile.customerid, $scope.onCustomerLoaded);
}]);
superApp.controller('StoreCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$state', '$stateParams', 'storeService',
   'authService',
  function($rootScope, $scope, $window, $location, $state, $stateParams, storeService,
    authService) {

    $rootScope.pageTitle = 'Store';
    $scope.filteredProducts = [];
    $scope.products = [];
    $scope.productsInCart = [];
    $scope.productsByCategory = []
    $scope.loading = true;
    $scope.authLoaded = authService.authorizationReceived;

    $scope.goToProduct = function(productnumber) {
      $state.go('product', {productnumber: productnumber});
    }

    $scope.isActive = function(route) {
      return route == $location.path();
    }

    $scope.openCart = function() {
      $rootScope.showCart(function(isVisible) {$scope.showCart = isVisible});
    };

    $scope.defaultImage = function(product) {
      if (product.remote_img) {
        product.img = product.remote_img;
      } else {
        product.img = "http://placehold.it/475x475&text=[img]";
      }
    }

    function onProductsInCartReceived (result) {
      $scope.productsInCart = result;
    }

    function onProductsLoaded (error, result) {
      if (error) {
        $scope.error = error;
        return;
      }
      $scope.products = result;
      $scope.productsByCategory = storeService.productsByCategory;
      storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);
      var stateUrl = $location.path().split("/");
      if (stateUrl.indexOf("product") >= 0) {
        var ind = stateUrl.indexOf("product");
        $scope.goToProduct(stateUrl[++ind]);
      }
      $scope.loading = false;
    }

    $scope.$watch('authLoaded', function (newValue, oldValue) {
      if (newValue) {
        storeService.getStoreFront(onProductsLoaded, true);
      }
    });

}]);
superApp.controller('SupportCtrl',
  ['$rootScope', '$scope', 'emailService', 'authService', '$stateParams',
  function($rootScope, $scope, emailService, authService, $stateParams) {

  	$scope.submitted = false;

  	if (authService.authorized) {
  		$scope.email = authService.profile.email;
  	} 

    if ($stateParams.topic) {
      $scope.topic = $stateParams.topic;
    }
  	
  	$scope.sendRequest = function() {
  		if ($scope.email == null) {
  			$scope.error = 'Please provide an email address for us to contact.';
  			return;
  		}
  		$scope.submitting = true;
  		$scope.data = {
  			topic: $scope.topic,
  			subject: $scope.subject,
  			orderid: $scope.orderid,
  			message: $scope.message
  		};
  		emailService.sendSupportRequest($scope.email, $scope.data, function(error, result) {
  			$scope.submitted = true;
  			$scope.submitting = false;
  		});
  	}

}]);
superApp.controller('TechniquesCtrl',
  ['$rootScope', '$scope',
  function($rootScope, $scope) {

}]);
superApp.controller('TermsCtrl',
  ['$rootScope', '$scope', '$window',
  function($rootScope, $scope, $window) {
  	

}]);
superApp.controller('ZonesCtrl',
  ['$rootScope', '$scope', '$stateParams',
  function($rootScope, $scope, $stateParams) {

  	$scope.viewState = $stateParams.procedure;

  	$scope.changeView = function(viewstate) {
  		$scope.viewState = viewstate;
  	}

}]);
appDirectives.directive('appointmentConfirmModalDir', ['profileService', 'authService', 'bookingService',
	function(profileService, authService, bookingService) { 
	return {
		restrict: 'E',
		scope: {
			appt: '=',
			close: '='
		},
		templateUrl: 'directives/appointment_confirm_modal_template.html',
		link: function(scope, element) {

			scope.patient = {};

			scope.toTitleCase = function(str) {
				if (!str) {
					return '';
				} else {
					return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
				}
			}

			scope.getDisplayDate = function(date) {
				return moment(date, 'X').format('LLLL')
			}

			scope.updateStatus = function(status) {
				scope.appt.status = status;
				bookingService.updateApptRequest(scope.appt, scope.patient, onApptUpdated);
			}

			function onApptUpdated (error, appt) {
				if (error) {
					scope.error = error;
					return;
				} else {
					scope.appt = appt;
					scope.close();
				}
			}

			function onProfileLoaded (error, profile) {
				scope.patient = profile;
			}

			var apptWatch = null;
			apptWatch = scope.$watch('appt', function (newVal, oldVal) {
				if (newVal) {
					profileService.getProfileByID(newVal.patient, onProfileLoaded);
				}
			});


			scope.$on('$destroy', function() {
				apptWatch();
			});
			
		}
	}
}]);
appDirectives.directive('bookingModalDir', ['$window', 'authService', 'bookingService',
	function($window, authService, bookingService) { 
	return {
		restrict: 'E',
		scope: {
			office: '=',
			close: '='
		},
		templateUrl: 'directives/booking_modal_template.html',
		link: function(scope, element) {
			scope.appts = [];
			scope.apptsByOfficeAndTimestamp = {};
			scope.dateOffset = 0;
			scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
			scope.error = null;
			scope.success = null;

			scope.reset = function () {
				scope.appts = [];
				scope.apptsByOfficeAndTimestamp = {};
				scope.dateOffset = 0;
				scope.startDate = moment().startOf('week').add(1, 'days'); // always want this weeks monday
				scope.error = null;
				scope.success = null;
			}

			scope.getUnix = function (offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('X');
			}

			scope.getDisplayDay = function(offset) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('ddd');
			}

			scope.getDisplayDate = function(offset) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').format('MMM Do YYYY');
			}

			scope.getDisplayTime = function(offset, hour) {
				return moment().startOf('week').add(1, 'days').add(scope.dateOffset + offset, 'days').hours(hour).format('LT');
			}

			scope.getSlotClass = function(offset, hour) {
				var appt = scope.apptsByOfficeAndTimestamp[scope.office.id][scope.getUnix(offset, hour)];
				if (appt && appt.status) {
					return appt.status;
				} else {
					return '';
				}
			}

			scope.selectSlot = function(offset, hour, $event) {
				scope.error = null;
				scope.success = null;	
				bookingService.sendApptRequest(scope.getUnix(offset, hour), scope.office, scope.office.profile, scope.procedure, onApptRequested);
			}

			scope.previous = function() {
				if (scope.dateOffset > 0) {
					scope.dateOffset -= 7;
				};
			}

			scope.next = function() {
				scope.dateOffset += 7;
			}

			function onApptRequested (error, appt) {
				if (error) {
					scope.error = error;
				} else {
					scope.success = true;
					scope.appts.push(appt);
					scope.apptsByOfficeAndTimestamp[appt.office] = scope.apptsByOfficeAndTimestamp[appt.office] || {};
					scope.apptsByOfficeAndTimestamp[appt.office][appt.date] = appt;
				}
			}

			function onApptsLoaded (error, appts) {
				scope.appts = appts || [];
			}

			bookingService.getPatientAppts(onApptsLoaded);

			var apptsWatch = null;
			apptsWatch = scope.$watch('appts', function (newVal, oldVal) {
				if (newVal && newVal.length) {
					for (var i = 0; i < newVal.length; i++) {
						scope.apptsByOfficeAndTimestamp[newVal[i].office] = scope.apptsByOfficeAndTimestamp[newVal[i].office] || {};
						scope.apptsByOfficeAndTimestamp[newVal[i].office][newVal[i].date] = newVal[i];
					}
				}
			});

			var officeWatch = null;
			officeWatch = scope.$watch('office', function (newVal, oldVal) {
				if (newVal) {
					scope.reset();
					bookingService.getPatientAppts(onApptsLoaded);
				}
			});

			scope.$on('$destroy', function() {
				officeWatch();
				apptsWatch();
			});
			
		}
	}
}]);
appDirectives.directive('comingSoonDir', ['$parse', function ($parse) {
    return {
        restrict: 'E',
        templateUrl: 'directives/coming_soon_template.html',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
        }
    };
}]);
appDirectives.directive('cartDir', [ 'authService', '$state', '$rootScope', '$cookieStore', '$cookies', '$window', 
	    'storeService', '$timeout',
	function(authService, $state, $rootScope, $cookieStore, $cookies, $window, 
		storeService, $timeout) {
	return {
		restrict: 'E',
		scope: {
			close: '='
		},
		templateUrl: 'directives/cart_template.html',
		link: function(scope, element) {

			scope.products = {};
			scope.productsInCart = [];
			scope.profileid = null;
			scope.cartTotal = 0;
			scope.cartProductsLoading = true;
			scope.cartWatch = null;

			if (authService.authorized) {
				scope.profileid = authService.profileid;
			}

			scope.persistCartItems = function() {
				var productnumbers = [];
				var quantities = [];
				for (var i = 0; i < scope.productsInCart.length; i++) {
					productnumbers[i] = scope.productsInCart[i].productnumber;
					quantities[i] = scope.productsInCart[i].quantity;
				}
				storeService.updateCart(authService.profileid, productnumbers, quantities);
			}

			scope.removeItemFromCart = function(index) {
				scope.productsInCart.splice(index, 1);
				scope.updateTotal();
  				scope.persistCartItems();
			}

			scope.updateTotal = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  					scope.cartTotal += parseInt(scope.products[scope.productsInCart[i].productnumber].price) * parseInt(scope.productsInCart[i].quantity);
  				}
  				scope.cartTotal = parseInt(scope.cartTotal).toFixed(2);
			}

			scope.updateTotalAndPersist = function() {
				scope.cartTotal = 0;
				for (var i = 0; i < scope.productsInCart.length; i++) {
  					scope.cartTotal += parseInt(scope.products[scope.productsInCart[i].productnumber].price) * parseInt(scope.productsInCart[i].quantity);
  				}
  				scope.cartTotal = parseInt(scope.cartTotal).toFixed(2);
  				scope.persistCartItems();
			}

			scope.goToCheckout = function() {
				$state.go("checkout");
				$rootScope.$broadcast('cartviewchange', {displayCart: false});
			}

	  		function onProductsLoaded (error, products) {
	  			scope.products = storeService.productsByID;
	  			if (scope.productsInCart.length > 0) {
	  				scope.updateTotal();
	  			}
	  			scope.cartProductsLoading = false;
	  		}

	  		function onProductsInCartReceived (error, products) {
	  			scope.productsInCart = products;
				if (storeService.productsReceived) {
					onProductsLoaded(null, storeService.products);
				} else {
					storeService.getStoreFront(onProductsLoaded);
				}
	  		};

	  		cartWatch = scope.$watch(function() { return $cookies.pInCart; },
	  			function (newValue, oldValue) {
	  				if (newValue && newValue != oldValue) {
	  					scope.productsInCart = $cookieStore.get('pInCart');
	  					scope.updateTotal();
	  				}
	  			}
	  		);

			storeService.getProductsInCart(authService.profileid, onProductsInCartReceived);

			scope.$on('loggedout', function() {
  				cartWatch();
  				$cookieStore.put('pInCart', []);
			});

		}
	}
}]);
appDirectives.directive('errorDir', ['$window', '$log',
	function($window, $log) { 
	return {
		restrict: 'E',
		scope: {
			msg: '@',
			htmlMsg: '=',
			level: '='
		},
		templateUrl: 'directives/error_template.html',
		link: function(scope, element) {
		}
	}
}]);

appDirectives.directive('fileModelDir', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
    	console.log('attrs', attrs);
      var model = $parse(attrs.fileModelDir);
      console.log('parse result', model);
      var modelSetter = model.assign;
      
      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);
appDirectives.directive('footerDir', [ 'authService', '$state',
	function(authService, $state) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/footer_template.html',
		link: function(scope, element) {



		}
	}
}]);
appDirectives.directive('learnMoreModalDir', ['$window', 'authService', 'emailService',
	function($window, authService, emailService) { 
	return {
		restrict: 'E',
		scope: {
			close: '='
		},
		templateUrl: 'directives/learn_more_modal_template.html',
		link: function(scope, element) {
		  	scope.submitted = false;
			scope.submitting = false;

			scope.submit = function() {
				if (scope.submitting) {
					return;
				}

		  		if (scope.email == null) {
		  			scope.error = 'Please provide an email address for us to contact.';
		  			return;
		  		}
		  		scope.submitting = true;
		  		scope.data = {
		  			topic: 'Learn More',
		  			subject: 'Learn More Inquiry',
		  			orderid: 'N/A',
		  			message: 'This user submitted their email for more information, please reach out to them in a timely manner'
		  		};
		  		emailService.sendSupportRequest(scope.email, scope.data, function(error, result) {
		  			if (error) {
		  				scope.error = 'Error submitting request, please try again.';
		  			} else {
		  				scope.submitted = true;
		  			}
		  			scope.submitting = false;
		  		});
		  	}
			
		}
	}
}]);
appDirectives.directive('mobileNavBarDir', [ 'authService', '$state', '$location', '$rootScope', '$window', '$cookieStore', '$cookies', 'storeService',
	function(authService, $state, $location, $rootScope, $window, $cookieStore, $cookies, storeService) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/mobile_nav_bar_template.html',
		link: function(scope, element) {
			scope.loggedIn = false;
			scope.name = "";
			scope.profileid = null;
			scope.isAdmin = false;
			scope.isMerchant = false;
			scope.query = null;
			scope.productsInCart = [];
			scope.itemCount = 0;
			scope.cart = {};
			scope.productNames = [];
			scope.productCategories = {};

			scope.goToPage = function(page) {
	  			$state.go(page);
			};

	  		scope.logoutNow = function() {
	  			scope.loggedIn = false;
	  			$state.go("logout");
	  		};

	  		scope.openCart = function() {
	  			$rootScope.showCart(function(isVisible) {scope.showCart = isVisible});
	  		};

	  		scope.search = function(query) {
	  			$state.go("search_results", {'query' : query});
	  		}

	  		scope.handleLoaded = function() {
	  			if (authService.authorized) {
	  				scope.loggedIn = true;
	  				scope.name = authService.profile.name;
	  				scope.profileid = authService.profile.id;
	  				scope.isAdmin = authService.isAdmin;
	  				scope.isYLIFT = authService.isYLIFT;
	  				scope.isMerchant = authService.isMerchant;
	  			} else {
	  				scope.loggedIn = false;
	  				scope.name =  null;
	  				scope.isAdmin = false;
	  				scope.isMerchant = false;
	  			}
	  		};

	  		function onProductsLoaded (products) {
				products.forEach(function(product, index) {
					if (scope.productCategories[product.category] === undefined) {
						scope.productCategories[product.category] = 0;
					}
					scope.productCategories[product.category]++;
		            scope.productNames.push(product.name);
		        });
			}

			if (authService.authorized) {
				scope.loggedIn = true;
				scope.name = authService.profile.name;
				scope.profileid = authService.profile.id;
				scope.isAdmin = authService.isAdmin;
	  			scope.isYLIFT = authService.isYLIFT;
	  			scope.isMerchant = authService.isMerchant;
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}

			scope.$on('productsloaded', function (evt, products) {
				onProductsLoaded(products);
			});

			var pInCartWatch = scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard ... me too
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
				}
				scope.itemCount = scope.productsInCart.length || 0;
			});

			scope.$on('$destroy', function () {
				pInCartWatch();
			});

		}
	}
}]);
appDirectives.directive('nameDir', ['profileService', 
	function(profileService) {
	return {
			restrict: 'E',
			scope: {
				id: '=',
				format: '@'
			},
			templateUrl: 'directives/name_template.html',
			link: function(scope, element) {
				scope.name = "";
				if (!scope.width || !scope.height) {
					scope.width = scope.height = 20; // should be symmetric 
				}

				scope.$watch('id', function(newValue, oldValue) {
					if (newValue) {
						profileService.getProfileByID(scope.id, function(error, data) {
							if (scope.format == 'initials') {
								var name = data.name.split(' ', 3);
								for (var i = 0; i < name.length; i++) {
									scope.name += name[i].charAt(0);
								}
							} else if (scope.format == "first-name") {
								scope.name = data.name.split(' ')[0];
							}else {
								scope.name = data.name || data.email;
							}
						});
					}
				});
			}
		};
	}]);

appDirectives.directive('navBarDir', [ 'authService', '$state', '$location', '$rootScope', '$window', 
		'$cookieStore', '$cookies', 'storeService', 'profileService',
	function(authService, $state, $location, $rootScope, $window, 
		$cookieStore, $cookies, storeService, profileService) {
	return {
		restrict: 'E',
		scope: {
			back: '=',
			close: '=',
			center: '='
		},
		templateUrl: 'directives/nav_bar_template.html',
		link: function(scope, element) {

			function init () {
	  			scope.loggedIn = false;
				scope.name = "";
				scope.profileid = null;
				scope.isAdmin = false;
				scope.isMerchant = false;
				scope.isYLIFT = false;
				scope.query = null;
				scope.productsInCart = [];
				scope.productCategories = {};
				scope.itemCount = 0;
				scope.cart = {};
				scope.productNames = [];
	  		}
			
			init();

			scope.goToPage = function(page) {
	  			$state.go(page);
			};

			scope.toTitleCase = function(str) {
				return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			}

	    	scope.isActive = function(route) {
	      		return route === $location.path();
	  		};

	  		scope.logoutNow = function() {
	  			scope.loggedIn = false;
	  			init();
	  			$state.go("logout");
	  		};

	  		scope.openCart = function() {
	  			$rootScope.$broadcast('cartviewchange', {displayCart: true});
	  			// $rootScope.showCart(function(isVisible) {scope.showCart = isVisible});
	  		};

	  		scope.search = function(query) {
	  			$state.go("search_results", {'query' : query});
	  		}

	  		scope.handleLoaded = function() {
	  			if (authService.authorized) {
	  				scope.loggedIn = true;
	  				scope.name = authService.profile.name;
	  				scope.profileid = authService.profile.id;
	  				scope.isAdmin = authService.isAdmin;
	  				scope.isYLIFT = authService.isYLIFT;
	  				onProfileLoaded();
	  			} else {
	  				scope.loggedIn = false;
	  				scope.name =  null;
	  				scope.isAdmin = false;
	  			}
	  		};

	  		scope.checkProductsLoaded = function($event) {
	  			if (scope.productNames.length > 0) {
	  				$event.stopPropagation();
	  				return;
	  			}
	  			storeService.getStoreFront(onProductsLoaded);
	  		}

			var pInCartWatch = scope.$watch(function() { return $cookies.pInCart; }, function(newCart, oldCart) { // this makes me hard ... me too
				if (newCart) {
					scope.productsInCart = JSON.parse(newCart);
				}
				scope.itemCount = scope.productsInCart.length || 0;
			});

	  		function onProfileLoaded () {
	  			profileService.getMerchantProfile(function (error, profile) {
	  				if (profile && profile.name) {
	  					scope.merchantName = profile.name;
	  					scope.isMerchant = true;
	  				}
	  			});
	  		}

			function onProductsLoaded (error, products) {
				products.forEach(function(product, index) {
					if (scope.productCategories[product.category] === undefined) {
						scope.productCategories[product.category] = 0;
					}
					scope.productCategories[product.category]++;
		            scope.productNames.push(product.name);
		        });
			}
			
			if (authService.authorized) {
				scope.loggedIn = true;
				scope.name = authService.profile.name;
				scope.profileid = authService.profile.id;
	  			scope.isYLIFT = authService.isYLIFT;
				scope.isAdmin = authService.isAdmin;
				onProfileLoaded();
			} else {
				scope.loadedFun = null;
			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
			        scope.handleLoaded();
			        scope.loadedFun();
	  			});
			}


			scope.$on('authorizationloaded', function (evt, args) {
				scope.handleLoaded();
			});


			scope.$on('productsloaded', function (evt, products) {
				onProductsLoaded(null, products);
			});

			scope.$on('merchantcreated', function (evt, args) {
				onProfileLoaded();
			});

			scope.$on('$destroy', function () {
				pInCartWatch();
			});

		}
	}
}]);
appDirectives.directive('navLinksDir', [ 'authService', '$state', '$rootScope',
	function(authService, $state, $rootScope) {
	return {
		restrict: 'E',
		scope: {
		},
		templateUrl: 'directives/nav_links_template.html',
		link: function(scope, element) {

			scope.handleLoaded = function() {
	  			if (authService.authorized) {
	  				scope.isAdmin = authService.isAdmin;
	  				scope.isYLIFT = authService.isYLIFT;
	  			} else {
	  				scope.isAdmin = false;
	  				scope.isYLIFT = false;
	  			}
	  		};

			scope.$on('authorizationloaded', function (evt, args) {
				scope.handleLoaded();
			});
		}
	}
}]);
appDirectives.directive('productCardDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			product: '='
		},
		templateUrl: 'directives/product_card_template.html',
		link: function(scope, element) {
			scope.defaultImage = function(product) {
		      if (product.remote_img) {
		        product.img = product.remote_img;
		      } else {
		        product.img = "http://placehold.it/475x475&text=[img]";
		      }
		    }
		}
	}
}]);
appDirectives.directive('productCartDir', [ '$state', '$rootScope', '$window', 'storeService', '$timeout', 'merchantService',
	function($state, $rootScope, $window, storeService, $timeout, merchantService) {
	return {
		restrict: 'E',
		scope: {
			product: '=',
			item: '=',
			ind: '=',
			edit: '=',
			remove: '='
		},
		templateUrl: 'directives/product_cart_template.html',
		link: function(scope, element) {

			scope.recentChange = false;
			scope.vendornames = {};

			scope.updateQuantity = function(quantity) {
				scope.item.quantity = quantity;
				scope.$parent.updateTotalAndPersist();
			}

			scope.addOne = function() {
				scope.item.quantity++;
				scope.$parent.updateTotalAndPersist();
				scope.recentChange = true;
                $timeout(function() {
                    scope.recentChange = false;
                }, 1000);
			} 

			scope.minusOne = function() {
				if (scope.item.quantity > 0) {
					scope.item.quantity--;
					scope.recentChange = true;
	                $timeout(function() {
	                    scope.recentChange = false;
	                }, 1000);
				} else {
					scope.remove(scope.ind);
				}
				scope.$parent.updateTotalAndPersist();
			} 

			scope.goToProduct = function() {
				$state.go('product', {productnumber: scope.product.productnumber});
				$rootScope.$broadcast('cartviewchange', {displayCart: false});
			}

			merchantService.getMerchantByID(scope.product.attributes.vendor, function (err, data) {
				if(!err) {
					scope.vendorname = data.name;
				}
			})
		}
	}
}]);
appDirectives.directive('productImgDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			pn: '=',
			w: '=',
			h: '=',
			x: '=',
			click: '='
		},
		templateUrl: 'directives/product_img_template.html',
		// replace: true, // Replace with the template below
		// transclude: true, // we want to insert custom content inside the directive
		link: function(scope, element) {
			if (storeService.productsByID && storeService.productsByID[scope.pn] && storeService.productsByID[scope.pn].remote_img) {
				scope.src = storeService.productsByID[scope.pn].remote_img
			} else {
				scope.src = "/img/logo.png";
			}
		}
	}
}]);
appDirectives.directive('productReviewDir', [ '$state',
	function($state) {
	return {
		restrict: 'E',
		scope: {
			review: '='
		},
		templateUrl: 'directives/product_review_template.html',
		link: function(scope, element) {
			scope.title = scope.review.title;
			scope.description = scope.review.review;
			scope.rating = scope.review.rating;
			scope.name = scope.review.name;

		}
	}
}]);
appDirectives.directive('promoDir', ['$window', 'promoService',
	function($window, promoService) { 
	return {
		restrict: 'E',
		scope: {
			total: '=',
			shipping: '=',
			domain: '@',
			error: '=',
			showLabel: '='
		},
		templateUrl: 'directives/promo_template.html',
		link: function(scope, element) {

			scope.validating = false;
			scope.success = false;
			scope.code = null;

			if (!scope.domain) {
				$log.debug('no domain set in promo dir');
			}

			scope.applyCode = function() {
				if (scope.validating) {
					return;
				}
				scope.validating = true;
				promoService.getPromoCode(scope.code, scope.domain, onCodeLoaded);
			}

			function onCodeLoaded(error, code) {
				if (error) {
					scope.error = error;
				} else {
					scope.code = code;
					if (code.type == "money_off") {
						scope.total -= parseInt(code.value);
					} else if (code.type == "percent_off") {
						scope.total -= (scope.total * parseFloat(code.value));
					} else if (code.type == "new_price") {
						scope.total = code.value;
					} else if (code.type == "free_shipping") {
						scope.shipping = 0;
					}
					scope.total = parseFloat(scope.total).toFixed(2); // ensure we have 2 decimal places
					scope.success = true;
					scope.error = null;
				}
				scope.validating = false;
			}
			
		}
	}
}]);
appDirectives.directive('suggestedProductDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		scope: {
			pn: '=',
			detailed: '='
		},
		templateUrl: 'directives/suggested_product_template.html',
		link: function(scope, element) {
			scope.name = null;
			scope.price = null;

			scope.p = storeService.productsByID[scope.pn];

			scope.goToProduct = function() {
				$state.go("product", {productnumber:scope.pn});
			}

			if (scope.detailed == 'yes') {
				scope.name = p.name;
				scope.price = p.price;
			}
		}
	}
}]);
appDirectives.directive('zipSearchDir', [ '$state', '$rootScope', '$window', 'storeService',
	function($state, $rootScope, $window, storeService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			onSubmit: '=',
		},
		templateUrl: 'directives/zip_search_template.html',
		link: function(scope, element) {

			element.bind("keydown keypress", function(event) {
            	if (event.which === 13) {
            		scope.onSubmit(scope.zip);
            	}
            });

		}
	}
}]);
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
	            $log.debug('error adding address', data);
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
        };

        this.checkEmailAvailability = function(email, callback) {
        	$http({method: 'POST', url: "/admin/email_availability",
                   data: {email:email} })
            .success(function(data, status, headers, config) {
            	callback(null, data);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error checking email availability', data);
                callback(data.message);
            });
        };

}]);
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
trdServices.service('awsService', ['$http', '$log',
	function($http, $log) {

	this.getSignedRequest = function(file, callback) {
		$http({method:'GET', url:'/sign_s3?file_name=' + file.name + '&file_type=' + file.type}).
			success(function(data, status, headers, config) {
				callback(file, data.signed_request, data.url);
			}).
			error(function(data, status, headers, config) {
				$log.debug("getting signed request failed:", data);
				callback();
			});
	};

	this.getObject = function(file, callback) {
		$http({method:'POST', url:'/get_object', data: {file_name: file}}).
			success(function(data, status, headers, config) {
				callback(null, data.success);
			}).
			error(function(data, status, headers, config) {
				$log.debug("getting object failed:", data);
				callback(true);
			});
	};

	this.uploadFile = function(file, signed_request, url, callback) {
		var xhr = new XMLHttpRequest();
	    xhr.open("PUT", signed_request);
	    xhr.setRequestHeader('x-amz-acl', 'public-read');
	    xhr.onload = function() {
	        callback(url);
	    };
	    xhr.onerror = function() {
	        alert("Could not upload file.");
	    };
	    xhr.send(file);
	};

}]);

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
	    		   data: {office:office, patient: authService.profile, date:date, procedure:procedure}})
	        .success(function (data, status, headers, config) {
	            callback(null, data.appt);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding appointment request', data);
            	callback(data.message);
	        });
    	}

    	this.updateApptRequest = function(appt, patient, callback) {
    		var inThis = this;
	        $http({method: 'POST', url: '/booking/update_appt', 
	    		   data: {appt:appt, patient:patient}})
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
trdServices.service("cartService", ['$rootScope', '$http', '$cookieStore',
    function ($rootScope, $http, $cookieStore) {

    	// this.isVisible = false;

    	// this.toggleVisible = function(callback) {
    	// 	this.isVisible = !this.isVisible;
    	// 	console.log("toggleVisible", this.isVisible);
    	// 	callback(this.isVisible);
    	// }

}]);
trdServices.service('emailService', ['$http', '$log', 
	function($http, $log) {

	this.sendSupportRequest = function(email, props, callback) {
		$http({method:'POST', url:'/email_support',
			   data: {email:email, props:props}}).
			success(function(data, status, headers, config) {
				callback(null, data.result);
			}).
			error(function(data, status, headers, config) {
				$log.debug('error sending support request', data);
				callback(data.message);
			});
	};

	this.changeUserEmail = function(oldemail, newemail, callback) {
		$http({method:'POST', url:'/change_email',
			   data: {oldemail:oldemail, newemail:newemail}}).
			success(function(data, status, headers, config) {
				if(callback) {
					callback(null);
				}
			}).
			error(function(data, status, headers, config) {
				$log.debug('error sending email', data);
				if(callback) {
					callback(data.message);
				}
			});
	};

}]);

trdServices.service("locationService", ['$rootScope', '$http', '$cookieStore', '$q', 'authService', '$log',
    function ($rootScope, $http, $cookieStore, $q, authService, $log) {
    	this.locationsRetrieved = false;
    	this.locations = [];
    	this.locationsByDoctor = {};
    	this.locationsByProfile = {};

    	this.addressToLatLong = function(address) {

    		var deferred = $q.defer();
    		var geocoder = new google.maps.Geocoder();
    		var lookup = address.address1 + ', ' + address.city + ', ' + address.state + ' ' + address.zip;
  			geocoder.geocode({address:lookup}, function (results, status) {
  				if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
  					address.location = results[0].geometry.location;
  					address.formattedaddress = results[0].formatted_address;
  					deferred.resolve(address);
  				} else {
  					deferred.reject(new Error("bad address"));
  				}
  			});
  			return deferred.promise;
    	};

    	this.getYLiftLocations = function(callback) {
    		if (this.locationsRetrieved) {
    			callback(this.locations);
    			return;
    		}
    		var inThis = this;
    		$http({method: 'GET', url: '/ylift_locations'}).
    		success(function(data, status, headers, config) {
    			var promises = [];
    			data.locations.forEach(function (location, index) {
    				var deferred = $q.defer();
    				inThis.addressToLatLong(location)
    				.then(function (result) {
    					deferred.resolve(result);
    				}, function (err) {
    					deferred.resolve(null);
    				});
    				promises.push(deferred.promise);
    			});
    			$q.all(promises)
    			.then(function (result) {
    				var locations = result.filter(function(n) { return n != null });
    				inThis.locationsRetrieved = true;
    				inThis.locations = locations;
    				for (var i = 0; i < locations.length; i++) {
    					inThis.locationsByDoctor[locations[i].profileid] = locations[i];
    				}
    				callback(null, inThis.locations);
    			}, function (reasons) {
    				$log.debug('error retrieving y lift locations', reasons);
    				callback('There was an error retrieving Y Lift Network locations');
    			});
		    }).
		    error(function(data, status, headers, config) {
		    	callback(data.message);
		    });
    	}

    	this.getProfileAddresses = function (callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		if (this.locationsByProfile[authService.profileid] !== undefined) {
    			callback(null, this.locationsByProfile[authService.profileid]);
    			return;
    		}
    		inThis = this;
    		$http({method: 'GET', url: '/profile/addresses/' + authService.profileid})
	        .success(function (data, status, headers, config) {
	        	inThis.locationsByProfile[authService.profileid] = data.addresses;
	            callback(null, data.addresses);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting addresses', data);
	            callback(data.message);
	        });
    	}

    	this.addAddressToProfile = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		var inThis = this;
    		$http({method: 'POST', url: '/profile/add_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
                inThis.locationsByProfile[authService.profileid] = inThis.locationsByProfile[authService.profileid] || [];
	        	inThis.locationsByProfile[authService.profileid].push(data.address);
	            if (callback) {
	                callback(null, data.address);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error adding address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

    	this.updateAddress = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
    		var inThis = this;
    		$http({method: 'POST', url: '/profile/update_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
	        	for (var i = 0; i < inThis.locationsByProfile[authService.profileid].length; i++) {
	        		if (inThis.locationsByProfile[authService.profileid][i].id == data.address.id) {
	        			inThis.locationsByProfile[authService.profileid][i] = data.address;
	        		}
	        	}
	            if (callback) {
	                callback(null, data.address);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error updating address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

    	this.removeAddress = function (address, callback) {
    		if (!authService.profileid) {
    			callback('Not authorized');
    			return;
    		}
            var inThis = this;
    		$http({method: 'POST', url: '/profile/remove_address/' + authService.profileid, data:{address:address}})
	        .success(function (data, status, headers, config) {
	        	for (var i = 0; i < inThis.locationsByProfile[authService.profileid].length; i++) {
	        		if (inThis.locationsByProfile[authService.profileid][i].id == address.id) {
                        inThis.locationsByProfile[authService.profileid].splice(i, 1);
	        		}
	        	}
	            if (callback) {
	                callback(null, data.success);
	            }
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error removing address', data);
	            if (callback) {
	                callback(data.message);
	            }
	        });
    	}

}]);


trdServices.service("merchantService", ['$http',
    function ($http) {	

    this.merchants = [];

    this.getMerchantByID = function(merchantid, callback) {
        if(this.merchants[merchantid]) {
            callback(null, this.merchants[merchantid]);
        }
    	var internalThis = this;
        $http({method: 'POST', url: "/get_merchant_name",
            data:{id:merchantid}})
        .success(function(data, status, headers, config) {
        	internalThis.merchants[data.merchant.id] = data.merchant;
            callback(null, data.merchant);
        })
        .error(function(data, status, headers, config) {
            callback("Merchant not found");
        });
      };

     this.getMerchantName = function(id, callback) {
     	if(this.merchants[id]) {	// merchant is already cached
     		callback(this.merchants[id].name);
     	}else {						// else need to grab it
     		this.getMerchantByID(id, function(result) {
     			if(result.name) {	// merchant was found
     				callback(result.name);
     			}else{
     				callback("No merchant found");
     			}
     		});
     	}
     };

}]);
trdServices.service("productService", ['$rootScope', '$http', '$cookieStore', 'stripeService', 'profileService', 
    'authService', '$log',
    function ($rootScope, $http, $cookieStore, stripeService, profileService, 
        authService, $log) {

        this.initService = function() {
            this.mostViewedByProfile = {};
            this.reviewsByProduct = {};
            this.merchantByProduct = {};
        }

        this.initService();

    	this.submitReview = function(productnumber, review, callback) {
    		review.productnumber = productnumber;
    		$http({method: 'POST', url: "/submit_review",
    			   data:{review:review}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, {message:"success!"});
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error submitting review', data);
                if (callback) {
                    callback(data.message);
                }
            });
    	}

    	this.getRating = function(productnumber, callback) {
    		$http({method: 'GET', url: "/product_rating/" + productnumber})
            .success(function(data, status, headers, config) {
                callback(null, data.data);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error getting rating', data);
                callback(data.message);
            });
    	}

    	this.getReviews = function(productnumber, callback) {
            if (this.reviewsByProduct[productnumber] !== undefined) {
                callback(null, this.reviewsByProduct[productnumber]);
                return;
            }
            var inThis = this;
    		$http({method: 'GET', url: "/product_reviews/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.reviewsByProduct[productnumber] = data.data;
                callback(null, data.data);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error getting reviews', data);
                callback(data.message);
            });
    	}

        this.getMerchant = function(productnumber, callback) {
            if (this.merchantByProduct[productnumber] !== undefined) {
                callback(null, this.merchantByProduct[productnumber]);
                return;
            }
            var inThis = this;
            $http({method: 'GET', url: "/product_merchant/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.merchantByProduct[productnumber] = data.merchant;
                callback(null, data.merchant);
            })
            .error(function(data, status, headers, config) {
                $log.debug('error getting merchant', data);
                callback(data.message);
            });
        }

        this.addPageView = function(productnumber, callback) {
            $http({method: 'POST', url: "/product_page_view/" + productnumber + '?profile=' + authService.profileid})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(null, data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error adding page view', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

        this.addProduct = function(product, callback) {
            if (!profileService.merchant) {
                callback('Merchant not authorized to add product');
                return;
            }
            $http({method: 'POST', url: "/add_product",
                   data: {product:product, merchant:profileService.merchant}})
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

        this.updateProduct = function(product, callback) {
            $http({method: 'POST', url: "/update_product",
                   data: {product:product}})
            .success(function(data, status, headers, config) {
                if (callback) {
                    callback(data);
                }
            })
            .error(function(data, status, headers, config) {
                $log.debug('error updating product', data);
                if (callback) {
                    callback(data.message);
                }
            });
        }

        // this.getMostViewedProduct = function(profileid, callback) {
        //     if (this.mostViewedByProfile[profileid] !== undefined) {
        //         callback(this.mostViewedByProfile[profileid]);
        //         return;
        //     }
        //     var inThis = this;
        //     $http({method: 'GET', url: "/most_viewed_product/" + profileid})
        //     .success(function(data, status, headers, config) {
        //         inThis.mostViewedByProfile[profileid] = data;
        //         callback(data);
        //     })
        //     .error(function(data, status, headers, config) {
        //         callback({message:"error", err:data});
        //     });
        // }

}]);
trdServices.service("profileService", ['$rootScope', '$http', '$cookieStore', 'authService', '$log',
    function ($rootScope, $http, $cookieStore, authService, $log) {

    this.adminOf = {};
    this.profilesByID = {};

    this.updateProfile = function(profile, callback) {
        $http({method: 'POST', url: '/profile/update/' + profile.id, data:{profile:profile}})
        .success(function (data, status, headers, config) {
            if (callback) {
                callback(null, data);
            }
        })
        .error(function (data, status, headers, config) {
            $log.debug('error updating profile', data);
            if (callback) {
                callback(data.message);
            }
        });
    }

    this.getProfileByID = function(id, callback) {
        if (this.profilesByID[id] !== undefined) {
            callback(this.profilesByID[id]);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: '/profile/' + id})
        .success(function (data, status, headers, config) {
            callback(null, data.profile);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error getting profile', data);
            callback(data.message);
        });
    }

    this.getMerchantProfile = function(callback) {
        if (this.merchant !== undefined) {
            callback(null, this.merchant);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: '/profile/get_merchant/' + authService.profile.id})
        .success(function (data, status, headers, config) {
            if (data.profile && data.admin) {
                inThis.adminOf[data.profile.id] = true;
            }
            inThis.merchant = data.profile;
            callback(null, data.profile);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error getting merchant profile', data);
            callback(data.message);
        });
    }

    this.addMerchantProfile = function(name, category, regkey, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/add_merchant/' + authService.profile.id, 
               data:{name:name, category:category, regkey:regkey}})
        .success(function (data, status, headers, config) {
            inThis.merchant = data;
            inThis.adminOf[data.id] = true;
            callback(null, data);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error adding merchant profile', data);
            callback(data.message);
        });
    }

    this.updateMerchantProfile = function(profile, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/update_merchant', 
               data:{profile:profile}})
        .success(function (data, status, headers, config) {
            if (data.profile && data.admin) {
                inThis.adminOf[data.profile.id] = true;
            }
            inThis.merchant = data.profile;
            callback(null, data.profile);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error updating merchant profile', data);
            callback(data.message);
        });
    }

    this.deleteMerchantProfile = function(callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/delete_merchant/' + authService.profile.id, 
               data:{merchantid:this.merchant.id}})
        .success(function (data, status, headers, config) {
            if (data.result == "unauthorized") {
                callback('You are not authorized to remove this account');
                return;
            }
            inThis.adminOf[inThis.merchant.id] = false;
            inThis.merchant = null;
            callback(null, null);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error deleting profile', data);
            callback(data.message);
        });
    }

    this.isAdminOfMerchant = function(merchantid) {
        return this.adminOf[merchantid];
    }

    $rootScope.$on('loggedout', function(evt, args) {
        this.adminOf = {};
    });
 
}]);
trdServices.service("promoService", ['$http', '$log', '$rootScope',
    function ($http, $log, $rootScope) {


    	this.initService = function() {
    		this.currentPromo = null;
    	}

    	this.getPromoCode = function(code, domain, callback) {
    		inThis = this;
	        $http({method: 'POST', url: '/promo/' + code, data: {domain:domain}})
	        .success(function (data, status, headers, config) {
	        	inThis.currentPromo = data.key;
	            callback(null, data.key);
	        })
	        .error(function (data, status, headers, config) {
	            $log.debug('error getting promo code', data);
	            inThis.currentPromo = null;
            	callback(data.message);
	        });
    	}

    	this.initService();

	    $rootScope.$on('loggedout', function(evt, args) {
	        this.initService;
	    });


}]);
trdServices.service("registrationService", ['$rootScope', '$http',
    function ($rootScope, $http) {

    this.verifyKey = function(key, callback) {
        $http({method: 'POST', url: '/verify_key', data:{key:key}})
        .success(function (data, status, headers, config) {
            callback(data.status, data.merchant);
        })
        .error(function (data, status, headers, config) {
            console.log('error validating key', data);
            callback(data.status);
        });
    }
     
}]);
trdServices.service("storeService", ['$rootScope', '$http', '$cookieStore', 'stripeService', '$log', 'authService',
    function ($rootScope, $http, $cookieStore, stripeService, $log, authService) {

    this.initService = function() {
        this.productsReceived = false;
        this.cartReceived = false;
        this.ordersReceived = false;
        this.productsInCart = [];
        this.products = [];
        this.productsByID = {};
        this.relatedProductsByID = {};
        this.productsByCategory = {};
        this.productsByMerchant = {};
        this.orders = [];
        this.ordersByID = {};
        this.cart = {};
    }

    this.initService();

    this.getProductMerchant = function(productid, callback) {
        return this.productsByID[productid].attributes.vendor;
    }

    this.getStoreFront = function(callback, refresh) {
        if (this.productsReceived && !refresh) {
            callback(null, this.products);
            return;
        }
        var internalThis = this;
        $http({method: 'POST', url: "/store", data:{ylift: authService.isYLIFT}})
            .success(function(data, status, headers, config) {
                internalThis.products = [];
                internalThis.productsByID = {};
                internalThis.productsByCategory = {};
                for(var i = 0; i < data.products.length; i++) {
                    internalThis.productsByID[data.products[i].productnumber] = data.products[i]; 
                    internalThis.products.push(data.products[i]); //seems redundant if we already have productsByID containing all products
                    if(internalThis.productsByCategory[data.products[i].category]){
                        internalThis.productsByCategory[data.products[i].category].push(data.products[i]);
                    }else {
                        internalThis.productsByCategory[data.products[i].category] = [];
                        internalThis.productsByCategory[data.products[i].category].push(data.products[i]);
                    }
                }
                internalThis.productsReceived = true;
                callback(null, internalThis.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting all products', data);
                internalThis.productsReceived = false;
                callback(data.message);
            });
    }

    this.getProductByID = function(productnumber, callback) {
        if (this.productsByID[productnumber] !== undefined) {
            callback(null, this.productsByID[productnumber]);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: "/get_product_by_id/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.productsByID[productnumber] = data.product;
                callback(null, data.product);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting product by id', data);
                callback(data.message);
            });
    }

    this.getProductsByIDs = function(productnumbers, callback) {
        if (!Array.isArray(productnumbers)) {
            productnumbers = [productnumbers];
        }
        var products = {};
        var productsToGet = [];
        productnumbers.forEach(function (pn, index) {
            if (this.productsByID[pn] !== undefined) {
                products[pn] = this.productsByID[pn];
            } else {
                productsToGet.push(pn);
            }
        });
        if (productsToGet.length == 0) {
            callback(null, products);
        } else {
            var inThis = this;
            $http({method: 'POST', url: "/get_products_by_ids", data: {productIDs: productsToGet}})
                .success(function(data, status, headers, config) {
                    data.products.forEach(function (product, index) {
                        inThis.productsByID[product.productnumber] = product;
                        products[product.productnumber] = product;
                    });
                    callback(null, products);
                })
                .error(function(data, status, headers, config) {
                    $log.debug('there was an error getting products by ids', data);
                    callback(data.message);
                });
        }
    }

    this.getRelatedProducts = function(productnumber, callback) {
        if (this.relatedProductsByID[productnumber] !== undefined) {
            callback(null, this.relatedProductsByID[productnumber]);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: "/get_related_products/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.relatedProductsByID[productnumber] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting related products', data);
                callback(data.message);
            });
    }

    this.getProductsByCategory = function(category, callback) {
        if (this.productsReceived) {
            callback(null, this.productsByCategory[category]);
        } else{
            var inThis = this;
            $http({method: 'POST', url: "/get_products_by_category", data:{category:category}})
            .success(function(data, status, headers, config) {
                inThis.productsByCategory[category] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting products by category', data);
                callback(data.message);
            });
        }
    }

    this.getProductsByMerchant = function(merchantid, callback) {
        if (this.productsByMerchant[merchantid] !== undefined) {
            callback(null ,this.productsByMerchant[merchantid]);
        } else{
            var inThis = this;
            $http({method: 'GET', url: "/get_products_by_merchant/" + merchantid})
            .success(function(data, status, headers, config) {
                inThis.productsByMerchant[merchantid] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting products by merchant', data);
                callback(data.message);
            });
        }
    }

    this.addItemToCart = function(profileid, productnumber, quantity, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/add_item_to_cart", data: {profileid:profileid, productnumber:productnumber,quantity:quantity}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart);
                })
                .error(function(data, status, headers, config) {
                    internalThis.cartReceived = false;
                    $log.debug('there was an error adding item to cart', data);
                    callback(data.message);
                });
        } else {
            var pInCart = $cookieStore.get('pInCart') || [];
            var pInCartObj = {
                "productnumber": productnumber,
                "quantity": quantity
            };
            var duplicate = false;
            for (var i = 0; i < pInCart.length; i++) {
                if (pInCart[i].productnumber == pInCartObj.productnumber) {
                    var duplicate = true;
                    pInCart[i].quantity = parseInt(pInCart[i].quantity) + parseInt(pInCartObj.quantity);
                }
            }
            if (!duplicate) {
                pInCart.push(pInCartObj);
            }
            console.log('guest cart', pInCart, pInCartObj);
            this.updateProductsInCartCookie(pInCart);
            callback(null, null);
        }
    }
    
    this.updateCart = function(profileid, productnumbers, quantities, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/update_cart", data:{profileid:profileid, productnumbers:productnumbers, quantities:quantities}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    if (callback) {
                        callback(null, data.cart);
                    }
                })
                .error(function(data, status, headers, config) {
                    internalThis.cartReceived = false;
                    $log.debug('there was an error updating cart', data);
                    if (callback) {
                        callback(data.message);
                    }
                });
        } else {
            var pInCart = [];
            productnumbers.forEach(function (num, index) {
                var pInCartObj = {
                    "productnumber": num,
                    "quantity": quantities[index]
                };
                pInCart.push(pInCartObj);
            });
            this.updateProductsInCartCookie(pInCart);
            if (callback) {
                callback(null, null);
            }
        }
    }

    this.emptyCart = function(profileid, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/empty_cart", data:{profileid:profileid}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart);
                })
                .error(function(data, status, headers, config) {
                    $log.debug('there was an error emptying the cart', data);
                    internalThis.cartReceived = false;
                    callback(data.message);
                });
        } else {
            this.updateProductsInCartCookie();
            callback(null, null);
        }
    }

    this.getProductsInCart = function(profileid, callback) {
        if (profileid) {
            var internalThis = this;
            $http({method: 'GET', url: "/cart/" + profileid})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart.products);
                    $rootScope.$broadcast('cartloaded', internalThis.cart);

                })
                .error(function(data, status, headers, config) {
                    $log.debug('there was an error getting products in user cart', data);
                    internalThis.cartReceived = false;
                    callback(data.message);
                });
        } else {
            callback(null, $cookieStore.get('pInCart') || []);
        }
    }

    this.getOrderByID = function(orderid, callback) {
        if (typeof this.ordersByID[orderid] != 'undefined') {
          callback(null, this.ordersByID[orderid]);
          return;
        }
        var internalThis = this;
        $http({method: 'GET', url: "/order/" + orderid})
            .success(function(data, status, headers, config) {
                internalThis.ordersByID[orderid] = data.order;
                callback(null, data.order);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting order by id', data);
                callback(data.message);
            });
    }

    this.getOrdersByUserID = function(profileid, callback) {
      if (this.ordersReceived) {
        callback(null, this.orders);
        return;
      }
      var internalThis = this;
      $http({method: 'GET', url: "/all_orders/" + profileid})
        .success(function(data, status, headers, config) {
          for (var i = 0; i < data.orders.length; i++) {
            internalThis.ordersByID[data.orders[i].id] = data.orders[i];
          }
          internalThis.orders = data.orders;
          internalThis.ordersReceived = true;
          callback(null, internalThis.orders);
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error getting orders by user', data);
            callback(data.message);
        });
    }

    this.getMerchantOrders = function(merchantid, callback) {
      var internalThis = this;
      $http({method: 'GET', url: "/merchant_orders/" + merchantid})
        .success(function(data, status, headers, config) {
          for (var i = 0; i < data.orders.length; i++) {
            internalThis.ordersByID[data.orders[i].id] = data.orders[i];
          }
          callback(null, data.orders);
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error getting merchant orders', data);
            callback(data.message);
        });
    }

    this.updateOrder = function(order, callback) {
      var internalThis = this;
      $http({method: 'POST', url: "/update_order", data:{order:order}})
        .success(function(data, status, headers, config) {
          internalThis.ordersByID[data.order.id] = data.order;
          if (callback) {
            callback(null, data.order);
          }
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error updating the order', data);
            if (callback) {
                callback(data.message);
            }
        });
    }

    this.getFilteredProducts = function(query, callback) {
        var filteredProducts = [];
        this.products.forEach(function(product, index) {
            if(product.name.toLowerCase().indexOf(query) > -1 
                || product.description.toLowerCase().indexOf(query) > -1
                || product.category.toLowerCase() == query){
              filteredProducts.push(product);
            }
        });
        callback(filteredProducts);
    }

    this.updateProductsInCartCookie = function(productsInCart) {  
        $cookieStore.put('pInCart', productsInCart || []);
    }

    this.submitCheckOrder = function(customer, total, callback) {
      var inThis = this;
      $http({method: 'POST', url: "/add_check_order",
            data:{total:total,customer:customer}})
        .success(function(data, status, headers, config) {
            callback(null, {id: data.order.id});
        })
        .error(function(data, status, headers, config) {
          $log.debug('there was an error submitting the check order', data);
          callback(data.message);
        });
      };

    $rootScope.$on('loggedout', function(evt, args) {
        this.initService;
    });

}]);
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
trdServices.service("testimonialService", ['$rootScope', '$http', '$cookieStore', 'profileService',
    function ($rootScope, $http, $cookieStore, profileService) {

    	this.getAllTestimonials = function(callback) {
    		$http({method: 'GET', url: "/get_all_testimonials"})
            .success(function(data, status, headers, config) {
                callback(true, data.testimonials);
            })
            .error(function(data, status, headers, config) {
                callback(false, data.error);
            });
    	}

}]);
trdServices.service("trainingService", ['$rootScope', '$http', '$cookieStore', 'authService',
    function ($rootScope, $http, $cookieStore, authService) {

    	this.trainingsByProfile = {};

    	this.getAvailableDates = function(callback) {
			$http({method:'GET', url:'/training_dates'}).
				success(function(data, status, headers, config) {
					callback(data);
				}).
				error(function(data, status, headers, config) {
					$log.debug("getting training dates failed:", data);
					callback();
				});
	    }

	    this.getTrainingsByProfileID = function(callback) {
	    	var inThis = this;
	    	$http({method:'GET', url:'/training_dates/' + authService.profileid}).
				success(function(data, status, headers, config) {
    				inThis.trainingsByProfile[authService.profileid] = data.dates;
					callback(null, data.dates);
				}).
				error(function(data, status, headers, config) {
					$log.debug("getting profile training dates failed:", data);
					callback(data.message);
				});
	    }
}]);
/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
!function(a){"use strict";var b=window.angulartics||(window.angulartics={});b.waitForVendorCount=0,b.waitForVendorApi=function(a,c,d,e,f){f||b.waitForVendorCount++,e||(e=d,d=void 0),!Object.prototype.hasOwnProperty.call(window,a)||void 0!==d&&void 0===window[a][d]?setTimeout(function(){b.waitForVendorApi(a,c,d,e,!0)},c):(b.waitForVendorCount--,e(window[a]))},a.module("angulartics",[]).provider("$analytics",function(){var c={pageTracking:{autoTrackFirstPage:!0,autoTrackVirtualPages:!0,trackRelativePath:!1,autoBasePath:!1,basePath:""},eventTracking:{},bufferFlushDelay:1e3,developerMode:!1},d=["pageTrack","eventTrack","setAlias","setUsername","setAlias","setUserProperties","setUserPropertiesOnce","setSuperProperties","setSuperPropertiesOnce"],e={},f={},g=function(a){return function(){b.waitForVendorCount&&(e[a]||(e[a]=[]),e[a].push(arguments))}},h=function(b,c){return f[b]||(f[b]=[]),f[b].push(c),function(){var c=arguments;a.forEach(f[b],function(a){a.apply(this,c)},this)}},i={settings:c},j=function(a,b){b?setTimeout(a,b):a()},k={$get:function(){return i},api:i,settings:c,virtualPageviews:function(a){this.settings.pageTracking.autoTrackVirtualPages=a},firstPageview:function(a){this.settings.pageTracking.autoTrackFirstPage=a},withBase:function(b){this.settings.pageTracking.basePath=b?a.element("base").attr("href").slice(0,-1):""},withAutoBase:function(a){this.settings.pageTracking.autoBasePath=a},developerMode:function(a){this.settings.developerMode=a}},l=function(b,d){i[b]=h(b,d);var f=c[b],g=f?f.bufferFlushDelay:null,k=null!==g?g:c.bufferFlushDelay;a.forEach(e[b],function(a,b){j(function(){d.apply(this,a)},b*k)})},m=function(a){return a.replace(/^./,function(a){return a.toUpperCase()})},n=function(a){var b="register"+m(a);k[b]=function(b){l(a,b)},i[a]=h(a,g(a))};return a.forEach(d,n),k}).run(["$rootScope","$window","$analytics","$injector",function(b,c,d,e){d.settings.pageTracking.autoTrackFirstPage&&e.invoke(["$location",function(a){var b=!0;if(e.has("$route")){var f=e.get("$route");for(var g in f.routes){b=!1;break}}else if(e.has("$state")){var h=e.get("$state");for(var i in h.get()){b=!1;break}}if(b)if(d.settings.pageTracking.autoBasePath&&(d.settings.pageTracking.basePath=c.location.pathname),d.settings.pageTracking.trackRelativePath){var j=d.settings.pageTracking.basePath+a.url();d.pageTrack(j,a)}else d.pageTrack(a.absUrl(),a)}]),d.settings.pageTracking.autoTrackVirtualPages&&e.invoke(["$location",function(a){d.settings.pageTracking.autoBasePath&&(d.settings.pageTracking.basePath=c.location.pathname+"#"),e.has("$route")&&b.$on("$routeChangeSuccess",function(b,c){if(!c||!(c.$$route||c).redirectTo){var e=d.settings.pageTracking.basePath+a.url();d.pageTrack(e,a)}}),e.has("$state")&&b.$on("$stateChangeSuccess",function(){var b=d.settings.pageTracking.basePath+a.url();d.pageTrack(b,a)})}]),d.settings.developerMode&&a.forEach(d,function(a,b){"function"==typeof a&&(d[b]=function(){})})}]).directive("analyticsOn",["$analytics",function(b){function c(a){return["a:","button:","button:button","button:submit","input:button","input:submit"].indexOf(a.tagName.toLowerCase()+":"+(a.type||""))>=0}function d(a){return c(a),"click"}function e(a){return c(a)?a.innerText||a.value:a.id||a.name||a.tagName}function f(a){return"analytics"===a.substr(0,9)&&-1===["On","Event","If","Properties","EventType"].indexOf(a.substr(9))}function g(a){var b=a.slice(9);return"undefined"!=typeof b&&null!==b&&b.length>0?b.substring(0,1).toLowerCase()+b.substring(1):b}return{restrict:"A",link:function(c,h,i){var j=i.analyticsOn||d(h[0]),k={};a.forEach(i.$attr,function(a,b){f(b)&&(k[g(b)]=i[b],i.$observe(b,function(a){k[g(b)]=a}))}),a.element(h[0]).bind(j,function(d){var f=i.analyticsEvent||e(h[0]);k.eventType=d.type,(!i.analyticsIf||c.$eval(i.analyticsIf))&&(i.analyticsProperties&&a.extend(k,c.$eval(i.analyticsProperties)),b.eventTrack(f,k))})}}}])}(angular);
/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
!function(a){"use strict";a.module("angulartics.google.analytics",["angulartics"]).config(["$analyticsProvider",function(b){b.settings.trackRelativePath=!0,b.settings.ga={additionalAccountNames:void 0,userId:null},b.registerPageTrack(function(c){window._gaq&&_gaq.push(["_trackPageview",c]),window.ga&&(b.settings.ga.userId&&ga("set","&uid",b.settings.ga.userId),ga("send","pageview",c),a.forEach(b.settings.ga.additionalAccountNames,function(a){ga(a+".send","pageview",c)}))}),b.registerEventTrack(function(c,d){if(d&&d.category||(d=d||{},d.category="Event"),d.value){var e=parseInt(d.value,10);d.value=isNaN(e)?0:e}if(window.ga){for(var f={eventCategory:d.category,eventAction:c,eventLabel:d.label,eventValue:d.value,nonInteraction:d.noninteraction,page:d.page||window.location.hash.substring(1),userId:b.settings.ga.userId},g=1;20>=g;g++)d["dimension"+g.toString()]&&(f["dimension"+g.toString()]=d["dimension"+g.toString()]),d["metric"+g.toString()]&&(f["metric"+g.toString()]=d["metric"+g.toString()]);ga("send","event",f),a.forEach(b.settings.ga.additionalAccountNames,function(a){ga(a+".send","event",f)})}else window._gaq&&_gaq.push(["_trackEvent",d.category,c,d.label,d.value,d.noninteraction])}),b.registerSetUsername(function(a){b.settings.ga.userId=a})}])}(angular);
/*
 angular-file-upload v1.2.0
 https://github.com/nervgh/angular-file-upload
*/

!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):"object"==typeof exports?exports["angular-file-upload"]=t():e["angular-file-upload"]=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";var r=function(e){return e&&e.__esModule?e["default"]:e},i=r(n(2)),o=r(n(3)),s=r(n(4)),a=r(n(5)),u=r(n(6)),l=r(n(7)),c=r(n(1)),f=r(n(8)),p=r(n(9)),d=r(n(10)),h=r(n(11)),v=r(n(12));angular.module(i.name,[]).value("fileUploaderOptions",o).factory("FileUploader",s).factory("FileLikeObject",a).factory("FileItem",u).factory("FileDirective",l).factory("FileSelect",c).factory("FileDrop",f).factory("FileOver",p).directive("nvFileSelect",d).directive("nvFileDrop",h).directive("nvFileOver",v).run(["FileUploader","FileLikeObject","FileItem","FileDirective","FileSelect","FileDrop","FileOver",function(e,t,n,r,i,o,s){e.FileLikeObject=t,e.FileItem=n,e.FileDirective=r,e.FileSelect=i,e.FileDrop=o,e.FileOver=s}])},function(e,t,n){"use strict";function r(e){var t=function(e){function t(e){u(this,t),this.events={$destroy:"destroy",change:"onChange"},this.prop="select",s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e),this.uploader.isHTML5||this.element.removeAttr("multiple"),this.element.prop("value",null)}return a(t,e),o(t,{getOptions:{value:function(){}},getFilters:{value:function(){}},isEmptyAfterSelection:{value:function(){return!!this.element.attr("multiple")}},onChange:{value:function(){var e=this.uploader.isHTML5?this.element[0].files:this.element[0],t=this.getOptions(),n=this.getFilters();this.uploader.isHTML5||this.destroy(),this.uploader.addToQueue(e,t,n),this.isEmptyAfterSelection()&&this.element.prop("value",null)}}}),t}(e);return t}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function l(e,t,n){var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var i=Object.getPrototypeOf(e);return null===i?void 0:l(i,t,n)}if("value"in r&&r.writable)return r.value;var o=r.get;return void 0===o?void 0:o.call(n)},a=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(e.__proto__=t)},u=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;i(n(2));r.$inject=["FileDirective"]},function(e,t){e.exports={name:"angularFileUpload"}},function(e,t){"use strict";e.exports={url:"/",alias:"file",headers:{},queue:[],progress:0,autoUpload:!1,removeAfterUpload:!1,method:"POST",filters:[],formData:[],queueLimit:Number.MAX_VALUE,withCredentials:!1}},function(e,t,n){"use strict";function r(e,t,n,r,i,v){var m=r.File,_=r.FormData,g=function(){function r(t){s(this,r);var n=a(e);u(this,n,t,{isUploading:!1,_nextIndex:0,_failFilterIndex:-1,_directives:{select:[],drop:[],over:[]}}),this.filters.unshift({name:"queueLimit",fn:this._queueLimitFilter}),this.filters.unshift({name:"folder",fn:this._folderFilter})}return o(r,{addToQueue:{value:function(e,t,n){var r=this.isArrayLikeObject(e)?e:[e],o=this._getFilters(n),s=this.queue.length,a=[];l(r,function(e){var n=new i(e);if(this._isValidFile(n,o,t)){var r=new v(this,e,t);a.push(r),this.queue.push(r),this._onAfterAddingFile(r)}else{var s=o[this._failFilterIndex];this._onWhenAddingFileFailed(n,s,t)}},this),this.queue.length!==s&&(this._onAfterAddingAll(a),this.progress=this._getTotalProgress()),this._render(),this.autoUpload&&this.uploadAll()}},removeFromQueue:{value:function(e){var t=this.getIndexOfItem(e),n=this.queue[t];n.isUploading&&n.cancel(),this.queue.splice(t,1),n._destroy(),this.progress=this._getTotalProgress()}},clearQueue:{value:function(){for(;this.queue.length;)this.queue[0].remove();this.progress=0}},uploadItem:{value:function(e){var t=this.getIndexOfItem(e),n=this.queue[t],r=this.isHTML5?"_xhrTransport":"_iframeTransport";n._prepareToUploading(),this.isUploading||(this.isUploading=!0,this[r](n))}},cancelItem:{value:function(e){var t=this.getIndexOfItem(e),n=this.queue[t],r=this.isHTML5?"_xhr":"_form";n&&n.isUploading&&n[r].abort()}},uploadAll:{value:function(){var e=this.getNotUploadedItems().filter(function(e){return!e.isUploading});e.length&&(l(e,function(e){e._prepareToUploading()}),e[0].upload())}},cancelAll:{value:function(){var e=this.getNotUploadedItems();l(e,function(e){e.cancel()})}},isFile:{value:function(e){return this.constructor.isFile(e)}},isFileLikeObject:{value:function(e){return this.constructor.isFileLikeObject(e)}},isArrayLikeObject:{value:function(e){return this.constructor.isArrayLikeObject(e)}},getIndexOfItem:{value:function(e){return f(e)?e:this.queue.indexOf(e)}},getNotUploadedItems:{value:function(){return this.queue.filter(function(e){return!e.isUploaded})}},getReadyItems:{value:function(){return this.queue.filter(function(e){return e.isReady&&!e.isUploading}).sort(function(e,t){return e.index-t.index})}},destroy:{value:function(){l(this._directives,function(e){l(this._directives[e],function(e){e.destroy()},this)},this)}},onAfterAddingAll:{value:function(e){}},onAfterAddingFile:{value:function(e){}},onWhenAddingFileFailed:{value:function(e,t,n){}},onBeforeUploadItem:{value:function(e){}},onProgressItem:{value:function(e,t){}},onProgressAll:{value:function(e){}},onSuccessItem:{value:function(e,t,n,r){}},onErrorItem:{value:function(e,t,n,r){}},onCancelItem:{value:function(e,t,n,r){}},onCompleteItem:{value:function(e,t,n,r){}},onCompleteAll:{value:function(){}},_getTotalProgress:{value:function(e){if(this.removeAfterUpload)return e||0;var t=this.getNotUploadedItems().length,n=t?this.queue.length-t:this.queue.length,r=100/this.queue.length,i=(e||0)*r/100;return Math.round(n*r+i)}},_getFilters:{value:function(e){if(!e)return this.filters;if(d(e))return e;var t=e.match(/[^\s,]+/g);return this.filters.filter(function(e){return-1!==t.indexOf(e.name)},this)}},_render:{value:function(){t.$$phase||t.$apply()}},_folderFilter:{value:function(e){return!(!e.size&&!e.type)}},_queueLimitFilter:{value:function(){return this.queue.length<this.queueLimit}},_isValidFile:{value:function(e,t,n){return this._failFilterIndex=-1,t.length?t.every(function(t){return this._failFilterIndex++,t.fn.call(this,e,n)},this):!0}},_isSuccessCode:{value:function(e){return e>=200&&300>e||304===e}},_transformResponse:{value:function(e,t){var r=this._headersGetter(t);return l(n.defaults.transformResponse,function(t){e=t(e,r)}),e}},_parseHeaders:{value:function(e){var t,n,r,i={};return e?(l(e.split("\n"),function(e){r=e.indexOf(":"),t=e.slice(0,r).trim().toLowerCase(),n=e.slice(r+1).trim(),t&&(i[t]=i[t]?i[t]+", "+n:n)}),i):i}},_headersGetter:{value:function(e){return function(t){return t?e[t.toLowerCase()]||null:e}}},_xhrTransport:{value:function(e){var t=e._xhr=new XMLHttpRequest,n=new _,r=this;if(r._onBeforeUploadItem(e),l(e.formData,function(e){l(e,function(e,t){n.append(t,e)})}),"number"!=typeof e._file.size)throw new TypeError("The file specified is no longer valid");n.append(e.alias,e._file,e.file.name),t.upload.onprogress=function(t){var n=Math.round(t.lengthComputable?100*t.loaded/t.total:0);r._onProgressItem(e,n)},t.onload=function(){var n=r._parseHeaders(t.getAllResponseHeaders()),i=r._transformResponse(t.response,n),o=r._isSuccessCode(t.status)?"Success":"Error",s="_on"+o+"Item";r[s](e,i,t.status,n),r._onCompleteItem(e,i,t.status,n)},t.onerror=function(){var n=r._parseHeaders(t.getAllResponseHeaders()),i=r._transformResponse(t.response,n);r._onErrorItem(e,i,t.status,n),r._onCompleteItem(e,i,t.status,n)},t.onabort=function(){var n=r._parseHeaders(t.getAllResponseHeaders()),i=r._transformResponse(t.response,n);r._onCancelItem(e,i,t.status,n),r._onCompleteItem(e,i,t.status,n)},t.open(e.method,e.url,!0),t.withCredentials=e.withCredentials,l(e.headers,function(e,n){t.setRequestHeader(n,e)}),t.send(n),this._render()}},_iframeTransport:{value:function(e){var t=h('<form style="display: none;" />'),n=h('<iframe name="iframeTransport'+Date.now()+'">'),r=e._input,i=this;e._form&&e._form.replaceWith(r),e._form=t,i._onBeforeUploadItem(e),r.prop("name",e.alias),l(e.formData,function(e){l(e,function(e,n){var r=r('<input type="hidden" name="'+n+'" />');r.val(e),t.append(r)})}),t.prop({action:e.url,method:"POST",target:n.prop("name"),enctype:"multipart/form-data",encoding:"multipart/form-data"}),n.bind("load",function(){var t="",r=200;try{t=n[0].contentDocument.body.innerHTML}catch(o){r=500}var s={response:t,status:r,dummy:!0},a={},u=i._transformResponse(s.response,a);i._onSuccessItem(e,u,s.status,a),i._onCompleteItem(e,u,s.status,a)}),t.abort=function(){var o,s={status:0,dummy:!0},a={};n.unbind("load").prop("src","javascript:false;"),t.replaceWith(r),i._onCancelItem(e,o,s.status,a),i._onCompleteItem(e,o,s.status,a)},r.after(t),t.append(r).append(n),t[0].submit(),this._render()}},_onWhenAddingFileFailed:{value:function(e,t,n){this.onWhenAddingFileFailed(e,t,n)}},_onAfterAddingFile:{value:function(e){this.onAfterAddingFile(e)}},_onAfterAddingAll:{value:function(e){this.onAfterAddingAll(e)}},_onBeforeUploadItem:{value:function(e){e._onBeforeUpload(),this.onBeforeUploadItem(e)}},_onProgressItem:{value:function(e,t){var n=this._getTotalProgress(t);this.progress=n,e._onProgress(t),this.onProgressItem(e,t),this.onProgressAll(n),this._render()}},_onSuccessItem:{value:function(e,t,n,r){e._onSuccess(t,n,r),this.onSuccessItem(e,t,n,r)}},_onErrorItem:{value:function(e,t,n,r){e._onError(t,n,r),this.onErrorItem(e,t,n,r)}},_onCancelItem:{value:function(e,t,n,r){e._onCancel(t,n,r),this.onCancelItem(e,t,n,r)}},_onCompleteItem:{value:function(e,t,n,r){e._onComplete(t,n,r),this.onCompleteItem(e,t,n,r);var i=this.getReadyItems()[0];return this.isUploading=!1,p(i)?void i.upload():(this.onCompleteAll(),this.progress=this._getTotalProgress(),void this._render())}}},{isFile:{value:function(e){return m&&e instanceof m}},isFileLikeObject:{value:function(e){return e instanceof this.constructor.FileLikeObject}},isArrayLikeObject:{value:function(e){return c(e)&&"length"in e}},inherit:{value:function(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.super_=t}}}),r}();return g.prototype.isHTML5=!(!m||!_),g.isHTML5=g.prototype.isHTML5,g}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;var a=(i(n(2)),angular.copy),u=angular.extend,l=angular.forEach,c=angular.isObject,f=angular.isNumber,p=angular.isDefined,d=angular.isArray,h=angular.element;r.$inject=["fileUploaderOptions","$rootScope","$http","$window","FileLikeObject","FileItem"]},function(e,t,n){"use strict";function r(){var e=function(){function e(t){s(this,e);var n=u(t),r=n?t.value:t,i=l(r)?"FakePath":"Object",o="_createFrom"+i;this[o](r)}return o(e,{_createFromFakePath:{value:function(e){this.lastModifiedDate=null,this.size=null,this.type="like/"+e.slice(e.lastIndexOf(".")+1).toLowerCase(),this.name=e.slice(e.lastIndexOf("/")+e.lastIndexOf("\\")+2)}},_createFromObject:{value:function(e){this.lastModifiedDate=a(e.lastModifiedDate),this.size=e.size,this.type=e.type,this.name=e.name}}}),e}();return e}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;var a=(i(n(2)),angular.copy),u=angular.isElement,l=angular.isString;r.$inject=[]},function(e,t,n){"use strict";function r(e,t){var n=function(){function n(e,r,i){s(this,n);var o=c(r),f=o?l(r):null,p=o?null:r;u(this,{url:e.url,alias:e.alias,headers:a(e.headers),formData:a(e.formData),removeAfterUpload:e.removeAfterUpload,withCredentials:e.withCredentials,method:e.method},i,{uploader:e,file:new t(r),isReady:!1,isUploading:!1,isUploaded:!1,isSuccess:!1,isCancel:!1,isError:!1,progress:0,index:null,_file:p,_input:f}),f&&this._replaceNode(f)}return o(n,{upload:{value:function(){try{this.uploader.uploadItem(this)}catch(e){this.uploader._onCompleteItem(this,"",0,[]),this.uploader._onErrorItem(this,"",0,[])}}},cancel:{value:function(){this.uploader.cancelItem(this)}},remove:{value:function(){this.uploader.removeFromQueue(this)}},onBeforeUpload:{value:function(){}},onProgress:{value:function(e){}},onSuccess:{value:function(e,t,n){}},onError:{value:function(e,t,n){}},onCancel:{value:function(e,t,n){}},onComplete:{value:function(e,t,n){}},_onBeforeUpload:{value:function(){this.isReady=!0,this.isUploading=!0,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!1,this.progress=0,this.onBeforeUpload()}},_onProgress:{value:function(e){this.progress=e,this.onProgress(e)}},_onSuccess:{value:function(e,t,n){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!0,this.isCancel=!1,this.isError=!1,this.progress=100,this.index=null,this.onSuccess(e,t,n)}},_onError:{value:function(e,t,n){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onError(e,t,n)}},_onCancel:{value:function(e,t,n){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!0,this.isError=!1,this.progress=0,this.index=null,this.onCancel(e,t,n)}},_onComplete:{value:function(e,t,n){this.onComplete(e,t,n),this.removeAfterUpload&&this.remove()}},_destroy:{value:function(){this._input&&this._input.remove(),this._form&&this._form.remove(),delete this._form,delete this._input}},_prepareToUploading:{value:function(){this.index=this.index||++this.uploader._nextIndex,this.isReady=!0}},_replaceNode:{value:function(t){var n=e(t.clone())(t.scope());n.prop("value",null),t.css("display","none"),t.after(n)}}}),n}();return n}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;var a=(i(n(2)),angular.copy),u=angular.extend,l=angular.element,c=angular.isElement;r.$inject=["$compile","FileLikeObject"]},function(e,t,n){"use strict";function r(){var e=function(){function e(t){s(this,e),a(this,t),this.uploader._directives[this.prop].push(this),this._saveLinks(),this.bind()}return o(e,{bind:{value:function(){for(var e in this.events){var t=this.events[e];this.element.bind(e,this[t])}}},unbind:{value:function(){for(var e in this.events)this.element.unbind(e,this.events[e])}},destroy:{value:function(){var e=this.uploader._directives[this.prop].indexOf(this);this.uploader._directives[this.prop].splice(e,1),this.unbind()}},_saveLinks:{value:function(){for(var e in this.events){var t=this.events[e];this[t]=this[t].bind(this)}}}}),e}();return e.prototype.events={},e}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;var a=(i(n(2)),angular.extend);r.$inject=[]},function(e,t,n){"use strict";function r(e){var t=function(e){function t(e){u(this,t),this.events={$destroy:"destroy",drop:"onDrop",dragover:"onDragOver",dragleave:"onDragLeave"},this.prop="drop",s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e)}return a(t,e),o(t,{getOptions:{value:function(){}},getFilters:{value:function(){}},onDrop:{value:function(e){var t=this._getTransfer(e);if(t){var n=this.getOptions(),r=this.getFilters();this._preventAndStop(e),l(this.uploader._directives.over,this._removeOverClass,this),this.uploader.addToQueue(t.files,n,r)}}},onDragOver:{value:function(e){var t=this._getTransfer(e);this._haveFiles(t.types)&&(t.dropEffect="copy",this._preventAndStop(e),l(this.uploader._directives.over,this._addOverClass,this))}},onDragLeave:{value:function(e){e.currentTarget!==this.element[0]&&(this._preventAndStop(e),l(this.uploader._directives.over,this._removeOverClass,this))}},_getTransfer:{value:function(e){return e.dataTransfer?e.dataTransfer:e.originalEvent.dataTransfer}},_preventAndStop:{value:function(e){e.preventDefault(),e.stopPropagation()}},_haveFiles:{value:function(e){return e?e.indexOf?-1!==e.indexOf("Files"):e.contains?e.contains("Files"):!1:!1}},_addOverClass:{value:function(e){e.addOverClass()}},_removeOverClass:{value:function(e){e.removeOverClass()}}}),t}(e);return t}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function c(e,t,n){var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var i=Object.getPrototypeOf(e);return null===i?void 0:c(i,t,n)}if("value"in r&&r.writable)return r.value;var o=r.get;return void 0===o?void 0:o.call(n)},a=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(e.__proto__=t)},u=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;var l=(i(n(2)),angular.forEach);r.$inject=["FileDirective"]},function(e,t,n){"use strict";function r(e){var t=function(e){function t(e){u(this,t),this.events={$destroy:"destroy"},this.prop="over",this.overClass="nv-file-over",s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e)}return a(t,e),o(t,{addOverClass:{value:function(){this.element.addClass(this.getOverClass())}},removeOverClass:{value:function(){this.element.removeClass(this.getOverClass())}},getOverClass:{value:function(){return this.overClass}}}),t}(e);return t}var i=function(e){return e&&e.__esModule?e["default"]:e},o=function(){function e(e,t){for(var n in t){var r=t[n];r.configurable=!0,r.value&&(r.writable=!0)}Object.defineProperties(e,t)}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function l(e,t,n){var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var i=Object.getPrototypeOf(e);return null===i?void 0:l(i,t,n)}if("value"in r&&r.writable)return r.value;var o=r.get;return void 0===o?void 0:o.call(n)},a=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(e.__proto__=t)},u=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};e.exports=r;i(n(2));r.$inject=["FileDirective"]},function(e,t,n){"use strict";function r(e,t,n){return{link:function(r,i,o){var s=r.$eval(o.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');var a=new n({uploader:s,element:i});a.getOptions=e(o.options).bind(a,r),a.getFilters=function(){return o.filters}}}}var i=function(e){return e&&e.__esModule?e["default"]:e};e.exports=r;i(n(2));r.$inject=["$parse","FileUploader","FileSelect"]},function(e,t,n){"use strict";function r(e,t,n){return{link:function(r,i,o){var s=r.$eval(o.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');if(s.isHTML5){var a=new n({uploader:s,element:i});a.getOptions=e(o.options).bind(a,r),a.getFilters=function(){return o.filters}}}}}var i=function(e){return e&&e.__esModule?e["default"]:e};e.exports=r;i(n(2));r.$inject=["$parse","FileUploader","FileDrop"]},function(e,t,n){"use strict";function r(e,t){return{link:function(n,r,i){var o=n.$eval(i.uploader);if(!(o instanceof e))throw new TypeError('"Uploader" must be an instance of FileUploader');var s=new t({uploader:o,element:r});s.getOverClass=function(){return i.overClass||this.overClass}}}}var i=function(e){return e&&e.__esModule?e["default"]:e};e.exports=r;i(n(2));r.$inject=["FileUploader","FileOver"]}])});
//# sourceMappingURL=angular-file-upload.min.js.map
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2014, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($, window, document, undefined) {
  'use strict';

  var header_helpers = function (class_array) {
    var i = class_array.length;
    var head = $('head');

    while (i--) {
      if(head.has('.' + class_array[i]).length === 0) {
        head.append('<meta class="' + class_array[i] + '" />');
      }
    }
  };

  header_helpers([
    'foundation-mq-small',
    'foundation-mq-medium',
    'foundation-mq-large',
    'foundation-mq-xlarge',
    'foundation-mq-xxlarge',
    'foundation-data-attribute-namespace']);

  // Enable FastClick if present

  $(function() {
    if (typeof FastClick !== 'undefined') {
      // Don't attach to body if undefined
      if (typeof document.body !== 'undefined') {
        FastClick.attach(document.body);
      }
    }
  });

  // private Fast Selector wrapper,
  // returns jQuery object. Only use where
  // getElementById is not available.
  var S = function (selector, context) {
    if (typeof selector === 'string') {
      if (context) {
        var cont;
        if (context.jquery) {
          cont = context[0];
          if (!cont) return context;
        } else {
          cont = context;
        }
        return $(cont.querySelectorAll(selector));
      }

      return $(document.querySelectorAll(selector));
    }

    return $(selector, context);
  };

  // Namespace functions.

  var attr_name = function (init) {
    var arr = [];
    if (!init) arr.push('data');
    if (this.namespace.length > 0) arr.push(this.namespace);
    arr.push(this.name);

    return arr.join('-');
  };

  var add_namespace = function (str) {
    var parts = str.split('-'),
        i = parts.length,
        arr = [];

    while (i--) {
      if (i !== 0) {
        arr.push(parts[i]);
      } else {
        if (this.namespace.length > 0) {
          arr.push(this.namespace, parts[i]);
        } else {
          arr.push(parts[i]);
        }
      }
    }

    return arr.reverse().join('-');
  };

  // Event binding and data-options updating.

  var bindings = function (method, options) {
    var self = this,
        should_bind_events = !S(this).data(this.attr_name(true));

    if (typeof method === 'string') {
      return this[method].call(this, options);
    }

    if (S(this.scope).is('[' + this.attr_name() +']')) {
      S(this.scope).data(this.attr_name(true) + '-init', $.extend({}, this.settings, (options || method), this.data_options(S(this.scope))));

      if (should_bind_events) {
        this.events(this.scope);
      }

    } else {
      S('[' + this.attr_name() +']', this.scope).each(function () {
        var should_bind_events = !S(this).data(self.attr_name(true) + '-init');
        S(this).data(self.attr_name(true) + '-init', $.extend({}, self.settings, (options || method), self.data_options(S(this))));

        if (should_bind_events) {
          self.events(this);
        }
      });
    }
  };

  var single_image_loaded = function (image, callback) {
    function loaded () {
      callback(image[0]);
    }

    function bindLoad () {
      this.one('load', loaded);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr( 'src' ),
            param = src.match( /\?/ ) ? '&' : '?';

        param += 'random=' + (new Date()).getTime();
        this.attr('src', src + param);
      }
    }

    if (!image.attr('src')) {
      loaded();
      return;
    }

    if (image[0].complete || image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call(image);
    }
  };

  /*
    https://github.com/paulirish/matchMedia.js
  */

  window.matchMedia = window.matchMedia || (function( doc ) {

    "use strict";

    var bool,
        docElem = doc.documentElement,
        refNode = docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
        fakeBody = doc.createElement( "body" ),
        div = doc.createElement( "div" );

    div.id = "mq-test-1";
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);

    return function (q) {

      div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

      docElem.insertBefore( fakeBody, refNode );
      bool = div.offsetWidth === 42;
      docElem.removeChild( fakeBody );

      return {
        matches: bool,
        media: q
      };

    };

  }( document ));

  /*
   * jquery.requestAnimationFrame
   * https://github.com/gnarf37/jquery-requestAnimationFrame
   * Requires jQuery 1.8+
   *
   * Copyright (c) 2012 Corey Frang
   * Licensed under the MIT license.
   */

  (function($) {

  // requestAnimationFrame polyfill adapted from Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  var animating,
      lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

  for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + "RequestAnimationFrame" ];
    cancelAnimationFrame = cancelAnimationFrame ||
      window[ vendors[lastTime] + "CancelAnimationFrame" ] ||
      window[ vendors[lastTime] + "CancelRequestAnimationFrame" ];
  }

  function raf() {
    if (animating) {
      requestAnimationFrame(raf);

      if (jqueryFxAvailable) {
        jQuery.fx.tick();
      }
    }
  }

  if (requestAnimationFrame) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;

    if (jqueryFxAvailable) {
      jQuery.fx.timer = function (timer) {
        if (timer() && jQuery.timers.push(timer) && !animating) {
          animating = true;
          raf();
        }
      };

      jQuery.fx.stop = function () {
        animating = false;
      };
    }
  } else {
    // polyfill
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  }

  }( jQuery ));


  function removeQuotes (string) {
    if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
    }

    return string;
  }

  window.Foundation = {
    name : 'Foundation',

    version : '5.2.3',

    media_queries : {
      small : S('.foundation-mq-small').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      medium : S('.foundation-mq-medium').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      large : S('.foundation-mq-large').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      xlarge: S('.foundation-mq-xlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      xxlarge: S('.foundation-mq-xxlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
    },

    stylesheet : $('<style></style>').appendTo('head')[0].sheet,

    global: {
      namespace: undefined
    },

    init : function (scope, libraries, method, options, response) {
      var args = [scope, method, options, response],
          responses = [];

      // check RTL
      this.rtl = /rtl/i.test(S('html').attr('dir'));

      // set foundation global scope
      this.scope = scope || this.scope;

      this.set_namespace();

      if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
        if (this.libs.hasOwnProperty(libraries)) {
          responses.push(this.init_lib(libraries, args));
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, libraries));
        }
      }

      return scope;
    },

    init_lib : function (lib, args) {
      if (this.libs.hasOwnProperty(lib)) {
        this.patch(this.libs[lib]);

        if (args && args.hasOwnProperty(lib)) {
            if (typeof this.libs[lib].settings !== 'undefined') {
                $.extend(true, this.libs[lib].settings, args[lib]);
            }
            else if (typeof this.libs[lib].defaults !== 'undefined') {
                $.extend(true, this.libs[lib].defaults, args[lib]);
            }
          return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
        }

        args = args instanceof Array ? args : new Array(args);    // PATCH: added this line
        return this.libs[lib].init.apply(this.libs[lib], args);
      }

      return function () {};
    },

    patch : function (lib) {
      lib.scope = this.scope;
      lib.namespace = this.global.namespace;
      lib.rtl = this.rtl;
      lib['data_options'] = this.utils.data_options;
      lib['attr_name'] = attr_name;
      lib['add_namespace'] = add_namespace;
      lib['bindings'] = bindings;
      lib['S'] = this.utils.S;
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' '),
          i = methods_arr.length;

      while (i--) {
        if (this.utils.hasOwnProperty(methods_arr[i])) {
          scope[methods_arr[i]] = this.utils[methods_arr[i]];
        }
      }
    },

    set_namespace: function () {

      // Description:
      //    Don't bother reading the namespace out of the meta tag
      //    if the namespace has been set globally in javascript
      //
      // Example:
      //    Foundation.global.namespace = 'my-namespace';
      // or make it an empty string:
      //    Foundation.global.namespace = '';
      //
      //

      // If the namespace has not been set (is undefined), try to read it out of the meta element.
      // Otherwise use the globally defined namespace, even if it's empty ('')
      var namespace = ( this.global.namespace === undefined ) ? $('.foundation-data-attribute-namespace').css('font-family') : this.global.namespace;

      // Finally, if the namsepace is either undefined or false, set it to an empty string.
      // Otherwise use the namespace value.
      this.global.namespace = ( namespace === undefined || /false/i.test(namespace) ) ? '' : namespace;
    },

    libs : {},

    // methods that can be inherited in libraries
    utils : {

      // Description:
      //    Fast Selector wrapper returns jQuery object. Only use where getElementById
      //    is not available.
      //
      // Arguments:
      //    Selector (String): CSS selector describing the element(s) to be
      //    returned as a jQuery object.
      //
      //    Scope (String): CSS selector describing the area to be searched. Default
      //    is document.
      //
      // Returns:
      //    Element (jQuery Object): jQuery object containing elements matching the
      //    selector within the scope.
      S : S,

      // Description:
      //    Executes a function a max of once every n milliseconds
      //
      // Arguments:
      //    Func (Function): Function to be throttled.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      // Returns:
      //    Lazy_function (Function): Function with throttling applied.
      throttle : function (func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      },

      // Description:
      //    Executes a function when it stops being invoked for n seconds
      //    Modified version of _.debounce() http://underscorejs.org
      //
      // Arguments:
      //    Func (Function): Function to be debounced.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      //    Immediate (Bool): Whether the function should be called at the beginning
      //    of the delay instead of the end. Default is false.
      //
      // Returns:
      //    Lazy_function (Function): Function with debouncing applied.
      debounce : function (func, delay, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, delay);
          if (callNow) result = func.apply(context, args);
          return result;
        };
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
            data_options = function (el) {
              var namespace = Foundation.global.namespace;

              if (namespace.length > 0) {
                return el.data(namespace + '-' + data_attr_name);
              }

              return el.data(data_attr_name);
            };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return ! isNaN (o-0) && o !== null && o !== "" && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') return $.trim(str);
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) p[1] = true;
          if (/false/i.test(p[1])) p[1] = false;
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      // Description:
      //    Adds JS-recognizable media queries
      //
      // Arguments:
      //    Media (String): Key string for the media query to be stored as in
      //    Foundation.media_queries
      //
      //    Class (String): Class name for the generated <meta> tag
      register_media : function (media, media_class) {
        if(Foundation.media_queries[media] === undefined) {
          $('head').append('<meta class="' + media_class + '">');
          Foundation.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
        }
      },

      // Description:
      //    Add custom CSS within a JS-defined media query
      //
      // Arguments:
      //    Rule (String): CSS rule to be appended to the document.
      //
      //    Media (String): Optional media query string for the CSS rule to be
      //    nested under.
      add_custom_rule : function (rule, media) {
        if (media === undefined && Foundation.stylesheet) {
          Foundation.stylesheet.insertRule(rule, Foundation.stylesheet.cssRules.length);
        } else {
          var query = Foundation.media_queries[media];

          if (query !== undefined) {
            Foundation.stylesheet.insertRule('@media ' +
              Foundation.media_queries[media] + '{ ' + rule + ' }');
          }
        }
      },

      // Description:
      //    Performs a callback function when an image is fully loaded
      //
      // Arguments:
      //    Image (jQuery Object): Image(s) to check if loaded.
      //
      //    Callback (Function): Function to execute when image is fully loaded.
      image_loaded : function (images, callback) {
        var self = this,
            unloaded = images.length;

        if (unloaded === 0) {
          callback(images);
        }

        images.each(function () {
          single_image_loaded(self.S(this), function () {
            unloaded -= 1;
            if (unloaded === 0) {
              callback(images);
            }
          });
        });
      },

      // Description:
      //    Returns a random, alphanumeric string
      //
      // Arguments:
      //    Length (Integer): Length of string to be generated. Defaults to random
      //    integer.
      //
      // Returns:
      //    Rand (String): Pseudo-random, alphanumeric string.
      random_str : function () {
        if (!this.fidx) this.fidx = 0;
        this.prefix = this.prefix || [(this.name || 'F'), (+new Date).toString(36)].join('-');

        return this.prefix + (this.fidx++).toString(36);
      }
    }
  };

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.abide = {
    name : 'abide',

    version : '5.2.3',

    settings : {
      live_validate : true,
      focus_on_invalid : true,
      error_labels: true, // labels with a for="inputId" will recieve an `error` class
      timeout : 1000,
      patterns : {
        alpha: /^[a-zA-Z]+$/,
        alpha_numeric : /^[a-zA-Z0-9]+$/,
        integer: /^[-+]?\d+$/,
        number: /^[-+]?\d*(?:\.\d+)?$/,

        // amex, visa, diners
        card : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
        cvv : /^([0-9]){3,4}$/,

        // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
        email : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

        url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
        // abc.de
        domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,

        datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
        // YYYY-MM-DD
        date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
        // HH:MM:SS
        time : /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
        dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
        // MM/DD/YYYY
        month_day_year : /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,

        // #FFF or #FFFFFF
        color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
      },
      validators : {
        equalTo: function(el, required, parent) {
          var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
              to    = el.value,
              valid = (from === to);

          return valid;
        }
      }
    },

    timer : null,

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          form = self.S(scope).attr('novalidate', 'novalidate'),
          settings = form.data(this.attr_name(true) + '-init') || {};

      this.invalid_attr = this.add_namespace('data-invalid');

      form
        .off('.abide')
        .on('submit.fndtn.abide validate.fndtn.abide', function (e) {
          var is_ajax = /ajax/i.test(self.S(this).attr(self.attr_name()));
          return self.validate(self.S(this).find('input, textarea, select').get(), e, is_ajax);
        })
        .on('reset', function() {
          return self.reset($(this));
        })
        .find('input, textarea, select')
          .off('.abide')
          .on('blur.fndtn.abide change.fndtn.abide', function (e) {
            self.validate([this], e);
          })
          .on('keydown.fndtn.abide', function (e) {
            if (settings.live_validate === true) {
              clearTimeout(self.timer);
              self.timer = setTimeout(function () {
                self.validate([this], e);
              }.bind(this), settings.timeout);
            }
          });
    },

    reset : function (form) {
      form.removeAttr(this.invalid_attr);
      $(this.invalid_attr, form).removeAttr(this.invalid_attr);
      $('.error', form).not('small').removeClass('error');
    },

    validate : function (els, e, is_ajax) {
      var validations = this.parse_patterns(els),
          validation_count = validations.length,
          form = this.S(els[0]).closest('[data-' + this.attr_name(true) + ']'),
          settings = form.data(this.attr_name(true) + '-init') || {},
          submit_event = /submit/.test(e.type);

      form.trigger('validated');
      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < validation_count; i++) {
        if (!validations[i] && (submit_event || is_ajax)) {
          if (settings.focus_on_invalid) els[i].focus();
          form.trigger('invalid');
          this.S(els[i]).closest('[data-' + this.attr_name(true) + ']').attr(this.invalid_attr, '');
          return false;
        }
      }

      if (submit_event || is_ajax) {
        form.trigger('valid');
      }

      form.removeAttr(this.invalid_attr);

      if (is_ajax) return false;

      return true;
    },

    parse_patterns : function (els) {
      var i = els.length,
          el_patterns = [];

      while (i--) {
        el_patterns.push(this.pattern(els[i]));
      }

      return this.check_validation_and_apply_styles(el_patterns);
    },

    pattern : function (el) {
      var type = el.getAttribute('type'),
          required = typeof el.getAttribute('required') === 'string';

      var pattern = el.getAttribute('pattern') || '';

      if (this.settings.patterns.hasOwnProperty(pattern) && pattern.length > 0) {
        return [el, this.settings.patterns[pattern], required];
      } else if (pattern.length > 0) {
        return [el, new RegExp('^'+pattern+'$'), required];
      }

      if (this.settings.patterns.hasOwnProperty(type)) {
        return [el, this.settings.patterns[type], required];
      }

      pattern = /.*/;

      return [el, pattern, required];
    },

    check_validation_and_apply_styles : function (el_patterns) {
      var i = el_patterns.length,
          validations = [],
          form = this.S(el_patterns[0][0]).closest('[data-' + this.attr_name(true) + ']'),
          settings = form.data(this.attr_name(true) + '-init') || {};

      while (i--) {
        var el = el_patterns[i][0],
            required = el_patterns[i][2],
            value = el.value.trim(),
            direct_parent = this.S(el).parent(),
            validator = el.getAttribute(this.add_namespace('data-abide-validator')),
            is_radio = el.type === "radio",
            is_checkbox = el.type === "checkbox",
            label = this.S('label[for="' + el.getAttribute('id') + '"]'),
            valid_length = (required) ? (el.value.length > 0) : true;

        var parent, valid;

        // support old way to do equalTo validations
        if(el.getAttribute(this.add_namespace('data-equalto'))) { validator = "equalTo" }

        if (!direct_parent.is('label')) {
          parent = direct_parent;
        } else {
          parent = direct_parent.parent();
        }

        if (is_radio && required) {
          validations.push(this.valid_radio(el, required));
        } else if (is_checkbox && required) {
          validations.push(this.valid_checkbox(el, required));
        } else if (validator) {
          valid = this.settings.validators[validator].apply(this, [el, required, parent])
          validations.push(valid);

          if (valid) {
            this.S(el).removeAttr(this.invalid_attr);
            parent.removeClass('error');
          } else {
            this.S(el).attr(this.invalid_attr, '');
            parent.addClass('error');
          }

        } else {

          if (el_patterns[i][1].test(value) && valid_length ||
            !required && el.value.length < 1 || $(el).attr('disabled')) {
            this.S(el).removeAttr(this.invalid_attr);
            parent.removeClass('error');
            if (label.length > 0 && settings.error_labels) label.removeClass('error');

            validations.push(true);
            $(el).triggerHandler('valid');
          } else {
            this.S(el).attr(this.invalid_attr, '');
            parent.addClass('error');
            if (label.length > 0 && settings.error_labels) label.addClass('error');

            validations.push(false);
            $(el).triggerHandler('invalid');
          }
        }
      }

      return validations;
    },

    valid_checkbox : function(el, required) {
      var el = this.S(el),
          valid = (el.is(':checked') || !required);

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass('error');
      } else {
        el.attr(this.invalid_attr, '').parent().addClass('error');
      }

      return valid;
    },

    valid_radio : function (el, required) {
      var name = el.getAttribute('name'),
          group = this.S(el).closest('[data-' + this.attr_name(true) + ']').find("[name='"+name+"']"),
          count = group.length,
          valid = false;

      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < count; i++) {
        if (group[i].checked) valid = true;
      }

      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < count; i++) {
        if (valid) {
          this.S(group[i]).removeAttr(this.invalid_attr).parent().removeClass('error');
        } else {
          this.S(group[i]).attr(this.invalid_attr, '').parent().addClass('error');
        }
      }

      return valid;
    },

    valid_equal: function(el, required, parent) {
      var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
          to    = el.value,
          valid = (from === to);

      if (valid) {
        this.S(el).removeAttr(this.invalid_attr);
        parent.removeClass('error');
      } else {
        this.S(el).attr(this.invalid_attr, '');
        parent.addClass('error');
      }

      return valid;
    },

    valid_oneof: function(el, required, parent, doNotValidateOthers) {
      var el = this.S(el),
        others = this.S('[' + this.add_namespace('data-oneof') + ']'),
        valid = others.filter(':checked').length > 0;

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass('error');
      } else {
        el.attr(this.invalid_attr, '').parent().addClass('error');
      }

      if (!doNotValidateOthers) {
        var _this = this;
        others.each(function() {
          _this.valid_oneof.call(_this, this, null, null, true);
        });
      }

      return valid;
    }
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.accordion = {
    name : 'accordion',

    version : '5.2.3',

    settings : {
      active_class: 'active',
      multi_expand: false,
      toggleable: true,
      callback : function () {}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this;
      var S = this.S;
      S(this.scope)
      .off('.fndtn.accordion')
      .on('click.fndtn.accordion', '[' + this.attr_name() + '] > dd > a', function (e) {
        var accordion = S(this).closest('[' + self.attr_name() + ']'),
            target = S('#' + this.href.split('#')[1]),
            siblings = S('dd > .content', accordion),
            aunts = $('dd', accordion),
            groupSelector = self.attr_name() + '=' + accordion.attr(self.attr_name()),
            settings = accordion.data(self.attr_name(true) + '-init'),
            active_content = S('dd > .content.' + settings.active_class, accordion);
        e.preventDefault();

        if (accordion.attr(self.attr_name())) {
          siblings = siblings.add('[' + groupSelector + '] dd > .content');
          aunts = aunts.add('[' + groupSelector + '] dd');
        }

        if (settings.toggleable && target.is(active_content)) {
          target.parent('dd').toggleClass(settings.active_class, false);
          return target.toggleClass(settings.active_class, false);
        }

        if (!settings.multi_expand) {
          siblings.removeClass(settings.active_class);
          aunts.removeClass(settings.active_class);
        }

        target.addClass(settings.active_class).parent().addClass(settings.active_class);
        settings.callback(target);
      });
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.alert = {
    name : 'alert',

    version : '5.2.3',

    settings : {
      callback: function (){}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = this.S;

      $(this.scope).off('.alert').on('click.fndtn.alert', '[' + this.attr_name() + '] a.close', function (e) {
          var alertBox = S(this).closest('[' + self.attr_name() + ']'),
              settings = alertBox.data(self.attr_name(true) + '-init') || self.settings;

        e.preventDefault();
        if ('transitionend' in window || 'webkitTransitionEnd' in window || 'oTransitionEnd' in window) {
          alertBox.addClass("alert-close");
          alertBox.on('transitionend webkitTransitionEnd oTransitionEnd', function(e) {
            S(this).trigger('close').remove();
            settings.callback();
          });
        } else {
          alertBox.fadeOut(300, function () {
            S(this).trigger('close').remove();
            settings.callback();
          });
        }
      });
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.clearing = {
    name : 'clearing',

    version: '5.2.3',

    settings : {
      templates : {
        viewing : '<a href="#" class="clearing-close">&times;</a>' +
          '<div class="visible-img" style="display: none"><div class="clearing-touch-label"></div><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />' +
          '<p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a>' +
          '<a href="#" class="clearing-main-next"><span></span></a></div>'
      },

      // comma delimited list of selectors that, on click, will close clearing,
      // add 'div.clearing-blackout, div.visible-img' to close on background click
      close_selectors : '.clearing-close',

      touch_label : '',

      // event initializers and locks
      init : false,
      locked : false
    },

    init : function (scope, method, options) {
      var self = this;
      Foundation.inherit(this, 'throttle image_loaded');

      this.bindings(method, options);

      if (self.S(this.scope).is('[' + this.attr_name() + ']')) {
        this.assemble(self.S('li', this.scope));
      } else {
        self.S('[' + this.attr_name() + ']', this.scope).each(function () {
          self.assemble(self.S('li', this));
        });
      }
    },

    events : function (scope) {
      var self = this,
          S = self.S,
          $scroll_container = $('.scroll-container');

      if ($scroll_container.length > 0) {
        this.scope = $scroll_container;
      }

      S(this.scope)
        .off('.clearing')
        .on('click.fndtn.clearing', 'ul[' + this.attr_name() + '] li',
          function (e, current, target) {
            var current = current || S(this),
                target = target || current,
                next = current.next('li'),
                settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init'),
                image = S(e.target);

            e.preventDefault();

            if (!settings) {
              self.init();
              settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
            }

            // if clearing is open and the current image is
            // clicked, go to the next image in sequence
            if (target.hasClass('visible') &&
              current[0] === target[0] &&
              next.length > 0 && self.is_open(current)) {
              target = next;
              image = S('img', target);
            }

            // set current and target to the clicked li if not otherwise defined.
            self.open(image, current, target);
            self.update_paddles(target);
          })

        .on('click.fndtn.clearing', '.clearing-main-next',
          function (e) { self.nav(e, 'next') })
        .on('click.fndtn.clearing', '.clearing-main-prev',
          function (e) { self.nav(e, 'prev') })
        .on('click.fndtn.clearing', this.settings.close_selectors,
          function (e) { Foundation.libs.clearing.close(e, this) });

      $(document).on('keydown.fndtn.clearing',
          function (e) { self.keydown(e) });

      S(window).off('.clearing').on('resize.fndtn.clearing',
        function () { self.resize() });

      this.swipe_events(scope);
    },

    swipe_events : function (scope) {
      var self = this,
      S = self.S;

      S(this.scope)
        .on('touchstart.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          var data = {
                start_page_x: e.touches[0].pageX,
                start_page_y: e.touches[0].pageY,
                start_time: (new Date()).getTime(),
                delta_x: 0,
                is_scrolling: undefined
              };

          S(this).data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          // Ignore pinch/zoom events
          if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

          var data = S(this).data('swipe-transition');

          if (typeof data === 'undefined') {
            data = {};
          }

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if ( typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? 'next' : 'prev';
            data.active = true;
            self.nav(e, direction);
          }
        })
        .on('touchend.fndtn.clearing', '.visible-img', function(e) {
          S(this).data('swipe-transition', {});
          e.stopPropagation();
        });
    },

    assemble : function ($li) {
      var $el = $li.parent();

      if ($el.parent().hasClass('carousel')) {
        return;
      }
      
      $el.after('<div id="foundationClearingHolder"></div>');

      var grid = $el.detach(),
          grid_outerHTML = '';

      if (grid[0] == null) {
        return;
      } else {
        grid_outerHTML = grid[0].outerHTML;
      }
      
      var holder = this.S('#foundationClearingHolder'),
          settings = $el.data(this.attr_name(true) + '-init'),
          data = {
            grid: '<div class="carousel">' + grid_outerHTML + '</div>',
            viewing: settings.templates.viewing
          },
          wrapper = '<div class="clearing-assembled"><div>' + data.viewing +
            data.grid + '</div></div>',
          touch_label = this.settings.touch_label;

      if (Modernizr.touch) {
        wrapper = $(wrapper).find('.clearing-touch-label').html(touch_label).end();
      }

      holder.after(wrapper).remove();
    },

    open : function ($image, current, target) {
      var self = this,
          body = $(document.body),
          root = target.closest('.clearing-assembled'),
          container = self.S('div', root).first(),
          visible_image = self.S('.visible-img', container),
          image = self.S('img', visible_image).not($image),
          label = self.S('.clearing-touch-label', container),
          error = false;

      image.error(function () {
        error = true;
      });

      function startLoad() {
        setTimeout(function () {
          this.image_loaded(image, function () {
            if (image.outerWidth() === 1 && !error) {
              startLoad.call(this);
            } else {
              cb.call(this, image);
            }
          }.bind(this));
        }.bind(this), 50);
      }

      function cb (image) {
        var $image = $(image);
        $image.css('visibility', 'visible');
        // toggle the gallery
        body.css('overflow', 'hidden');
        root.addClass('clearing-blackout');
        container.addClass('clearing-container');
        visible_image.show();
        this.fix_height(target)
          .caption(self.S('.clearing-caption', visible_image), self.S('img', target))
          .center_and_label(image, label)
          .shift(current, target, function () {
            target.siblings().removeClass('visible');
            target.addClass('visible');
          });
        visible_image.trigger('opened.fndtn.clearing')
      }

      if (!this.locked()) {
        visible_image.trigger('open.fndtn.clearing');
        // set the image to the selected thumbnail
        image
          .attr('src', this.load($image))
          .css('visibility', 'hidden');

        startLoad.call(this);
      }
    },

    close : function (e, el) {
      e.preventDefault();

      var root = (function (target) {
            if (/blackout/.test(target.selector)) {
              return target;
            } else {
              return target.closest('.clearing-blackout');
            }
          }($(el))),
          body = $(document.body), container, visible_image;

      if (el === e.target && root) {
        body.css('overflow', '');
        container = $('div', root).first();
        visible_image = $('.visible-img', container);
        visible_image.trigger('close.fndtn.clearing');
        this.settings.prev_index = 0;
        $('ul[' + this.attr_name() + ']', root)
          .attr('style', '').closest('.clearing-blackout')
          .removeClass('clearing-blackout');
        container.removeClass('clearing-container');
        visible_image.hide();
        visible_image.trigger('closed.fndtn.clearing');        
      }

      return false;
    },

    is_open : function (current) {
      return current.parent().prop('style').length > 0;
    },

    keydown : function (e) {
      var clearing = $('.clearing-blackout ul[' + this.attr_name() + ']'),
          NEXT_KEY = this.rtl ? 37 : 39,
          PREV_KEY = this.rtl ? 39 : 37,
          ESC_KEY = 27;

      if (e.which === NEXT_KEY) this.go(clearing, 'next');
      if (e.which === PREV_KEY) this.go(clearing, 'prev');
      if (e.which === ESC_KEY) this.S('a.clearing-close').trigger('click');
    },

    nav : function (e, direction) {
      var clearing = $('ul[' + this.attr_name() + ']', '.clearing-blackout');

      e.preventDefault();
      this.go(clearing, direction);
    },

    resize : function () {
      var image = $('img', '.clearing-blackout .visible-img'),
          label = $('.clearing-touch-label', '.clearing-blackout');

      if (image.length) {
        this.center_and_label(image, label);
        image.trigger('resized.fndtn.clearing')
      }
    },

    // visual adjustments
    fix_height : function (target) {
      var lis = target.parent().children(),
          self = this;

      lis.each(function () {
        var li = self.S(this),
            image = li.find('img');

        if (li.height() > image.outerHeight()) {
          li.addClass('fix-height');
        }
      })
      .closest('ul')
      .width(lis.length * 100 + '%');

      return this;
    },

    update_paddles : function (target) {
      var visible_image = target
        .closest('.carousel')
        .siblings('.visible-img');

      if (target.next().length > 0) {
        this.S('.clearing-main-next', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-next', visible_image).addClass('disabled');
      }

      if (target.prev().length > 0) {
        this.S('.clearing-main-prev', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-prev', visible_image).addClass('disabled');
      }
    },

    center_and_label : function (target, label) {
      if (!this.rtl) {
        target.css({
          marginLeft : -(target.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2)
        });

        if (label.length > 0) {
          label.css({
            marginLeft : -(label.outerWidth() / 2),
            marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10
          });
        }
      } else {
        target.css({
          marginRight : -(target.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2),
          left: 'auto',
          right: '50%'
        });

        if (label.length > 0) {
          label.css({
            marginRight : -(label.outerWidth() / 2),
            marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10,
            left: 'auto',
            right: '50%'
          });
        }
      }
      return this;
    },

    // image loading and preloading

    load : function ($image) {
      var href;

      if ($image[0].nodeName === "A") {
        href = $image.attr('href');
      } else {
        href = $image.parent().attr('href');
      }

      this.preload($image);

      if (href) return href;
      return $image.attr('src');
    },

    preload : function ($image) {
      this
        .img($image.closest('li').next())
        .img($image.closest('li').prev());
    },

    img : function (img) {
      if (img.length) {
        var new_img = new Image(),
            new_a = this.S('a', img);

        if (new_a.length) {
          new_img.src = new_a.attr('href');
        } else {
          new_img.src = this.S('img', img).attr('src');
        }
      }
      return this;
    },

    // image caption

    caption : function (container, $image) {
      var caption = $image.attr('data-caption');

      if (caption) {
        container
          .html(caption)
          .show();
      } else {
        container
          .text('')
          .hide();
      }
      return this;
    },

    // directional methods

    go : function ($ul, direction) {
      var current = this.S('.visible', $ul),
          target = current[direction]();

      if (target.length) {
        this.S('img', target)
          .trigger('click', [current, target])
          .trigger('change.fndtn.clearing');
      }
    },

    shift : function (current, target, callback) {
      var clearing = target.parent(),
          old_index = this.settings.prev_index || target.index(),
          direction = this.direction(clearing, current, target),
          dir = this.rtl ? 'right' : 'left',
          left = parseInt(clearing.css('left'), 10),
          width = target.outerWidth(),
          skip_shift;

      var dir_obj = {};

      // we use jQuery animate instead of CSS transitions because we
      // need a callback to unlock the next animation
      // needs support for RTL **
      if (target.index() !== old_index && !/skip/.test(direction)){
        if (/left/.test(direction)) {
          this.lock();
          dir_obj[dir] = left + width;
          clearing.animate(dir_obj, 300, this.unlock());
        } else if (/right/.test(direction)) {
          this.lock();
          dir_obj[dir] = left - width;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      } else if (/skip/.test(direction)) {
        // the target image is not adjacent to the current image, so
        // do we scroll right or not
        skip_shift = target.index() - this.settings.up_count;
        this.lock();

        if (skip_shift > 0) {
          dir_obj[dir] = -(skip_shift * width);
          clearing.animate(dir_obj, 300, this.unlock());
        } else {
          dir_obj[dir] = 0;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      }

      callback();
    },

    direction : function ($el, current, target) {
      var lis = this.S('li', $el),
          li_width = lis.outerWidth() + (lis.outerWidth() / 4),
          up_count = Math.floor(this.S('.clearing-container').outerWidth() / li_width) - 1,
          target_index = lis.index(target),
          response;

      this.settings.up_count = up_count;

      if (this.adjacent(this.settings.prev_index, target_index)) {
        if ((target_index > up_count) && target_index > this.settings.prev_index) {
          response = 'right';
        } else if ((target_index > up_count - 1) && target_index <= this.settings.prev_index) {
          response = 'left';
        } else {
          response = false;
        }
      } else {
        response = 'skip';
      }

      this.settings.prev_index = target_index;

      return response;
    },

    adjacent : function (current_index, target_index) {
      for (var i = target_index + 1; i >= target_index - 1; i--) {
        if (i === current_index) return true;
      }
      return false;
    },

    // lock management

    lock : function () {
      this.settings.locked = true;
    },

    unlock : function () {
      this.settings.locked = false;
    },

    locked : function () {
      return this.settings.locked;
    },

    off : function () {
      this.S(this.scope).off('.fndtn.clearing');
      this.S(window).off('.fndtn.clearing');
    },

    reflow : function () {
      this.init();
    }
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.dropdown = {
    name : 'dropdown',

    version : '5.2.3',

    settings : {
      active_class: 'open',
      align: 'bottom',
      is_hover: false,
      opened: function(){},
      closed: function(){}
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');

      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.dropdown')
        .on('click.fndtn.dropdown', '[' + this.attr_name() + ']', function (e) {
          var settings = S(this).data(self.attr_name(true) + '-init') || self.settings;
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            self.toggle($(this));
          }
        })
        .on('mouseenter.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this),
              dropdown,
              target;

          clearTimeout(self.timeout);

          if ($this.data(self.data_attr())) {
            dropdown = S('#' + $this.data(self.data_attr()));
            target = $this;
          } else {
            dropdown = $this;
            target = S("[" + self.attr_name() + "='" + dropdown.attr('id') + "']");
          }

          var settings = target.data(self.attr_name(true) + '-init') || self.settings;
          
          if(S(e.target).data(self.data_attr()) && settings.is_hover) {
            self.closeall.call(self);
          }
          
          if (settings.is_hover) self.open.apply(self, [dropdown, target]);
        })
        .on('mouseleave.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this);
          self.timeout = setTimeout(function () {
            if ($this.data(self.data_attr())) {
              var settings = $this.data(self.data_attr(true) + '-init') || self.settings;
              if (settings.is_hover) self.close.call(self, S('#' + $this.data(self.data_attr())));
            } else {
              var target = S('[' + self.attr_name() + '="' + S(this).attr('id') + '"]'),
                  settings = target.data(self.attr_name(true) + '-init') || self.settings;
              if (settings.is_hover) self.close.call(self, $this);
            }
          }.bind(this), 150);
        })
        .on('click.fndtn.dropdown', function (e) {
          var parent = S(e.target).closest('[' + self.attr_name() + '-content]');

          if (S(e.target).data(self.data_attr()) || S(e.target).parent().data(self.data_attr())) {
            return;
          }
          if (!(S(e.target).data('revealId')) && 
            (parent.length > 0 && (S(e.target).is('[' + self.attr_name() + '-content]') || 
              $.contains(parent.first()[0], e.target)))) {
            e.stopPropagation();
            return;
          }

          self.close.call(self, S('[' + self.attr_name() + '-content]'));
        })
        .on('opened.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
            self.settings.opened.call(this);
        })
        .on('closed.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
            self.settings.closed.call(this);
        });

      S(window)
        .off('.dropdown')
        .on('resize.fndtn.dropdown', self.throttle(function () {
          self.resize.call(self);
        }, 50));

      this.resize();
    },

    close: function (dropdown) {
      var self = this;
      dropdown.each(function () {
        if (self.S(this).hasClass(self.settings.active_class)) {
          self.S(this)
            .css(Foundation.rtl ? 'right':'left', '-99999px')
            .removeClass(self.settings.active_class)
            .prev('[' + self.attr_name() + ']')
            .removeClass(self.settings.active_class)
            .removeData('target');

          self.S(this).trigger('closed', [dropdown]);
        }
      });
    },

    closeall: function() {
      var self = this;
      $.each(self.S('[' + this.attr_name() + '-content]'), function() {
        self.close.call(self, self.S(this))
      });
    },

    open: function (dropdown, target) {
        this
          .css(dropdown
            .addClass(this.settings.active_class), target);
        dropdown.prev('[' + this.attr_name() + ']').addClass(this.settings.active_class);
        dropdown.data('target', target.get(0)).trigger('opened', [dropdown, target]);
    },

    data_attr: function () {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + this.name;
      }

      return this.name;
    },

    toggle : function (target) {
      var dropdown = this.S('#' + target.data(this.data_attr()));
      if (dropdown.length === 0) {
        // No dropdown found, not continuing
        return;
      }

      this.close.call(this, this.S('[' + this.attr_name() + '-content]').not(dropdown));

      if (dropdown.hasClass(this.settings.active_class)) {
        this.close.call(this, dropdown);
        if (dropdown.data('target') !== target.get(0))
          this.open.call(this, dropdown, target);
      } else {
        this.open.call(this, dropdown, target);
      }
    },

    resize : function () {
      var dropdown = this.S('[' + this.attr_name() + '-content].open'),
          target = this.S("[" + this.attr_name() + "='" + dropdown.attr('id') + "']");

      if (dropdown.length && target.length) {
        this.css(dropdown, target);
      }
    },

    css : function (dropdown, target) {
      this.clear_idx();

      if (this.small()) {
        var p = this.dirs.bottom.call(dropdown, target);

        dropdown.attr('style', '').removeClass('drop-left drop-right drop-top').css({
          position : 'absolute',
          width: '95%',
          'max-width': 'none',
          top: p.top
        });

        dropdown.css(Foundation.rtl ? 'right':'left', '2.5%');
      } else {
        var settings = target.data(this.attr_name(true) + '-init') || this.settings;

        this.style(dropdown, target, settings);
      }

      return dropdown;
    },

    style : function (dropdown, target, settings) {
      var css = $.extend({position: 'absolute'}, 
        this.dirs[settings.align].call(dropdown, target, settings));

      dropdown.attr('style', '').css(css);
    },

    // return CSS property object
    // `this` is the dropdown
    dirs : {
      // Calculate target offset
      _base : function (t) {
        var o_p = this.offsetParent(),
            o = o_p.offset(),
            p = t.offset();

        p.top -= o.top;
        p.left -= o.left;

        return p;
      },
      top: function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t),
            pip_offset_base = (t.outerWidth() / 2) - 8;

        this.addClass('drop-top');

        if (t.outerWidth() < this.outerWidth() || self.small()) {
          self.adjust_pip(pip_offset_base, p);
        }

        if (Foundation.rtl) {
          return {left: p.left - this.outerWidth() + t.outerWidth(), 
            top: p.top - this.outerHeight()};
        }

        return {left: p.left, top: p.top - this.outerHeight()};
      },
      bottom: function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t),
            pip_offset_base = (t.outerWidth() / 2) - 8;

        if (t.outerWidth() < this.outerWidth() || self.small()) {
          self.adjust_pip(pip_offset_base, p);
        }

        if (self.rtl) {
          return {left: p.left - this.outerWidth() + t.outerWidth(), top: p.top + t.outerHeight()};
        }

        return {left: p.left, top: p.top + t.outerHeight()};
      },
      left: function (t, s) {
        var p = Foundation.libs.dropdown.dirs._base.call(this, t);

        this.addClass('drop-left');

        return {left: p.left - this.outerWidth(), top: p.top};
      },
      right: function (t, s) {
        var p = Foundation.libs.dropdown.dirs._base.call(this, t);

        this.addClass('drop-right');

        return {left: p.left + t.outerWidth(), top: p.top};
      }
    },

    // Insert rule to style psuedo elements
    adjust_pip : function (pip_offset_base, p) {
      var sheet = Foundation.stylesheet;

      if (this.small()) {
        pip_offset_base += p.left - 8;
      }

      this.rule_idx = sheet.cssRules.length;

      var sel_before = '.f-dropdown.open:before',
          sel_after  = '.f-dropdown.open:after',
          css_before = 'left: ' + pip_offset_base + 'px;',
          css_after  = 'left: ' + (pip_offset_base - 1) + 'px;';

      if (sheet.insertRule) {
        sheet.insertRule([sel_before, '{', css_before, '}'].join(' '), this.rule_idx);
        sheet.insertRule([sel_after, '{', css_after, '}'].join(' '), this.rule_idx + 1);
      } else {
        sheet.addRule(sel_before, css_before, this.rule_idx);
        sheet.addRule(sel_after, css_after, this.rule_idx + 1);
      }
    },

    // Remove old dropdown rule index
    clear_idx : function () {
      var sheet = Foundation.stylesheet;

      if (this.rule_idx) {
        sheet.deleteRule(this.rule_idx);
        sheet.deleteRule(this.rule_idx);
        delete this.rule_idx;
      }
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    off: function () {
      this.S(this.scope).off('.fndtn.dropdown');
      this.S('html, body').off('.fndtn.dropdown');
      this.S(window).off('.fndtn.dropdown');
      this.S('[data-dropdown-content]').off('.fndtn.dropdown');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.equalizer = {
    name : 'equalizer',

    version : '5.2.3',

    settings : {
      use_tallest: true,
      before_height_change: $.noop,
      after_height_change: $.noop,
      equalize_on_stack: false
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'image_loaded');
      this.bindings(method, options);
      this.reflow();
    },

    events : function () {
      this.S(window).off('.equalizer').on('resize.fndtn.equalizer', function(e){
        this.reflow();
      }.bind(this));
    },

    equalize: function(equalizer) {
      var isStacked = false,
          vals = equalizer.find('[' + this.attr_name() + '-watch]:visible'),
          settings = equalizer.data(this.attr_name(true)+'-init');

      if (vals.length === 0) return;
      var firstTopOffset = vals.first().offset().top;
      settings.before_height_change();
      equalizer.trigger('before-height-change');
      vals.height('inherit');
      vals.each(function(){
        var el = $(this);
        if (el.offset().top !== firstTopOffset) {
          isStacked = true;
        }
      });

      if (settings.equalize_on_stack === false) {
        if (isStacked) return;
      };

      var heights = vals.map(function(){ return $(this).outerHeight(false) }).get();

      if (settings.use_tallest) {
        var max = Math.max.apply(null, heights);
        vals.css('height', max);
      } else {
        var min = Math.min.apply(null, heights);
        vals.css('height', min);
      }
      settings.after_height_change();
      equalizer.trigger('after-height-change');
    },

    reflow : function () {
      var self = this;

      this.S('[' + this.attr_name() + ']', this.scope).each(function(){
        var $eq_target = $(this);
        self.image_loaded(self.S('img', this), function(){
          self.equalize($eq_target)
        });
      });
    }
  };
})(jQuery, window, window.document);


;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.interchange = {
    name : 'interchange',

    version : '5.2.3',

    cache : {},

    images_loaded : false,
    nodes_loaded : false,

    settings : {
      load_attr : 'interchange',

      named_queries : {
        'default' : 'only screen',
        small : Foundation.media_queries.small,
        medium : Foundation.media_queries.medium,
        large : Foundation.media_queries.large,
        xlarge : Foundation.media_queries.xlarge,
        xxlarge: Foundation.media_queries.xxlarge,
        landscape : 'only screen and (orientation: landscape)',
        portrait : 'only screen and (orientation: portrait)',
        retina : 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
          'only screen and (min--moz-device-pixel-ratio: 2),' +
          'only screen and (-o-min-device-pixel-ratio: 2/1),' +
          'only screen and (min-device-pixel-ratio: 2),' +
          'only screen and (min-resolution: 192dpi),' +
          'only screen and (min-resolution: 2dppx)'
      },

      directives : {
        replace: function (el, path, trigger) {
          // The trigger argument, if called within the directive, fires
          // an event named after the directive on the element, passing
          // any parameters along to the event that you pass to trigger.
          //
          // ex. trigger(), trigger([a, b, c]), or trigger(a, b, c)
          //
          // This allows you to bind a callback like so:
          // $('#interchangeContainer').on('replace', function (e, a, b, c) {
          //   console.log($(this).html(), a, b, c);
          // });

          if (/IMG/.test(el[0].nodeName)) {
            var orig_path = el[0].src;

            if (new RegExp(path, 'i').test(orig_path)) return;

            el[0].src = path;

            return trigger(el[0].src);
          }
          var last_path = el.data(this.data_attr + '-last-path');

          if (last_path == path) return;

          if (/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i.test(path)) {
            $(el).css('background-image', 'url('+path+')');
            el.data('interchange-last-path', path);
            return trigger(path);
          }

          return $.get(path, function (response) {
            el.html(response);
            el.data(this.data_attr + '-last-path', path);
            trigger();
          });

        }
      }
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.data_attr = this.set_data_attr();
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
      this.load('images');
      this.load('nodes');
    },

    get_media_hash : function() {
        var mediaHash='';
        for (var queryName in this.settings.named_queries ) {
            mediaHash += matchMedia(this.settings.named_queries[queryName]).matches.toString();
        }
        return mediaHash;
    },

    events : function () {
      var self = this, prevMediaHash;

      $(window)
        .off('.interchange')
        .on('resize.fndtn.interchange', self.throttle(function () {
            var currMediaHash = self.get_media_hash();
            if (currMediaHash !== prevMediaHash) {
                self.resize();
            }
            prevMediaHash = currMediaHash;
        }, 50));

      return this;
    },

    resize : function () {
      var cache = this.cache;

      if(!this.images_loaded || !this.nodes_loaded) {
        setTimeout($.proxy(this.resize, this), 50);
        return;
      }

      for (var uuid in cache) {
        if (cache.hasOwnProperty(uuid)) {
          var passed = this.results(uuid, cache[uuid]);

          if (passed) {
            this.settings.directives[passed
              .scenario[1]].call(this, passed.el, passed.scenario[0], function () {
                if (arguments[0] instanceof Array) { 
                  var args = arguments[0];
                } else { 
                  var args = Array.prototype.slice.call(arguments, 0);
                }

                passed.el.trigger(passed.scenario[1], args);
              });
          }
        }
      }

    },

    results : function (uuid, scenarios) {
      var count = scenarios.length;

      if (count > 0) {
        var el = this.S('[' + this.add_namespace('data-uuid') + '="' + uuid + '"]');

        while (count--) {
          var mq, rule = scenarios[count][2];
          if (this.settings.named_queries.hasOwnProperty(rule)) {
            mq = matchMedia(this.settings.named_queries[rule]);
          } else {
            mq = matchMedia(rule);
          }
          if (mq.matches) {
            return {el: el, scenario: scenarios[count]};
          }
        }
      }

      return false;
    },

    load : function (type, force_update) {
      if (typeof this['cached_' + type] === 'undefined' || force_update) {
        this['update_' + type]();
      }

      return this['cached_' + type];
    },

    update_images : function () {
      var images = this.S('img[' + this.data_attr + ']'),
          count = images.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cache = {};
      this.cached_images = [];
      this.images_loaded = (count === 0);

      while (i--) {
        loaded_count++;
        if (images[i]) {
          var str = images[i].getAttribute(data_attr) || '';

          if (str.length > 0) {
            this.cached_images.push(images[i]);
          }
        }

        if (loaded_count === count) {
          this.images_loaded = true;
          this.enhance('images');
        }
      }

      return this;
    },

    update_nodes : function () {
      var nodes = this.S('[' + this.data_attr + ']').not('img'),
          count = nodes.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cached_nodes = [];
      this.nodes_loaded = (count === 0);


      while (i--) {
        loaded_count++;
        var str = nodes[i].getAttribute(data_attr) || '';

        if (str.length > 0) {
          this.cached_nodes.push(nodes[i]);
        }

        if(loaded_count === count) {
          this.nodes_loaded = true;
          this.enhance('nodes');
        }
      }

      return this;
    },

    enhance : function (type) {
      var i = this['cached_' + type].length;

      while (i--) {
        this.object($(this['cached_' + type][i]));
      }

      return $(window).trigger('resize');
    },

    parse_params : function (path, directive, mq) {
      return [this.trim(path), this.convert_directive(directive), this.trim(mq)];
    },

    convert_directive : function (directive) {

      var trimmed = this.trim(directive);

      if (trimmed.length > 0) {
        return trimmed;
      }

      return 'replace';
    },

    object : function(el) {
      var raw_arr = this.parse_data_attr(el),
          scenarios = [], 
          i = raw_arr.length;

      if (i > 0) {
        while (i--) {
          var split = raw_arr[i].split(/\((.*?)(\))$/);

          if (split.length > 1) {
            var cached_split = split[0].split(/\, /),
                params = this.parse_params(cached_split[0],
                  cached_split[1], split[1]);

            scenarios.push(params);
          }
        }
      }

      return this.store(el, scenarios);
    },

    store : function (el, scenarios) {
      var uuid = this.random_str(),
          current_uuid = el.data(this.add_namespace('uuid', true));

      if (this.cache[current_uuid]) return this.cache[current_uuid];

      el.attr(this.add_namespace('data-uuid'), uuid);

      return this.cache[uuid] = scenarios;
    },

    trim : function(str) {

      if (typeof str === 'string') {
        return $.trim(str);
      }

      return str;
    },

    set_data_attr: function (init) {
      if (init) {
        if (this.namespace.length > 0) {
          return this.namespace + '-' + this.settings.load_attr;
        }

        return this.settings.load_attr;
      }

      if (this.namespace.length > 0) {
        return 'data-' + this.namespace + '-' + this.settings.load_attr;
      }

      return 'data-' + this.settings.load_attr;
    },

    parse_data_attr : function (el) {
      var raw = el.attr(this.attr_name()).split(/\[(.*?)\]/),
          i = raw.length, 
          output = [];

      while (i--) {
        if (raw[i].replace(/[\W\d]+/, '').length > 4) {
          output.push(raw[i]);
        }
      }

      return output;
    },

    reflow : function () {
      this.load('images', true);
      this.load('nodes', true);
    }

  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  var Modernizr = Modernizr || false;

  Foundation.libs.joyride = {
    name : 'joyride',

    version : '5.2.3',

    defaults : {
      expose                   : false,     // turn on or off the expose feature
      modal                    : true,      // Whether to cover page with modal during the tour
      tip_location             : 'bottom',  // 'top' or 'bottom' in relation to parent
      nub_position             : 'auto',    // override on a per tooltip bases
      scroll_speed             : 1500,      // Page scrolling speed in milliseconds, 0 = no scroll animation
      scroll_animation         : 'linear',  // supports 'swing' and 'linear', extend with jQuery UI.
      timer                    : 0,         // 0 = no timer , all other numbers = timer in milliseconds
      start_timer_on_click     : true,      // true or false - true requires clicking the first button start the timer
      start_offset             : 0,         // the index of the tooltip you want to start on (index of the li)
      next_button              : true,      // true or false to control whether a next button is used
      tip_animation            : 'fade',    // 'pop' or 'fade' in each tip
      pause_after              : [],        // array of indexes where to pause the tour after
      exposed                  : [],        // array of expose elements
      tip_animation_fade_speed : 300,       // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      cookie_monster           : false,     // true or false to control whether cookies are used
      cookie_name              : 'joyride', // Name the cookie you'll use
      cookie_domain            : false,     // Will this cookie be attached to a domain, ie. '.notableapp.com'
      cookie_expires           : 365,       // set when you would like the cookie to expire.
      tip_container            : 'body',    // Where will the tip be attached
      abort_on_close           : true,      // When true, the close event will not fire any callback
      tip_location_patterns    : {
        top: ['bottom'],
        bottom: [], // bottom should not need to be repositioned
        left: ['right', 'top', 'bottom'],
        right: ['left', 'top', 'bottom']
      },
      post_ride_callback     : function (){},    // A method to call once the tour closes (canceled or complete)
      post_step_callback     : function (){},    // A method to call after each step
      pre_step_callback      : function (){},    // A method to call before each step
      pre_ride_callback      : function (){},    // A method to call before the tour starts (passed index, tip, and cloned exposed element)
      post_expose_callback   : function (){},    // A method to call after an element has been exposed
      template : { // HTML segments for tip layout
        link    : '<a href="#close" class="joyride-close-tip">&times;</a>',
        timer   : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
        tip     : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
        wrapper : '<div class="joyride-content-wrapper"></div>',
        button  : '<a href="#" class="small button joyride-next-tip"></a>',
        modal   : '<div class="joyride-modal-bg"></div>',
        expose  : '<div class="joyride-expose-wrapper"></div>',
        expose_cover: '<div class="joyride-expose-cover"></div>'
      },
      expose_add_class : '' // One or more space-separated class names to be added to exposed element
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.settings = this.settings || $.extend({}, this.defaults, (options || method));

      this.bindings(method, options)
    },

    events : function () {
      var self = this;

      $(this.scope)
        .off('.joyride')
        .on('click.fndtn.joyride', '.joyride-next-tip, .joyride-modal-bg', function (e) {
          e.preventDefault();

          if (this.settings.$li.next().length < 1) {
            this.end();
          } else if (this.settings.timer > 0) {
            clearTimeout(this.settings.automate);
            this.hide();
            this.show();
            this.startTimer();
          } else {
            this.hide();
            this.show();
          }

        }.bind(this))

        .on('click.fndtn.joyride', '.joyride-close-tip', function (e) {
          e.preventDefault();
          this.end(this.settings.abort_on_close);
        }.bind(this));

      $(window)
        .off('.joyride')
        .on('resize.fndtn.joyride', self.throttle(function () {
          if ($('[' + self.attr_name() + ']').length > 0 && self.settings.$next_tip) {
            if (self.settings.exposed.length > 0) {
              var $els = $(self.settings.exposed);

              $els.each(function () {
                var $this = $(this);
                self.un_expose($this);
                self.expose($this);
              });
            }

            if (self.is_phone()) {
              self.pos_phone();
            } else {
              self.pos_default(false);
            }
          }
        }, 100));
    },

    start : function () {
      var self = this,
          $this = $('[' + this.attr_name() + ']', this.scope),
          integer_settings = ['timer', 'scrollSpeed', 'startOffset', 'tipAnimationFadeSpeed', 'cookieExpires'],
          int_settings_count = integer_settings.length;

      if (!$this.length > 0) return;

      if (!this.settings.init) this.events();

      this.settings = $this.data(this.attr_name(true) + '-init');

      // non configureable settings
      this.settings.$content_el = $this;
      this.settings.$body = $(this.settings.tip_container);
      this.settings.body_offset = $(this.settings.tip_container).position();
      this.settings.$tip_content = this.settings.$content_el.find('> li');
      this.settings.paused = false;
      this.settings.attempts = 0;

      // can we create cookies?
      if (typeof $.cookie !== 'function') {
        this.settings.cookie_monster = false;
      }

      // generate the tips and insert into dom.
      if (!this.settings.cookie_monster || this.settings.cookie_monster && !$.cookie(this.settings.cookie_name)) {
        this.settings.$tip_content.each(function (index) {
          var $this = $(this);
          this.settings = $.extend({}, self.defaults, self.data_options($this));

          // Make sure that settings parsed from data_options are integers where necessary
          var i = int_settings_count;
          while (i--) {
            self.settings[integer_settings[i]] = parseInt(self.settings[integer_settings[i]], 10);
          }
          self.create({$li : $this, index : index});
        });

        // show first tip
        if (!this.settings.start_timer_on_click && this.settings.timer > 0) {
          this.show('init');
          this.startTimer();
        } else {
          this.show('init');
        }

      }
    },

    resume : function () {
      this.set_li();
      this.show();
    },

    tip_template : function (opts) {
      var $blank, content;

      opts.tip_class = opts.tip_class || '';

      $blank = $(this.settings.template.tip).addClass(opts.tip_class);
      content = $.trim($(opts.li).html()) +
        this.button_text(opts.button_text) +
        this.settings.template.link +
        this.timer_instance(opts.index);

      $blank.append($(this.settings.template.wrapper));
      $blank.first().attr(this.add_namespace('data-index'), opts.index);
      $('.joyride-content-wrapper', $blank).append(content);

      return $blank[0];
    },

    timer_instance : function (index) {
      var txt;

      if ((index === 0 && this.settings.start_timer_on_click && this.settings.timer > 0) || this.settings.timer === 0) {
        txt = '';
      } else {
        txt = $(this.settings.template.timer)[0].outerHTML;
      }
      return txt;
    },

    button_text : function (txt) {
      if (this.settings.next_button) {
        txt = $.trim(txt) || 'Next';
        txt = $(this.settings.template.button).append(txt)[0].outerHTML;
      } else {
        txt = '';
      }
      return txt;
    },

    create : function (opts) {
      var buttonText = opts.$li.attr(this.add_namespace('data-button')) 
        || opts.$li.attr(this.add_namespace('data-text')),
        tipClass = opts.$li.attr('class'),
        $tip_content = $(this.tip_template({
          tip_class : tipClass,
          index : opts.index,
          button_text : buttonText,
          li : opts.$li
        }));

      $(this.settings.tip_container).append($tip_content);
    },

    show : function (init) {
      var $timer = null;

      // are we paused?
      if (this.settings.$li === undefined
        || ($.inArray(this.settings.$li.index(), this.settings.pause_after) === -1)) {

        // don't go to the next li if the tour was paused
        if (this.settings.paused) {
          this.settings.paused = false;
        } else {
          this.set_li(init);
        }

        this.settings.attempts = 0;

        if (this.settings.$li.length && this.settings.$target.length > 0) {
          if (init) { //run when we first start
            this.settings.pre_ride_callback(this.settings.$li.index(), this.settings.$next_tip);
            if (this.settings.modal) {
              this.show_modal();
            }
          }

          this.settings.pre_step_callback(this.settings.$li.index(), this.settings.$next_tip);

          if (this.settings.modal && this.settings.expose) {
            this.expose();
          }

          this.settings.tip_settings = $.extend({}, this.settings, this.data_options(this.settings.$li));

          this.settings.timer = parseInt(this.settings.timer, 10);

          this.settings.tip_settings.tip_location_pattern = this.settings.tip_location_patterns[this.settings.tip_settings.tip_location];

          // scroll if not modal
          if (!/body/i.test(this.settings.$target.selector)) {
            this.scroll_to();
          }

          if (this.is_phone()) {
            this.pos_phone(true);
          } else {
            this.pos_default(true);
          }

          $timer = this.settings.$next_tip.find('.joyride-timer-indicator');

          if (/pop/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip.show();

              setTimeout(function () {
                $timer.animate({
                  width: $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.show();

            }


          } else if (/fade/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip
                .fadeIn(this.settings.tip_animation_fade_speed)
                .show();

              setTimeout(function () {
                $timer.animate({
                  width: $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed);
            }
          }

          this.settings.$current_tip = this.settings.$next_tip;

        // skip non-existant targets
        } else if (this.settings.$li && this.settings.$target.length < 1) {

          this.show();

        } else {

          this.end();

        }
      } else {

        this.settings.paused = true;

      }

    },

    is_phone : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    hide : function () {
      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      if (!this.settings.modal) {
        $('.joyride-modal-bg').hide();
      }

      // Prevent scroll bouncing...wait to remove from layout
      this.settings.$current_tip.css('visibility', 'hidden');
      setTimeout($.proxy(function() {
        this.hide();
        this.css('visibility', 'visible');
      }, this.settings.$current_tip), 0);
      this.settings.post_step_callback(this.settings.$li.index(),
        this.settings.$current_tip);
    },

    set_li : function (init) {
      if (init) {
        this.settings.$li = this.settings.$tip_content.eq(this.settings.start_offset);
        this.set_next_tip();
        this.settings.$current_tip = this.settings.$next_tip;
      } else {
        this.settings.$li = this.settings.$li.next();
        this.set_next_tip();
      }

      this.set_target();
    },

    set_next_tip : function () {
      this.settings.$next_tip = $(".joyride-tip-guide").eq(this.settings.$li.index());
      this.settings.$next_tip.data('closed', '');
    },

    set_target : function () {
      var cl = this.settings.$li.attr(this.add_namespace('data-class')),
          id = this.settings.$li.attr(this.add_namespace('data-id')),
          $sel = function () {
            if (id) {
              return $(document.getElementById(id));
            } else if (cl) {
              return $('.' + cl).first();
            } else {
              return $('body');
            }
          };

      this.settings.$target = $sel();
    },

    scroll_to : function () {
      var window_half, tipOffset;

      window_half = $(window).height() / 2;
      tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight());

      if (tipOffset != 0) {
        $('html, body').stop().animate({
          scrollTop: tipOffset
        }, this.settings.scroll_speed, 'swing');
      }
    },

    paused : function () {
      return ($.inArray((this.settings.$li.index() + 1), this.settings.pause_after) === -1);
    },

    restart : function () {
      this.hide();
      this.settings.$li = undefined;
      this.show('init');
    },

    pos_default : function (init) {
      var $nub = this.settings.$next_tip.find('.joyride-nub'),
          nub_width = Math.ceil($nub.outerWidth() / 2),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      // tip must not be "display: none" to calculate position
      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {
          if (this.bottom()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight()),
                left: this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth()});
            } else {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight()),
                left: this.settings.$target.offset().left});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'top');

          } else if (this.top()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height),
                left: this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth()});
            } else {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height),
                left: this.settings.$target.offset().left});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'bottom');

          } else if (this.right()) {

            this.settings.$next_tip.css({
              top: this.settings.$target.offset().top,
              left: (this.settings.$target.outerWidth() + this.settings.$target.offset().left + nub_width)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'left');

          } else if (this.left()) {

            this.settings.$next_tip.css({
              top: this.settings.$target.offset().top,
              left: (this.settings.$target.offset().left - this.settings.$next_tip.outerWidth() - nub_width)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'right');

          }

          if (!this.visible(this.corners(this.settings.$next_tip)) && this.settings.attempts < this.settings.tip_settings.tip_location_pattern.length) {

            $nub.removeClass('bottom')
              .removeClass('top')
              .removeClass('right')
              .removeClass('left');

            this.settings.tip_settings.tip_location = this.settings.tip_settings.tip_location_pattern[this.settings.attempts];

            this.settings.attempts++;

            this.pos_default();

          }

      } else if (this.settings.$li.length) {

        this.pos_modal($nub);

      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }

    },

    pos_phone : function (init) {
      var tip_height = this.settings.$next_tip.outerHeight(),
          tip_offset = this.settings.$next_tip.offset(),
          target_height = this.settings.$target.outerHeight(),
          $nub = $('.joyride-nub', this.settings.$next_tip),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      $nub.removeClass('bottom')
        .removeClass('top')
        .removeClass('right')
        .removeClass('left');

      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {

        if (this.top()) {

            this.settings.$next_tip.offset({top: this.settings.$target.offset().top - tip_height - nub_height});
            $nub.addClass('bottom');

        } else {

          this.settings.$next_tip.offset({top: this.settings.$target.offset().top + target_height + nub_height});
          $nub.addClass('top');

        }

      } else if (this.settings.$li.length) {
        this.pos_modal($nub);
      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }
    },

    pos_modal : function ($nub) {
      this.center();
      $nub.hide();

      this.show_modal();
    },

    show_modal : function () {
      if (!this.settings.$next_tip.data('closed')) {
        var joyridemodalbg =  $('.joyride-modal-bg');
        if (joyridemodalbg.length < 1) {
          $('body').append(this.settings.template.modal).show();
        }

        if (/pop/i.test(this.settings.tip_animation)) {
            joyridemodalbg.show();
        } else {
            joyridemodalbg.fadeIn(this.settings.tip_animation_fade_speed);
        }
      }
    },

    expose : function () {
      var expose,
          exposeCover,
          el,
          origCSS,
          origClasses,
          randId = 'expose-' + this.random_str(6);

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if(this.settings.$target && !/body/i.test(this.settings.$target.selector)){
        el = this.settings.$target;
      }  else {
        return false;
      }

      if(el.length < 1){
        if(window.console){
          console.error('element not valid', el);
        }
        return false;
      }

      expose = $(this.settings.template.expose);
      this.settings.$body.append(expose);
      expose.css({
        top: el.offset().top,
        left: el.offset().left,
        width: el.outerWidth(true),
        height: el.outerHeight(true)
      });

      exposeCover = $(this.settings.template.expose_cover);

      origCSS = {
        zIndex: el.css('z-index'),
        position: el.css('position')
      };

      origClasses = el.attr('class') == null ? '' : el.attr('class');

      el.css('z-index',parseInt(expose.css('z-index'))+1);

      if (origCSS.position == 'static') {
        el.css('position','relative');
      }

      el.data('expose-css',origCSS);
      el.data('orig-class', origClasses);
      el.attr('class', origClasses + ' ' + this.settings.expose_add_class);

      exposeCover.css({
        top: el.offset().top,
        left: el.offset().left,
        width: el.outerWidth(true),
        height: el.outerHeight(true)
      });

      if (this.settings.modal) this.show_modal();

      this.settings.$body.append(exposeCover);
      expose.addClass(randId);
      exposeCover.addClass(randId);
      el.data('expose', randId);
      this.settings.post_expose_callback(this.settings.$li.index(), this.settings.$next_tip, el);
      this.add_exposed(el);
    },

    un_expose : function () {
      var exposeId,
          el,
          expose ,
          origCSS,
          origClasses,
          clearAll = false;

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if(this.settings.$target && !/body/i.test(this.settings.$target.selector)){
        el = this.settings.$target;
      }  else {
        return false;
      }

      if(el.length < 1){
        if (window.console) {
          console.error('element not valid', el);
        }
        return false;
      }

      exposeId = el.data('expose');
      expose = $('.' + exposeId);

      if (arguments.length > 1) {
        clearAll = arguments[1];
      }

      if (clearAll === true) {
        $('.joyride-expose-wrapper,.joyride-expose-cover').remove();
      } else {
        expose.remove();
      }

      origCSS = el.data('expose-css');

      if (origCSS.zIndex == 'auto') {
        el.css('z-index', '');
      } else {
        el.css('z-index', origCSS.zIndex);
      }

      if (origCSS.position != el.css('position')) {
        if(origCSS.position == 'static') {// this is default, no need to set it.
          el.css('position', '');
        } else {
          el.css('position', origCSS.position);
        }
      }

      origClasses = el.data('orig-class');
      el.attr('class', origClasses);
      el.removeData('orig-classes');

      el.removeData('expose');
      el.removeData('expose-z-index');
      this.remove_exposed(el);
    },

    add_exposed: function(el){
      this.settings.exposed = this.settings.exposed || [];
      if (el instanceof $ || typeof el === 'object') {
        this.settings.exposed.push(el[0]);
      } else if (typeof el == 'string') {
        this.settings.exposed.push(el);
      }
    },

    remove_exposed: function(el){
      var search, i;
      if (el instanceof $) {
        search = el[0]
      } else if (typeof el == 'string'){
        search = el;
      }

      this.settings.exposed = this.settings.exposed || [];
      i = this.settings.exposed.length;

      while (i--) {
        if (this.settings.exposed[i] == search) {
          this.settings.exposed.splice(i, 1);
          return;
        }
      }
    },

    center : function () {
      var $w = $(window);

      this.settings.$next_tip.css({
        top : ((($w.height() - this.settings.$next_tip.outerHeight()) / 2) + $w.scrollTop()),
        left : ((($w.width() - this.settings.$next_tip.outerWidth()) / 2) + $w.scrollLeft())
      });

      return true;
    },

    bottom : function () {
      return /bottom/i.test(this.settings.tip_settings.tip_location);
    },

    top : function () {
      return /top/i.test(this.settings.tip_settings.tip_location);
    },

    right : function () {
      return /right/i.test(this.settings.tip_settings.tip_location);
    },

    left : function () {
      return /left/i.test(this.settings.tip_settings.tip_location);
    },

    corners : function (el) {
      var w = $(window),
          window_half = w.height() / 2,
          //using this to calculate since scroll may not have finished yet.
          tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight()),
          right = w.width() + w.scrollLeft(),
          offsetBottom =  w.height() + tipOffset,
          bottom = w.height() + w.scrollTop(),
          top = w.scrollTop();

      if (tipOffset < top) {
        if (tipOffset < 0) {
          top = 0;
        } else {
          top = tipOffset;
        }
      }

      if (offsetBottom > bottom) {
        bottom = offsetBottom;
      }

      return [
        el.offset().top < top,
        right < el.offset().left + el.outerWidth(),
        bottom < el.offset().top + el.outerHeight(),
        w.scrollLeft() > el.offset().left
      ];
    },

    visible : function (hidden_corners) {
      var i = hidden_corners.length;

      while (i--) {
        if (hidden_corners[i]) return false;
      }

      return true;
    },

    nub_position : function (nub, pos, def) {
      if (pos === 'auto') {
        nub.addClass(def);
      } else {
        nub.addClass(pos);
      }
    },

    startTimer : function () {
      if (this.settings.$li.length) {
        this.settings.automate = setTimeout(function () {
          this.hide();
          this.show();
          this.startTimer();
        }.bind(this), this.settings.timer);
      } else {
        clearTimeout(this.settings.automate);
      }
    },

    end : function (abort) {
      if (this.settings.cookie_monster) {
        $.cookie(this.settings.cookie_name, 'ridden', { expires: this.settings.cookie_expires, domain: this.settings.cookie_domain });
      }

      if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
      }

      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      this.settings.$next_tip.data('closed', true);

      $('.joyride-modal-bg').hide();
      this.settings.$current_tip.hide();

      if (typeof abort === 'undefined' || abort === false) {
        this.settings.post_step_callback(this.settings.$li.index(), this.settings.$current_tip);
        this.settings.post_ride_callback(this.settings.$li.index(), this.settings.$current_tip);
      }

      $('.joyride-tip-guide').remove();
    },

    off : function () {
      $(this.scope).off('.joyride');
      $(window).off('.joyride');
      $('.joyride-close-tip, .joyride-next-tip, .joyride-modal-bg').off('.joyride');
      $('.joyride-tip-guide, .joyride-modal-bg').remove();
      clearTimeout(this.settings.automate);
      this.settings = {};
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs['magellan-expedition'] = {
    name : 'magellan-expedition',

    version : '5.2.3',

    settings : {
      active_class: 'active',
      threshold: 0, // pixels from the top of the expedition for it to become fixes
      destination_threshold: 20, // pixels from the top of destination for it to be considered active
      throttle_delay: 30, // calculation throttling to increase framerate
      fixed_top: 0 // top distance in pixels assigend to the fixed element on scroll
    }, 

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          settings = self.settings;

      // initialize expedition offset
      self.set_expedition_position();

      S(self.scope)
        .off('.magellan')
        .on('click.fndtn.magellan', '[' + self.add_namespace('data-magellan-arrival') + '] a[href^="#"]', function (e) {
          e.preventDefault();
          var expedition = $(this).closest('[' + self.attr_name() + ']'),
              settings = expedition.data('magellan-expedition-init'),
              hash = this.hash.split('#').join(''),
              target = $("a[name='"+hash+"']");
          
          if (target.length === 0) {
            target = $('#'+hash);
          }

          // Account for expedition height if fixed position
          var scroll_top = target.offset().top;
          scroll_top = scroll_top - expedition.outerHeight();

          $('html, body').stop().animate({
            'scrollTop': scroll_top
          }, 700, 'swing', function () {
            if(history.pushState) {
              history.pushState(null, null, '#'+hash);
            }
            else {
              location.hash = '#'+hash;
            }
          });
        })
        .on('scroll.fndtn.magellan', self.throttle(this.check_for_arrivals.bind(this), settings.throttle_delay));
      
      $(window)
        .on('resize.fndtn.magellan', self.throttle(this.set_expedition_position.bind(this), settings.throttle_delay));
    },

    check_for_arrivals : function() {
      var self = this;
      self.update_arrivals();
      self.update_expedition_positions();
    },

    set_expedition_position : function() {
      var self = this;
      $('[' + this.attr_name() + '=fixed]', self.scope).each(function(idx, el) {
        var expedition = $(this),
            styles = expedition.attr('styles'), // save styles
            top_offset;

        expedition.attr('style', '');
        top_offset = expedition.offset().top + self.settings.threshold;

        expedition.data(self.data_attr('magellan-top-offset'), top_offset);
        expedition.attr('style', styles);
      });
    },

    update_expedition_positions : function() {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + '=fixed]', self.scope).each(function() {
        var expedition = $(this),
            top_offset = expedition.data('magellan-top-offset');

        if (window_top_offset >= top_offset) {
          // Placeholder allows height calculations to be consistent even when
          // appearing to switch between fixed/non-fixed placement
          var placeholder = expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']');
          if (placeholder.length === 0) {
            placeholder = expedition.clone();
            placeholder.removeAttr(self.attr_name());
            placeholder.attr(self.add_namespace('data-magellan-expedition-clone'),'');
            expedition.before(placeholder);
          }
          expedition.css({position:'fixed', top: self.settings.fixed_top});
        } else {
          expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']').remove();
          expedition.attr('style','').removeClass('fixed');
        }
      });
    },

    update_arrivals : function() {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + ']', self.scope).each(function() {
        var expedition = $(this),
            settings = expedition.data(self.attr_name(true) + '-init'),
            offsets = self.offsets(expedition, window_top_offset),
            arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']'),
            active_item = false;
        offsets.each(function(idx, item) {
          if (item.viewport_offset >= item.top_offset) {
            var arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']');
            arrivals.not(item.arrival).removeClass(settings.active_class);
            item.arrival.addClass(settings.active_class);
            active_item = true;
            return true;
          }
        });

        if (!active_item) arrivals.removeClass(settings.active_class);
      });
    },

    offsets : function(expedition, window_offset) {
      var self = this,
          settings = expedition.data(self.attr_name(true) + '-init'),
          viewport_offset = window_offset;

      return expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']').map(function(idx, el) {
        var name = $(this).data(self.data_attr('magellan-arrival')),
            dest = $('[' + self.add_namespace('data-magellan-destination') + '=' + name + ']');
        if (dest.length > 0) {
          var top_offset = dest.offset().top - settings.destination_threshold - expedition.outerHeight();
          return {
            destination : dest,
            arrival : $(this),
            top_offset : top_offset,
            viewport_offset : viewport_offset
          }
        }
      }).sort(function(a, b) {
        if (a.top_offset < b.top_offset) return -1;
        if (a.top_offset > b.top_offset) return 1;
        return 0;
      });
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {
      this.S(this.scope).off('.magellan');
      this.S(window).off('.magellan');
    },

    reflow : function () {
      var self = this;
      // remove placeholder expeditions used for height calculation purposes
      $('[' + self.add_namespace('data-magellan-expedition-clone') + ']', self.scope).remove();
    }
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.offcanvas = {
    name : 'offcanvas',

    version : '5.2.3',

    settings : {
      open_method: 'move',
      close_on_click: true
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          move_class = '',
          right_postfix = '',
          left_postfix = '';

      if (this.settings.open_method === 'move') {
        move_class = 'move-';
        right_postfix = 'right';
        left_postfix = 'left';
      } else if (this.settings.open_method === 'overlap') {
        move_class = 'offcanvas-overlap';
      }

      S(this.scope).off('.offcanvas')
        .on('click.fndtn.offcanvas', '.left-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + right_postfix);
        })
        .on('click.fndtn.offcanvas', '.left-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          if (settings.close_on_click) {
            self.hide.call(self, move_class + right_postfix, self.get_wrapper(e));
          }
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + left_postfix);
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          if (settings.close_on_click) {
            self.hide.call(self, move_class + left_postfix, self.get_wrapper(e));
          }
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          self.click_remove_class(e, move_class + left_postfix);
          if (right_postfix) self.click_remove_class(e, move_class + right_postfix);
        });

    },

    toggle: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      if ($off_canvas.is('.' + class_name)) {
        this.hide(class_name, $off_canvas);
      } else {
        this.show(class_name, $off_canvas);
      }
    },

    show: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('open');
      $off_canvas.addClass(class_name);
    },

    hide: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('close');
      $off_canvas.removeClass(class_name);
    },

    click_toggle_class: function(e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.toggle(class_name, $off_canvas);
    },

    click_remove_class: function(e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.hide(class_name, $off_canvas);
    },

    get_settings: function(e) {
      var offcanvas  = this.S(e.target).closest('[' + this.attr_name() + ']');
      return offcanvas.data(this.attr_name(true) + '-init') || this.settings;
    },

    get_wrapper: function(e) {
      var $off_canvas = this.S(e ? e.target : this.scope).closest('.off-canvas-wrap');

      if ($off_canvas.length === 0) {
        $off_canvas = this.S('.off-canvas-wrap');
      }
      return $off_canvas;
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  var noop = function() {};

  var Orbit = function(el, settings) {
    // Don't reinitialize plugin
    if (el.hasClass(settings.slides_container_class)) {
      return this;
    }

    var self = this,
        container,
        slides_container = el,
        number_container,
        bullets_container,
        timer_container,
        idx = 0,
        animate,
        adjust_height_after = false,
        has_init_active = slides_container.find("." + settings.active_slide_class).length > 0;

    self.cache = {};

    self.slides = function() {
      return slides_container.children(settings.slide_selector);
    };

    if (!has_init_active) {self.slides().first().addClass(settings.active_slide_class)};

    self.update_slide_number = function(index) {
      if (settings.slide_number) {
        number_container.find('span:first').text(parseInt(index)+1);
        number_container.find('span:last').text(self.slides().length);
      }
      if (settings.bullets) {
        bullets_container.children().removeClass(settings.bullets_active_class);
        $(bullets_container.children().get(index)).addClass(settings.bullets_active_class);
      }
    };

    self.update_active_link = function(index) {
      var link = $('[data-orbit-link="'+self.slides().eq(index).attr('data-orbit-slide')+'"]');
      link.siblings().removeClass(settings.bullets_active_class);
      link.addClass(settings.bullets_active_class);
    };

    self.build_markup = function() {
      slides_container.wrap('<div class="'+settings.container_class+'"></div>');
      container = slides_container.parent();
      slides_container.addClass(settings.slides_container_class);
      slides_container.addClass(settings.animation);
      
      if (settings.stack_on_small) {
        container.addClass(settings.stack_on_small_class);
      }

      if (settings.navigation_arrows) {
        container.append($('<a href="#"><span></span></a>').addClass(settings.prev_class));
        container.append($('<a href="#"><span></span></a>').addClass(settings.next_class));
      }

      if (settings.timer) {
        timer_container = $('<div>').addClass(settings.timer_container_class);
        timer_container.append('<span>');
        if (settings.timer_show_progress_bar) {
            timer_container.append($('<div>').addClass(settings.timer_progress_class));
        }
        timer_container.addClass(settings.timer_paused_class);
        container.append(timer_container);
      }

      if (settings.slide_number) {
        number_container = $('<div>').addClass(settings.slide_number_class);
        number_container.append('<span></span> ' + settings.slide_number_text + ' <span></span>');
        container.append(number_container);
      }

      if (settings.bullets) {
        bullets_container = $('<ol>').addClass(settings.bullets_container_class);
        container.append(bullets_container);
        bullets_container.wrap('<div class="orbit-bullets-container"></div>');
        self.slides().each(function(idx, el) {
          var bullet = $('<li>').attr('data-orbit-slide', idx)
            .on('click', self.link_bullet);
          bullets_container.append(bullet);
        });
      }

    };

    self._prepare_direction = function(next_idx, current_direction) {
      var dir = 'next';
      if (next_idx <= idx) { dir = 'prev'; }
      
      if (settings.animation === 'slide') {    
        setTimeout(function(){
          slides_container.removeClass("swipe-prev swipe-next");
          if (dir === 'next') {slides_container.addClass("swipe-next");}
          else if (dir === 'prev') {slides_container.addClass("swipe-prev");}
        },0);
      }
      
      var slides = self.slides();
      if (next_idx >= slides.length) {
        if (!settings.circular) return false;
        next_idx = 0;
      } else if (next_idx < 0) {
        if (!settings.circular) return false;
        next_idx = slides.length - 1;
      }
      var current = $(slides.get(idx))
        , next = $(slides.get(next_idx));
      
      return [dir, current, next, next_idx];
    };

    self._goto = function(next_idx, start_timer) {
      if (next_idx === null) {return false;}
      if (self.cache.animating) {return false;}
      if (next_idx === idx) {return false;}
      if (typeof self.cache.timer === 'object') {self.cache.timer.restart();}
      
      var slides = self.slides();
      self.cache.animating = true;
      var res = self._prepare_direction(next_idx)
        , dir = res[0]
        , current = res[1]
        , next = res[2]
        , next_idx = res[3];

      // This means that circular is disabled and we most likely reached the last slide.
      if (res === false) return false;

      slides_container.trigger('before-slide-change.fndtn.orbit');
      settings.before_slide_change();
      idx = next_idx;

      current.css("transitionDuration", settings.animation_speed+"ms");
      next.css("transitionDuration", settings.animation_speed+"ms");
      
      var callback = function() {
        var unlock = function() {
          if (start_timer === true) {self.cache.timer.restart();}
          self.update_slide_number(idx);
          // Remove "animate-in" class as late as possible to avoid "flickering" (especially with variable_height).
          next.removeClass("animate-in");
          next.addClass(settings.active_slide_class);
          self.update_active_link(next_idx);
          slides_container.trigger('after-slide-change.fndtn.orbit',[{slide_number: idx, total_slides: slides.length}]);
          settings.after_slide_change(idx, slides.length);
          setTimeout(function(){
            self.cache.animating = false;
          }, 100);
          
        };
        if (slides_container.height() != next.height() && settings.variable_height) {
          slides_container.animate({'min-height': next.height()}, 250, 'linear', unlock);
        } else {
          unlock();
        }
      };

      if (slides.length === 1) {callback(); return false;}

      var start_animation = function() {
        if (dir === 'next') {animate.next(current, next, callback);}
        if (dir === 'prev') {animate.prev(current, next, callback);}        
      };

      if (next.height() > slides_container.height() && settings.variable_height) {
        slides_container.animate({'min-height': next.height()}, 250, 'linear', start_animation);
      } else {
        start_animation();
      }
    };
    
    self.next = function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._prepare_direction(idx + 1);
      setTimeout(function(){
        self._goto(idx + 1);
    }, 100);
    };
    
    self.prev = function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._prepare_direction(idx - 1);
      setTimeout(function(){
        self._goto(idx - 1)
      }, 100);
    };

    self.link_custom = function(e) {
      e.preventDefault();
      var link = $(this).attr('data-orbit-link');
      if ((typeof link === 'string') && (link = $.trim(link)) != "") {
        var slide = container.find('[data-orbit-slide='+link+']');
        if (slide.index() != -1) {
          setTimeout(function(){
            self._goto(slide.index());
          },100);
        }
      }
    };

    // Click handler for slides and bullets.
    self.link_bullet = function(e) {    
      var index = $(this).attr('data-orbit-slide');
      if ((typeof index === 'string') && (index = $.trim(index)) != "") {
        if(isNaN(parseInt(index)))
        {
          var slide = container.find('[data-orbit-slide='+index+']');
          if (slide.index() != -1) {
            index = slide.index() + 1;
            self._prepare_direction(index);
            setTimeout(function(){
              self._goto(index);
            },100);
          }
        }
        else
        {
          index = parseInt(index);
          self._prepare_direction(index);
          setTimeout(function(){
            self._goto(index);
          },100);
        }
      }
    }

    self.timer_callback = function() {
      self._goto(idx + 1, true);
    }
    
    self.compute_dimensions = function() {
      var current = $(self.slides().get(idx));
      var h = current.height();
      if (!settings.variable_height) {
        self.slides().each(function(){
          if ($(this).height() > h) { h = $(this).height(); }
        });
      }
      slides_container.css('minHeight', String(h)+'px');
    };

    self.create_timer = function() {
      var t = new Timer(
        container.find('.'+settings.timer_container_class), 
        settings, 
        self.timer_callback
      );
      return t;
    };

    self.stop_timer = function() {
      if (typeof self.cache.timer === 'object') self.cache.timer.stop();
    };

    self.toggle_timer = function() {
      var t = container.find('.'+settings.timer_container_class);
      if (t.hasClass(settings.timer_paused_class)) {
        if (typeof self.cache.timer === 'undefined') {self.cache.timer = self.create_timer();}
        self.cache.timer.start();     
      }
      else {
        if (typeof self.cache.timer === 'object') {self.cache.timer.stop();}
      }
    };

    self.init = function() {
      self.build_markup();
      if (settings.timer) {
        self.cache.timer = self.create_timer(); 
        Foundation.utils.image_loaded(this.slides().find('img'), self.cache.timer.start);
      }
      
      animate = new CSSAnimation(settings, slides_container);

      if (has_init_active) {
        var $init_target = slides_container.find("." + settings.active_slide_class),
            animation_speed = settings.animation_speed;
        settings.animation_speed = 1;
        $init_target.removeClass('active');
        self._goto($init_target.index());
        settings.animation_speed = animation_speed;
      }

      container.on('click', '.'+settings.next_class, self.next);
      container.on('click', '.'+settings.prev_class, self.prev);

      if (settings.next_on_click) {
        container.on('click', '.'+settings.slides_container_class+' [data-orbit-slide]', self.link_bullet);
      }
      
      container.on('click', self.toggle_timer);
      if (settings.swipe) {
        slides_container.on('touchstart.fndtn.orbit',function(e) {
          if (self.cache.animating) {return;}
          if (!e.touches) {e = e.originalEvent;}
          e.preventDefault();
          e.stopPropagation();

          self.cache.start_page_x = e.touches[0].pageX;
          self.cache.start_page_y = e.touches[0].pageY;
          self.cache.start_time = (new Date()).getTime();
          self.cache.delta_x = 0;
          self.cache.is_scrolling = null;
          self.cache.direction = null;
          
          self.stop_timer(); // does not appear to prevent callback from occurring          
        })
        .on('touchmove.fndtn.orbit',function(e) {
          if (Math.abs(self.cache.delta_x) > 5) {
            e.preventDefault();
            e.stopPropagation();
          }

          if (self.cache.animating) {return;}          
          requestAnimationFrame(function(){
            if (!e.touches) { e = e.originalEvent; }

            // Ignore pinch/zoom events
            if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

            self.cache.delta_x = e.touches[0].pageX - self.cache.start_page_x;

            if (self.cache.is_scrolling === null) {
              self.cache.is_scrolling = !!( self.cache.is_scrolling || Math.abs(self.cache.delta_x) < Math.abs(e.touches[0].pageY - self.cache.start_page_y) );
            }

            if (self.cache.is_scrolling) {
              return;
            }
            
            var direction = (self.cache.delta_x < 0) ? (idx+1) : (idx-1);
            if (self.cache.direction !== direction) {
              var res = self._prepare_direction(direction);
              self.cache.direction = direction;
              self.cache.dir = res[0];
              self.cache.current = res[1];
              self.cache.next = res[2];
            }

            if (settings.animation === 'slide') {
              var offset, next_offset;
              
              offset = (self.cache.delta_x / container.width()) * 100;
              if (offset >= 0) {next_offset = -(100 - offset);}
              else {next_offset = 100 + offset;}

              self.cache.current.css("transform","translate3d("+offset+"%,0,0)");
              self.cache.next.css("transform","translate3d("+next_offset+"%,0,0)");
            }
          });
        })
        .on('touchend.fndtn.orbit', function(e) {
          if (self.cache.animating) {return;}
          e.preventDefault();
          e.stopPropagation();
          setTimeout(function(){
            self._goto(self.cache.direction);
          }, 50);
        });
      }
      container.on('mouseenter.fndtn.orbit', function(e) {
        if (settings.timer && settings.pause_on_hover) {
          self.stop_timer();
        }
      })
      .on('mouseleave.fndtn.orbit', function(e) {
        if (settings.timer && settings.resume_on_mouseout) {
          self.cache.timer.start();
        }
      });
      
      $(document).on('click', '[data-orbit-link]', self.link_custom);
      $(window).on('load resize', self.compute_dimensions);
      var children = this.slides().find('img');
      Foundation.utils.image_loaded(children, self.compute_dimensions);
      Foundation.utils.image_loaded(children, function() {
        container.prev('.'+settings.preloader_class).css('display', 'none');
        self.update_slide_number(idx);
        self.update_active_link(idx);
        slides_container.trigger('ready.fndtn.orbit');
      });
    };

    self.init();
  };

  var Timer = function(el, settings, callback) {
    var self = this,
        duration = settings.timer_speed,
        progress = el.find('.'+settings.timer_progress_class),
        do_progress = progress && progress.css('display') != 'none',
        start, 
        timeout,
        left = -1;

    this.update_progress = function(w) {
      var new_progress = progress.clone();
      new_progress.attr('style', '');
      new_progress.css('width', w+'%');
      progress.replaceWith(new_progress);
      progress = new_progress;
    };

    this.restart = function() {
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      left = -1;
      if (do_progress) {self.update_progress(0);}
      self.start();
    };

    this.start = function() {
      if (!el.hasClass(settings.timer_paused_class)) {return true;}
      left = (left === -1) ? duration : left;
      el.removeClass(settings.timer_paused_class);
      if (do_progress) {
          start = new Date().getTime();
          progress.animate({'width': '100%'}, left, 'linear');
      }
      timeout = setTimeout(function() {
        self.restart();
        callback();
      }, left);
      el.trigger('timer-started.fndtn.orbit')
    };

    this.stop = function() {
      if (el.hasClass(settings.timer_paused_class)) {return true;}
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      if (do_progress) {
          var end = new Date().getTime();
          left = left - (end - start);
          var w = 100 - ((left / duration) * 100);
          self.update_progress(w);
      }
      el.trigger('timer-stopped.fndtn.orbit');
    };
  };

  var CSSAnimation = function(settings, container) {
    var animation_end = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";

    this.next = function(current, next, callback) {
      if (Modernizr.csstransitions) {
        next.on(animation_end, function(e){
          next.unbind(animation_end);
          current.removeClass("active animate-out");
          container.children().css({
            "transform":"",
            "-ms-transform":"",
            "-webkit-transition-duration":"",
            "-moz-transition-duration": "",
            "-o-transition-duration": "",
            "transition-duration":""
          });
          callback();
        });
      } else {
        setTimeout(function(){
          current.removeClass("active animate-out");
          container.children().css({
            "transform":"",
            "-ms-transform":"",
            "-webkit-transition-duration":"",
            "-moz-transition-duration": "",
            "-o-transition-duration": "",
            "transition-duration":""
          });
          callback();
        }, settings.animation_speed);
      }
      container.children().css({
        "transform":"",
        "-ms-transform":"",
        "-webkit-transition-duration":"",
        "-moz-transition-duration": "",
        "-o-transition-duration": "",
        "transition-duration":""
      });
      current.addClass("animate-out");
      next.addClass("animate-in");
    };

    this.prev = function(current, prev, callback) {
      if (Modernizr.csstransitions) {
        prev.on(animation_end, function(e){
          prev.unbind(animation_end);
          current.removeClass("active animate-out");
          container.children().css({
            "transform":"",
            "-ms-transform":"",
            "-webkit-transition-duration":"",
            "-moz-transition-duration": "",
            "-o-transition-duration": "",
            "transition-duration":""
          });
          callback();
        });
      } else {
        setTimeout(function(){
          current.removeClass("active animate-out");
          container.children().css({
            "transform":"",
            "-ms-transform":"",
            "-webkit-transition-duration":"",
            "-moz-transition-duration": "",
            "-o-transition-duration": "",
            "transition-duration":""
          });
          callback();
        }, settings.animation_speed);
      }
      container.children().css({
        "transform":"",
        "-ms-transform":"",
        "-webkit-transition-duration":"",
        "-moz-transition-duration": "",
        "-o-transition-duration": "",
        "transition-duration":""
      });
      current.addClass("animate-out");
      prev.addClass("animate-in");
    };
  };


  Foundation.libs = Foundation.libs || {};

  Foundation.libs.orbit = {
    name: 'orbit',

    version: '5.2.3',

    settings: {
      animation: 'slide',
      timer_speed: 10000,
      pause_on_hover: true,
      resume_on_mouseout: false,
      next_on_click: true,
      animation_speed: 500,
      stack_on_small: false,
      navigation_arrows: true,
      slide_number: true,
      slide_number_text: 'of',
      container_class: 'orbit-container',
      stack_on_small_class: 'orbit-stack-on-small',
      next_class: 'orbit-next',
      prev_class: 'orbit-prev',
      timer_container_class: 'orbit-timer',
      timer_paused_class: 'paused',
      timer_progress_class: 'orbit-progress',
      timer_show_progress_bar: true,
      slides_container_class: 'orbit-slides-container',
      preloader_class: 'preloader',
      slide_selector: '*',
      bullets_container_class: 'orbit-bullets',
      bullets_active_class: 'active',
      slide_number_class: 'orbit-slide-number',
      caption_class: 'orbit-caption',
      active_slide_class: 'active',
      orbit_transition_class: 'orbit-transitioning',
      bullets: true,
      circular: true,
      timer: true,
      variable_height: false,
      swipe: true,
      before_slide_change: noop,
      after_slide_change: noop
    },

    init : function (scope, method, options) {
      var self = this;
      this.bindings(method, options);
    },

    events : function (instance) {
      var self = this;
      var orbit_instance = new Orbit(this.S(instance), this.S(instance).data('orbit-init'));
      this.S(instance).data(self.name + '-instance', orbit_instance);
    },

    reflow : function () {
      var self = this;

      if (self.S(self.scope).is('[data-orbit]')) {
        var $el = self.S(self.scope);
        var instance = $el.data(self.name + '-instance');
        instance.compute_dimensions();
      } else {
        self.S('[data-orbit]', self.scope).each(function(idx, el) {
          var $el = self.S(el);
          var opts = self.data_options($el);
          var instance = $el.data(self.name + '-instance');
          instance.compute_dimensions();
        });
      }
    }
  };

    
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.reveal = {
    name : 'reveal',

    version : '5.2.3',

    locked : false,

    settings : {
      animation: 'fadeAndPop',
      animation_speed: 250,
      close_on_background_click: true,
      close_on_esc: true,
      dismiss_modal_class: 'close-reveal-modal',
      bg_class: 'reveal-modal-bg',
      open: function(){},
      opened: function(){},
      close: function(){},
      closed: function(){},
      bg : $('.reveal-modal-bg'),
      css : {
        open : {
          'opacity': 0,
          'visibility': 'visible',
          'display' : 'block'
        },
        close : {
          'opacity': 1,
          'visibility': 'hidden',
          'display': 'none'
        }
      }
    },

    init : function (scope, method, options) {
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.reveal')
        .on('click.fndtn.reveal', '[' + this.add_namespace('data-reveal-id') + ']', function (e) {
          e.preventDefault();

          if (!self.locked) {
            var element = S(this),
                ajax = element.data(self.data_attr('reveal-ajax'));

            self.locked = true;

            if (typeof ajax === 'undefined') {
              self.open.call(self, element);
            } else {
              var url = ajax === true ? element.attr('href') : ajax;

              self.open.call(self, element, {url: url});
            }
          }
        });

      S(document)
        .on('touchend.fndtn.reveal click.fndtn.reveal', this.close_targets(), function (e) {

          e.preventDefault();

          if (!self.locked) {
            var settings = S('[' + self.attr_name() + '].open').data(self.attr_name(true) + '-init'),
                bg_clicked = S(e.target)[0] === S('.' + settings.bg_class)[0];

            if (bg_clicked) {
              if (settings.close_on_background_click) {
                e.stopPropagation();
              } else {
                return;
              }
            }

            self.locked = true;
            self.close.call(self, bg_clicked ? S('[' + self.attr_name() + '].open') : S(this).closest('[' + self.attr_name() + ']'));
          }
        });

      if(S('[' + self.attr_name() + ']', this.scope).length > 0) {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', this.settings.open)
          .on('opened.fndtn.reveal', this.settings.opened)
          .on('opened.fndtn.reveal', this.open_video)
          .on('close.fndtn.reveal', this.settings.close)
          .on('closed.fndtn.reveal', this.settings.closed)
          .on('closed.fndtn.reveal', this.close_video);
      } else {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.open)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.opened)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.open_video)
          .on('close.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.close)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.closed)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.close_video);
      }

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_on : function (scope) {
      var self = this;

      // PATCH #1: fixing multiple keyup event trigger from single key press
      self.S('body').off('keyup.fndtn.reveal').on('keyup.fndtn.reveal', function ( event ) {
        var open_modal = self.S('[' + self.attr_name() + '].open'),
            settings = open_modal.data(self.attr_name(true) + '-init');
        // PATCH #2: making sure that the close event can be called only while unlocked,
        //           so that multiple keyup.fndtn.reveal events don't prevent clean closing of the reveal window.
        if ( settings && event.which === 27  && settings.close_on_esc && !self.locked) { // 27 is the keycode for the Escape key
          self.close.call(self, open_modal);
        }
      });

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_off : function (scope) {
      this.S('body').off('keyup.fndtn.reveal');
      return true;
    },

    open : function (target, ajax_settings) {
      var self = this,
          modal;

      if (target) {
        if (typeof target.selector !== 'undefined') {
          // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
          modal = self.S('#' + target.data(self.data_attr('reveal-id'))).first();
        } else {
          modal = self.S(this.scope);

          ajax_settings = target;
        }
      } else {
        modal = self.S(this.scope);
      }

      var settings = modal.data(self.attr_name(true) + '-init');
      settings = settings || this.settings;

      if (!modal.hasClass('open')) {
        var open_modal = self.S('[' + self.attr_name() + '].open');

        if (typeof modal.data('css-top') === 'undefined') {
          modal.data('css-top', parseInt(modal.css('top'), 10))
            .data('offset', this.cache_offset(modal));
        }

        this.key_up_on(modal);    // PATCH #3: turning on key up capture only when a reveal window is open
        modal.trigger('open');

        if (open_modal.length < 1) {
          this.toggle_bg(modal, true);
        }

        if (typeof ajax_settings === 'string') {
          ajax_settings = {
            url: ajax_settings
          };
        }

        if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
          if (open_modal.length > 0) {
            this.hide(open_modal, settings.css.close);
          }

          this.show(modal, settings.css.open);
        } else {
          var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;

          $.extend(ajax_settings, {
            success: function (data, textStatus, jqXHR) {
              if ( $.isFunction(old_success) ) {
                old_success(data, textStatus, jqXHR);
              }

              modal.html(data);
              self.S(modal).foundation('section', 'reflow');
              self.S(modal).children().foundation();

              if (open_modal.length > 0) {
                self.hide(open_modal, settings.css.close);
              }
              self.show(modal, settings.css.open);
            }
          });

          $.ajax(ajax_settings);
        }
      }
    },

    close : function (modal) {
      var modal = modal && modal.length ? modal : this.S(this.scope),
          open_modals = this.S('[' + this.attr_name() + '].open'),
          settings = modal.data(this.attr_name(true) + '-init') || this.settings;

      if (open_modals.length > 0) {
        this.locked = true;
        this.key_up_off(modal);   // PATCH #3: turning on key up capture only when a reveal window is open
        modal.trigger('close');
        this.toggle_bg(modal, false);
        this.hide(open_modals, settings.css.close, settings);
      }
    },

    close_targets : function () {
      var base = '.' + this.settings.dismiss_modal_class;

      if (this.settings.close_on_background_click) {
        return base + ', .' + this.settings.bg_class;
      }

      return base;
    },

    toggle_bg : function (modal, state) {
      if (this.S('.' + this.settings.bg_class).length === 0) {
        this.settings.bg = $('<div />', {'class': this.settings.bg_class})
          .appendTo('body').hide();
      }

      var visible = this.settings.bg.filter(':visible').length > 0;
      if ( state != visible ) {
        if ( state == undefined ? visible : !state ) {
          this.hide(this.settings.bg);
        } else {
          this.show(this.settings.bg);
        }
      }
    },

    show : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init');
        settings = settings || this.settings;

        if (el.parent('body').length === 0) {
          var placeholder = el.wrap('<div style="display: none;" />').parent(),
              rootElement = this.settings.rootElement || 'body';

          el.on('closed.fndtn.reveal.wrapped', function() {
            el.detach().appendTo(placeholder);
            el.unwrap().unbind('closed.fndtn.reveal.wrapped');
          });

          el.detach().appendTo(rootElement);
        }

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          css.top = $(window).scrollTop() - el.data('offset') + 'px';
          var end_css = {
            top: $(window).scrollTop() + el.data('css-top') + 'px',
            opacity: 1
          };

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.trigger('opened');
              }.bind(this))
              .addClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        if (animData.fade) {
          css.top = $(window).scrollTop() + el.data('css-top') + 'px';
          var end_css = {opacity: 1};

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.trigger('opened');
              }.bind(this))
              .addClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        return el.css(css).show().css({opacity: 1}).addClass('open').trigger('opened');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeIn(settings.animation_speed / 2);
      }

      this.locked = false;

      return el.show();
    },

    hide : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init');
        settings = settings || this.settings;

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          var end_css = {
            top: - $(window).scrollTop() - el.data('offset') + 'px',
            opacity: 0
          };

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.css(css).trigger('closed');
              }.bind(this))
              .removeClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        if (animData.fade) {
          var end_css = {opacity: 0};

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.css(css).trigger('closed');
              }.bind(this))
              .removeClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        return el.hide().css(css).removeClass('open').trigger('closed');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeOut(settings.animation_speed / 2);
      }

      return el.hide();
    },

    close_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = $('iframe', video);

      if (iframe.length > 0) {
        iframe.attr('data-src', iframe[0].src);
        iframe.attr('src', 'about:blank');
        video.hide();
      }
    },

    open_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = video.find('iframe');

      if (iframe.length > 0) {
        var data_src = iframe.attr('data-src');
        if (typeof data_src === 'string') {
          iframe[0].src = iframe.attr('data-src');
        } else {
          var src = iframe[0].src;
          iframe[0].src = undefined;
          iframe[0].src = src;
        }
        video.show();
      }
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    cache_offset : function (modal) {
      var offset = modal.show().height() + parseInt(modal.css('top'), 10);

      modal.hide();

      return offset;
    },

    off : function () {
      $(this.scope).off('.fndtn.reveal');
    },

    reflow : function () {}
  };

  /*
   * getAnimationData('popAndFade') // {animate: true,  pop: true,  fade: true}
   * getAnimationData('fade')       // {animate: true,  pop: false, fade: true}
   * getAnimationData('pop')        // {animate: true,  pop: true,  fade: false}
   * getAnimationData('foo')        // {animate: false, pop: false, fade: false}
   * getAnimationData(null)         // {animate: false, pop: false, fade: false}
   */
  function getAnimationData(str) {
    var fade = /fade/i.test(str);
    var pop = /pop/i.test(str);
    return {
      animate: fade || pop,
      pop: pop,
      fade: fade
    };
  }
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.slider = {
    name : 'slider',

    version : '5.2.3',

    settings: {
      start: 0,
      end: 100,
      step: 1,
      initial: null,
      display_selector: '',
      on_change: function(){}
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this,'throttle');
      this.bindings(method, options);
      this.reflow();
    },

    events : function() {
      var self = this;

      $(this.scope)
        .off('.slider')
        .on('mousedown.fndtn.slider touchstart.fndtn.slider pointerdown.fndtn.slider',
        '[' + self.attr_name() + '] .range-slider-handle', function(e) {
          if (!self.cache.active) {
            e.preventDefault();
            self.set_active_slider($(e.target));
          }
        })
        .on('mousemove.fndtn.slider touchmove.fndtn.slider pointermove.fndtn.slider', function(e) {
          if (!!self.cache.active) {
            e.preventDefault();
            self.calculate_position(self.cache.active, e.pageX || e.originalEvent.clientX || e.originalEvent.touches[0].clientX || e.currentPoint.x);
          }
        })
        .on('mouseup.fndtn.slider touchend.fndtn.slider pointerup.fndtn.slider', function(e) {
          self.remove_active_slider();
        })
        .on('change.fndtn.slider', function(e) {
          self.settings.on_change();
        });

      self.S(window)
        .on('resize.fndtn.slider', self.throttle(function(e) {
          self.reflow();
        }, 300));
    },

    set_active_slider : function($handle) {
      this.cache.active = $handle;
    },

    remove_active_slider : function() {
      this.cache.active = null;
    },

    calculate_position : function($handle, cursor_x) {
      var self = this,
          settings = $.extend({}, self.settings, self.data_options($handle.parent())),
          handle_w = $.data($handle[0], 'handle_w'),
          handle_o = $.data($handle[0], 'handle_o'),
          bar_w = $.data($handle[0], 'bar_w'),
          bar_o = $.data($handle[0], 'bar_o');

      requestAnimationFrame(function(){
        var pct;

        if (Foundation.rtl) {
          pct = self.limit_to(((bar_o+bar_w-cursor_x)/bar_w),0,1);
        } else {
          pct = self.limit_to(((cursor_x-bar_o)/bar_w),0,1);
        }

        var norm = self.normalized_value(pct, settings.start, settings.end, settings.step);

        self.set_ui($handle, norm);
      });
    },

    set_ui : function($handle, value) {
      var settings = $.extend({}, this.settings, this.data_options($handle.parent())),
          handle_w = $.data($handle[0], 'handle_w'),
          bar_w = $.data($handle[0], 'bar_w'),
          norm_pct = this.normalized_percentage(value, settings.start, settings.end),
          handle_offset = norm_pct*(bar_w-handle_w)-1,
          progress_bar_width = norm_pct*100;

      if (Foundation.rtl) {
        handle_offset = -handle_offset;
      }

      this.set_translate($handle, handle_offset);
      $handle.siblings('.range-slider-active-segment').css('width', progress_bar_width+'%');

      $handle.parent().attr(this.attr_name(), value);
      $handle.parent().trigger('change');

      $handle.parent().children('input[type=hidden]').val(value);

      if (settings.input_id != '') {
        $(settings.display_selector).each(function(){
          if (this.hasOwnProperty('value')) {
            $(this).val(value);
          } else {
            $(this).text(value);
          }
        });
      }

    },

    normalized_percentage : function(val, start, end) {
      return (val - start)/(end - start);
    },

    normalized_value : function(val, start, end, step) {
      var range = end - start,
          point = val*range,
          mod = (point-(point%step)) / step,
          rem = point % step,
          round = ( rem >= step*0.5 ? step : 0);
      return (mod*step + round) + start;
    },

    set_translate : function(ele, offset, vertical) {
      if (vertical) {
        $(ele)
          .css('-webkit-transform', 'translateY('+offset+'px)')
          .css('-moz-transform', 'translateY('+offset+'px)')
          .css('-ms-transform', 'translateY('+offset+'px)')
          .css('-o-transform', 'translateY('+offset+'px)')
          .css('transform', 'translateY('+offset+'px)');
      } else {
        $(ele)
          .css('-webkit-transform', 'translateX('+offset+'px)')
          .css('-moz-transform', 'translateX('+offset+'px)')
          .css('-ms-transform', 'translateX('+offset+'px)')
          .css('-o-transform', 'translateX('+offset+'px)')
          .css('transform', 'translateX('+offset+'px)');
      }
    },

    limit_to : function(val, min, max) {
      return Math.min(Math.max(val, min), max);
    },

    initialize_settings : function(handle) {
      $.data(handle, 'bar', $(handle).parent());
      $.data(handle, 'bar_o', $(handle).parent().offset().left);
      $.data(handle, 'bar_w', $(handle).parent().outerWidth());
      $.data(handle, 'handle_o', $(handle).offset().left);
      $.data(handle, 'handle_w', $(handle).outerWidth());
      $.data(handle, 'settings', $.extend({}, this.settings, this.data_options($(handle).parent())));
    },

    set_initial_position : function($ele) {
      var settings = $.data($ele.children('.range-slider-handle')[0], 'settings'),
          initial = (!!settings.initial ? settings.initial : Math.floor((settings.end-settings.start)*0.5/settings.step)*settings.step+settings.start),
          $handle = $ele.children('.range-slider-handle');
      this.set_ui($handle, initial);
    },

    set_value : function(value) {
      var self = this;
      $('[' + self.attr_name() + ']', this.scope).each(function(){
        $(this).attr(self.attr_name(), value);
      });
      if (!!$(this.scope).attr(self.attr_name())) {
        $(this.scope).attr(self.attr_name(), value);
      }
      self.reflow();
    },

    reflow : function() {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function() {
        var handle = $(this).children('.range-slider-handle')[0],
            val = $(this).attr(self.attr_name());
        self.initialize_settings(handle);

        if (val) {
          self.set_ui($(handle), parseFloat(val));
        } else {
          self.set_initial_position($(this));
        }
      });
    }

  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tab = {
    name : 'tab',

    version : '5.2.3',

    settings : {
      active_class: 'active',
      callback : function () {},
      deep_linking: false,
      scroll_to_content: true,
      is_hover: false
    },

    default_tab_hashes: [],

    init : function (scope, method, options) {
      var self = this,
          S = this.S;

      this.bindings(method, options);
      this.handle_location_hash_change();

      // Store the default active tabs which will be referenced when the
      // location hash is absent, as in the case of navigating the tabs and
      // returning to the first viewing via the browser Back button.
      S('[' + this.attr_name() + '] > .active > a', this.scope).each(function () {
        self.default_tab_hashes.push(this.hash);
      });
    },

    events : function () {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.tab')
        // Click event: tab title
        .on('click.fndtn.tab', '[' + this.attr_name() + '] > * > a', function (e) {
          var settings = S(this).closest('[' + self.attr_name() +']').data(self.attr_name(true) + '-init');
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            e.stopPropagation();
            self.toggle_active_tab(S(this).parent());
          }
        })
        // Hover event: tab title
        .on('mouseenter.fndtn.tab', '[' + this.attr_name() + '] > * > a', function (e) {
          var settings = S(this).closest('[' + self.attr_name() +']').data(self.attr_name(true) + '-init');
          if (settings.is_hover) self.toggle_active_tab(S(this).parent());
        });

      // Location hash change event
      S(window).on('hashchange.fndtn.tab', function (e) {
        e.preventDefault();
        self.handle_location_hash_change();
      });
    },

    handle_location_hash_change : function () {
      var self = this,
          S = this.S;

      S('[' + this.attr_name() + ']', this.scope).each(function () {
        var settings = S(this).data(self.attr_name(true) + '-init');
        if (settings.deep_linking) {
          // Match the location hash to a label
          var hash = self.scope.location.hash;
          if (hash != '') {
            // Check whether the location hash references a tab content div or
            // another element on the page (inside or outside the tab content div)
            var hash_element = S(hash);
            if (hash_element.hasClass('content') && hash_element.parent().hasClass('tab-content')) {
              // Tab content div
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + hash + ']').parent());
            } else {
              // Not the tab content div. If inside the tab content, find the
              // containing tab and toggle it as active.
              var hash_tab_container_id = hash_element.closest('.content').attr('id');
              if (hash_tab_container_id != undefined) {
                self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=#' + hash_tab_container_id + ']').parent(), hash);
              }
            }
          } else {
            // Reference the default tab hashes which were initialized in the init function
            for (var ind in self.default_tab_hashes) {
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + self.default_tab_hashes[ind] + ']').parent());
            }
          }
        }
       });
     },

    toggle_active_tab: function (tab, location_hash) {
      var S = this.S,
          tabs = tab.closest('[' + this.attr_name() + ']'),
          anchor = tab.children('a').first(),
          target_hash = '#' + anchor.attr('href').split('#')[1],
          target = S(target_hash),
          siblings = tab.siblings(),
          settings = tabs.data(this.attr_name(true) + '-init');

      // allow usage of data-tab-content attribute instead of href
      if (S(this).data(this.data_attr('tab-content'))) {
        target_hash = '#' + S(this).data(this.data_attr('tab-content')).split('#')[1];
        target = S(target_hash);
      }

      if (settings.deep_linking) {
        // Get the scroll Y position prior to moving to the hash ID
        var cur_ypos = $('body,html').scrollTop();

        // Update the location hash to preserve browser history
        // Note that the hash does not need to correspond to the
        // tab content ID anchor; it can be an ID inside or outside of the tab
        // content div.
        if (location_hash != undefined) {
          window.location.hash = location_hash;
        } else {
          window.location.hash = target_hash;
        }

        if (settings.scroll_to_content) {
          // If the user is requesting the content of a tab, then scroll to the
          // top of the title area; otherwise, scroll to the element within
          // the content area as defined by the hash value.
          if (location_hash == undefined || location_hash == target_hash) {
            tab.parent()[0].scrollIntoView();
          } else {
            S(target_hash)[0].scrollIntoView();
          }
        } else {
          // Adjust the scrollbar to the Y position prior to setting the hash
          // Only do this for the tab content anchor, otherwise there will be
          // conflicts with in-tab anchor links nested in the tab-content div
          if (location_hash == undefined || location_hash == target_hash) {
            $('body,html').scrollTop(cur_ypos);
          }
        }
      }

      // WARNING: The activation and deactivation of the tab content must
      // occur after the deep linking in order to properly refresh the browser
      // window (notably in Chrome).
      tab.addClass(settings.active_class).triggerHandler('opened');
      siblings.removeClass(settings.active_class);
      target.siblings().removeClass(settings.active_class).end().addClass(settings.active_class);
      settings.callback(tab);
      target.triggerHandler('toggled', [tab]);
      tabs.triggerHandler('toggled', [target]);
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tooltip = {
    name : 'tooltip',

    version : '5.2.3',

    settings : {
      additional_inheritable_classes : [],
      tooltip_class : '.tooltip',
      append_to: 'body',
      touch_close_text: 'Tap To Close',
      disable_for_touch: false,
      hover_delay: 200,
      show_on : 'all',
      tip_template : function (selector, content) {
        return '<span data-selector="' + selector + '" class="'
          + Foundation.libs.tooltip.settings.tooltip_class.substring(1)
          + '">' + content + '<span class="nub"></span></span>';
      }
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this, 'random_str');
      this.bindings(method, options);
    },

    should_show: function (target, tip) {
      var settings = $.extend({}, this.settings, this.data_options(target));

      if (settings.show_on === 'all') {
        return true;
      } else if (this.small() && settings.show_on === 'small') {
        return true;
      } else if (this.medium() && settings.show_on === 'medium') {
        return true;
      } else if (this.large() && settings.show_on === 'large') {
        return true;
      }
      return false;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    events : function (instance) {
      var self = this,
          S = self.S;

      self.create(this.S(instance));

      $(this.scope)
        .off('.tooltip')
        .on('mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip',
          '[' + this.attr_name() + ']', function (e) {
          var $this = S(this),
              settings = $.extend({}, self.settings, self.data_options($this)),
              is_touch = false;

          if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type) && S(e.target).is('a')) {
            return false;
          }

          if (/mouse/i.test(e.type) && self.ie_touch(e)) return false;

          if ($this.hasClass('open')) {
            if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) e.preventDefault();
            self.hide($this);
          } else {
            if (settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              return;
            } else if(!settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              e.preventDefault();
              S(settings.tooltip_class + '.open').hide();
              is_touch = true;
            }

            if (/enter|over/i.test(e.type)) {
              this.timer = setTimeout(function () {
                var tip = self.showTip($this);
              }.bind(this), self.settings.hover_delay);
            } else if (e.type === 'mouseout' || e.type === 'mouseleave') {
              clearTimeout(this.timer);
              self.hide($this);
            } else {
              self.showTip($this);
            }
          }
        })
        .on('mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', '[' + this.attr_name() + '].open', function (e) {
          if (/mouse/i.test(e.type) && self.ie_touch(e)) return false;

          if($(this).data('tooltip-open-event-type') == 'touch' && e.type == 'mouseleave') {
            return;
          }
          else if($(this).data('tooltip-open-event-type') == 'mouse' && /MSPointerDown|touchstart/i.test(e.type)) {
            self.convert_to_touch($(this));
          } else {
            self.hide($(this));
          }
        })
        .on('DOMNodeRemoved DOMAttrModified', '[' + this.attr_name() + ']:not(a)', function (e) {
          self.hide(S(this));
        });
    },

    ie_touch : function (e) {
      // How do I distinguish between IE11 and Windows Phone 8?????
      return false;
    },

    showTip : function ($target) {
      var $tip = this.getTip($target);
      if (this.should_show($target, $tip)){
        return this.show($target);
      }
      return;
    },

    getTip : function ($target) {
      var selector = this.selector($target),
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip = null;

      if (selector) {
        tip = this.S('span[data-selector="' + selector + '"]' + settings.tooltip_class);
      }

      return (typeof tip === 'object') ? tip : false;
    },

    selector : function ($target) {
      var id = $target.attr('id'),
          dataSelector = $target.attr(this.attr_name()) || $target.attr('data-selector');

      if ((id && id.length < 1 || !id) && typeof dataSelector != 'string') {
        dataSelector = this.random_str(6);
        $target.attr('data-selector', dataSelector);
      }

      return (id && id.length > 0) ? id : dataSelector;
    },

    create : function ($target) {
      var self = this,
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip_template = this.settings.tip_template;

      if (typeof settings.tip_template === 'string' && window.hasOwnProperty(settings.tip_template)) {
        tip_template = window[settings.tip_template];
      }

      var $tip = $(tip_template(this.selector($target), $('<div></div>').html($target.attr('title')).html())),
          classes = this.inheritable_classes($target);

      $tip.addClass(classes).appendTo(settings.append_to);

      if (Modernizr.touch) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', function(e) {
          self.hide($target);
        });
      }

      $target.removeAttr('title').attr('title','');
    },

    reposition : function (target, tip, classes) {
      var width, nub, nubHeight, nubWidth, column, objPos;

      tip.css('visibility', 'hidden').show();

      width = target.data('width');
      nub = tip.children('.nub');
      nubHeight = nub.outerHeight();
      nubWidth = nub.outerHeight();

      if (this.small()) {
        tip.css({'width' : '100%' });
      } else {
        tip.css({'width' : (width) ? width : 'auto'});
      }

      objPos = function (obj, top, right, bottom, left, width) {
        return obj.css({
          'top' : (top) ? top : 'auto',
          'bottom' : (bottom) ? bottom : 'auto',
          'left' : (left) ? left : 'auto',
          'right' : (right) ? right : 'auto'
        }).end();
      };

      objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', target.offset().left);

      if (this.small()) {
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', 12.5, $(this.scope).width());
        tip.addClass('tip-override');
        objPos(nub, -nubHeight, 'auto', 'auto', target.offset().left);
      } else {
        var left = target.offset().left;
        if (Foundation.rtl) {
          nub.addClass('rtl');
          left = target.offset().left + target.outerWidth() - tip.outerWidth();
        }
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', left);
        tip.removeClass('tip-override');
        if (classes && classes.indexOf('tip-top') > -1) {
          if (Foundation.rtl) nub.addClass('rtl');
          objPos(tip, (target.offset().top - tip.outerHeight()), 'auto', 'auto', left)
            .removeClass('tip-override');
        } else if (classes && classes.indexOf('tip-left') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left - tip.outerWidth() - nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        } else if (classes && classes.indexOf('tip-right') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left + target.outerWidth() + nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        }
      }

      tip.css('visibility', 'visible').hide();
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    inheritable_classes : function ($target) {
      var settings = $.extend({}, this.settings, this.data_options($target)),
          inheritables = ['tip-top', 'tip-left', 'tip-bottom', 'tip-right', 'radius', 'round'].concat(settings.additional_inheritable_classes),
          classes = $target.attr('class'),
          filtered = classes ? $.map(classes.split(' '), function (el, i) {
            if ($.inArray(el, inheritables) !== -1) {
              return el;
            }
          }).join(' ') : '';

      return $.trim(filtered);
    },

    convert_to_touch : function($target) {
      var self = this,
          $tip = self.getTip($target),
          settings = $.extend({}, self.settings, self.data_options($target));

      if ($tip.find('.tap-to-close').length === 0) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('click.fndtn.tooltip.tapclose touchstart.fndtn.tooltip.tapclose MSPointerDown.fndtn.tooltip.tapclose', function(e) {
          self.hide($target);
        });
      }

      $target.data('tooltip-open-event-type', 'touch');
    },

    show : function ($target) {
      var $tip = this.getTip($target);

      if ($target.data('tooltip-open-event-type') == 'touch') {
        this.convert_to_touch($target);
      }

      this.reposition($target, $tip, $target.attr('class'));
      $target.addClass('open');
      $tip.fadeIn(150);
    },

    hide : function ($target) {
      var $tip = this.getTip($target);

      $tip.fadeOut(150, function() {
        $tip.find('.tap-to-close').remove();
        $tip.off('click.fndtn.tooltip.tapclose touchstart.fndtn.tooltip.tapclose MSPointerDown.fndtn.tapclose');
        $target.removeClass('open');
      });
    },

    off : function () {
      var self = this;
      this.S(this.scope).off('.fndtn.tooltip');
      this.S(this.settings.tooltip_class).each(function (i) {
        $('[' + self.attr_name() + ']').eq(i).attr('title', $(this).text());
      }).remove();
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.topbar = {
    name : 'topbar',

    version: '5.2.3',

    settings : {
      index : 0,
      sticky_class : 'sticky',
      custom_back_text: true,
      back_text: 'Back',
      is_hover: true,
      mobile_show_parent_link: false,
      scrolltop : true, // jump to top when sticky nav menu toggle is clicked
      sticky_on : 'all'
    },

    init : function (section, method, options) {
      Foundation.inherit(this, 'add_custom_rule register_media throttle');
      var self = this;

      self.register_media('topbar', 'foundation-mq-topbar');

      this.bindings(method, options);

      self.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var topbar = $(this),
            settings = topbar.data(self.attr_name(true) + '-init'),
            section = self.S('section', this);
        topbar.data('index', 0);
        var topbarContainer = topbar.parent();
        if (topbarContainer.hasClass('fixed') || self.is_sticky(topbar, topbarContainer, settings) ) {
          self.settings.sticky_class = settings.sticky_class;
          self.settings.sticky_topbar = topbar;
          topbar.data('height', topbarContainer.outerHeight());
          topbar.data('stickyoffset', topbarContainer.offset().top);
        } else {
          topbar.data('height', topbar.outerHeight());
        }

        if (!settings.assembled) {
          self.assemble(topbar);
        }

        if (settings.is_hover) {
          self.S('.has-dropdown', topbar).addClass('not-click');
        } else {
          self.S('.has-dropdown', topbar).removeClass('not-click');
        }

        // Pad body when sticky (scrolled) or fixed.
        self.add_custom_rule('.f-topbar-fixed { padding-top: ' + topbar.data('height') + 'px }');

        if (topbarContainer.hasClass('fixed')) {
          self.S('body').addClass('f-topbar-fixed');
        }
      });

    },

    is_sticky: function (topbar, topbarContainer, settings) {
      var sticky = topbarContainer.hasClass(settings.sticky_class);

      if (sticky && settings.sticky_on === 'all') {
        return true;
      } else if (sticky && this.small() && settings.sticky_on === 'small') {
        return true;
      } else if (sticky && this.medium() && settings.sticky_on === 'medium') {
        return true;
      } else if (sticky && this.large() && settings.sticky_on === 'large') {
        return true;
      }

      return false;
    },

    toggle: function (toggleEl) {
      var self = this,
          topbar;

      if (toggleEl) {
        topbar = self.S(toggleEl).closest('[' + this.attr_name() + ']');
      } else {
        topbar = self.S('[' + this.attr_name() + ']');
      }

      var settings = topbar.data(this.attr_name(true) + '-init');

      var section = self.S('section, .section', topbar);

      if (self.breakpoint()) {
        if (!self.rtl) {
          section.css({left: '0%'});
          $('>.name', section).css({left: '100%'});
        } else {
          section.css({right: '0%'});
          $('>.name', section).css({right: '100%'});
        }

        self.S('li.moved', section).removeClass('moved');
        topbar.data('index', 0);

        topbar
          .toggleClass('expanded')
          .css('height', '');
      }

      if (settings.scrolltop) {
        if (!topbar.hasClass('expanded')) {
          if (topbar.hasClass('fixed')) {
            topbar.parent().addClass('fixed');
            topbar.removeClass('fixed');
            self.S('body').addClass('f-topbar-fixed');
          }
        } else if (topbar.parent().hasClass('fixed')) {
          if (settings.scrolltop) {
            topbar.parent().removeClass('fixed');
            topbar.addClass('fixed');
            self.S('body').removeClass('f-topbar-fixed');

            window.scrollTo(0,0);
          } else {
            topbar.parent().removeClass('expanded');
          }
        }
      } else {
        if (self.is_sticky(topbar, topbar.parent(), settings)) {
          topbar.parent().addClass('fixed');
        }

        if (topbar.parent().hasClass('fixed')) {
          if (!topbar.hasClass('expanded')) {
            topbar.removeClass('fixed');
            topbar.parent().removeClass('expanded');
            self.update_sticky_positioning();
          } else {
            topbar.addClass('fixed');
            topbar.parent().addClass('expanded');
            self.S('body').addClass('f-topbar-fixed');
          }
        }
      }
    },

    timer : null,

    events : function (bar) {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.topbar')
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .toggle-topbar', function (e) {
          e.preventDefault();
          self.toggle(this);
        })
        .on('click.fndtn.topbar','.top-bar .top-bar-section li a[href^="#"],[' + this.attr_name() + '] .top-bar-section li a[href^="#"]',function (e) {
            var li = $(this).closest('li');
            if(self.breakpoint() && !li.hasClass('back') && !li.hasClass('has-dropdown'))
            {
            self.toggle();
            }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] li.has-dropdown', function (e) {
          var li = S(this),
              target = S(e.target),
              topbar = li.closest('[' + self.attr_name() + ']'),
              settings = topbar.data(self.attr_name(true) + '-init');

          if(target.data('revealId')) {
            self.toggle();
            return;
          }

          if (self.breakpoint()) return;
          if (settings.is_hover && !Modernizr.touch) return;

          e.stopImmediatePropagation();

          if (li.hasClass('hover')) {
            li
              .removeClass('hover')
              .find('li')
              .removeClass('hover');

            li.parents('li.hover')
              .removeClass('hover');
          } else {
            li.addClass('hover');

            $(li).siblings().removeClass('hover');

            if (target[0].nodeName === 'A' && target.parent().hasClass('has-dropdown')) {
              e.preventDefault();
            }
          }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown>a', function (e) {
          if (self.breakpoint()) {

            e.preventDefault();

            var $this = S(this),
                topbar = $this.closest('[' + self.attr_name() + ']'),
                section = topbar.find('section, .section'),
                dropdownHeight = $this.next('.dropdown').outerHeight(),
                $selectedLi = $this.closest('li');

            topbar.data('index', topbar.data('index') + 1);
            $selectedLi.addClass('moved');

            if (!self.rtl) {
              section.css({left: -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({left: 100 * topbar.data('index') + '%'});
            } else {
              section.css({right: -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({right: 100 * topbar.data('index') + '%'});
            }

            topbar.css('height', $this.siblings('ul').outerHeight(true) + topbar.data('height'));
          }
        });
      
      S(window).off('.topbar').on('resize.fndtn.topbar', self.throttle(function () {
        self.resize.call(self);
      }, 50)).trigger('resize');

      S('body').off('.topbar').on('click.fndtn.topbar touchstart.fndtn.topbar', function (e) {
        var parent = S(e.target).closest('li').closest('li.hover');

        if (parent.length > 0) {
          return;
        }

        S('[' + self.attr_name() + '] li.hover').removeClass('hover');
      });

      // Go up a level on Click
      S(this.scope).on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = S(this),
            topbar = $this.closest('[' + self.attr_name() + ']'),
            section = topbar.find('section, .section'),
            settings = topbar.data(self.attr_name(true) + '-init'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        topbar.data('index', topbar.data('index') - 1);

        if (!self.rtl) {
          section.css({left: -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({left: 100 * topbar.data('index') + '%'});
        } else {
          section.css({right: -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({right: 100 * topbar.data('index') + '%'});
        }

        if (topbar.data('index') === 0) {
          topbar.css('height', '');
        } else {
          topbar.css('height', $previousLevelUl.outerHeight(true) + topbar.data('height'));
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });
    },

    resize : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var topbar = self.S(this),
            settings = topbar.data(self.attr_name(true) + '-init');

        var stickyContainer = topbar.parent('.' + self.settings.sticky_class);
        var stickyOffset;

        if (!self.breakpoint()) {
          var doToggle = topbar.hasClass('expanded');
          topbar
            .css('height', '')
            .removeClass('expanded')
            .find('li')
            .removeClass('hover');

            if(doToggle) {
              self.toggle(topbar);
            }
        }

        if(self.is_sticky(topbar, stickyContainer, settings)) {
          if(stickyContainer.hasClass('fixed')) {
            // Remove the fixed to allow for correct calculation of the offset.
            stickyContainer.removeClass('fixed');

            stickyOffset = stickyContainer.offset().top;
            if(self.S(document.body).hasClass('f-topbar-fixed')) {
              stickyOffset -= topbar.data('height');
            }

            topbar.data('stickyoffset', stickyOffset);
            stickyContainer.addClass('fixed');
          } else {
            stickyOffset = stickyContainer.offset().top;
            topbar.data('stickyoffset', stickyOffset);
          }
        }

      });
    },

    breakpoint : function () {
      return !matchMedia(Foundation.media_queries['topbar']).matches;
    },

    small : function () {
      return matchMedia(Foundation.media_queries['small']).matches;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    assemble : function (topbar) {
      var self = this,
          settings = topbar.data(this.attr_name(true) + '-init'),
          section = self.S('section', topbar);

      // Pull element out of the DOM for manipulation
      section.detach();

      self.S('.has-dropdown>a', section).each(function () {
        var $link = self.S(this),
            $dropdown = $link.siblings('.dropdown'),
            url = $link.attr('href'),
            $titleLi;

        if (!$dropdown.find('.title.back').length) {
          if (settings.mobile_show_parent_link && url && url.length > 1) {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li><li><a class="parent-link js-generated" href="' + url + '">' + $link.text() +'</a></li>');
          } else {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li>');
          }
  
          // Copy link to subnav
          if (settings.custom_back_text == true) {
            $('h5>a', $titleLi).html(settings.back_text);
          } else {
            $('h5>a', $titleLi).html('&laquo; ' + $link.html());
          }
          $dropdown.prepend($titleLi);
        }
      });

      // Put element back in the DOM
      section.appendTo(topbar);

      // check for sticky
      this.sticky();

      this.assembled(topbar);
    },

    assembled : function (topbar) {
      topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {assembled: true}));
    },

    height : function (ul) {
      var total = 0,
          self = this;

      $('> li', ul).each(function () { 
        total += self.S(this).outerHeight(true); 
      });

      return total;
    },

    sticky : function () {
      var self = this;

      this.S(window).on('scroll', function() {
        self.update_sticky_positioning();
      });
    },

    update_sticky_positioning: function() {
      var klass = '.' + this.settings.sticky_class,
          $window = this.S(window), 
          self = this;

      if (self.settings.sticky_topbar && self.is_sticky(this.settings.sticky_topbar,this.settings.sticky_topbar.parent(), this.settings)) {
        var distance = this.settings.sticky_topbar.data('stickyoffset');
        if (!self.S(klass).hasClass('expanded')) {
          if ($window.scrollTop() > (distance)) {
            if (!self.S(klass).hasClass('fixed')) {
              self.S(klass).addClass('fixed');
              self.S('body').addClass('f-topbar-fixed');
            }
          } else if ($window.scrollTop() <= distance) {
            if (self.S(klass).hasClass('fixed')) {
              self.S(klass).removeClass('fixed');
              self.S('body').removeClass('f-topbar-fixed');
            }
          }
        }
      }
    },

    off : function () {
      this.S(this.scope).off('.fndtn.topbar');
      this.S(window).off('.fndtn.topbar');
    },

    reflow : function () {}
  };
}(jQuery, this, this.document));
