angular.module('RewardsListCtrl', []).controller('RewardsListController', function(
  $scope,
  $state,
  MerchantService,
  UtilService,
  RewardsService,
  StorageService
) {
  $scope.loadingRewards = false;
  /**
   * Change status of a reward
   * @param {*} index 
   * @param {*} isActive 
   * @param {*} tab 
   */
  $scope.changeStatus = function($event, index, isActive, tab) {
    $event.stopPropagation();
    var reward = {};
    if (tab === 0) {
        reward = $scope.rewards[index];
    } else if (tab === 1) {
        reward = $scope.activeRewards[index];
    } else if (tab === 2) {
        rewards = $scope.inactiveRewards[index];
    }

    if (isActive) {
      RewardsService.deactivate(reward._id).then(function (result) {
          if (result.status === 200) {
              reward.isActive = false;
          } else if (result.status === 500) {
              UtilService.showError('errTitle', 'errMsg');
          } else {
              UtilService.showError('errTitle', result.data);
          }
      }).catch(function (err) {
        UtilService.showError('errTitle', 'errMsg');
      });  
    } else {
      RewardsService.activate(reward._id).then(function (result) {
          if (result.status === 200) {
              reward.isActive = true;
          } else if (result.status === 500) {
              UtilService.showError('errTitle', 'errMsg');
          } else {
              UtilService.showError('errTitle', result.data);
          }
      }).catch(function (err) {
          UtilService.showError('errTitle', 'errMsg');
      });
    }
  }

  $scope.goToNewReward = function() {
    $state.go('dashboard.reward-add', {}, {});
  };

  /**
   * Edit Reward
   * @param {rewardId} id 
   */
  $scope.goToEditReward = function(id) {
    $state.go('dashboard.reward-add-edit', { id: id }, {});
  };

  /**
   * Go to rewards
   * @param {rewardId} id 
   */
  $scope.goToReward = function(id) {
    if (id === undefined) {
    //   const _id = $location.search().id;
      RewardsService.getReward(_id).then(function (result) {
          if (result.status === 200) {
              $scope.reward = result.data;
          } else {
            UtilService.showError('errTitle', 'errMsg');
          }
      }).catch();
    } else {
        $state.go('dashboard.reward-add-edit', { id: id }, {});
    }
  };

  $scope.isExpired = function() {
      return StorageService.isExpired();
  };

  /**
   * Load a reward or route to reward page
   */
  $scope.loadRewards = function () {
    $scope.loadingRewards = true;
    var details = {};

    if (angular.isDefined($scope.query)) {
      details['query'] = $scope.query;
    }

    RewardsService.getMerchRewards(details).then(function (result) {
      $scope.loadingRewards = false;
      $scope.rewards = result.data;
    }).catch(function (err) {
        $scope.loadingRewards = false;
        console.log(err);
        // showError(errTitle, errMsg);
    });
  };
});