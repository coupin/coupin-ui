angular.module('MerchantSrv', []).factory('MerchantService', function (
    $http,
    StorageService
) {
    var baseV1Url = 'http://localhost:5030/api/v1';
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
            return $http.get(baseV1Url + '/merchant/' + id, {
                headers: authHeader
            });
        },
        update: function (id, user) {
            return $http.put(baseV1Url + '/merchant/' + id, user, {
                headers: authHeader
            });
        }
    }
});