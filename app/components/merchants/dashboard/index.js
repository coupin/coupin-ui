class MerchantDashboard {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor($alert, StorageService, $state, $rootScope, $window) {
    'ngInject';

    this.$alert = $alert;
    this.StorageService = StorageService;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$window = $window;
  }

  $onInit() {
    this.user = this.StorageService.getUser();
  }

  isExpired() {
    return this.StorageService.isExpired();
  }

  analyticsState() {
    return this.$state.includes('dashboard.analytics') || 
      this.$state.includes('dashboard.reward-analytics');
  }

  logOut() {
    this.StorageService.clearAll();
    this.$state.go('merchant-auth', {});
    this.$window.location.reload();
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
