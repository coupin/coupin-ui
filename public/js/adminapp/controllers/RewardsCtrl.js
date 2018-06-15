angular.module('RewardsCtrl', []).controller('RewardsController', [
  '$scope',
  '$state',
  'merchants',
  'RewardsService',
  'UtilService',
  function(
  $scope,
  $state,
  merchants,
  RewardsService,
  UtilService
) {
  var page = 0;

  $scope.loading = false;
  $scope.merchants = merchants;
  $scope.statuses = [{
    display: 'All',
    value: 'all'
  }, {
    display: 'Pending',
    value: 'isPending'
  }, {
    display: 'Active',
    value: 'active'
  }, {
    display: 'Inactive',
    value: 'inactive'
  }, {
    display: 'Expired',
    value: 'expired'
  }];
  $scope.selectedStatus = $scope.statuses[0].value;

  $scope.addReward = function() {
    $state.go('portal.add-rewards', {
      id: null
    });
  }

  $scope.disableSearch = function() {
    return !UtilService.isDefined($scope.selectedMerch) || $scope.loading;
  };

  $scope.getPage = function() {
    return `Page ${page + 1}`;
  };

  $scope.nextPage = function() {
    if ($scope.merchants.lenght === 10)
    $scope.loadRewards();    
    page++;
  };

  $scope.loadRewards = function () {
    var query = {};
    $scope.loading = true;

    if (UtilService.isDefined($scope.selectedStatus)) {
      query['status'] = $scope.selectedStatus;
    }

    RewardsService.getMerchRewards($scope.selectedMerch._id, query).then(function (result) {
      $scope.rewards = result.data;
      if ($scope.rewards)
      $scope.loading = false;
    }).catch(function (err) {
        console.log(err);
        $scope.loading = false;
    });
  };

  $scope.resetPage = function() {
    page = 0;
  };
}]);