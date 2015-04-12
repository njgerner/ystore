'use strict';
// var pouchdb = require('pouchdb');

/* Controllers */

var superApp = angular.module('trdApp.controllers', ['ui.sortable', 'ui.slider']);

superApp.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  physician: 'physician'
});

superApp.controller('MainCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$cookies', '$state', 'authService', 'trdInterceptor', 'stripeService',
  function($rootScope, $scope, $window, $location, $cookies, $state, authService, trdInterceptor, stripeService) {

    $scope.handleLoaded = function() {
      $scope.authorized = authService.authorized;
      $scope.isAdmin = authService.isAdmin;
      $scope.loggedin = authService.loggedin;
    };
      
    $scope.hideCart = function() {
      console.log('hiding cart');
      $rootScope.hideCart(function() {  }); 
    };

    $scope.cartViewFun = $rootScope.$on('cartviewchange', function(evt, args) { // this is really important don't delete
      $scope.showCart = $rootScope.isVisible;
      console.log('cartviewchange', $scope.showCart);
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