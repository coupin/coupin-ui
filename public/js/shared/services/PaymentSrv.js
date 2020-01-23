angular.module('PaymentSrv', ['ngSessionStorage']).factory('PaymentService', [
  '$http',
  'ENV_VARS',
  'StorageService',
  function (
    $http,
    ENV_VARS,
    StorageService
  ) {
      function getAuthHeader() {
        var token = StorageService.getToken();
        return {
            'x-access-token': token
        };
      }

      var baseV1Url = ENV_VARS.apiUrl;

      return {
        initiatePayment: function (details) {
          return $http.post(baseV1Url + '/initiatepayment', details, {
            headers: getAuthHeader()
          });
        },
      };
  }]);
