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
  $scope.pin = '';
  $scope.scannerIsActive = false

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
    let rewards = [];
    for(let i = 0; i < $scope.rewards.length; i++) {
      for(let j = 0; j < $scope.use.length; j++) {
        if(i === $scope.use[j]) {
          rewards.push($scope.rewards[i])
        }
      }
    }

    CoupinService.redeem($scope.booking._id, rewards).then(function(response) {
      $scope.updating = false;
      $scope.booking = response.data;
      $scope.rewards = response.data.rewardId;

      $('#confirmationModal').modal('hide');
      $('#confirmationAllModal').modal('hide');
      UtilService.showSuccess('Success!', 'Rewards were successfully redeemed!');
    }).catch(function(err) {
      $scope.updating = false;
      UtilService.showError('Uh Oh', 'Failed to redeem. Please check you network and try again.');

      $('#confirmationModal').modal('hide');
      $('#confirmationAllModal').modal('hide');
    });
  };

  /**
   * Toggle single reward
   * @param {*} index 
   * @param {*} status 
   */
  $scope.toggleReward = function(index, status) {
    const location = $scope.use.indexOf(index);

    if(location > -1) {
      $scope.use.splice(location, 1);
    } else if (location === -1 && status === 'pending') {
      $scope.use.push(index);
    } else if (status === 'expired') {
      UtilService.showError('Uh Oh', 'Sorry the reward has expired');
    }

    $scope.rewards = [ ...$scope.rewards ]
  };

  $scope.isRewardSelected = function (index) {
    return $scope.use.indexOf(index) > -1
  };

  $scope.showTable = function() {
    return $scope.rewards.length > 0 && !$scope.loading;
  };

  $scope.cannotCancelAll = function() {
    return $scope.booking.status !== 'awaiting_payment' && $scope.booking.status !== 'paid'
  };

  $scope.cannotRedeemAll = function() {
    return $scope.rewards.some(reward => reward.status === 'pending')
  }

  $scope.cannotRedeemOne = function() {
    return $scope.use.length < 1
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

    let rewards = $scope.rewards;

    if(id) {
      rewards = $scope.rewards.filter(reward => reward._id === id);
    }
    
    CoupinService.redeem($scope.booking._id, rewards).then(function(response) {
      $scope.updating = false;
      $scope.booking = response.data;
      $scope.rewards = response.data.rewardId;

      UtilService.showSuccess('Success', 'Rewards have been successfully updated'); 
      $('#confirmationModal').modal('hide');
      $('#confirmationAllModal').modal('hide');           
    }).catch(function(err) {
      $scope.updating = false;
      UtilService.showError('Uh Oh', '');

      $('#confirmationModal').modal('hide');
      $('#confirmationAllModal').modal('hide');
    });
  }

  /**
   * Verify Booking Code
   * @param {String} pin 
   */
  $scope.verify = function(pin) {
    if (!pin) return;
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

  let scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });

  function onScanSuccess(decodedText) {
    $scope.pin = decodedText;

    $scope.scannerIsActive = !$scope.scannerIsActive;
    scanner.clear();

    $scope.$digest()
  } 

  $scope.toggleReader = function() {
    $scope.scannerIsActive = !$scope.scannerIsActive;
    scanner.render(onScanSuccess)
  }

  $scope.$watch('select.all', function(newValue) {
    toggleAll(newValue);
  });

  AnalyticsService.getStats(startDate.toISOString(), endDate.toISOString())
    .then(function (res) {
      $scope.loadingStats = false;
      $scope.stats = res.data;
    });
});