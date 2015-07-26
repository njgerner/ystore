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