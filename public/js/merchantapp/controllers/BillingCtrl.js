angular.module('BillingCtrl', []).controller('BillingController', function (
  $scope,
  $window,
  $timeout,
  ENV_VARS,
  PaymentService,
  StorageService,
  MerchantService,
  UtilService
) {
  var previousPlan = '';
  $scope.showRest = false;
  var url = window.location.origin;
  $scope.loading = false;
  $scope.historyLoading = true;
  var isPayAsYouGo = false;
  var isTrial = false;
  $scope.history = [];
  var hasExpired;
  $scope.user = StorageService.getUser();

  MerchantService.retrieve($scope.user.id).then(function (response) {
    $scope.user.merchantInfo.billing = response.data.merchantInfo.billing;
    StorageService.setUser($scope.user);
    isPayAsYouGo = $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
    isTrial = $scope.user.merchantInfo.billing.plan === 'trial';
    hasExpired = ($scope.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter($scope.user.merchantInfo.billing.history[0].expiration)) || false;
    $scope.history = $scope.user.merchantInfo.billing.history;
    $scope.billing = {
      plan: $scope.user.merchantInfo.billing.plan,
      reference: null,
      date: new Date()
    };
    $scope.historyLoading = false;
  }).catch(function () {
    UtilService.showError('Uh oh!', 'There was an error loading the updated billing history');
    isPayAsYouGo = $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
    hasExpired = ($scope.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter($scope.user.merchantInfo.billing.history[0].expiration)) || false;
    $scope.history = $scope.user.merchantInfo.billing.history;
    $scope.billing = {
      plan: $scope.user.merchantInfo.billing.plan,
      reference: null,
      date: new Date()
    };
    $scope.historyLoading = false;
  });

  $scope.isValidTrialPlan = function () {
    return $scope.billing.plan === 'trial' && !hasExpired;
  };

  $scope.setShowRest = function () {
    $scope.showRest = !$scope.showRest;
  }

  $scope.displayRenew = function () {
    return !isPayAsYouGo && hasExpired;
  };

  $scope.setPlan = function (plan) {
    previousPlan = $scope.billing.plan;
    $scope.billing.plan = plan;
    if (plan === 'monthly') {
      $scope.amount = 57000;
      bill = true;
    } else if (plan === 'yearly') {
      $scope.amount = 750000;
      bill = true;
    } else {
      bill = false;
    }
  };

  $scope.showHistory = function () {
    return $scope.history.length > 0;
  };

  function persistBillingInfo() {
    MerchantService.updateBilling($scope.user.id, $scope.billing)
      .then(function (response) {
        StorageService.setUser(response.data);
        if ($scope.billing.plan === $scope.user.merchantInfo.billing.plan) {
          UtilService.showSuccess('Success', 'Subscription successfully renewed!');
        } else {
          UtilService.showSuccess('Success', 'Billing successfully changed to ' + $scope.billing.plan + ' plan!');
        }
        if (hasExpired) {
          StorageService.setExpired(false);
        }
        $window.location.reload();
      })
      .catch(function (err) {
        UtilService.showError('Uh Oh', 'There was an error while updating your billing info. please contact admin on admin@coupinapp.com');
      });
  }

  function makePayment() {
    $scope.loading = true;
      const paymentObject = {
          callbackUrl: url + '/dashboard/billing',
          amount: $scope.amount,
          email: $scope.user.email,
          type: 'billing',
          billingPlan: $scope.billing.plan,
          companyName: $scope.user.merchantInfo.companyName,
          userId: $scope.user.id,
      };

    PaymentService.initiatePayment(paymentObject).then(function (result) {
        var authorizationUrl = result.data['authorization_url'];
        UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the billing');
        $timeout(function () {
            window.location = authorizationUrl;
        }, 1500)
    });
  }

  function validBilling() {
    if (isPayAsYouGo && $scope.billing.plan !== 'payAsYouGo') {
      return true;
    } else if (isPayAsYouGo && $scope.billing.plan === 'payAsYouGo') {
      UtilService.showInfo('Hey!', 'Pay As You Go cannot be renewed.');
      return false;
    } else {
      var isValid = moment(new Date()).isBefore($scope.user.merchantInfo.billing.history[0].expiration);
      if (isValid) {
        $scope.billing.plan = previousPlan;
        UtilService.showInfo('Hey!', 'Your current plan is yet to expire. Please wait for it to expire before renewing.');
        return false;
      } else {
        return true;
      }
    }
  }

  $scope.updateBilling = function (renew) {
    if (!validBilling()) {
      return;
    }

    if (!renew) {
      if (bill) {
        makePayment();
      } else {
        persistBillingInfo();
      }
    } else {
      $scope.setPlan($scope.user.merchantInfo.billing.plan);
      makePayment();
      // StorageService.setExpired(false);
    }
  };

  $scope.planStatus = function () {
    if ($scope.user.merchantInfo.billing.history[0] && !isPayAsYouGo) {
      return hasExpired ? 'expired' : 'active';
    }

    return false;
  }
});