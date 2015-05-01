//===============ANGULAR==================//
var trdApp = angular.module('trdApp', [
  'ngRoute',
  'ngAnimate',
  'infinite-scroll',
  'ui.router',
  'trdApp.services',
  'trdApp.directives',
  'trdApp.controllers',
  'ui.slider',
  'ngTagsInput',
  'mm.foundation',
  'angularFileUpload' //https://github.com/nervgh/angular-file-upload
  // 'uiGmapgoogle-maps'
]);

trdApp.run(['$rootScope', '$state', '$stateParams', '$cookies', '$location', 'authService', // watch these params in bin/www
    function ($rootScope, $state, $stateParams, $cookies, $location, authService) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.isVisible = false;

      $rootScope.$on('$stateChangeStart', 
        function(event, toState, toParams, fromState, fromParams){
          console.log('to:: ' + toState.name, 'from:: ' + fromState.name);
          console.log('authorized / received', authService.authorized, authService.authorizationReceived);

          var isExceptionalState = function() {
            var exceptionalState = ["terms", "store", "store.search", "checkout", "order", "support"];
            return exceptionalState.indexOf(toState.name) >= 0;
          }

          var isAuthorizedState = function() {
            var authStates = ["profile", "settings", "settings.profile", "settings.store", "settings.notifications", "orders", "leave_review"];
            return authStates.indexOf(toState.name) >= 0;
          }

          var isUnauthorizedState = function () {
            var unauthedStates = ["login", "login_by_token", "email_sent", "email_taken", "resend_email", "new_password", "reset_password"];
            return unauthedStates.indexOf(toState.name) >= 0;
          };
          
          if (authService.authorizationReceived) {

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

trdApp.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
  function($httpProvider, $stateProvider, $urlRouterProvider) {
    $httpProvider.interceptors.push('trdInterceptor');
    $urlRouterProvider.otherwise("/store");
    
    $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "/partials/login.html",
      controller: "LoginCtrl"
    })
    .state('logout', {
      url: "/logout",
      templateUrl: "/partials/logout.html",
      controller: "LogoutCtrl"
    })
    .state('order', {
      url: "/order/:orderid",
      templateUrl: "/partials/order.html",
      controller: "OrderCtrl"
    })
    .state('orders', {
      url: "/orders/:orderid",
      templateUrl: "/partials/orders.html",
      controller: "OrdersCtrl"
    })
    .state('limit_orders', {
      url: "/orders/:orderid/:limit",
      templateUrl: "/partials/limit_orders.html",
      controller: "OrdersCtrl"
    })
    .state('store', {
      url:"/store",
      templateUrl:"/partials/store.html",
      controller: "StoreCtrl"
    })
    .state('store.search', {
      url:"/store",
      templateUrl:"/partials/search_store.html",
      controller: "SearchStoreCtrl"
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
      controller: "ProfileCtrl"
    })
    .state('reset_password', {
      url:"/reset_password/:resettoken",
      templateUrl: "/partials/reset_password.html",
      controller: "ResetPasswordCtrl"
    })
    .state('sell_info', {
      url:"/sell_info",
      templateUrl: "/partials/sell_with_us.html",
      controller: "SellInfoCtrl"
    })
    .state('about', {
      url:"/about",
      templateUrl: "/partials/about.html",
      controller: "AboutCtrl"
    })
    .state('settings', {
      abstract: true,
      url:"/settings",
      templateUrl: "/partials/settings.html",
      controller: "SettingsCtrl"
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
    .state('support', {
      url:"/support",
      templateUrl: "/partials/support.html",
      controller: "SupportCtrl"
    })
    .state('terms', {
      url:"/terms",
      templateUrl: "/partials/terms.html",
      controller: "TermsCtrl"
    })
    .state('checkout', {
      url: "/checkout",
      views: {
        '': {
          templateUrl: "/partials/checkout.html",
          controller: "CheckoutCtrl"
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