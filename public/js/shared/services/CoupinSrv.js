angular.module('CoupinSrv', []).factory('CoupinService', [
  '$http',
  'ENV_VARS',
  'StorageService'
, function(
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
    cancel: function(id) {
      return $http.post(baseV1Url + "/coupin/" + id + "/cancel", {
        headers: getAuthHeader()
      });
    },
    redeem: function(id, rewards) {
      return $http.post(baseV1Url + "/coupin/" + id + "/redeem", {
        rewards: rewards
      }, {
        headers: getAuthHeader()
      });
    },
    verify: function(pin) {
      return $http.get(baseV1Url + "/coupin/" + pin + "/verify", {
        headers: getAuthHeader()
      });
    }
  };
}]);