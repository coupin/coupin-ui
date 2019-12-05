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

  const id = $state.params.id;

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

  getReward(id);
  getGenderDistribution(id);
  getAgeDistribution(id);
  getGeneratedRedeemedCoupin(id);
});