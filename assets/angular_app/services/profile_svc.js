trdServices.service("profileService", ['$rootScope', '$http', '$cookieStore', 'authService', '$log',
    function ($rootScope, $http, $cookieStore, authService, $log) {

    this.adminOf = {};

    this.updateProfile = function(profile, callback) {
        $http({method: 'POST', url: '/profile/update/' + profile.id, data:{profile:profile}})
        .success(function (data, status, headers, config) {
            callback(null, data);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error updating profile', data);
            callback(data.message);
        });
    }

    this.getMerchantProfile = function(callback) {
        if (this.merchant !== undefined) {
            callback(null, this.merchant);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: '/profile/get_merchant/' + authService.profile.id})
        .success(function (data, status, headers, config) {
            if (data.profile && data.admin) {
                inThis.adminOf[data.profile.id] = true;
            }
            inThis.merchant = data.profile;
            callback(null, data.profile);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error getting merchant profile', data);
            callback(data.message);
        });
    }

    this.addMerchantProfile = function(name, category, regkey, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/add_merchant/' + authService.profile.id, 
               data:{name:name, category:category, regkey:regkey}})
        .success(function (data, status, headers, config) {
            inThis.merchant = data;
            inThis.adminOf[data.id] = true;
            callback(null, data);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error adding merchant profile', data);
            callback(data.message);
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
            callback(null, data.profile);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error updating merchant profile', data);
            callback(data.message);
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
            callback(null, null);
        })
        .error(function (data, status, headers, config) {
            $log.debug('error deleting profile', data);
            callback(data.message);
        });
    }

    this.isAdminOfMerchant = function(merchantid) {
        return this.adminOf[merchantid];
    }

    $rootScope.$on('loggedout', function(evt, args) {
        this.adminOf = {};
    });
 
}]);