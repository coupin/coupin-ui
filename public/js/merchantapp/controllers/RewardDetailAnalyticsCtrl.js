angular.module('RewardDetailAnalyticsCtrl', []).controller('RewardDetailAnalyticsController', function (
  $scope,
  $state,
  UtilService,
  RewardsService,
  AnalyticsService
) {
  $state.reward = {};
  $scope.ageDistributionData = [{
    name: 'Female',
    data: [0, 0]
  }, {
    name: 'Male',
    data: [0, 0]
  }]

  $scope.id = $state.params.id;

  $scope.goToAnalytics = function () {
    $state.go('dashboard.analytics', {}, {});
  };

  function getReward(rewardId) {
    AnalyticsService.getSingleReward(rewardId).then(function (result) {
      $scope.reward = result.data;
      $scope.reward.endDate = new Date($scope.reward.endDate);
      $scope.reward.startDate = new Date($scope.reward.startDate);
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getGenderDistribution(rewardId) {
    AnalyticsService.getRewardGenderDistribution(rewardId).then(function (result) {
      $scope.genderDistributionData = result.data;
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getAgeDistribution(rewardId) {
    AnalyticsService.getRewardAgeDistribution(rewardId).then(function (result) {
      $scope.ageDistributionData = result.data;
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getGeneratedRedeemedCoupin(rewardId) {
    AnalyticsService.getGeneratedRedeemedCoupin(rewardId).then(function (result) {
      $scope.generatedVsRedeemed = result.data;
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  $scope.getPdf = function () {
    AnalyticsService.singleRewardPdf($scope.id)
    .then(function (res) {
      console.log(res)
      UtilService.showInfo('Hey!', 'Your pdf is being generated, download will start when it is ready');

      var interval = setInterval(function () {
        AnalyticsService.checkPdfStatus(res.data.documentId)
          .then(function (_res) {
            if (_res.data.status === 'success') {
              window.open(_res.data.downloadUrl, '_blank');
              UtilService.showSuccess('Hey!', 'Your pdf is ready, download will start soon');
              clearInterval(interval);
            }
          }).catch(function (err) {
            clearInterval(interval);
            UtilService.showError('Uh oh!', 'There was an error loading your pdf, please try again');
          });
      }, 3000);
    });
  }

  getReward($scope.id);
  getGenderDistribution($scope.id);
  getAgeDistribution($scope.id);
  getGeneratedRedeemedCoupin($scope.id);
});