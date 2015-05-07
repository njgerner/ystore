trdServices.service("registrationService", ['$rootScope', '$http',
    function ($rootScope, $http) {

    this.verifyKey = function(key, callback) {
        $http({method: 'POST', url: '/verify_key', data:{key:key}})
        .success(function (data, status, headers, config) {
            callback(data.status);
        })
        .error(function (data, status, headers, config) {
            console.log('error validating key', data);
            callback();
        });
    }
     
}]);