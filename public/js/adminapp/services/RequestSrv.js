angular.module('RequestSrv', []).factory('RequestService', [
  '$http',
  'StorageService'
, function(
  $http,
  StorageService
) {
  var token = StorageService.getToken();
  var authHeader = {
      'x-access-token': token
  };
  var baseV1Url = 'http://localhost:5030/api/v1';

  return {
    getRequests: function(status) {
      return $http.get(`${baseV1Url}/merchant/status/${status}`, {
          headers: authHeader
      });
    }
  };
}]);