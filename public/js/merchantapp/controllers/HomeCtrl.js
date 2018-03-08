angular.module('HomeCtrl', []).controller('HomeController', function(
  $scope,
  StorageService,
  CoupinService,
  RewardsService
) {
  $scope.user = StorageService.getUser();
  $scope.booking = {};
  $scope.rewards = [];
  $scope.empty = false;
  $scope.loading = false;
  $scope.updating = false;
  $scope.used = [];

  $scope.expired = function(date) {
    return new Date(date) < new Date();
  };

  $scope.hasUsed = function(index) {
    console.log(index);
    return $scope.used.includes(index);
  };

  $scope.redeem = function(id, index) {
    $scope.updating = true;

    CoupinService.redeem($scope.booking._id, [id]).then(function(err, response) {
      console.log(response);
      $scope.used.push(index);
      $scope.updating = false;
    }).catch(function(err) {
      console.log(err);
      $scope.updating = false;
    });
  };

  $scope.showTable = function() {
    return $scope.rewards.length > 0 && !$scope.loading;
  };

  $scope.verify = function(pin) {
    $scope.loading = true;
    $scope.empty = false;

    CoupinService.verify(pin).then(function(response) {
      console.log(response);
      $scope.loading = false;
      $scope.booking = response.data;
      $scope.rewards = response.data.rewardId;
      $scope.used = response.data.used;
    }).catch(function(err) {
      console.log(err);
      $scope.loading = false;
      if (err.status === 404) {
        $scope.empty = true;
      }
    });
  };
});