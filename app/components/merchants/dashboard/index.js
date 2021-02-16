class MerchantHome {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor() {
    'ngInject';
  }

  $onInit() { }
}

export default app => app.component(
  'merchantHome', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantHome,
    controllerAs: 'vm',
    bindings: MerchantHome.bindings(),
    require: MerchantHome.require()
  }
);
