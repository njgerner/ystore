superApp.controller('AdminPromoCtrl',
  ['$rootScope', '$scope', '$state', 'adminService',
  function($rootScope, $scope, $state, adminService) {

    $scope.displayPromo = function(value, type) {
      if(type == 'percent_off') {
        return Number(value)*100 + "% off";
      }else if(type == 'new_price') {
        return "New price: $" + value;
      }else if(type == 'money_off') {
        return "$" + value + " off";
      }
    };

    // $scope.confirmPassword = function(attempt) {
    //   if(bcrypt.compareSync(attempt, $scope.hash)) {
    //     $scope.authorized = true;
    //   }else {
    //     $scope.authorized = false;
    //   }
    // };

    $scope.activate = function() {
      if($scope.activating) {
        $scope.error = "Please wait";
        return;
      }
      if(!$scope.newcode) {
        $scope.error = "Please enter a promo code";
        return;
      }else if(!$scope.promotype) {
        $scope.error = "Please select a promo type";
        return;
      }else if(!$scope.value) {
        $scope.error = "Enter a value for the promo code";
        return;
      }else if(!$scope.makeactive) {
        $scope.error = "Choose whether to make the promo code active upon submission";
        return;
      }
      else{
        if($scope.promotype == 'percent_off') {
          if(isNaN($scope.value) || $scope.value <= 0 || $scope.value > 100 || $scope.value.length > 2) {
            $scope.error = "Enter a valid percent";
            return;
          }
        }else if($scope.promotype == 'new_price') {
          if(isNaN($scope.value) || $scope.value <= 0) {
            $scope.error = "Enter a valid price";
            return;
          }
        }else if($scope.promotype == 'money_off') {
          if(isNaN($scope.value)) {
            $scope.error = "Enter a valid discount";
            return;
          }
        }
        var promo = {};
        promo.key = $scope.newcode;
        promo.type = $scope.promotype;
        if($scope.message) {promo.message = $scope.message};
        if($scope.promotype == 'percent_off') {
          promo.value = Number($scope.value)*.01;
        }else {
          promo.value = $scope.value;
        }
        promo.active = $scope.makeactive;
        adminService.addPromoCode(promo, function (err, code) {
          if(err) {
            $scope.error = err;
          }

        });
      }
    };

    adminService.getAllPromoCodes(function (err, codes) {
      if(err) {
        $scope.error = err;
      }
      $scope.promos = codes;
    })

}]);