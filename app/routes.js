export function routesConfig(
  $stateProvider, $locationProvider, $urlRouterProvider
) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      component: 'home',
    })
    .state('admin', {
      url: '/admin',
      component: ''
    })
}
