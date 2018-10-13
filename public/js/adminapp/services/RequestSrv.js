angular.module('RequestSrv', []).factory('RequestService', [
  '$http',
  'ENV_VARS',
  'StorageService'
, function(
  $http,
  ENV_VARS,
  StorageService
) {
  var baseV1Url = ENV_VARS.apiUrl;
  var token = StorageService.getToken();
  var authHeader = {
      'x-access-token': token
  };

  return {
    getRequests: function(status) {
      return $http.get(`${baseV1Url}/merchant/status/${status}`, {
          headers: authHeader
      });
    },
    getRewards: function() {
      return $http.get(`${baseV1Url}/rewards/requests`, {
          headers: authHeader
      });
    },
    getMerchantsRewards: function(id) {
      return $http.get(`${baseV1Url}/merchant/${id}/rewards`, {
          headers: authHeader
      });
    },
    // Use to approve or decline
    updateStatus : function(id, details) {
      return $http.put(`${baseV1Url}/merchant/${id}/status/`, details, {
        headers: authHeader
      });
    }
  };
}]);