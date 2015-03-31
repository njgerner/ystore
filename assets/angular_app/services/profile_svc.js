trdServices.service("profileService", ['$rootScope', '$http', '$cookieStore',
    function ($rootScope, $http, $cookieStore) {

    this.updateUser = function(id, profile, property, callback) {
        var internalThis = this;
        $http({method: 'POST', 
               url: '/update_user', 
               data: JSON.stringify({profile: profile, userid:id, property:property}),
               headers: {'Content-Type': 'application/json'} 
             })
            .success(function (data, status, headers, config) {
                if(data.profile) {
                    internalThis.profile = data.profile;
                }
            })
            .error(function (data, status, headers, config) {
                callback("FAILED TO LOGIN");
            }); 
    }

    this.updateProfile = function(profile, callback) {
        var inThis = this;
        $http({method: 'POST', url: '/profile/update/' + profile.id, data:{profile:profile}})
            .success(function (data, status, headers, config) {
                callback(data);
            })
            .error(function (data, status, headers, config) {
                console.log('error updating profile', data);
                callback();
            });
    }
 
}]);