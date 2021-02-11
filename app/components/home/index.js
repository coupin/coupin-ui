class Home {
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
  'home', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: Home,
    controllerAs: 'vm',
    bindings: Home.bindings(),
    require: Home.require()
  }
);
