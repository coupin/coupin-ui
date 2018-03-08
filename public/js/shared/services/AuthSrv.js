angular.module('AuthSrv', []).factory('AuthService', [
  '$http',
function(
  $http
) {
  var baseV1Url = 'http://localhost:5030/api/v1';

  return {
    check : function(adminData) {
      return $http.post(baseV1Url + '/admin', adminData);
    },
    registerMerch : function(merchantData) {
      return $http.post(baseV1Url + '/merchant/register', merchantData);
    },
    signinM: function(details) {
      return $http.post(baseV1Url + '/auth/signin/m', details);
    }
  };
}]);