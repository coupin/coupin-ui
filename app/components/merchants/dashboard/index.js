class MerchantDashboard {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor($alert, StorageService, $state) {
    'ngInject';

    this.$alert = $alert;
    this.StorageService = StorageService;
    this.$state = $state;
  }

  $onInit() { }

  isExpired() {
    return this.StorageService.isExpired();
  }

  analyticsState() {
    return this.$state.includes('dashboard.analytics') || 
      this.$state.includes('dashboard.reward-analytics');
  }
}

export default app => app.component(
  'merchantDashboard', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantDashboard,
    controllerAs: 'vm',
    bindings: MerchantDashboard.bindings(),
    require: MerchantDashboard.require()
  }
);
