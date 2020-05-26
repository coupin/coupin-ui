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
    .otherwise('/admin');

  $stateProvider
    .state('a', {
      url: '/admin',
      templateUrl: '/views/admin/login.html',
      controller: 'AuthController'
    })
    .state('portal', {
      url: '/admin/dashboard',
      templateUrl: '/views/admin/base.html',
      controller: 'AdminController'
    })
    .state('portal.view-admins', {
      url: '/admins',
      templateUrl: 'views/admin/viewAdmin.html',
      controller: 'SuperAdminController'
    })
    .state('portal.add-admins', {
      url: '/admins/add',
      templateUrl: 'views/admin/addAdmin.html',
      controller: 'AdminController'
    })
    .state('portal.view-merchs', {
      url: '/merchs',
      templateUrl: 'views/admin/viewMerch.html',
      controller: 'MerchantController'
    })
    .state('portal.view-rewards', {
      url: '/rewards',
      templateUrl: 'views/admin/viewRewards.html',
      controller: 'RewardsController',
      resolve: {
        merchants: function(AdminService) {
          return AdminService.getMerchNames().then(function(response) {
            return response.data;
          });
        }
      }
    })
    .state('portal.add-merchs', {
      url: '/merchs/add/:id',
      templateUrl: 'views/admin/addMerch.html',
      controller: 'AddMerchantController',
      resolve: {
        merchantId: function($stateParams) {
          return $stateParams.id;
        }
      }
    })
    .state('portal.add-rewards', {
      url: '/rewards/add/:id',
      templateUrl: 'views/admin/addReward.html',
      controller: 'AddRewardController',
      resolve: {
        rewardId: function($stateParams) {
          return $stateParams.id;
        },
        merchants: function(AdminService) {
          return AdminService.getMerchNames().then(function(response) {
            return response.data;
          });
        }
      }
    })
    .state('portal.featured', {
      url: '/featured',
      templateUrl: 'views/admin/hotFeatured.html',
      controller: 'FeaturedController',
      resolve: {
        merchants: function(AdminService) {
          return AdminService.getMerchNames(true).then(function(response) {
            return response.data;
          });
        }
      }
    })
    .state('portal.config', {
      url: '/config',
      templateUrl: 'views/admin/config.html',
      controller: 'ConfigController',
      resolve: {
        config: function(ConfigService) {
          return ConfigService.getConfig().then(function(response) {
            return response.data;
          });
        }
      }
    })
    .state('portal.home', {
      url: '/home',
      templateUrl: 'views/admin/viewRequests.html',
      controller: 'RequestController'
    });

  $locationProvider.html5Mode(true);
}]);