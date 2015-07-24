'use strict';
// var pouchdb = require('pouchdb');

/* Controllers */

var superApp = angular.module('trdApp.controllers', ['ui.sortable', 'ui.slider']);

superApp.controller('MainCtrl',
  ['$rootScope', '$scope', '$window', '$location', '$cookies', '$state', 'authService', 'trdInterceptor', 
  'stripeService',
  function($rootScope, $scope, $window, $location, $cookies, $state, authService, trdInterceptor, 
    stripeService) {

    $scope.cartAnimation = '';

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
      $scope.cartAnimation = 'fadeOutUp';
      console.log('past closeCart', $scope.displayCart);
    };

    $scope.handleViewClick = function() {
      console.log('handle view click');
      if ($scope.displayCart) {
        $scope.displayCart = false;
        $scope.cartAnimation = 'fadeOutUp';
      }
    }

    $scope.getCartAnimateClass = function() {
      return $scope.cartAnimation;
    }

    $rootScope.$on('cartviewchange', function(evt, args) { // this is really important don't delete
      console.log('on cartviewchange', args);
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