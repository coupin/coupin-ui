angular.module('adminRoutes', []).config([
  '$locationProvider',
  '$stateProvider',
  '$urlRouterProvider',
function(
  $locationProvider,
  $stateProvider,
  $urlRouterProvider
) {
  $urlRouterProvider
    .otherwise('/a');

  $stateProvider
    .state('a', {
      url: '/a',
      templateUrl: '/views/admin/login.html',
      controller: 'AuthController'
    })
    .state('portal', {
      url: '/a/dashboard',
      templateUrl: '/views/admin/base.html',
      controller: 'AdminController'
    })
    .state('portal.view-admins', {
      url: '/a/dashboard/admins',
      templateUrl: 'views/admin/viewAdmin.html',
      controller: 'SuperAdminController'
    })
    .state('portal.add-admins', {
      url: '/a/dashboard/admins/add',
      templateUrl: 'views/admin/addAdmin.html',
      controller: 'AdminController'
    })
    .state('portal.view-merchs', {
      url: '/a/dashboard/merchs',
      templateUrl: 'views/admin/viewMerch.html',
      controller: 'MerchantController'
    })
    .state('portal.add-merchs', {
      url: '/a/dashboard/merchs/add',
      templateUrl: 'views/admin/addMerch.html',
      controller: 'MerchantController'
    })
    .state('portal.view-requests', {
      url: '/a/dashboard/requests',
      templateUrl: 'views/admin/viewRequests.html',
      controller: 'RequestController'
    });

  $locationProvider.html5Mode(true);
}]);