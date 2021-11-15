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
    trialDuration: 1,
  };

  ConfigService.getConfig()
    .then(function (res) {
      $scope.trialData = {
        trialStatus: res.data.trialPeriod ? res.data.trialPeriod.enabled : false,
        trialEndDate: res.data.trialPeriod ? res.data.trialPeriod.endDate : '',
        trialDuration: res.data.trialPeriod ? res.data.trialPeriod.duration : 1,
      };
    });

  $scope.updateTrialConfig = function () {
    if ($scope.trialData.trialStatus && !$scope.trialData.trialEndDate) {
      UtilService.showError('Oh Snap!', 'Please enter a valid date');
      return;
    }

    if ($scope.trialData.trialStatus && $scope.trialData.trialDuration < 1) {
      UtilService.showError('Oh Snap!', 'Please enter a valid duration amount');
      return;
    }

    var data = {
      status: $scope.trialData.trialStatus,
    };

    if ($scope.trialData.trialStatus) {
      data['endDate'] = $scope.trialData.trialEndDate;
      data['duration'] = $scope.trialData.trialDuration;
    }

    ConfigService.setTrialConfig(data)
      .then(function (res) {
        var message = 'Trial Period has been ' + ($scope.trialData.trialStatus ? 'activated' : 'deactivated');

        UtilService.showSuccess('Success', message);
      });
  }
});
