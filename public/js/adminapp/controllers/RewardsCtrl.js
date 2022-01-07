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
  $scope.page = 0;
  $scope.maxPage = 0;
  $scope.selectedReward = {
    name: '',
    action: ''
  }

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
    var inStatus = Date.now > (new Date(date)) ? 'InActive' : 'Active';
    return status === 'active' ? inStatus : status;
  };

  $scope.getPage = function() {
    var page = $scope.page + 1
    return "Page " + page;
  };

  $scope.previousPage = function() {
    if ($scope.page > 0) {
      $scope.page -= 1;
      $scope.loadRewards();    
    }
  };

  $scope.nextPage = function() {
    if ($scope.page < ($scope.maxPage - 1)) {
      $scope.page += 1;
      $scope.loadRewards();    
    }
  };

  $scope.selectPage = function(page) {

  };

  $scope.loadRewards = function () {
    var query = {
      limit: 10,
      page: $scope.page,
    };

    $scope.loading = true;

    if (UtilService.isDefined($scope.selectedStatus)) {
      query['status'] = $scope.selectedStatus;
    }

    const selectedId = !!$scope.selectedMerch ? $scope.selectedMerch._id : 0;
    AdminRewardsService.getMerchRewards(selectedId, query).then(function (result) {
      $scope.loading = false;
      $scope.rewards = result.data;
    }).catch(function (err) {
        $scope.loading = false;
    });

    AdminRewardsService.getMerchRewardsCount(!!$scope.selectedMerch ? $scope.selectedMerch._id : '0', query).then(function (result) {
      $scope.rewardsCount = result.data.count;
      $scope.maxPage = Math.ceil($scope.rewardsCount / 10);
    });
  };

  $scope.resetPage = function() {
    $scope.page = 0;
    $scope.loadRewards();
  };

  $scope.showModal = function (id, method) {
    const reward = $scope.rewards.find(reward => reward._id === id);
    $scope.method = method

    if (method === 'put') {
      $scope.selectedReward.action = reward.isActive ? 'deactivate' : 'activate'
      $scope.selectedReward.status = reward.status === 'inactive' ? 'active' : 'inactive'
    } else {
      $scope.selectedReward.action = 'delete'
    }

    $scope.selectedReward.id = reward._id;
    $scope.selectedReward.name = reward.name;
  }

  $scope.updateVisibility = function(id, status, method) {
    var newRewards = [...$scope.rewards];

    if (method === 'put') {
      var selectedRewardIdx = newRewards.findIndex(reward => reward._id === id);
      newRewards[selectedRewardIdx].isActive = !newRewards[selectedRewardIdx].isActive;
      newRewards[selectedRewardIdx].status = newRewards[selectedRewardIdx].status === 'active' ? 'inactive' : 'active';
  
      $scope.rewards = newRewards;
      AdminRewardsService.toggleRewardStatus(id, status);
    } else {
      $scope.rewards = newRewards.filter(reward => reward._id !== id)
  
      AdminRewardsService.deleteReward(id);
    }

  }
}]);