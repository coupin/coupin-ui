import moment from 'moment';

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
    .state('dashboard.rewardsList', {
      url: '/rewards',
      component: 'merchantRewardsList'
    })
    .state('dashboard.reward', {
      url: '/merchants/reward',
      component: 'merchantReward'
    })
    .state('dashboard.reward-edit', {
      url: '/merchants/reward/:id',
      component: 'merchantReward',
    })
    .state('dashboard.analytics', {
      url: '/analytics',
      component: 'merchantAnalytics',
      resolve: {
        shouldAccess: ['StorageService', '$q', 'RewardService', (StorageService, $q, RewardService) => {
          var deferred = $q.defer();
          var user = StorageService.getUser();
          var billing = user.merchantInfo.billing;

          if (billing.plan === 'payAsYouGo') {
            RewardService.getMerchRewards({ status: 'active' })
              .then((result) => {
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
        }]
      }
    })
    .state('admin', {
      url: '/admin',
      component: ''
    })
}
