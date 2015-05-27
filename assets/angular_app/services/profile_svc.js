trdServices.service("profileService", ['$rootScope', '$http', '$cookieStore', 'authService',
    function ($rootScope, $http, $cookieStore, authService) {

    this.adminOf = {};

    this.updateProfile = function(profile, callback) {
        $http({method: 'POST', url: '/profile/update/' + profile.id, data:{profile:profile}})
        .success(function (data, status, headers, config) {
            callback(data);
        })
        .error(function (data, status, headers, config) {
            console.log('error updating profile', data);
            callback();
        });
    }

    this.getMerchantProfile = function(callback) {
        if (this.merchant !== undefined) {
            callback(this.merchant);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: '/profile/get_merchant/' + authService.profile.id})
        .success(function (data, status, headers, config) {
            if (data.profile && data.admin) {
                inThis.adminOf[data.profile.id] = true;
            }
            inThis.merchant = data.profile;
            callback(data.profile);
        })
        .error(function (data, status, headers, config) {
            console.log('error updating profile', data);
            callback();
        });
    }

    this.addMerchantProfile = function(name, email, regkey, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/add_merchant/' + authService.profile.id, 
               data:{name:name, email:email, regkey:regkey}})
        .success(function (data, status, headers, config) {
            inThis.merchant = data;
            inThis.adminOf[data.id] = true;
            callback(data);
        })
        .error(function (data, status, headers, config) {
            console.log('error updating profile', data);
            callback();
        });
    }

    this.updateMerchantProfile = function(profile, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/update_merchant', 
               data:{profile:profile}})
        .success(function (data, status, headers, config) {
            if (data.profile && data.admin) {
                inThis.adminOf[data.profile.id] = true;
            }
            inThis.merchant = data.profile;
            callback(data.profile);
        })
        .error(function (data, status, headers, config) {
            console.log('error updating profile', data);
            callback();
        });
    }

    this.deleteMerchantProfile = function(callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/delete_merchant/' + authService.profile.id, 
               data:{merchantid:this.merchant.id}})
        .success(function (data, status, headers, config) {
            if (data.result == "unauthorized") {
                callback('You are not authorized to remove this account');
                return;
            }
            inThis.adminOf[inThis.merchant.id] = false;
            inThis.merchant = null;
            callback();
        })
        .error(function (data, status, headers, config) {
            console.log('error deleting profile', data);
            callback('Error deleting profile, please try again');
        });
    }

    this.isAdminOfMerchant = function(merchantid) {
        return this.adminOf[merchantid];
    }
 
}]);