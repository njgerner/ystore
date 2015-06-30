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
  'ngTagsInput',
  'ngError',
  'flow',
  'env.config',
  'mm.foundation',
  'angulartics',
  'angulartics.google.analytics',
  // 'n3-line-chart',
  'angularFileUpload' //https://github.com/nervgh/angular-file-upload
  // 'uiGmapgoogle-maps'
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
            var unauthedStates = ["login", "login_by_token", "email_sent", "email_taken", "resend_email", "new_password", "reset_password", "register"];
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
              $state.go("store");
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
                $state.go("store");
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

      $rootScope.hideCart = function(callback) {
        $('#cart').foundation('reveal', 'close');
        this.isVisible = false;
        callback(this.isVisible);
      }

      $rootScope.showCart = function(callback) {
        $('#cart').foundation('reveal', 'open');
        this.isVisible = true;
        callback(this.isVisible);
      }

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
      url: "/register",
      templateUrl: "/partials/register.html",
      controller: "RegisterCtrl",
      title: "Register"
    })
    .state('register.home', {
      url: "/intro",
      templateUrl: "/partials/register_home.html",
      controller: "RegisterHomeCtrl"
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
    .state('office_scheduling', {
      url: "/scheduling",
      templateUrl: "/partials/office_scheduling.html",
      controller: "OfficeSchedulingCtrl",
      title: "Scheduling"
    })
    .state('merchant_inventory', {
      abstract: true,
      url: "/merchant_inventory",
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
      url: "/new_product",
      templateUrl: "/partials/merchant_inventory_new_product.html",
      controller: "MerchantInventoryNewProductCtrl"
    })
    .state('merchant_orders', {
      url: "/merchant_orders",
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
      url:"/leave_review/:productnumber",
      templateUrl:"/partials/leave_review.html",
      controller: "LeaveReviewCtrl"
    })
    .state('search_results', {
      url:"/search_results?query",
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
      url:"/reset_password/:resettoken",
      templateUrl: "/partials/reset_password.html",
      controller: "ResetPasswordCtrl",
      title: "Password Assistance"
    })
    .state('sell_info', {
      url:"/sell_info",
      templateUrl: "/partials/sell_with_us.html",
      controller: "SellInfoCtrl",
      title: "Sell with Y Lift"
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
    })
    .state('techniques.yeye', {
      parent: 'techniques',
      url:"/y-eye",
      templateUrl: "/partials/techniques_yeye.html",
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
      url:"/before_after/:procedure",
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
      controller: "SettingsProfileCtrl"
    })
    .state('settings.store', {
      url:"/store",
      templateUrl: "/partials/settings_store.html",
      controller: "SettingsStoreCtrl"
    })
    .state('settings.notifications', {
      url:"/notifications",
      templateUrl: "/partials/settings_notifications.html",
      controller: "SettingsNotificationsCtrl"
    })
    .state('settings.merchant', {
      url:"/merchant",
      templateUrl: "/partials/settings_merchant.html",
      controller: "SettingsMerchantCtrl"
    })
    .state('support', {
      url:"/support",
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