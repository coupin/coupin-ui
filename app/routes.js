export function routesConfig(
  $stateProvider, $locationProvider, $urlRouterProvider
) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider
    // .state('merchant', {
    //   url: '/',
    //   component: 'merchantHome',
    // })
    .state('merchant-auth', {
      url: '/merchant-auth',
      component: 'merchantAuth'
    })
    .state('dashboard', {
      url: '/dashboard',
      component: 'merchantDashboard'
    })
    .state('dashboard.home', {
      url: '/home',
      component: 'merchantVerify'
    })
    .state('dashboard.rewards', {
      url: '/rewards',
      component: 'merchantRewards'
    })
    .state('admin', {
      url: '/admin',
      component: ''
    })
}
