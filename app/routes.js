export function routesConfig(
  $stateProvider, $locationProvider, $urlRouterProvider
) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('merchant', {
      url: '/',
      component: 'merchantHome',
    })
    .state('dashboard', {
      parent: 'merchant',
      url: '/dashboard',
      component: ''
    })
    .state('merchant-auth', {
      url: '/merchant',
      component: 'merchantAuth'
    })
    .state('admin', {
      url: '/admin',
      component: ''
    })
}
