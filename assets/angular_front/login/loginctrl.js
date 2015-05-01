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

    $scope.showReg = function() {
      $scope.failedMessage = '';
      $scope.loginState = "register";
      $scope.pass_reset = false;
    }

    $scope.showForgotPass = function() {
      $scope.failedMessage = '';
      $scope.loginState = "forgot_password";
    }

  	$scope.login = function() {
      $scope.signingIn = true;
  		authService.login($scope.email, $scope.password, function(failedMessage, successMessage) {
  			if (successMessage) {
          console.log('success?', successMessage);
  				$scope.loggedin = true;
          if (successMessage == "temp_password") {
            $state.go('pass_reset');
          } else {
            $state.go("store");
          }
  			} else {
          $scope.signingIn = false;
          console.log('login failed', failedMessage);
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
          $scope.pass_reset = true;
        } else {
          $scope.requestingReset = false;
          $scope.failedMessage = failedMessage;
        }
      });
    };

  	$scope.register = function() {
      $scope.failedMessage = null;
      if ($scope.password !== $scope.confirmpassword) {
        $scope.failedMessage = "Passwords must match!";
        return;
      }
  		authService.register($scope.email, $scope.password, function(err, status) {
        console.log("loginctrl err/status", err, status);
  			if (err) {
          console.log('error register', err);
          $scope.failedMessage = status;
        } else {
  				$state.go(status);
        }
  		});
  	}

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