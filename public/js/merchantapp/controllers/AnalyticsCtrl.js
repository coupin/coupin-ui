angular.module('AnalyticsCtrl', []).controller('AnalyticsController', function (
  $scope,
  $state,
  AnalyticsService,
  shouldAccess,
  UtilService
) {
  $scope.page = 1
  $scope.stats = {
    active: 0,
    generated: 0,
    redeemed: 0,
  };
  $scope.shouldAccess = shouldAccess;
  var disableDownload = false;

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
        localStorage.setItem('startDate', $scope.start);
        localStorage.setItem('endDate', $scope.end);
        onDatePickerChange()
      }
    });
  
    if (localStorage.getItem('startDate') && localStorage.getItem('endDate')) {
      var start = localStorage.getItem('startDate');
      var end = localStorage.getItem('endDate');

      $scope.picker.setDateRange(moment(start), moment(end));
    } else {
      $scope.picker.setDateRange(moment().subtract(30, 'day'), moment());
    }


    getRewards($scope.start, $scope.end, $scope.page)
    getStats($scope.start, $scope.end)
  }

  $scope.goToReward = function (rewardId) {
    $state.go('dashboard.reward-analytics', { id: rewardId }, {});
  };

  function onDatePickerChange() {
    if ($scope.start && $scope.end) {
      $scope.loadingRewards = true;
      $scope.loadingStats = true;
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
      var value = ((data.redeemed / data.generated) || 0) * 100;
      $scope.radarSeriesValue = [parseFloat(value.toFixed(2))];
    });
  }

  $scope.getPdf = function () {
    if (disableDownload) {
      UtilService.showWarning('Hey!', 'You have a pending download, please try again after it is done');
      return;
    }

    disableDownload = true;

    AnalyticsService.allRewardPdf($scope.start, $scope.end)
    .then(function (res) {
      UtilService.showInfo('Hey!', 'Your pdf is being generated, download will start when it is ready');

      var interval = setInterval(function () {
        AnalyticsService.checkPdfStatus(res.data.documentId)
          .then(function (_res) {
            if (_res.data.status === 'success') {
              window.open(_res.data.downloadUrl);
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

  $scope.getExcel = function () {
    if (disableDownload) {
      UtilService.showWarning('Hey!', 'You have a pending download, please try again after it is done');
      return;
    }

    AnalyticsService.getExcel($scope.start, $scope.end)
    .then(function (res) {
      console.log(res.data);
      UtilService.showSuccess('Hey!', 'Your file is being downloaded');
      window.open(window.URL.createObjectURL(res.data));
      disableDownload = false;
    }).catch(function (err) {
      clearInterval(interval);
      UtilService.showError('Uh oh!', 'There was an error loading your report, please try again');
      disableDownload = false;
    });
  }
});