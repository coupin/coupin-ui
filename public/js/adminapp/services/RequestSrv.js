angular.module('RequestSrv', []).factory('RequestService', [
  '$http',
  'config',
  'StorageService'
, function(
  $http,
  config,
  StorageService
) {
  var baseV1Url = config.baseUrl;
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
    // Use to approve or decline
    updateStatus : function(id, details) {
      return $http.put(`${baseV1Url}/merchant/${id}/status/`, details, {
        headers: authHeader
      });
    }
  };
}]);