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
        function getAuthHeader() {
            var token = StorageService.getToken();
            return {
                'x-access-token': token
            };
        }
      var baseV1Url = ENV_VARS.apiUrl;

      return {
          // create: function (details) {
          //     return $http.post(baseV1Url + '/rewards', details, {
          //         headers: authHeader
          //     });
          // },
          getAllMerchRewards: function (query) {
              var url = `${baseV1Url}/rewards?limit=${query.limit}&page=${query.page}`;
              if (UtilService.isDefined(query.search)) {
                  url += `&query=${query.search}`;
              }
              
              return $http({
                  method: 'GET',
                  url: url,
                  headers: getAuthHeader(),
                  data: query
              });
          },
          getMerchRewards: function (id, query) {
              var url = baseV1Url + '/merchant/' + id + '/rewards';
              if (UtilService.isDefined(query)) {
                  url = url + '?status=' + query.status + '&limit=' + query.limit + '&page=' + query.page;
              }
              
              return $http({
                  method: 'GET',
                  url: url,
                  headers: getAuthHeader(),
                  data: query
              });
          },
          getMerchRewardsCount: function (id, query) {
              var url = baseV1Url + '/merchant/' + id + '/rewards/count';
              if (UtilService.isDefined(query)) {
                  url = url + '?status=' + query.status
              }
              
              return $http({
                  method: 'GET',
                  url: url,
                  headers: getAuthHeader(),
                  data: query
              });
          },
          toggleRewardStatus: function(id, status) {
              let url = baseV1Url + '/rewards/status' + '/' + id;

              return $http({
                method: 'PUT',
                url: url,
                headers: getAuthHeader(),
                data: JSON.stringify({ status })
              })
          },
          deleteReward: function(id) {
              let url = baseV1Url + '/rewards' + '/' + id;

              return $http({
                  method: 'DELETE',
                  url: url,
                  headers: getAuthHeader(),
              })
          }
      }
  }
]);