angular.module('AuthSrv', []).factory('AuthService', [
  '$http',
  'config',
function(
  $http,
  config
) {
  var baseV1Url = config.baseUrl;

  return {
    check : function(adminData) {
      return $http.post(baseV1Url + '/admin', adminData);
    },
    registerMerch : function(merchantData) {
      return $http.post(baseV1Url + '/auth/register/m', merchantData);
    },
    signinA: function(details) {
      return $http.post(baseV1Url + '/auth/signin/a', details);
    },
    signinM: function(details) {
      return $http.post(baseV1Url + '/auth/signin/m', details);
    }
  };
}]);