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
      $scope.loaded = true;
      $scope.authorized = authService.authorized;
      $scope.isAdmin = authService.isAdmin;
      $scope.loggedin = authService.loggedin;
    };
      
    $scope.hideCart = function() {
      $rootScope.hideCart(function() {  }); 
    };

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
      console.log('handle loaded 1');
      $scope.handleLoaded();
    } else {
      $scope.loadedFun = null;
      $scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
        console.log('handle loaded 2');
        $scope.handleLoaded();
        $scope.loadedFun();
      });
    }
}]);