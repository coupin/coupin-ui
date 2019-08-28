angular.module('MerchantSrv', []).factory('MerchantService', [
    'ENV_VARS',
    '$http',
    'StorageService',
function (
    ENV_VARS,
    $http,
    StorageService
) {
    var baseV1Url = ENV_VARS.apiUrl;
    var token = StorageService.getToken();
    var authHeader = {
        'x-access-token': token
    };

    return {
        adminCreate: function (data) {
            return $http.post(baseV1Url + '/merchant/register', data, {
                headers: authHeader
            });
        },
        changePassword : function (password) {
            return $http.post(baseV1Url + '/auth/password', {password: password}, {
                headers: authHeader
            });
        }
        ,
        // Complete Registration
        complete : function(id, details) {
            return $http.post(baseV1Url + '/merchant/' + id + '/confirm/', details);
        },
        confirm : function(id) {
            return $http.get(baseV1Url + '/merchant/' + id + '/confirm/');
        },
        get : function() {
            return $http.get(baseV1Url + '/merchant', {
                headers: authHeader
            });
        },
        getAllMerchants : function (page) {
            return $http.get(baseV1Url + '/merchant?page=' + page, {
                headers: authHeader
            });
        },
        login : function(details) {
            return $http.post(baseV1Url + '/auth/signin/m', details, );
        },
        retrieve : function(id) {
            var token = StorageService.getToken();
            return $http.get(baseV1Url + '/merchant/' + id, {
                headers: {
                    'x-access-token': token
                }
            });
        },
        update: function (id, user) {
            return $http.put(baseV1Url + '/merchant/' + id, user, {
                headers: authHeader
            });
        },
        updateBilling: function (id, billing) {
            return $http.post(baseV1Url + '/merchant/' + id, billing, {
                headers: authHeader
            });
        }
    }
}]);