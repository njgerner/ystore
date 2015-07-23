'use strict';
// var pouchdb = require('pouchdb');

/* Controllers */

var superApp = angular.module('trdApp.controllers', ['ui.sortable', 'ui.slider']);

superApp.controller('MainCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$cookies', '$state', 'authService', 'trdInterceptor', 
  'stripeService',
  function($rootScope, $scope, $window, $location, $cookies, $state, authService, trdInterceptor, 
    stripeService) {

    $scope.handleLoaded = function() {
      $scope.loaded = true;
      console.log('HANDLE LOADED', $scope.loaded, $scope.displayCart);
      $scope.authorized = authService.authorized;
      $scope.isAdmin = authService.isAdmin;
      $scope.loggedin = authService.loggedin;
    };
      
    $scope.closeCart = function() {
      console.log('CLOSE CART', $scope.displayCart);
      $scope.displayCart = false;
      console.log('past closeCart', $scope.displayCart);
    };

    $scope.handleViewClick = function() {
      $scope.displayCart = false;
    }

    $scope.getCartAnimateClass = function() {
      if ($scope.displayCart) {
        return 'fadeInDown';
      } else if ($scope.displayCart === false) { // this prevents the cart from fading out up on app start up when displayCart === undefined
        return 'fadeOutUp';
      }
    }

    $rootScope.$on('cartviewchange', function(evt, args) { // this is really important don't delete
      console.log('on cartviewchange', args);
      $scope.displayCart = args.displayCart;
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