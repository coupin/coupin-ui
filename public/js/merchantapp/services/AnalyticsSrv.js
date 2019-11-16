angular.module('AnalyticsSrv', []).factory('AnalyticsService', [
  'ENV_VARS',
  '$http',
  'StorageService',
function (
  ENV_VARS,
  $http,
  StorageService
) {
  var baseV1Url = ENV_VARS.apiUrl;
  var token = StorageService.getToken();
  var authHeader = {
      'x-access-token': token
  };

  return {
    getStats: function (start, end) {
      var url = '/analytics/get-stats';
      if (start & end) {
        url += '?start=' + start + '&end=' + end; 
      }

      return $http.get(baseV1Url + url, {
        headers: authHeader
      });
    },

    getRewards: function (start, end, page) {
      var url = '/analytics/rewards?start=' + start + '&end=' + end + '&page=' + page;
      return $http.get(baseV1Url + url, {
        headers: authHeader
      });
    },

    getOverallCoupinStat: function (start, end, page) {
      var url = '/analytics/get-coupin-stats';
      return $http.get(baseV1Url + url, {
        headers: authHeader
      });
    },

    getRewardGenderDistribution: function (rewardId) {
      var url = '/analytics/reward/' + rewardId +'/gender-distribution';
      return $http.get(baseV1Url + url, {
        headers: authHeader
      });
    },

    getRewardAgeDistribution: function (rewardId) {
      var url = '/analytics/reward/' + rewardId +'/age-distribution';
      return $http.get(baseV1Url + url, {
        headers: authHeader
      });
    },
  }
}]);