angular.module('HomeCtrl', []).controller('HomeController', function(
  $location,
  $scope,
  StorageService,
  CoupinService,
  RewardsService,
  UtilService,
  AnalyticsService
) {
  $scope.user = StorageService.getUser();
  $scope.booking = {};
  $scope.rewards = [];
  $scope.empty = false;
  $scope.loading = false;
  $scope.loadingStats = true;
  $scope.stats = {
    active: 0,
    generated: 0,
    redeemed: 0,
  };
  $scope.select = {
    all: false
  };
  $scope.updating = false;
  $scope.use = [];
  $scope.selectedReward = {};
  $scope.mockRewards = [
    {
        id: {
        name: 'Arinze reward',
        description: 'Something Just Like This',
        endDate: '2022-03-07T23:00:00.000Z',
        },
        status: 'used',
        quantity: 2,
        _id: 1
    },
    {
        id: {
        name: 'James reward',
        description: 'Closer',
        endDate: '2022-06-07T23:00:00.000Z',
        },
        status: 'expired',
        quantity: 3,
        _id: 3
    },
    {
        id: {
        name: 'Josiah reward',
        description: 'Something Just Like That',
        endDate: '2022-03-06T23:00:00.000Z',
        },
        status: 'used',
        quantity: 4,
        _id: 4
    }
]

  const endDate = new Date();
  const startDate = moment(endDate).subtract(30, 'day');

  /**
   * Toggle all rewards
   * @param {*} select 
   */
  function toggleAll(select) {
    if (select) {
      $scope.rewards.forEach((function(element, index) {
        if($scope.use.indexOf(index) === -1 && element.status === 'pending') {
          $('#reward-'+index).toggleClass('selected');
          $scope.use.push(index);
        }
      }));
    } else {
      $scope.use.forEach((function(element, index) {
          $('#reward-'+index).toggleClass('selected');
      }));
      $scope.use = [];
    }
  };

  $scope.expired = function(date) {
    return new Date(date) < new Date();
  };

  $scope.redeem = function() {
    $scope.updating = true;

    CoupinService.redeem($scope.booking._id, $scope.rewards)
    .then(function(response) {
      const data = response.data.rewardId;

      $scope.updating = false;
      $scope.rewards.forEach(function(object, index) {
        object.status = data[index].status;
        object.usedOn = data[index].usedOn;
      });
      toggleAll(false);
      UtilService.showSuccess('Success!', 'Rewards were successfully redeemed!');
    }).catch(function(err) {
      console.log(err);
      $scope.updating = false;
      UtilService.showError('Uh Oh', 'Failed to redeem. Please check you network and try again.');
    });
  };

  /**
   * Toggle single reward
   * @param {*} index 
   * @param {*} status 
   */
  $scope.toggleReward = function(index, status) {
    const location = $scope.use.indexOf(index);
    // var toggle = false;

    if(location > -1) {
      toggle = true;
      $scope.use.splice(location, 1);
    } else if (location === -1 && status === 'pending') {
      toggle = true;
      $scope.use.push(index);
    } else if (status === 'expired') {
      UtilService.showError('Uh Oh', 'Sorry the reward has expired');
    }

    // if (toggle) {
    //   $('#reward-'+index).toggleClass('selected');
    // }
  };

  $scope.isRewardSelected = function (index) {
    return $scope.use.indexOf(index) > -1
  };

  $scope.showTable = function() {
    return $scope.rewards.length > 0 && !$scope.loading;
  };

  $scope.disableButton = {
    cancelAll: function() {
      return $scope.booking.status !== 'awaiting_payment' && $scope.booking.status !== 'paid'
    },
    redeemAll: function() {
      return $scope.rewards.some(reward => reward.status === 'pending')
    }
  }

  $scope.setSelectedReward = function(reward) {
    $scope.selectedReward = {
      id: reward._id,
      name: reward.id.name,
      status: reward.status
    }
  }

  /**
   * Cancel Booking Code
   * @param {String} pin 
   */

  $scope.cancel = function(id) {
    $scope.updating = true;

    CoupinService.cancel(id).then(function(response) {
      $scope.updating = false;
      $scope.booking = response.data;
      $scope.rewards = response.data.rewardId;
      $('#confirmationModal').modal('hide');
      UtilService.showSuccess('Success', `${selectedReward.name} booking order has successfully been cancelled`)
    }).catch(function(err) {
      $('#confirmationModal').modal('hide');
      $scope.updating = false;
      UtilService.showError('Uh Oh', 'Looks like something went wrong, please try again later')
    })
  }

  /**
   * Verify Booking Code
   * @param {String} pin 
   */
  $scope.verify = function(pin) {
    $scope.loading = true;
    $scope.empty = false;

    CoupinService.verify(pin).then(function(response) {
      $scope.loading = false;
      $scope.booking = response.data;
      $scope.rewards = response.data.rewardId;
    }).catch(function(err) {
      $scope.loading = false;
      if (err.status === 404) {
        $scope.empty = true;
      } else {
        UtilService.showError('Uh Oh', '');
      }
    });
  };

  $scope.$watch('select.all', function(newValue) {
    toggleAll(newValue);
  });

  AnalyticsService.getStats(startDate.toISOString(), endDate.toISOString())
    .then(function (res) {
      $scope.loadingStats = false;
      $scope.stats = res.data;
    });
});