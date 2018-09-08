angular.module('HomeCtrl', []).controller('HomeController', function(
  $alert,
  $location,
  $scope,
  StorageService,
  CoupinService,
  RewardsService,
  UtilService
) {
  $scope.user = StorageService.getUser();
  $scope.booking = {};
  $scope.rewards = [];
  $scope.empty = false;
  $scope.loading = false;
  $scope.select = {
    all: false
  };
  $scope.updating = false;
  $scope.use = [];

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

  $scope.displayExpirationMessage = function() {
    return moment(new Date()).isAfter($scope.user.merchantInfo.billing.history[0].expiration);
  };

  $scope.expired = function(date) {
    return new Date(date) < new Date();
  };

  $scope.redeem = function() {
    $scope.updating = true;

    CoupinService.redeem($scope.booking._id, $scope.use)
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
    var toggle = false;

    if(location > -1) {
      toggle = true;
      $scope.use.splice(location, 1);
    } else if (location === -1 && status === 'pending') {
      toggle = true;
      $scope.use.push(index);
    } else if (status === 'expired') {
      UtilService.showError('Uh Oh', 'Sorry the reward has expired');
    }

    if (toggle) {
      $('#reward-'+index).toggleClass('selected');
    }
  };

  $scope.showTable = function() {
    return $scope.rewards.length > 0 && !$scope.loading;
  };

  $scope.disableButton = function() {
    return $scope.use.length === 0;
  }

  /**
   * Verify Booking Code
   * @param {String} pin 
   */
  $scope.verify = function(pin) {
    $scope.loading = true;
    $scope.empty = false;

    CoupinService.verify(pin).then(function(response) {
      console.log(response);
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

  // $scope.$watch(function() {
  //   $location.path();
  // }, function() {
  //   console.log('Change');
  //   var pathArray = $location.path().split("/");
  //   var page = pathArray[pathArray.length - 1];
  //   if (page === 'home' || page === 'rewards' || page === 'profile') {
  //     $(`#${page}`).toggleClass('nav-active');
  //   }
  // });

  $scope.$watch('select.all', function(newValue) {
    toggleAll(newValue);
  });
});