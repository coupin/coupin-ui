angular.module('RewardsCtrl', []).controller('RewardsController', [
  '$scope',
  '$state',
  'merchants',
  'AdminRewardsService',
  'UtilService',
  function(
  $scope,
  $state,
  merchants,
  AdminRewardsService,
  UtilService
) {
  var page = 0;

  $scope.loading = false;
  $scope.merchants = [{
    _id: 0,
    merchantInfo: {
      companyName: 'All'
    }
  }];
  $scope.merchants = $scope.merchants.concat(merchants);
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

  $scope.parseStatus = function(status, date) {
    var inStatus = moment(new Date()).isAfter(date) ? 'Active' : 'Inactive';
    return status === 'active' ? inStatus : status;
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

    AdminRewardsService.getMerchRewards($scope.selectedMerch._id, query).then(function (result) {
      $scope.loading = false;
      $scope.rewards = result.data;
    }).catch(function (err) {
        $scope.loading = false;
    });
  };

  $scope.resetPage = function() {
    page = 0;
  };
}]);