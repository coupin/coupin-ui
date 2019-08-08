angular.module('AdminRewardsSrv', ['ngSessionStorage']).factory('AdminRewardsService', [
  '$http',
  'ENV_VARS',
  'StorageService',
  'UtilService',
  function (
      $http,
      ENV_VARS,
      StorageService,
      UtilService
  ) {
      var token = StorageService.getToken();
      var authHeader = {
          'x-access-token': token
      };
      var baseV1Url = ENV_VARS.apiUrl;

      return {
          // create: function (details) {
          //     return $http.post(baseV1Url + '/rewards', details, {
          //         headers: authHeader
          //     });
          // },
          getMerchRewards: function (id, query) {
              var url = baseV1Url + '/merchant/' + id + '/rewards';
              if (UtilService.isDefined(query)) {
                  url = url + '?status=' + query.status
              }
              
              return $http({
                  method: 'GET',
                  url: url,
                  headers: authHeader,
                  data: query
              });
          }
      }
  }
]);