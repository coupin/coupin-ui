angular.module('CoupinSrv', []).factory('CoupinService', [
  '$http',
  'StorageService'
, function(
  $http,
  StorageService
) {
  var baseV1Url = config.baseUrl;
  var token = StorageService.getToken();
  var authHeader = {
      'x-access-token': token
  };

  return {
    redeem: function(id, rewards) {
      return $http.post(`${baseV1Url}/coupin/${id}/redeem`, {
        rewards: rewards
      }, {
        headers: authHeader
      });
    },
    verify: function(pin) {
      return $http.get(`${baseV1Url}/coupin/${pin}/verify`, {
        headers: authHeader
      });
    }
  };
}]);