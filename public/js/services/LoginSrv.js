angular.module('LoginSrv', []).factory('AdminLoginSrv', function($http) {
    return {
        check : function(adminData) {
            return $http.post('/admin', adminData);
        },
        registerMerch : function(merchantData) {
            return $http.post('http//:/merchant/register', merchantData);
        }
    }
});