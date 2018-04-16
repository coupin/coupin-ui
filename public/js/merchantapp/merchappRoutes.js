angular.module('merchappRoutes', []).config([
    '$locationProvider',
    '$stateProvider',
    '$urlRouterProvider',
function (
    $locationProvider,
    $stateProvider,
    $urlRouterProvider
) {
    $urlRouterProvider
    .otherwise('/dashboard');

    $stateProvider
        .state('auth', {
            url: '/auth',
            templateUrl: '/views/merchant/login.html',
            controller: 'AuthController'
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: '/views/merchant/home.html',
            controller: 'BaseMController'
        })
        .state('dashboard.home', {
            url: '/home',
            templateUrl: '/views/merchant/verify.html',
            controller: 'HomeController'
        }).state('dashboard.rewards', {
            url: '/rewards',
            templateUrl: '/views/merchant/rewardsList.html',
            controller: 'RewardsListController'
        }).state('dashboard.profile', {
            url: '/profile',
            templateUrl: '/views/merchant/profile.html',
            controller: 'ProfileController'
        })
        .state('dashboard.reward', {
            url: '/reward',
            templateUrl: '/views/merchant/view.html',
            controller: 'RewardsController'
        })
        .state('dashboard.reward-add', {
            url: '/merchant/rewards',
            templateUrl: '/views/merchant/rewards.html',
            controller: 'RewardsController'
        })
        .state('dashboard.reward-add-edit', {
            url: '/merchant/rewards/:id',
            templateUrl: '/views/merchant/rewards.html',
            controller: 'RewardsController',
            params: {
                param1: 'id'
            }
        });

    $locationProvider.html5Mode(true);
}]);