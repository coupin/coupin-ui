// import angular from 'angular';

import angular from 'angular';

class MerchantRewards {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor(
    $state,
    UtilService,
    RewardService,
    StorageService
  ) {
    'ngInject';

    this.StorageService = StorageService;
    this.UtilService = UtilService;
    this.RewardService = RewardService;
    this.$state = $state;
  }

  $onInit() {
    this.loadingRewards = false;
    this.page = 1;

    this.loadRewards();
  }

  /**
   * Load a reward or route to reward page
   */
   loadRewards() {
    this.loadingRewards = true;
    var details = {};

    if (angular.isDefined(this.query)) {
      details['query'] = this.query;
    }

    details.page = this.page;

    this.RewardService.getMerchRewards(details).then((result) => {
      this.loadingRewards = false;
      this.rewards = result.data;
    }).catch((err) => {
      this.loadingRewards = false;
      console.log(err);
    });
  }

  /**
   * Change status of a reward
   * @param {*} index 
   * @param {*} isActive 
   * @param {*} tab 
   */
  changeStatus($event, index, isActive, tab) {
    $event.stopPropagation();
    var reward = {};
    if (tab === 0) {
        reward = this.rewards[index];
    } else if (tab === 1) {
        reward = this.activeRewards[index];
    } else if (tab === 2) {
        rewards = this.inactiveRewards[index];
    }

    if (isActive) {
      this.RewardService.deactivate(reward._id).then((result) => {
          if (result.status === 200) {
              reward.isActive = false;
          } else if (result.status === 500) {
              this.UtilService.showError('errTitle', 'errMsg');
          } else {
              this.UtilService.showError('errTitle', result.data);
          }
      }).catch((err) => {
        this.UtilService.showError('errTitle', 'errMsg');
      });  
    } else {
      this.RewardService.activate(reward._id).then((result) => {
          if (result.status === 200) {
              reward.isActive = true;
          } else if (result.status === 500) {
              this.UtilService.showError('errTitle', 'errMsg');
          } else {
              this.UtilService.showError('errTitle', result.data);
          }
      }).catch((err) => {
          this.UtilService.showError('errTitle', 'errMsg');
      });
    }
  }

  goToNewReward() {
    this.$state.go('dashboard.reward-add', {}, {});
  }

  /**
   * Edit Reward
   * @param {rewardId} id 
   */
  goToEditReward(id) {
    this.$state.go('dashboard.reward-add-edit', { id: id }, {});
  }

  /**
   * Go to rewards
   * @param {rewardId} id 
   */
  goToReward(id) {
    if (angular.isUndefined(id)) {
      this.RewardService.getReward(_id).then((result) => {
          if (result.status === 200) {
              this.reward = result.data;
          } else {
            this.UtilService.showError('errTitle', 'errMsg');
          }
      }).catch();
    } else {
        this.$state.go('dashboard.reward-add-edit', { id: id }, {});
    }
  }

  isExpired() {
      return this.StorageService.isExpired();
  }
}

export default app => app.component(
  'merchantRewards', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantRewards,
    controllerAs: 'vm',
    bindings: MerchantRewards.bindings(),
    require: MerchantRewards.require()
  }
);
