angular.module('BankSrv', []).factory('BankService', [
  'ENV_VARS',
  '$http',
  'StorageService',
function (
  ENV_VARS,
  $http,
) {
  var baseV1Url = ENV_VARS.apiUrl;

  return {
    getBanks() {
      return $http.get(baseV1Url + '/banks');
    }
  }
}]);