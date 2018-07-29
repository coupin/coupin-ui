angular.module('AdminRewardsSrv', ['ngSessionStorage']).factory('AdminRewardsService', [
  '$http',
  'config',
  'StorageService',
  'UtilService',
  function (
      $http,
      config,
      StorageService,
      UtilService
  ) {
      var token = StorageService.getToken();
      var authHeader = {
          'x-access-token': token
      };
      var baseV1Url = config.baseUrl;

      return {
          // create: function (details) {
          //     return $http.post(baseV1Url + '/rewards', details, {
          //         headers: authHeader
          //     });
          // },
          getMerchRewards: function (id, query) {
              var url = `${baseV1Url}/merchant/${id}/rewards`;
              console.log(id);
              console.log(query);
              if (UtilService.isDefined(query)) {
                  url = `${url}?status=${query.status}`
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