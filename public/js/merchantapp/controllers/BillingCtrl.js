angular.module('BillingCtrl', []).controller('BillingController', function (
  $scope,
  StorageService,
  $window,
  ENV_VARS,
  MerchantService,
  UtilService,
) {
  var isPayAsYouGo = $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
  var hasExpired = ($scope.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter($scope.user.merchantInfo.billing.history[0].expiration)) || false;
  var previousPlan = '';

  if (!$scope.user) {
    $scope.user = StorageService.getUser();
  }

  $scope.billing = {
    plan: $scope.user.merchantInfo.billing.plan,
    reference: null,
    date: new Date()
  };

  $scope.history = $scope.user.merchantInfo.billing.history;

  $scope.displayRenew = function () {
    return !isPayAsYouGo && hasExpired;
  };

  $scope.setPlan = function (plan) {
    previousPlan = $scope.billing.plan;
    $scope.billing.plan = plan;
    if (plan === 'monthly') {
      amount = 57000;
      bill = true;
    } else if (plan === 'yearly') {
      amount = 750000;
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
          UtilService.showSuccess('Success', `Subscription successfully renewed!`);
        } else {
          UtilService.showSuccess('Success', `Billing successfully changed to ${$scope.billing.plan} plan!`);
        }
        if (hasExpired) {
          StorageService.setExpired(false);
        }
        $window.location.reload();
      })
      .catch(function (err) {
        UtilService.showError('Uh Oh', 'There was an error while updating your billing info. please contact admin on admin@coupin.com');
      });
  }

  function makePayment() {
    var date = new Date();
    var handler = PaystackPop.setup({
      key: ENV_VARS.payStackId,
      email: $scope.user.email,
      amount: amount * 100,
      ref: `${$scope.billing.plan}-${$scope.user.id}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getTime()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Plan",
            variable_name: "Billing_Plan",
            value: `${$scope.user.merchantInfo.companyName} - ${$scope.billing.plan}-${date.getTime()}`
          }
        ]
      },
      callback: function (response) {
        $scope.billing.date = date;
        $scope.billing.reference = response.reference
        persistBillingInfo();
      },
      onClose: function () {
        $scope.$apply(function () {
          $scope.loading = false;
          $scope.billing.plan = previousPlan;
          UtilService.showInfo('Payment Cancelled', 'Pay when you are ready.');
        });
      }
    });
    handler.openIframe();
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