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
  var redeem = [];

  $scope.expired = function(date) {
    return new Date(date) < new Date();
  };

  $scope.redeem = function(id, index) {
    $scope.updating = true;

    CoupinService.redeem($scope.booking._id, [id]).then(function(err, response) {
      $scope.updating = false;
    }).catch(function(err) {
      console.log(err);
      $scope.updating = false;
    });
  };

  $scope.toggleRedeem = function(index) {
    const location = redeem.indexOf(index);

    if(location > -1) {
      redeem.splice(location, 1);
    } else{
      redeem.push(index);
    }
    $('#'+index).toggleClass('selected');
  };

  $scope.remove = function(index) {
    redeem.push(index);
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