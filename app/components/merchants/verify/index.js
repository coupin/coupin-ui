import angular from 'angular';

class MerchantVerify {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor(
    StorageService,
    CoupinService,
    UtilService,
    AnalyticsService,
    $scope,
  ) {
    'ngInject';

    this.StorageService = StorageService;
    this.UtilService = UtilService;
    this.AnalyticsService = AnalyticsService;
    this.CoupinService = CoupinService;
    this.$scope = $scope;
  }

  $onInit() {
    this.user = this.StorageService.getUser();
    this.booking = {};
    this.rewards = [];
    this.empty = false;
    this.loading = false;
    this.loadingStats = true;
    this.stats = {
      active: 0,
      generated: 0,
      redeemed: 0,
    };
    this.select = {
      all: false
    };
    this.updating = false;
    this.use = [];

    this.AnalyticsService.getStats()
      .then((res) => {
        this.loadingStats = false;
        this.stats = res.data;
      });

    this.watchSelectAll();
  }

  toggleAll(select) {
    if (select) {
      this.rewards.forEach((function(element, index) {
        if(this.use.indexOf(index) === -1 && element.status === 'pending') {
          angular.element('#reward-'+index).toggleClass('selected');
          this.use.push(index);
        }
      }));
    } else {
      this.use.forEach((function(element, index) {
          angular.element('#reward-'+index).toggleClass('selected');
      }));
      this.use = [];
    }
  }

  watchSelectAll() {
    this.$scope.$watch('select.all', (newValue) => {
      this.toggleAll(newValue);
    });
  }

  expired(date) {
    return new Date(date) < new Date();
  }

  redeem() {
    this.updating = true;

    this.CoupinService.redeem(this.booking._id, this.use)
      .then(function(response) {
        const data = response.data.rewardId;

        this.updating = false;
        this.rewards.forEach(function(object, index) {
          object.status = data[index].status;
          object.usedOn = data[index].usedOn;
        });
        toggleAll(false);
        this.UtilService.showSuccess('Success!', 'Rewards were successfully redeemed!');
      }).catch(function(err) {
        console.log(err);
        this.updating = false;
        this.UtilService.showError('Uh Oh', 'Failed to redeem. Please check you network and try again.');
      });
  }

  toggleReward(index, status) {
    const location = this.use.indexOf(index);

    if (location > -1) {
      this.use.splice(location, 1);
      return;
    }

    if (location === -1 && status === 'pending') {
      this.use.push(index);
      return;
    }

    this.UtilService.showError('Uh Oh', 'Sorry the reward has expired');
  }

  isRewardSelected(index) {
    return this.use.indexOf(index) > -1
  }

  showTable() {
    return this.rewards.length > 0 && !this.loading;
  }

  disableButton() {
    return this.use.length === 0;
  }

  verify(pin) {
    this.loading = true;
    this.empty = false;

    this.CoupinService.verify(pin).then(function(response) {
      this.loading = false;
      this.booking = response.data;
      this.rewards = response.data.rewardId;
    }).catch(function(err) {
      this.loading = false;
      if (err.status === 404) {
        this.empty = true;
      } else {
        this.UtilService.showError('Uh Oh', '');
      }
    });
  }
}

export default app => app.component(
  'merchantVerify', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantVerify,
    controllerAs: 'vm',
    bindings: MerchantVerify.bindings(),
    require: MerchantVerify.require()
  }
);
