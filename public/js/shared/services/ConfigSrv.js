angular.module('ConfigSrv', []).factory('ConfigService', [
  '$http',
  'ENV_VARS',
  'StorageService',
function(
  $http,
  ENV_VARS,
  StorageService
) {
  var baseV1Url = ENV_VARS.apiUrl;
  function getAuthHeader() {
    var token = StorageService.getToken();
    return {
        'x-access-token': token
    };
  }

  return {
    getConfig: function() {
      return $http.get(baseV1Url + '/config');
    },

    setTrialConfig: function (data) {
      return $http.put(baseV1Url + '/config/trial-status', data, {
        headers: getAuthHeader()
      });
    }
  };
}]);