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
  function getAuthHeader() {
    var token = StorageService.getToken();
    return {
        'x-access-token': token
    };
  }

  return {
    getStats: function (start, end) {
      var url = '/analytics/get-stats';
      if (start & end) {
        url += '?startDate=' + start + '&endDate=' + end; 
      }

      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getRewards: function (start, end, page) {
      var url = '/analytics/rewards?startDate=' + start + '&endDate=' + end + '&page=' + page;
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getOverallCoupinStat: function (start, end, page) {
      var url = '/analytics/get-coupin-stats';
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getRewardGenderDistribution: function (rewardId) {
      var url = '/analytics/rewards/' + rewardId +'/gender-distribution';
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getSingleReward: function (rewardId) {
      var url = '/analytics/rewards/' + rewardId + '/statistics';
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getRewardAgeDistribution: function (rewardId) {
      var url = '/analytics/rewards/' + rewardId +'/age-distribution';
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    getRewardDeliveryDistribution: function (rewardId, startDate, endDate) {
      var url = '/analytics/rewards/' + rewardId +'/delivery-distribution?startDate=' + startDate + '&endDate=' + endDate;
      return $http.get(baseV1Url + url, {
        headers: getAuthHeader()
      });
    },

    // getGeneratedRedeemedCoupin: function (rewardId) {
    //   var url = '/analytics/rewards/' + rewardId +'/generated-redeemed-coupin';
    //   return $http.get(baseV1Url + url, {
    //     headers: getAuthHeader()
    //   });
    // },
    allRewardPdf: function (start, end) {
      return $http.get(baseV1Url + '/analytics/rewards/reports/pdf?start=' + start + '&end=' + end, {
        headers: getAuthHeader(),
      })
    },
    singleRewardPdf: function (id) {
      return $http.get(baseV1Url + '/analytics/pdf/reward/' + id, {
        headers: getAuthHeader(),
      })
    },
    checkPdfStatus: function (documentId) {
      return $http.get(baseV1Url + '/pdf/status?documentId=' + documentId, {
        headers: getAuthHeader(),
      });
    },
    getExcel: function (start, end) {
      return $http.get(baseV1Url + '/analytics/rewards/reports/xlsx?startDate=' + start + '&endDate=' + end, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });
    },
  }
}]);