superApp.controller('LoginCtrl',
  ['$rootScope', '$scope', '$state', 'authService', '$location', '$stateParams', '$timeout',
  function($rootScope, $scope, $state, authService, $location, $stateParams, $timeout) {
    $scope.name = "";
    $scope.office = {};
  	$scope.loginState = "signin";
    $scope.loginToken = $stateParams.token;
    $scope.failedMessage = '';
    $scope.loggedin = authService.loggedin;

    if ($scope.loginToken) {
      authService.loginWithToken($scope.loginToken, function(failedMessage, successMessage) {
        if (successMessage) {
          $state.go("profile");
        } else {
          // console.log(failedMessage);
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
  		authService.login($scope.email, $scope.password, function(failedMessage, successMessage) {
  			if (successMessage) {
  				$scope.loggedin = true;
          if (successMessage == "temp_password") {
            $state.go('pass_reset');
          } else {
            $state.go("profile");
          }
  			} else {
  				// console.log('login failed', failedMessage);
	  			$scope.failedMessage = failedMessage;
	  		}
  		});
  	}

    $scope.requestPasswordReset = function() {
      authService.requestPasswordReset($scope.email, function(failedMessage, successMessage) {
        if (successMessage) {
          $scope.loginState = "signin";
          $scope.pass_reset = true;
        } else {
          $scope.failedMessage = failedMessage;
        }
      });
    };

  	$scope.register = function() {
      $scope.name = $scope.firstname + ' ' + $scope.lastname;
      $scope.office = {
        name: $scope.officename,
        address1: $scope.address1,
        address2: $scope.address2,
        city: $scope.city,
        state: $scope.state,
        zip: $scope.zip
      };
  		authService.register($scope.email, $scope.password, $scope.name, $scope.office, $scope.regkey, $scope.allerganacct, function(err, status) {
  			if (err) {
          $scope.failedMessage = status;
        } else {
  				$scope.loginState = "in";
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