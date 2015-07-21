superApp.controller('AdminUserCtrl',
  ['$rootScope', '$window', '$scope', '$state', 'toolbelt', 'adminService', 'storeService', '$stateParams', '$http',
  function($rootScope, $window, $scope, $state, toolbelt, adminService, storeService, $stateParams, $http) {

    $scope.edit = false;

    $scope.clearAddress = function() {
      $scope.addressname = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.addressphone = null;
      $scope.addressemail = null;
      $scope.currAddress = null;
      $scope.addressInd = null;
      $scope.yliftInd = null;
    }

    $scope.updateInfo = function () {
      $scope.error = null;
      $scope.updating = true;
      var profile = angular.copy($scope.profile);
      profile.name = $scope.name;
      profile.email = $scope.email;
      adminService.checkEmailAvailability($scope.email, function (err, data) {
        if(err) {
          $scope.error = err;
          return;
        } else if (!data.available) {
          $scope.error = "Email is already in use.";
          return;
        } else {
          adminService.updateUserProfile(profile, function (err, profile) {
            $scope.profile = profile;
            $scope.edit = false;
            $scope.updating = false;
            $scope.notify = 'Successfully updated user profile';
            $scope.edit = false;
          });
        }
      });
    };

    $scope.submitAddress = function() {
      if (validate()) {    
          var address = {
          "name": $scope.addressname,
          "address1": $scope.address1,
          "address2": $scope.address2,
          "city": $scope.city,
          "state": $scope.state,
          "zip": $scope.zip,
          "phone": $scope.addressphone,
          "email": $scope.addressemail,
          "profile": $scope.profile.id,
          "default": $scope.default
          };
          if ($scope.addresses.length == 0) {
             address.default = true;
          }
          if ($scope.isYLIFT) {
              address.yliftInd = $scope.yliftInd;
          }
          if ($scope.currAddress) {
              address.id = $scope.currAddress.id;
              address.createdAt = $scope.currAddress.createdAt;
          }
          if ($scope.editAddressView) {
              $scope.updating = true;
              adminService.updateAddress(address, function (err, data) {
                if(err) {
                  $scope.error = err;
                } else {
                  $scope.updating = false;
                  $scope.clearAddress();
                  $scope.addAddressView = false;
                  $scope.editAddressView = false;
                  $scope.notify = 'Successfully updated user address';
                }
              });
          }
          if ($scope.addAddressView) {
              $scope.adding = true;
              adminService.addAddress(address, function (err, data) {
                if(err) {
                  $scope.error = err;
                } else {
                  $scope.updating = false;
                  $scope.clearAddress();
                  $scope.addAddressView = false;
                  $scope.editAddressView = false;
                  $scope.notify = "Successfully added user address";
                  $scope.addresses.push(data);
                }
              });
          }
      }
    };

    $scope.selectAddress = function(ind) {
        $scope.addAddressView = false;
        if ($scope.currAddress == $scope.addresses[ind]) {
          $scope.currAddress = null;
          $scope.currAddressImg = null;
          $scope.editAddressView = false;
          return;
        }
        $scope.currAddress = $scope.addresses[ind];
        $scope.addressname = $scope.currAddress.name;
        $scope.address1 = $scope.currAddress.address1;
        $scope.address2 = $scope.currAddress.address2;
        $scope.city = $scope.currAddress.city;
        $scope.state = $scope.currAddress.state;
        $scope.zip = $scope.currAddress.zip;  
        $scope.addressphone = $scope.currAddress.phone;  
        $scope.addressemail = $scope.currAddress.email;  
        $scope.yliftInd = $scope.currAddress.yliftInd;
        $scope.addressInd = ind;
        $scope.editAddressView = true;
    };

    $scope.enableAddAddress = function() {
        $scope.clearAddress();
        $scope.editAddressView = false;
        $scope.addAddressView = true;
    };

    $scope.cancel = function() {
      $scope.editAddressView = false;
      $scope.addAddressView = false;
    };

    $scope.makeDefault = function(ind) {
      if ($window.confirm('Make this address the default?')) {
        for (var i = 0; i < $scope.addresses.length; i++) {
          if ($scope.addresses[i].default) {
            $scope.addresses[i].default = false;
            adminService.updateAddress($scope.addresses[i], function (err, data) {
              if(err) {
                $scope.error = err;
              }
            });
          }
          if (i == ind) {
            $scope.addresses[i].default = true;
            adminService.addAddress($scope.addresses[i], function (err, data) {
              if(err) {
                $scope.error = err;
              }
            });
          }
        }
      }
    };

    $scope.removeAddress = function(index) {
      if ($window.confirm('Are you sure?')) {
        $scope.clearAddress();
        $scope.addAddressView = false;
        $scope.editAddressView = false;
        var address = $scope.addresses[index];
        adminService.deleteAddress(address, function (err, data) {
          if(err) {
            $scope.error = err;
          } else {
            $scope.addresses.splice(index, 1);
            $scope.notify = "Address successfully removed";
          }
        });
      }
    };

    function validate () {
      $scope.error = null;
      if (!$scope.addressname) {
        $scope.error = 'Please name this address';
        return false;
      }
      if (!$scope.address1) {
        $scope.error = 'Please add the street address';
        return false;
      }
      if (!$scope.city) {
        $scope.error = 'Please add the address city';
        return false;
      }
      if (!$scope.state) {
        $scope.error = 'Please add the address state';
        return false;
      }
      if (!$scope.zip) {
        $scope.error = 'Please add the address zip';
        return false;
      }
      if (!$scope.addressphone) {
        $scope.error = 'Please add a contact phone number for this address';
        return false;
      }
      if (!$scope.addressemail) {
        $scope.error = 'Please add a contact email address';
        return false;
      }
      return true;
    }

    $scope.formatPrice = function(price) {
      return "$" + toolbelt.insertCommasIntoNumber(price);
    };

    function onAddressesLoaded(err, data) {
          $scope.loadingAddresses = false;
          if(err) {
            $scope.error = err;
          }
          $scope.addresses = data;
          $scope.userloaded = true;
      };

    adminService.getProfileByID($stateParams.profileid, function (err, profile) {
        if(err) {
          $scope.error = err;
        } 
        $scope.profile = profile;

        adminService.getAddresses($scope.profile.id, onAddressesLoaded);
        $scope.loadingAddresses = true;

        storeService.getProductsInCart($stateParams.profileid, function (err, data) {
          if(!err) {
            $scope.cartProducts = {};
            $scope.total = 0;
            $scope.quantities = {};
            for(var i = 0; i < data.length; i++) {
              $scope.quantities[data[i].productnumber] = data[i].quantity;
              adminService.getProduct(data[i].productnumber, function (err, product) {
                if(err) {
                  $scope.error = err;
                } else { 
                  $scope.cartProducts[product.productnumber] = product;
                  $scope.total += (product.price * $scope.quantities[product.productnumber]);
                }
              })
            }
          }
        });
      });

}]);