angular.module('RewardsListCtrl', []).controller('RewardsListController', function(
  $scope,
  $state,
  $location,
  BankService,
  MerchantService,
  UtilService,
  RewardsService,
  StorageService
) {
  $scope.loadingRewards = false;
  $scope.page = 1;
  $scope.user = StorageService.getUser();

  // .newReward || $location.search() ? $location.search().newReward : {};
  const query = $state.params.newReward || $location.search().newReward;

  if (query && query.newReward && !hasAccountDetails()) {
    $('#accountInfoModal').modal('show');
  }

  // Account Info Variables
  $scope.bankInfo = {
    accountNumber: '',
    accountBank: '',
  };
  $scope.customerAccountDetails = null;
  $scope.showSaveAccount = false;
  $scope.confirmAccountLoading = false;
  $scope.accountConfirmationError = '';

  function getBanks() {
    BankService.getBanks()
        .then(({ data }) => {
            $scope.banks = data.banks;
        });
  }

  function hasAccountDetails() {
    const accountDetails = $scope.user.merchantInfo.accountDetails
    const accountKeys = Object.keys(accountDetails);

    const values = ['accountNumber',
    'bankName',
    'accountName',
    'bankCode'].every((field) => accountDetails[field]);

    return accountKeys.length > 0 && values
  }

  getBanks();

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

  $scope.accountInfoChange = function() {
    $scope.showSaveAccount = false;
};

  $scope.confirmAccountDetails = function () {
    const { accountNumber, accountBank } = $scope.bankInfo;
    $scope.confirmAccountLoading = true;

    const payload = {
        accountNumber,
        accountBankCode: accountBank.code,
    };

    MerchantService
        .confirmAccountDetails(payload)
        .then(({ data }) => {
            $scope.confirmAccountLoading = false;
            $scope.showSaveAccount = true;

            // save merchants account details here
            $scope.customerAccountDetails = {
                accountNumber,
                bankName: accountBank.name,
                accountName: data.account_name,
                bankCode: accountBank.code,
            };

            UtilService.showSuccess('Success', 'Account details have been confirmed');
        }).catch((error) => {
            $scope.confirmAccountLoading = false;
            $scope.accountConfirmationError = error.data.message;
            UtilService.showError('Error', error.data.message);

        });
  };

  $scope.saveMerchantAccountDetails = function () {
    MerchantService
        .saveAccountDetails($scope.customerAccountDetails)
        .then(() => {
            UtilService.showSuccess('Success', 'Account details have been stored');
            $('#accountInfoModal').modal('hide');
            MerchantService.refreshUser($scope.user.id);
            $state.go('dashboard.rewards', {});
        }).catch((error) => {
            $scope.accountSavingError = error.data.message;
            UtilService.showError('Error', error.data.message);
        })
  };

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

    details.page = $scope.page;

    RewardsService.getMerchRewards(details).then(function (result) {
      $scope.loadingRewards = false;
      $scope.rewards = result.data;
    }).catch(function (err) {
        $scope.loadingRewards = false;
        console.log(err);
        // showError(errTitle, errMsg);
    });
  };

  $scope.previousRewards = function () {
    if ($scope.page !== 1) {
      $scope.page -= 1;
      $scope.loadingRewards = true;
      $scope.rewards = [];
      $scope.loadRewards();
    }
  }

  $scope.nextRewards = function () {
    if ($scope.rewards && $scope.rewards.length === 10) {
      $scope.page += 1;
      $scope.loadingRewards = true;
      $scope.rewards = [];
      $scope.loadRewards();
    }
  }
});