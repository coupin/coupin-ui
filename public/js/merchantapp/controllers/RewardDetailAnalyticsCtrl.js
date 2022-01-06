angular.module('RewardDetailAnalyticsCtrl', []).controller('RewardDetailAnalyticsController', function (
  $scope,
  $state,
  UtilService,
  RewardsService,
  AnalyticsService
) {
  $state.reward = {};
  // $scope.ageDistributionData = [{
  //   name: 'Female',
  //   data: [0, 0]
  // }, {
  //   name: 'Male',
  //   data: [0, 0]
  // }]

  $scope.id = $state.params.id;
  var disableDownload = false;

  $scope.hideDeliveryDistribution = false;
  $scope.hideGenderDistribution = false;

  $scope.goToAnalytics = function () {
    $state.go('dashboard.analytics', {}, {});
  };

  function add(accumulator, a) {
    return accumulator + a;
  }

  function getReward(rewardId) {
    RewardsService.getReward(rewardId).then(function (result) {
      $scope.reward = result.data;
      $scope.reward.endDate = new Date($scope.reward.endDate);
      $scope.reward.startDate = new Date($scope.reward.startDate);
      getDeliveryDistribution($scope.id);
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getRewardBaseStats(rewardId) {
    AnalyticsService.getSingleReward(rewardId).then(function (result) {
      const { data } = result.data;

      $scope.reward.generatedCoupin = data.totalGenerated;
      $scope.reward.redeemedCoupin = data.totalRedeemed;

      var value = ((data.totalRedeemed / data.totalGenerated) || 0) * 100;
      $scope.radarSeriesValue = [parseFloat(value.toFixed(2))];
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getGenderDistribution(rewardId) {
    AnalyticsService.getRewardGenderDistribution(rewardId).then(function (result) {
      const { totalMale, totalFemale, totalUnspecified } = result.data.data;
      $scope.genderDistributionData = [totalMale, totalFemale, totalUnspecified];
      // $scope.genderDistributionData = [22, 18, 7];
      $scope.hideGenderDistribution = !$scope.genderDistributionData.reduce(add, 0);
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getAgeDistribution(rewardId) {
    AnalyticsService.getRewardAgeDistribution(rewardId).then(function (result) {
      const { data } = result.data;
      $scope.ageDistributionData = [data['under 15'], data['15 - 25'], data['25 - 35'], data['35 - 45'], data['above 45'], data.unspecified];
      // $scope.ageDistributionData = [27, 50, 15, 7, 1, 8];
      $scope.hideAgeDistribution = !$scope.ageDistributionData.reduce(add, 0);
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  function getDeliveryDistribution(rewardId) {
    AnalyticsService.getRewardDeliveryDistribution(rewardId, $scope.reward.startDate.getTime(), $scope.reward.endDate.getTime()).then(function (result) {
      const { totalDelivery, totalPickUp } = result.data.data;
      const { data } = result.data;
      console.log('data --> ', data)
      $scope.deliveryDistributionData = [totalDelivery, totalPickUp];
      // $scope.deliveryDistributionData = [12, 4];
      $scope.hideDeliveryDistribution = !$scope.deliveryDistributionData.reduce(add, 0);
    }).catch(function (error) {
        UtilService.showError('Error getting data', error.data);
    });
  }

  // function getGeneratedRedeemedCoupin(rewardId) {
  //   AnalyticsService.getGeneratedRedeemedCoupin(rewardId).then(function (result) {
  //     $scope.generatedVsRedeemed = result.data.data;
  //   }).catch(function (error) {
  //       UtilService.showError('Error getting data', error.data);
  //   });
  // }

  $scope.getPdf = function () {
    if (disableDownload) {
      UtilService.showWarning('Hey!', 'You have a pending download, please try again after it is done');
      return;
    }

    disableDownload = true;

    AnalyticsService.singleRewardPdf($scope.id)
    .then(function (res) {
      UtilService.showInfo('Hey!', 'Your pdf is being generated, download will start when it is ready');

      var interval = setInterval(function () {
        AnalyticsService.checkPdfStatus(res.data.documentId)
          .then(function (_res) {
            if (_res.data.status === 'success') {
              window.open(_res.data.downloadUrl, '_blank');
              UtilService.showSuccess('Hey!', 'Your pdf is ready, download will start soon');
              clearInterval(interval);
            }

            disableDownload = false;
          }).catch(function (err) {
            clearInterval(interval);
            UtilService.showError('Uh oh!', 'There was an error loading your pdf, please try again');
            disableDownload = false;
          });
      }, 3000);
    });
  }

  getReward($scope.id);
  getRewardBaseStats($scope.id);
  getGenderDistribution($scope.id);
  getAgeDistribution($scope.id);
  // getGeneratedRedeemedCoupin($scope.id);
});