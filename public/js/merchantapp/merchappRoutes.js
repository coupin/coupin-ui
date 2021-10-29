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
    .otherwise('/dashboard/home');

    $stateProvider
        .state('auth', {
            url: '/merchant',
            templateUrl: '/views/merchant/login.html',
            controller: 'AuthController'
        })
        .state('terms', {
            url: '/policy/terms',
            templateUrl: '/views/merchant/terms.html',
            // controller: 'AuthController'
        })
        .state('privacy-policy', {
            url: '/policy/privacy-policy',
            templateUrl: '/views/merchant/privacy.html',
            // controller: 'AuthController'
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
        }).state('dashboard.billing', {
            url: '/billing',
            templateUrl: '/views/merchant/billing.html',
            controller: 'BillingController'
        }).state('dashboard.analytics', {
            url: '/analytics',
            templateUrl: '/views/merchant/analytics.html',
            controller: 'AnalyticsController',
            resolve: {
                shouldAccess: function (StorageService, $q, RewardsService) {
                    var deferred = $q.defer();
                    var user = StorageService.getUser();
                    var billing = user.merchantInfo.billing;

                    if (billing.plan === 'payAsYouGo') {
                        RewardsService.getMerchRewards({ status: 'active' })
                            .then(function (result) {
                                var rewards = result.data;
                                if (rewards.length > 0) {
                                    deferred.resolve(true);
                                } else {
                                    deferred.resolve(false);
                                }
                            })
                    } else {
                        var hasExpired = (user.merchantInfo.billing.history[0] && moment(new Date()).isAfter(user.merchantInfo.billing.history[0].expiration)) || false;
                        deferred.resolve(!hasExpired);
                    }

                    return deferred.promise;
                }
            }
        }).state('dashboard.reward-analytics', {
            url: '/analytics/rewards/:id',
            templateUrl: '/views/merchant/rewardDetailAnalytics.html',
            controller: 'RewardDetailAnalyticsController',
            params: {
                param1: 'id'
            }
        }).state('dashboard.reward', {
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