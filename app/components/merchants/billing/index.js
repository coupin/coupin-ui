import moment from 'moment';

class MerchantBilling {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor(
    $window,
    $timeout,
    PaymentService,
    StorageService,
    MerchantService,
    UtilService
  ) {
    'ngInject';

    this.$window = $window;
    this.$timeout = $timeout;
    this.StorageService = StorageService;
    this.PaymentService = PaymentService;
    this.MerchantService = MerchantService;
    this.UtilService = UtilService;
  }

  $onInit() {
    this.previousPlan = '';
    this.showRest = false;
    this.url = window.location.origin;
    this.loading = false;
    this.historyLoading = true;
    this.isPayAsYouGo = false;
    this.isTrial = false;
    this.history = [];
    this.hasExpired;
    this.user = this.StorageService.getUser();

    this.MerchantService.retrieve(this.user.id).then((response) => {
      this.user.merchantInfo.billing = response.data.merchantInfo.billing;
      this.StorageService.setUser(this.user);
      this.isPayAsYouGo = this.user.merchantInfo.billing.plan === 'payAsYouGo';
      this.isTrial = this.user.merchantInfo.billing.plan === 'trial';
      this.hasExpired = (this.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter(this.user.merchantInfo.billing.history[0].expiration)) || false;
      this.history = this.user.merchantInfo.billing.history;
      this.billing = {
        plan: this.user.merchantInfo.billing.plan,
        reference: null,
        date: new Date()
      };
      this.historyLoading = false;
    }).catch(() => {
      this.UtilService.showError('Uh oh!', 'There was an error loading the updated billing history');
      this.isPayAsYouGo = this.user.merchantInfo.billing.plan === 'payAsYouGo';
      this.hasExpired = (this.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter(this.user.merchantInfo.billing.history[0].expiration)) || false;
      this.history = this.user.merchantInfo.billing.history;
      this.billing = {
        plan: this.user.merchantInfo.billing.plan,
        reference: null,
        date: new Date()
      };
      this.historyLoading = false;
    });

    this.plans = [
      {
        title: 'Pay as you go',
        value: 'payAsYouGo',
        price: '₦500 per Day',
        details: [
          'Single Reward Payments',
          '15% off any reward that exceeds 7 days',
          'Access to Customer Insights Through the Analytics Dashboard',
        ]
      },
      {
        title: 'Start Up Plan',
        value: 'monthly',
        price: '₦57,000 per Month',
        details: [
          'Unlimited Rewards Addition within Month of Payment',
          'Dedicated Tech Support',
          'Access to Customer Insights Through the Analytics Dashboard',
        ]
      },
      {
        title: 'Corporate Plan',
        value: 'yearly',
        price: '₦750,000 per Year',
        details: [
          'All of start up plan Options',
          'Coupin Concierge at Merchant Location',
        ]
      },
    ]
  }

  isValidTrialPlan() {
    if (this.billing) {
      return this.billing.plan === 'trial' && !this.hasExpired;
    }

    return false;
  }

  setShowRest() {
    this.showRest = !this.showRest;
  }

  displayRenew() {
    return !this.isPayAsYouGo && this.hasExpired;
  }

  setPlan (plan) {
    this.previousPlan = this.billing.plan;
    this.billing.plan = plan;
    if (plan === 'monthly') {
      this.amount = 57000;
      this.bill = true;
    } else if (plan === 'yearly') {
      this.amount = 750000;
      this.bill = true;
    } else {
      this.bill = false;
    }
  }

  showHistory() {
    return this.history.length > 0;
  }

  persistBillingInfo() {
    this.MerchantService.updateBilling(this.user.id, this.billing)
      .then((response) => {
        this.StorageService.setUser(response.data);
        if (this.billing.plan === this.user.merchantInfo.billing.plan) {
          this.UtilService.showSuccess('Success', 'Subscription successfully renewed!');
        } else {
          this.UtilService.showSuccess('Success', 'Billing successfully changed to ' + this.billing.plan + ' plan!');
        }
        if (this.hasExpired) {
          this.StorageService.setExpired(false);
        }
        this.$window.location.reload();
      })
      .catch((err) => {
        this.UtilService.showError('Uh Oh', 'There was an error while updating your billing info. please contact admin on admin@coupinapp.com');
      });
  }

  makePayment() {
    this.loading = true;
    const paymentObject = {
        callbackUrl: this.url + '/dashboard/billing',
        amount: this.amount,
        email: this.user.email,
        type: 'billing',
        billingPlan: this.billing.plan,
        companyName: this.user.merchantInfo.companyName,
        userId: this.user.id,
    };

    this.PaymentService.initiatePayment(paymentObject).then((result) => {
        const authorizationUrl = result.data['authorization_url'];
        this.UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the billing');
        this.$timeout(() => {
            window.location = authorizationUrl;
        }, 1500)
    });
  }

  validBilling() {
    if (this.isPayAsYouGo && this.billing.plan !== 'payAsYouGo') {
      return true;
    }
    
    if (this.isPayAsYouGo && this.billing.plan === 'payAsYouGo') {
      this.UtilService.showInfo('Hey!', 'Pay As You Go cannot be renewed.');
      return false;
    }

    const isValid = moment(new Date()).isBefore(this.user.merchantInfo.billing.history[0].expiration);
    if (isValid) {
      this.billing.plan = this.previousPlan;
      this.UtilService.showInfo('Hey!', 'Your current plan is yet to expire. Please wait for it to expire before renewing.');
      return false;
    } else {
      return true;
    }
  }

  updateBilling(renew) {
    if (!this.validBilling()) {
      return;
    }

    if (!renew) {
      if (this.bill) {
        this.makePayment();
      } else {
        this.persistBillingInfo();
      }
    } else {
      this.setPlan(this.user.merchantInfo.billing.plan);
      this.makePayment();
    }
  }

  planStatus() {
    if (this.user.merchantInfo.billing.history[0] && !this.isPayAsYouGo) {
      return this.hasExpired ? 'expired' : 'active';
    }

    return false;
  }
}

export default app => app.component(
  'merchantBilling', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantBilling,
    controllerAs: 'vm',
    bindings: MerchantBilling.bindings(),
    require: MerchantBilling.require()
  }
);
