angular.module('AnalyticsCtrl', []).controller('AnalyticsController', function (
  $scope,
  $state,
  AnalyticsService,
  shouldAccess
) {
  $scope.page = 1
  $scope.stats = {
    active: 0,
    generated: 0,
    redeemed: 0,
  };
  $scope.shouldAccess = shouldAccess;

  if (shouldAccess) {
    $scope.loadingRewards = true;
    $scope.loadingStats = true;
    $scope.radarSeriesValue = [0];
    getOverallCoupinStat();

    $scope.picker = new Lightpick({
      field: document.getElementById('datepicker'),
      singleDate: false,
      numberOfMonths: 2,
      onSelect: function (start, end) {
        $scope.start = start
        $scope.end = end
        onDatePickerChange()
      }
    });
  
    $scope.picker.setDateRange(moment().subtract(30, 'day'), moment());
    getRewards($scope.start, $scope.end, $scope.page)
    getStats($scope.start, $scope.end)
  }

  $scope.goToReward = function (rewardId) {
    $state.go('dashboard.reward-analytics', { id: rewardId }, {});
  };

  function onDatePickerChange() {
    if ($scope.start && $scope.end) {
       getRewards($scope.start, $scope.end, $scope.page)
       getStats($scope.start, $scope.end)
    }
  }

  function getStats(start, end) {
    AnalyticsService.getStats($scope.start, $scope.end)
      .then(function (res) {
        $scope.loadingStats = false;
        $scope.stats = res.data;
      });
  }

  function getRewards(start, end, page) {
    AnalyticsService.getRewards(start, end, page)
    .then(function (res) {
      $scope.loadingRewards = false;
      $scope.rewards = res.data.rewards.map(function (reward) {
        return {
          _id: reward._id,
          name: reward.reward.name,
          start: moment(reward.reward.startDate).format('ll'),
          expires: moment(reward.reward.endDate).format('ll'),
          coupins: {
            generated: reward.generatedCoupin,
            redeemed: reward.redeemedCoupin,
          }
        }
      });
    });
  }

  function getOverallCoupinStat() {
    AnalyticsService.getOverallCoupinStat()
    .then(function (res) {
      var data = res.data;
      var value = (data.redeemed / data.generated) * 100;
      $scope.radarSeriesValue = [parseFloat(value.toFixed(2))];
    });
  }
});