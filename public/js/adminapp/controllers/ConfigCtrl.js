angular.module('ConfigCtrl', []).controller('ConfigController', function(
  $scope,
  config,
  AdminService,
  UtilService,
  ConfigService,
) {
  $scope.minDate = new Date();
  $scope.trialData = {
    trialStatus: false,
    trialEndDate: '',
  };

  ConfigService.getConfig()
    .then(function (res) {
      console.log(res.data)
      $scope.trialData = {
        trialStatus: res.data.trialPeriod ? res.data.trialPeriod.enabled : false,
        trialEndDate: res.data.trialPeriod ? res.data.trialPeriod.endDate : '',
      };
    });

  $scope.updateTrialConfig = function () {
    if ($scope.trialData.trialStatus && !$scope.trialData.trialEndDate) {
      UtilService.showError('Oh Snap!', 'Please enter a valid date');
      return;
    }

    var data = {
      status: $scope.trialData.trialStatus,
    };

    if ($scope.trialData.trialStatus) {
      data['endDate'] = $scope.trialData.trialEndDate;
    }

    ConfigService.setTrialConfig(data)
      .then(function (res) {
        console.log(res.data);
      });
  }
});
