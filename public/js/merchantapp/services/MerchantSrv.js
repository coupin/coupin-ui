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
    function getAuthHeader() {
        var token = StorageService.getToken();
        return {
            'x-access-token': token
        };
    }

    function retrieve(id) {
        return $http.get(baseV1Url + '/merchant/' + id, {
            headers: getAuthHeader()
        });
    }

    return {
        adminCreate: function (data) {
            return $http.post(baseV1Url + '/merchant/register', data, {
                headers: getAuthHeader()
            });
        },
        changePassword : function (password) {
            return $http.post(baseV1Url + '/auth/password', {password: password}, {
                headers: getAuthHeader()
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
                headers: getAuthHeader()
            });
        },
        getAllMerchants : function (page, query) {
            return $http.get(`${baseV1Url}/merchant?page=${page}&search=${query}`, {
                headers: getAuthHeader()
            });
        },
        getAllMerchantsCount : function (query) {
            return $http.get(`${baseV1Url}/merchant/count?search=${query}`, {
                headers: getAuthHeader()
            });
        },
        login : function(details) {
            return $http.post(baseV1Url + '/auth/signin/m', details, {
                headers: getAuthHeader()
            });
        },
        retrieve : retrieve,
        update: function (id, user) {
            return $http.put(baseV1Url + '/merchant/' + id, user, {
                headers: getAuthHeader()
            });
        },
        updateBilling: function (id, billing) {
            return $http.post(baseV1Url + '/merchant/' + id, billing, {
                headers: getAuthHeader()
            });
        },
        confirmAccountDetails: function(params) {
            return $http.post(baseV1Url + '/accounts/confirm', params, {
                headers: getAuthHeader()
            });
        },
        saveAccountDetails: function(params) {
            return $http.post(baseV1Url + '/merchant/account', params, {
                headers: getAuthHeader()
            });
        },
        refreshUser: function(id) {
            return retrieve(id).then(({ data }) => {
                StorageService.setUser(data);
            });
        },
        updateMerchantVisibility: function(id, action) {
            const url = baseV1Url + '/merchant/' + id + '/' + action
            return $http({
                method: 'POST',
                url: url,
                headers: getAuthHeader()
            })
        }
    }
}]);