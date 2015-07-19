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
  ['$rootScope', '$scope', '$window', '$location', '$cookies', '$state', 'authService', 'trdInterceptor', 
  'stripeService', 'ENV',
  function($rootScope, $scope, $window, $location, $cookies, $state, authService, trdInterceptor, 
    stripeService, ENV) {

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
      
    $scope.hideCart = function() {
      $rootScope.hideCart(function() {  }); 
    };

    $scope.closeModal = function() {
      $scope.displayIntro = false;
    }

    $scope.cartViewFun = $rootScope.$on('cartviewchange', function(evt, args) { // this is really important don't delete
      $scope.showCart = $rootScope.isVisible;
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